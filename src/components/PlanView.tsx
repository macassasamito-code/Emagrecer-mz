import React, { useEffect, useState } from 'react';
import {
  CalculatedMetrics,
  ExerciseItem,
  FocusGoal,
  FOCUS_LABELS,
  formatMzn,
  MealItem,
  ScannedMealResult,
} from '../utils/nutrition';
import { MealIllustration } from './CulinaryArt';
import { Camera, Check, Clock, Dumbbell, Flame, Play, RotateCcw, Utensils } from 'lucide-react';

interface PlanViewProps {
  metrics: CalculatedMetrics;
  focusGoal: FocusGoal;
  meals: MealItem[];
  exercises: ExerciseItem[];
  completedMealIds: string[];
  completedExerciseIds: string[];
  scannedMeals: ScannedMealResult[];
  onToggleMeal: (mealId: string) => void;
  onToggleExercise: (exerciseId: string) => void;
  onOpenMealScanner: () => void;
  onEditPlan?: () => void;
}

export const PlanView: React.FC<PlanViewProps> = ({
  metrics,
  focusGoal,
  meals,
  exercises,
  completedMealIds,
  completedExerciseIds,
  scannedMeals,
  onToggleMeal,
  onToggleExercise,
  onOpenMealScanner,
  onEditPlan,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'meals' | 'workout'>('meals');
  const [timerSeconds, setTimerSeconds] = useState<number>(45);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const totalDailyCostMzn = meals.reduce((sum, m) => sum + m.costMznEstimate, 0);
  const totalWorkoutBurn = exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);

  return (
    <div className="space-y-6">
      {/* Sub-navigation & Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Plano Diário</span>
            <span aria-hidden="true">·</span>
            <span>{FOCUS_LABELS[focusGoal]}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">{metrics.dailyCaloriesKcal} kcal/dia</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Plano Personalizado de Hoje
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start">
          {onEditPlan && (
            <button
              type="button"
              onClick={onEditPlan}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Atualizar meu plano</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenMealScanner}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span>Escanear Refeição</span>
          </button>

          {/* Interactive Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveSubTab('meals')}
              className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubTab === 'meals'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Refeições de hoje ({completedMealIds.length}/4)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('workout')}
              className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubTab === 'workout'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Treino em Casa ({completedExerciseIds.length}/{exercises.length})</span>
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'meals' ? (
        <div className="space-y-6">
          {/* Summary strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4">
              <span className="text-xs text-slate-400">Meta Diária</span>
              <p className="text-lg font-bold text-white font-mono-tabular mt-0.5">
                {metrics.dailyCaloriesKcal} kcal
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4">
              <span className="text-xs text-slate-400">Proteína Total</span>
              <p className="text-lg font-bold text-emerald-400 font-mono-tabular mt-0.5">
                {metrics.dailyProteinGrams} g
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4">
              <span className="text-xs text-slate-400">Custo Diário Estimado</span>
              <p className="text-lg font-bold text-white font-mono-tabular mt-0.5">
                ~{formatMzn(totalDailyCostMzn)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4">
              <span className="text-xs text-slate-400">Refeições Concluídas</span>
              <p className="text-lg font-bold text-white font-mono-tabular mt-0.5">
                {completedMealIds.length} de {meals.length}{' '}
                {scannedMeals.length > 0 && `(+${scannedMeals.length} foto)`}
              </p>
            </div>
          </div>

          {scannedMeals.length > 0 && (
            <div className="rounded-2xl bg-emerald-950/20 border border-emerald-500/40 p-5 space-y-3">
              <p className="text-xs font-semibold text-emerald-400">
                Refeições Escaneadas por Câmera Hoje
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scannedMeals.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3.5 bg-slate-950/80 rounded-xl p-3 border border-slate-800"
                  >
                    <img
                      src={s.imageDataUrl}
                      alt={s.dishName}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{s.dishName}</p>
                      <p className="text-xs font-mono-tabular text-emerald-400 mt-0.5">
                        +{s.calories} kcal · P: {s.proteinGrams}g · C: {s.carbsGrams}g · G:{' '}
                        {s.fatsGrams}g
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {s.weightLossTip}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4 Meal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {meals.map((meal) => {
              const isDone = completedMealIds.includes(meal.id);
              return (
                <article
                  key={meal.id}
                  className={`rounded-2xl border p-5 sm:p-6 transition-colors flex flex-col justify-between gap-5 ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/50'
                      : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Unboxed clean metadata kicker */}
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-400">{meal.slot}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">{meal.time}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">~{formatMzn(meal.costMznEstimate)}</span>
                      </div>
                      <span className="font-mono-tabular font-semibold text-white">
                        {meal.calories} kcal · {meal.proteinGrams}g prot
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      <MealIllustration
                        variant={meal.illustrationType}
                        className="sm:col-span-4 h-28"
                      />
                      <div className="sm:col-span-8 space-y-2">
                        <h3 className="text-base font-bold text-white leading-snug">
                          {meal.title}
                        </h3>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {meal.localIngredients.map((ing, idx) => (
                            <li key={idx} className="leading-relaxed">
                              • {ing}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 pt-2 border-t border-slate-800/80 leading-relaxed">
                      <strong className="text-slate-200">Dica Moçambicana:</strong> {meal.prepTip}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleMeal(meal.id)}
                    className={`min-h-[44px] w-full rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      isDone
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      {isDone ? 'Refeição Registada no Diário' : `Marcar ${meal.slot} como Concluído`}
                    </span>
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Interactive Interval Timer Bar */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <Clock className="w-4 h-4" />
                <span>Cronómetro de Circuito em Casa (Sem Equipamento)</span>
              </div>
              <p className="text-sm text-slate-300">
                Queima estimada do treino completo:{' '}
                <strong className="text-white font-mono-tabular">{totalWorkoutBurn} kcal</strong> em 25 minutos.
              </p>
            </div>

            <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
              <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono-tabular text-xl font-bold text-emerald-400">
                00:{String(timerSeconds).padStart(2, '0')}
              </div>
              <button
                type="button"
                onClick={() => setTimerRunning((r) => !r)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{timerRunning ? 'Pausar' : 'Iniciar 45s'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setTimerSeconds(45);
                }}
                className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Reiniciar cronómetro para 45 segundos"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Exercise List */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 divide-y divide-slate-800">
            {exercises.map((ex, index) => {
              const isDone = completedExerciseIds.includes(ex.id);
              return (
                <div
                  key={ex.id}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-mono-tabular font-semibold text-emerald-400">
                        0{index + 1}.
                      </span>
                      <span>{ex.targetArea}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">
                        {ex.sets} séries × {ex.repsOrDuration}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">Descanso {ex.restSeconds}s</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{ex.name}</h3>
                    <p className="text-xs text-slate-400">{ex.cue}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono-tabular text-slate-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      {ex.caloriesBurned} kcal
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleExercise(ex.id)}
                      className={`min-h-[44px] px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                        isDone
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>{isDone ? 'Série Concluída' : 'Marcar Exercício'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
