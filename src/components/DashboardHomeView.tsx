import React from 'react';
import {
  calculateDailyConsumedTotals,
  CalculatedMetrics,
  ExerciseItem,
  FOCUS_LABELS,
  formatMzn,
  MealItem,
  ScannedMealResult,
  UserProfileInput,
  WeightLogEntry,
} from '../utils/nutrition';
import { MealIllustration } from './CulinaryArt';
import { WeightProgressChart } from './WeightProgressChart';
import {
  ArrowRight,
  Calculator,
  Camera,
  Check,
  Droplets,
  Dumbbell,
  Flame,
  Minus,
  Plus,
  Scale,
  Sparkles,
  Utensils,
} from 'lucide-react';

interface DashboardHomeViewProps {
  profile: UserProfileInput;
  metrics: CalculatedMetrics;
  meals: MealItem[];
  exercises: ExerciseItem[];
  completedMealIds: string[];
  completedExerciseIds: string[];
  scannedMeals: ScannedMealResult[];
  waterGlassesLogged: number;
  weightHistory: WeightLogEntry[];
  onLogNewWeight: (newWeightKg: number, note?: string) => void;
  onIncrementWater: (delta: number) => void;
  onToggleMeal: (mealId: string) => void;
  onOpenMealScanner: () => void;
  onNavigateTab: (tab: 'dashboard' | 'onboarding' | 'plan' | 'coach' | 'tribe' | 'admin') => void;
}

