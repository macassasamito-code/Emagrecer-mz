/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  appendWeightLogEntry,
  buildWeightHistorySeries,
  calculateMetabolicPlan,
  generateHomeWorkoutPlan,
  generateMozambicanMealPlan,
  isSubscriptionLocked,
  ScannedMealResult,
  SubscriptionStatus,
  UserProfileInput,
} from './utils/nutrition';
import {
  ChatMessage,
  ClientAccount,
  INITIAL_CLIENTS,
  INITIAL_COACH_MESSAGES,
  INITIAL_TRIBE_POSTS,
  TribePost,
} from './data/seedData';
import { DashboardHomeView } from './components/DashboardHomeView';
import { OnboardingCalculator } from './components/OnboardingCalculator';
import { PlanView } from './components/PlanView';
import { CoachChatView } from './components/CoachChatView';
import { TribeFeedView } from './components/TribeFeedView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { PaywallLockScreen } from './components/PaywallLockScreen';
import { AuthSwitchModal } from './components/AuthSwitchModal';
import { MealScannerModal } from './components/MealScannerModal';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton';
import {
  Calculator,
  Home,
  MessageSquareHeart,
  ShieldCheck,
  User,
  Users,
  Utensils,
} from 'lucide-react';

type ActiveTab = 'dashboard' | 'onboarding' | 'plan' | 'coach' | 'tribe' | 'admin';

