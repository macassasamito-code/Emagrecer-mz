import React, { useState } from 'react';
import {
  ActivityLevel,
  ACTIVITY_LABELS,
  calculateMetabolicPlan,
  FocusGoal,
  FOCUS_LABELS,
  Gender,
  UserProfileInput,
} from '../utils/nutrition';
import { Calculator, Check, Flame, Sparkles, Target } from 'lucide-react';

interface OnboardingCalculatorProps {
  initialProfile: UserProfileInput;
  onSaveProfile: (updated: UserProfileInput) => void;
}

export const OnboardingCalculator: React.FC<OnboardingCalculatorProps> = ({
  initialProfile,
  onSaveProfile,
}) => {
  const [form, setForm] = useState<UserProfileInput>(initialProfile);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedBanner, setSavedBanner] = useState(false);

  const previewMetrics = calculateMetabolicPlan(form);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrorMsg('Por favor, indique o seu nome.');
      return;
    }
    if (form.age < 16 || form.age > 90) {
      setErrorMsg('A idade deve estar entre 16 e 90 anos.');
      return;
    }
    if (form.currentWeightKg < 35 || form.currentWeightKg > 250) {
      setErrorMsg('Insira um peso atual válido (35 kg a 250 kg).');
      return;
    }
    if (form.targetWeightKg < 35 || form.targetWeightKg > 220) {
      setErrorMsg('Insira um peso alvo válido (35 kg a 220 kg).');
      return;
    }
    setErrorMsg(null);
    onSaveProfile(form);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Form Column */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-7 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6"
      >
        <div className="border-b border-slate-800 pb-5">
          <p className="text-xs font-medium text-emerald-400">
            Calculadora Biométrica Moçambicana
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Configurar Metas & Foco Corporal
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Calculamos automaticamente a tua Taxa Metabólica Basal (TMB), o défice calórico seguro e as porções exatas com alimentos locais.
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="rounded-xl bg-rose-950/70 border border-rose-800 px-4 py-3 text-xs font-medium text-rose-200"
          >
            {errorMsg}
          </div>
        )}

        {savedBanner && (
          <div
            role="status"
            className="rounded-xl bg-emerald-950/80 border border-emerald-700/80 px-4 py-3 text-xs font-medium text-emerald-200 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Metas recalculadas! O teu plano alimentar e treino foram atualizados.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="calc-name" className="block text-xs font-medium text-slate-300 mb-1.5">
              Nome Completo
            </label>
            <input
              id="calc-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full min-h-[44px] rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              placeholder="Ex: Neyma Mondlane"
            />
          </div>

          <div>
            <label htmlFor="calc-gender" className="block text-xs font-medium text-slate-300 mb-1.5">
              Género Biológico
            </label>
            <select
              id="calc-gender"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
              className="w-full min-h-[44px] rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="female">Feminino</option>
              <option value="male">Masculino</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label htmlFor="calc-age" className="block text-xs font-medium text-slate-300 mb-1.5">
              Idade (anos)
            </label>
            <input
              id="calc-age"
              type="number"
              min={16}
              max={90}
              value={form.age}
              onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
              className="w-full min-h-[44px] rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white font-mono-tabular focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="calc-height" className="block text-xs font-medium text-slate-300 mb-1.5">
              Altura (cm)
            </label>
            <input
              id="calc-height"
              type="number"
              min={135}
              max={215}
              value={form.heightCm}
              onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })}
              className="w-full min-h-[44px] rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white font-mono-tabular focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="calc-weight" className="block text-xs font-medium text-slate-300 mb-1.5">
              Peso Atual (kg)
            </label>
            <input
              id="calc-weight"
              type="number"
              step="0.5"
              min={35}
              max={250}
              value={form.currentWeightKg}
              onChange={(e) => setForm({ ...form, currentWeightKg: Number(e.target.value) })}
              className="w-full min-h-[44px] rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white font-mono-tabular focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="calc-target" className="block text-xs font-medium text-slate-300 mb-1.5">
              Peso Alvo (kg)
            </label>
            <input
              id="calc-target"
              type="number"
              step="0.5"
              min={35}
              max={220}
              value={form.targetWeightKg}
              onChange={(e) => setForm({ ...form, targetWeightKg: Number(e.target.value) })}
              className="w-full min-h-[44px] rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-emerald-400 font-semibold font-mono-tabular focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label htmlFor="calc-activity" className="block text-xs font-medium text-slate-300 mb-1.5">
            Nível de Atividade Física Diária
          </label>
          <select
            id="calc-activity"
            value={form.activityLevel}
            onChange={(e) => setForm({ ...form, activityLevel: e.target.value as ActivityLevel })}
            className="w-full min-h-[44px] rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
          >
            {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((level) => (
              <option key={level} value={level}>
                {ACTIVITY_LABELS[level]}
              </option>
            ))}
          </select>
        </div>

        {/* Specific Focus Options */}
        <div>
          <span className="block text-xs font-medium text-slate-300 mb-2">
            Foco Corporal Específico
          </span>
          <div className="grid grid-cols-1 gap-2.5">
            {(Object.keys(FOCUS_LABELS) as FocusGoal[]).map((goalKey) => {
              const isSelected = form.focusGoal === goalKey;
              return (
                <button
                  key={goalKey}
                  type="button"
                  onClick={() => setForm({ ...form, focusGoal: goalKey })}
                  className={`min-h-[48px] w-full text-left px-4 py-3 rounded-xl border transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-white'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Target
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    />
                    <span className="text-sm font-medium">{FOCUS_LABELS[goalKey]}</span>
                  </div>
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-emerald-400 bg-emerald-400' : 'border-slate-600'
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="min-h-[48px] w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Atualizar meu plano</span>
        </button>
      </form>

      {/* Right Live Algorithm Breakdown Column */}
      <div className="lg:col-span-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <p className="text-xs font-medium text-slate-400">Resultado do Algoritmo</p>
            <h3 className="text-lg font-bold text-white mt-0.5">Diagnóstico Metabólico</h3>
          </div>
          <Calculator className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-slate-950/90 border border-slate-800/90 p-4">
            <span className="text-xs text-slate-400">Taxa Metabólica Basal (TMB)</span>
            <p className="text-2xl font-bold text-white font-mono-tabular mt-1">
              {previewMetrics.bmrKcal} <span className="text-xs font-normal text-slate-400">kcal</span>
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">Gasto em repouso absoluto</span>
          </div>

          <div className="rounded-xl bg-slate-950/90 border border-slate-800/90 p-4">
            <span className="text-xs text-slate-400">Gasto Total Diário (TDEE)</span>
            <p className="text-2xl font-bold text-white font-mono-tabular mt-1">
              {previewMetrics.tdeeKcal} <span className="text-xs font-normal text-slate-400">kcal</span>
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">Com atividade física</span>
          </div>

          <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/40 p-4">
            <span className="text-xs text-emerald-300">Meta Diária de Calorias</span>
            <p className="text-2xl font-bold text-emerald-400 font-mono-tabular mt-1">
              {previewMetrics.dailyCaloriesKcal}{' '}
              <span className="text-xs font-normal text-emerald-300">kcal</span>
            </p>
            <span className="text-[11px] text-emerald-300/80 mt-1 block">
              Défice seguro: -{previewMetrics.safeDeficitKcal} kcal/dia
            </span>
          </div>

          <div className="rounded-xl bg-slate-950/90 border border-slate-800/90 p-4">
            <span className="text-xs text-slate-400">Meta de Proteína Diária</span>
            <p className="text-2xl font-bold text-white font-mono-tabular mt-1">
              {previewMetrics.dailyProteinGrams}{' '}
              <span className="text-xs font-normal text-slate-400">g/dia</span>
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">Preservação e tonificação</span>
          </div>
        </div>

        <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Peso a eliminar até a meta</span>
            <span className="font-semibold text-white font-mono-tabular">
              {previewMetrics.weightToLoseKg} kg
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Hidratação diária recomendada</span>
            <span className="font-semibold text-white font-mono-tabular">
              {previewMetrics.dailyWaterGlasses} copos ({previewMetrics.dailyWaterGlasses * 250} ml)
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Tempo estimado saudável</span>
            <span className="font-semibold text-emerald-400 font-mono-tabular">
              {previewMetrics.estimatedWeeks > 0
                ? `${previewMetrics.estimatedWeeks} semanas`
                : 'Meta atingida'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Distribuição de Macros</span>
            <span className="text-slate-300 font-mono-tabular">
              P: {previewMetrics.dailyProteinGrams}g · C: {previewMetrics.dailyCarbsGrams}g · G:{' '}
              {previewMetrics.dailyFatsGrams}g
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 text-xs text-slate-400 leading-relaxed pt-1">
          <Flame className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            O plano alimentar prioriza ingredientes naturais dos mercados de Moçambique (mandioca, batata-doce, peixe fresco, feijão nhemba, couve e ovos), evitando produtos importados caros.
          </p>
        </div>
      </div>
    </div>
  );
};