export const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({
  profile,
  metrics,
  meals,
  exercises,
  completedMealIds,
  completedExerciseIds,
  scannedMeals,
  waterGlassesLogged,
  weightHistory,
  onLogNewWeight,
  onIncrementWater,
  onToggleMeal,
  onOpenMealScanner,
  onNavigateTab,
}) => {
  const { totalCalories: consumedCalories, totalProteinGrams: consumedProtein } =
    calculateDailyConsumedTotals(meals, completedMealIds, scannedMeals);

  const burnedWorkoutCalories = exercises
    .filter((ex) => completedExerciseIds.includes(ex.id))
    .reduce((sum, ex) => sum + ex.caloriesBurned, 0);

  const calorieProgressPct = Math.min(
    100,
    Math.round((consumedCalories / Math.max(1, metrics.dailyCaloriesKcal)) * 100)
  );
  const proteinProgressPct = Math.min(
    100,
    Math.round((consumedProtein / Math.max(1, metrics.dailyProteinGrams)) * 100)
  );
  const waterProgressPct = Math.min(
    100,
    Math.round((waterGlassesLogged / Math.max(1, metrics.dailyWaterGlasses)) * 100)
  );

  // SVG Ring Geometry
  const ringRadius = 32;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const calorieStrokeOffset =
    ringCircumference - (calorieProgressPct / 100) * ringCircumference;
  const proteinStrokeOffset =
    ringCircumference - (proteinProgressPct / 100) * ringCircumference;

  return (
    <div className="space-y-8">
      {/* Top Welcome & Metabolic Strip */}
      <section className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">Resumo Diário Moçambique</span>
            <span aria-hidden="true">·</span>
            <span>Foco: {FOCUS_LABELS[profile.focusGoal]}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">TMB {metrics.bmrKcal} kcal</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">Défice -{metrics.safeDeficitKcal} kcal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Olá, {profile.name} — mantém a consistência hoje.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            O teu plano diário usa alimentos frescos locais (mandioca, batata-doce, peixe grelhado, feijão nhemba e folhas de abóbora) calibrados para chegares aos{' '}
            <strong className="text-emerald-400 font-mono-tabular">{profile.targetWeightKg} kg</strong> sem passar fome.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateTab('onboarding')}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-100 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Calculadora de Metas</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('coach')}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Falar com Coach Fit IA</span>
          </button>
        </div>
      </section>

      {/* 4 Core Visual Progress Metric Cards */}
      <section
        aria-label="Métricas diárias de progresso"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {/* Card 1: Daily Calories */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
              Calorias Diárias
            </span>
            <p className="text-2xl font-bold text-white font-mono-tabular">
              {consumedCalories}{' '}
              <span className="text-xs font-normal text-slate-400">
                / {metrics.dailyCaloriesKcal} kcal
              </span>
            </p>
            <span className="text-[11px] text-slate-400 block font-mono-tabular">
              Restam {Math.max(0, metrics.dailyCaloriesKcal - consumedCalories)} kcal hoje
            </span>
          </div>

          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={ringRadius}
                stroke="#1E293B"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r={ringRadius}
                stroke="#10B981"
                strokeWidth="7"
                strokeDasharray={ringCircumference}
                strokeDashoffset={calorieStrokeOffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <span className="absolute text-xs font-bold text-emerald-400 font-mono-tabular">
              {calorieProgressPct}%
            </span>
          </div>
        </div>

        {/* Card 2: Daily Protein */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-teal-400" />
              Proteína Diária
            </span>
            <p className="text-2xl font-bold text-white font-mono-tabular">
              {consumedProtein}g{' '}
              <span className="text-xs font-normal text-slate-400">
                / {metrics.dailyProteinGrams}g
              </span>
            </p>
            <span className="text-[11px] text-slate-400 block">
              Peixe, ovos, frango & nhemba
            </span>
          </div>

          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={ringRadius}
                stroke="#1E293B"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r={ringRadius}
                stroke="#14B8A6"
                strokeWidth="7"
                strokeDasharray={ringCircumference}
                strokeDashoffset={proteinStrokeOffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <span className="absolute text-xs font-bold text-teal-400 font-mono-tabular">
              {proteinProgressPct}%
            </span>
          </div>
        </div>

        {/* Card 3: Water Intake (Interactive) */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                Copos de Água (250ml)
              </span>
              <p className="text-2xl font-bold text-white font-mono-tabular mt-1">
                {waterGlassesLogged}{' '}
                <span className="text-xs font-normal text-slate-400">
                  / {metrics.dailyWaterGlasses} copos
                </span>
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onIncrementWater(-1)}
                aria-label="Remover 1 copo de água"
                className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onIncrementWater(1)}
                aria-label="Beber mais 1 copo de água"
                className="min-h-[40px] min-w-[40px] rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-sky-400 transition-transform origin-left"
                style={{ transform: `scaleX(${waterProgressPct / 100})` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 font-mono-tabular block">
              {(waterGlassesLogged * 0.25).toFixed(2)} L ingeridos hoje ({waterProgressPct}%)
            </span>
          </div>
        </div>

        {/* Card 4: Weight Remaining to Target */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between gap-3">
          <div>
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              Peso Restante para Meta
            </span>
            <p className="text-2xl font-bold text-emerald-400 font-mono-tabular mt-1">
              -{metrics.weightToLoseKg} kg
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800 font-mono-tabular">
            <span>Atual: {profile.currentWeightKg} kg</span>
            <span>→</span>
            <span className="text-emerald-400 font-semibold">Alvo: {profile.targetWeightKg} kg</span>
          </div>
        </div>
      </section>

      {/* Weekly Weight Loss Progression Line Chart (Recharts) */}
      <WeightProgressChart
        weightHistory={weightHistory}
        targetWeightKg={profile.targetWeightKg}
        onLogNewWeight={onLogNewWeight}
      />

      {/* Two-Column Split: Today's Mozambican Meals Check-in + Quick Workout Card */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Cols: Today's Meals Quick Check */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <p className="text-xs text-emerald-400 font-medium">
                Cardápio Económico Local (~{formatMzn(meals.reduce((s, m) => s + m.costMznEstimate, 0))}/dia)
              </p>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Refeições de hoje
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenMealScanner}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 shrink-0" />
                <span>Escanear Refeição</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('plan')}
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Ver Receitas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80">
            {/* Scanned extra meals from camera */}
            {scannedMeals.map((scanned) => (
              <div
                key={scanned.id}
                className="py-3.5 first:pt-0 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={scanned.imageDataUrl}
                    alt={scanned.dishName}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border border-emerald-500/40 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-semibold text-emerald-400">Foto IA</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">{scanned.scannedAt}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">
                        +{scanned.calories} kcal · +{scanned.proteinGrams}g P
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white truncate mt-0.5">
                      {scanned.dishName}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold text-emerald-400 whitespace-nowrap shrink-0">
                  Somado ao Dia
                </span>
              </div>
            ))}

            {meals.map((meal) => {
              const isCompleted = completedMealIds.includes(meal.id);
              return (
                <div
                  key={meal.id}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <MealIllustration
                      variant={meal.illustrationType}
                      className="w-14 h-14 shrink-0 hidden sm:flex"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-semibold text-emerald-400">{meal.slot}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">{meal.time}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">
                          {meal.calories} kcal · {meal.proteinGrams}g P
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white truncate mt-0.5">
                        {meal.title}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleMeal(meal.id)}
                    aria-label={
                      isCompleted
                        ? `Desmarcar ${meal.slot}`
                        : `Registar ${meal.slot} como consumido`
                    }
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isCompleted ? 'Concluído' : 'Registar'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Daily Home Workout Status & Community Highlight */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs text-emerald-400 font-medium">Treino Funcional Sem Ginásio</p>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  Circuito em Casa (25 min)
                </h2>
              </div>
              <Dumbbell className="w-5 h-5 text-emerald-400 shrink-0" />
            </div>

            <div className="py-3 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Exercícios Concluídos Hoje</span>
                <p className="text-xl font-bold text-white font-mono-tabular mt-0.5">
                  {completedExerciseIds.length} de {exercises.length} séries
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Gasto do Treino</span>
                <p className="text-xl font-bold text-emerald-400 font-mono-tabular mt-0.5">
                  +{burnedWorkoutCalories} kcal
                </p>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              {exercises.slice(0, 4).map((ex, i) => (
                <li
                  key={ex.id}
                  className="flex items-center justify-between py-1.5 border-b border-slate-800/60 last:border-none"
                >
                  <span className="truncate pr-2">
                    <strong className="font-mono-tabular text-emerald-400">0{i + 1}.</strong>{' '}
                    {ex.name}
                  </span>
                  <span className="font-mono-tabular text-slate-400 shrink-0">
                    {ex.sets}× {ex.repsOrDuration}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('plan')}
              className="min-h-[44px] flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Dumbbell className="w-4 h-4" />
              <span>Abrir Treino & Cronómetro</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('tribe')}
              className="min-h-[44px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Mural da Tribo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