export default function App() {
  const [clients, setClients] = useState<ClientAccount[]>(INITIAL_CLIENTS);
  const [activeClientId, setActiveClientId] = useState<string>('usr-1');
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
      return 'admin';
    }
    return 'dashboard';
  });

  // Daily progress state per session
  const [completedMealIds, setCompletedMealIds] = useState<string[]>(['meal-breakfast']);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>(['ex-1']);
  const [scannedMeals, setScannedMeals] = useState<ScannedMealResult[]>([]);
  const [isMealScannerOpen, setIsMealScannerOpen] = useState<boolean>(false);
  const [waterGlassesLogged, setWaterGlassesLogged] = useState<number>(5);
  const [tribePosts, setTribePosts] = useState<TribePost[]>(INITIAL_TRIBE_POSTS);
  const [coachMessages, setCoachMessages] = useState<ChatMessage[]>(INITIAL_COACH_MESSAGES);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Sync /admin route if user navigates
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/admin') {
        setActiveTab('admin');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const currentClient = useMemo(
    () => clients.find((c) => c.id === activeClientId) || clients[0],
    [clients, activeClientId]
  );

  const currentProfileInput: UserProfileInput = useMemo(
    () => ({
      name: currentClient.name,
      age: currentClient.age,
      gender: currentClient.gender,
      currentWeightKg: currentClient.currentWeightKg,
      heightCm: currentClient.heightCm,
      targetWeightKg: currentClient.targetWeightKg,
      activityLevel: currentClient.activityLevel,
      focusGoal: currentClient.focusGoal,
    }),
    [currentClient]
  );

  const metrics = useMemo(
    () => calculateMetabolicPlan(currentProfileInput),
    [currentProfileInput]
  );

  const meals = useMemo(
    () => generateMozambicanMealPlan(metrics, currentProfileInput.focusGoal),
    [metrics, currentProfileInput.focusGoal]
  );

  const exercises = useMemo(
    () => generateHomeWorkoutPlan(currentProfileInput.focusGoal),
    [currentProfileInput.focusGoal]
  );

  const currentWeightHistory = useMemo(
    () =>
      buildWeightHistorySeries(
        currentClient.weightHistory,
        currentClient.currentWeightKg,
        currentClient.targetWeightKg
      ),
    [currentClient.weightHistory, currentClient.currentWeightKg, currentClient.targetWeightKg]
  );

  const isLockedByPaywall = isSubscriptionLocked(currentClient.subscriptionStatus);

  const handleSaveProfile = (updated: UserProfileInput) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== currentClient.id) return c;
        const baseHistory = buildWeightHistorySeries(
          c.weightHistory,
          c.currentWeightKg,
          updated.targetWeightKg
        );
        const updatedHistory =
          baseHistory.length > 0
            ? baseHistory.map((item, idx) =>
                idx === baseHistory.length - 1
                  ? { ...item, weightKg: updated.currentWeightKg, targetWeightKg: updated.targetWeightKg }
                  : { ...item, targetWeightKg: updated.targetWeightKg }
              )
            : baseHistory;

        return {
          ...c,
          name: updated.name,
          age: updated.age,
          gender: updated.gender,
          currentWeightKg: updated.currentWeightKg,
          heightCm: updated.heightCm,
          targetWeightKg: updated.targetWeightKg,
          activityLevel: updated.activityLevel,
          focusGoal: updated.focusGoal,
          weightHistory: updatedHistory,
        };
      })
    );
  };

  const handleLogNewWeight = (newWeightKg: number, note?: string) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== currentClient.id) return c;
        const series = buildWeightHistorySeries(
          c.weightHistory,
          c.currentWeightKg,
          c.targetWeightKg
        );
        const nextHistory = appendWeightLogEntry(
          series,
          newWeightKg,
          c.targetWeightKg,
          undefined,
          note
        );
        return {
          ...c,
          currentWeightKg: newWeightKg,
          weightHistory: nextHistory,
        };
      })
    );
  };

  const handleToggleMeal = (mealId: string) => {
    setCompletedMealIds((prev) =>
      prev.includes(mealId) ? prev.filter((id) => id !== mealId) : [...prev, mealId]
    );
  };

  const handleToggleExercise = (exerciseId: string) => {
    setCompletedExerciseIds((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const handleAddScannedMeal = (scanned: ScannedMealResult) => {
    setScannedMeals((prev) => [scanned, ...prev]);
  };

  const handleIncrementWater = (delta: number) => {
    setWaterGlassesLogged((prev) => Math.max(0, Math.min(20, prev + delta)));
  };

  const handleReactPost = (postId: string, reactionType: 'clap' | 'fire' | 'heart') => {
    setTribePosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const already = Boolean(post.userReacted[reactionType]);
        return {
          ...post,
          reactions: {
            ...post.reactions,
            [reactionType]: already
              ? Math.max(0, post.reactions[reactionType] - 1)
              : post.reactions[reactionType] + 1,
          },
          userReacted: {
            ...post.userReacted,
            [reactionType]: !already,
          },
        };
      })
    );
  };

  const handleAddComment = (postId: string, commentText: string) => {
    setTribePosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: `c-${Date.now()}`,
              author: currentClient.name,
              text: commentText,
              timeAgo: 'Agora mesmo',
            },
          ],
        };
      })
    );
  };

  const handleCreatePost = (newPost: {
    category: TribePost['category'];
    content: string;
    dishTitle?: string;
    weightDeltaKg?: string;
  }) => {
    const initials = currentClient.name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const created: TribePost = {
      id: `post-${Date.now()}`,
      authorName: currentClient.name,
      authorCity: currentClient.city,
      authorInitials: initials,
      timeAgo: 'Agora mesmo',
      category: newPost.category,
      content: newPost.content,
      dishTitle: newPost.dishTitle,
      weightDeltaKg: newPost.weightDeltaKg,
      illustrationVariant:
        newPost.category === 'prato_saudavel'
          ? 'fish_plate'
          : newPost.category === 'treino_concluido'
          ? 'workout_mat'
          : 'none',
      reactions: { clap: 1, fire: 1, heart: 1 },
      userReacted: { clap: true },
      comments: [],
    };

    setTribePosts((prev) => [created, ...prev]);
  };

  const handleUpdateClientStatus = (clientId: string, newStatus: SubscriptionStatus) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              subscriptionStatus: newStatus,
              lastPaymentRef:
                newStatus === 'active'
                  ? `${c.paymentMethod === 'M-Pesa' ? 'MP' : 'EM'}261026.${Math.floor(
                      100 + Math.random() * 899
                    )}A`
                  : c.lastPaymentRef,
            }
          : c
      )
    );
  };

  const handleReactivateCurrentClient = (
    method: 'M-Pesa' | 'e-Mola',
    transactionCode: string
  ) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === currentClient.id
          ? {
              ...c,
              paymentMethod: method,
              subscriptionStatus: 'active',
              lastPaymentRef: transactionCode,
            }
          : c
      )
    );
  };

  const handleAddNewClient = (
    newClientData: Omit<
      ClientAccount,
      'id' | 'registeredAt' | 'lastPaymentRef' | 'nextBillingDate'
    >
  ) => {
    const created: ClientAccount = {
      ...newClientData,
      id: `usr-${Date.now()}`,
      registeredAt: '2026-10-26',
      lastPaymentRef: `${newClientData.paymentMethod === 'M-Pesa' ? 'MP' : 'EM'}261026.901N`,
      nextBillingDate: '2026-11-26',
    };
    setClients((prev) => [created, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col pb-20 md:pb-10">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-[#090D16]/90 backdrop-blur-md border-b border-slate-800/90">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-14">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#painel"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('dashboard');
            }}
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            CorpoFit MZ
          </a>

          {/* Zone 2: 5 concise single-line navigation links */}
          <nav
            aria-label="Navegação Principal"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300"
          >
            <a
              href="#painel"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('dashboard');
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'dashboard'
                  ? 'text-emerald-400 underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Painel
            </a>
            <a
              href="#metas"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('onboarding');
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'onboarding'
                  ? 'text-emerald-400 underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Calculadora
            </a>
            <a
              href="#plano"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('plan');
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'plan'
                  ? 'text-emerald-400 underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Meu Plano
            </a>
            <a
              href="#coach"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('coach');
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'coach'
                  ? 'text-emerald-400 underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Coach IA
            </a>
            <a
              href="#tribo"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('tribe');
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'tribe'
                  ? 'text-emerald-400 underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Mural da Tribo
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="min-h-[40px] px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Conta: {currentClient.name.split(' ')[0]}
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Workspace Context Bar (Below Header) */}
      <div className="border-b border-slate-800/60 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 min-w-0 truncate">
            <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <strong className="text-slate-200 truncate">{currentClient.name}</strong>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline truncate">{currentClient.city}</span>
            <span aria-hidden="true">·</span>
            <strong
              className={`shrink-0 ${
                currentClient.subscriptionStatus === 'active'
                  ? 'text-emerald-400'
                  : currentClient.subscriptionStatus === 'pending'
                  ? 'text-sky-400'
                  : 'text-amber-400'
              }`}
            >
              {currentClient.subscriptionStatus.toUpperCase()}
            </strong>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton />
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'admin' ? 'dashboard' : 'admin')}
              className={`min-h-[38px] px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{activeTab === 'admin' ? 'Voltar ao App' : 'Admin (/admin)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'admin' ? (
          <AdminDashboardView
            clients={clients}
            activeClientId={activeClientId}
            onUpdateClientStatus={handleUpdateClientStatus}
            onSelectActiveClient={(clientId) => {
              setActiveClientId(clientId);
              setActiveTab('dashboard');
            }}
            onAddNewClient={handleAddNewClient}
          />
        ) : isLockedByPaywall ? (
          <PaywallLockScreen
            client={currentClient}
            onReactivateNow={handleReactivateCurrentClient}
            onOpenAdminPanel={() => setActiveTab('admin')}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardHomeView
                profile={currentProfileInput}
                metrics={metrics}
                meals={meals}
                exercises={exercises}
                completedMealIds={completedMealIds}
                completedExerciseIds={completedExerciseIds}
                scannedMeals={scannedMeals}
                waterGlassesLogged={waterGlassesLogged}
                weightHistory={currentWeightHistory}
                onLogNewWeight={handleLogNewWeight}
                onIncrementWater={handleIncrementWater}
                onToggleMeal={handleToggleMeal}
                onOpenMealScanner={() => setIsMealScannerOpen(true)}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'onboarding' && (
              <OnboardingCalculator
                initialProfile={currentProfileInput}
                onSaveProfile={(updated) => {
                  handleSaveProfile(updated);
                }}
              />
            )}

            {activeTab === 'plan' && (
              <PlanView
                metrics={metrics}
                focusGoal={currentProfileInput.focusGoal}
                meals={meals}
                exercises={exercises}
                completedMealIds={completedMealIds}
                completedExerciseIds={completedExerciseIds}
                scannedMeals={scannedMeals}
                onToggleMeal={handleToggleMeal}
                onToggleExercise={handleToggleExercise}
                onOpenMealScanner={() => setIsMealScannerOpen(true)}
                onEditPlan={() => setActiveTab('onboarding')}
              />
            )}

            {activeTab === 'coach' && (
              <CoachChatView
                profile={currentProfileInput}
                metrics={metrics}
                messages={coachMessages}
                onAddMessage={(msg) => setCoachMessages((prev) => [...prev, msg])}
              />
            )}

            {activeTab === 'tribe' && (
              <TribeFeedView
                currentUserName={currentClient.name}
                posts={tribePosts}
                onReact={handleReactPost}
                onAddComment={handleAddComment}
                onCreatePost={handleCreatePost}
              />
            )}
          </>
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © 2026 CorpoFit MZ · Emagrecimento Consciente & Tonificação em Moçambique (MZN).
          </p>
          <div className="flex items-center gap-4">
            <span>Pagamentos Locais: M-Pesa & e-Mola</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className="hover:text-slate-300 underline underline-offset-4 cursor-pointer"
            >
              Acesso Administrativo
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Navigation Bar (Natural Thumb Zone, <15% viewport height) */}
      <nav
        aria-label="Navegação Móvel"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090D16]/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-5 items-center h-14 px-1"
      >
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`min-h-[44px] flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Painel</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('onboarding')}
          className={`min-h-[44px] flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'onboarding' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Calculator className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Metas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('plan')}
          className={`min-h-[44px] flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'plan' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Plano</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('coach')}
          className={`min-h-[44px] flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'coach' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <MessageSquareHeart className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Coach IA</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tribe')}
          className={`min-h-[44px] flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'tribe' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Tribo</span>
        </button>
      </nav>

      <AuthSwitchModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        clients={clients}
        activeClientId={activeClientId}
        onSelectClient={(id) => setActiveClientId(id)}
        onOpenAdmin={() => setActiveTab('admin')}
      />

      <MealScannerModal
        isOpen={isMealScannerOpen}
        onClose={() => setIsMealScannerOpen(false)}
        onAddScannedMeal={handleAddScannedMeal}
      />

      <OfflineIndicator />
    </div>
  );
}
