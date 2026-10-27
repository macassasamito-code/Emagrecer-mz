import React, { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  calculateWeightProgressSummary,
  WeightLogEntry,
} from '../utils/nutrition';
import { Check, Plus, Scale, TrendingDown } from 'lucide-react';

interface WeightProgressChartProps {
  weightHistory: WeightLogEntry[];
  targetWeightKg: number;
  onLogNewWeight: (newWeightKg: number, note?: string) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: WeightLogEntry;
  }>;
  label?: string;
}

const WeightChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const entry = payload[0].payload;
  const diffToTarget = Number((entry.weightKg - entry.targetWeightKg).toFixed(1));

  return (
    <div className="rounded-xl bg-slate-950/95 border border-slate-700 px-3.5 py-2.5 shadow-xl text-xs space-y-1">
      <div className="flex items-center justify-between gap-4 text-slate-400">
        <span className="font-semibold text-white">{entry.weekLabel}</span>
        <span className="font-mono-tabular">{entry.date}</span>
      </div>
      <p className="text-sm font-bold text-emerald-400 font-mono-tabular">
        {entry.weightKg.toFixed(1)} kg
      </p>
      <p className="text-[11px] text-slate-400 font-mono-tabular">
        {diffToTarget > 0
          ? `Faltam ${diffToTarget.toFixed(1)} kg para a meta (${entry.targetWeightKg.toFixed(1)} kg)`
          : `Meta de ${entry.targetWeightKg.toFixed(1)} kg atingida!`}
      </p>
      {entry.note && (
        <p className="text-[11px] text-slate-300 pt-1 border-t border-slate-800">
          {entry.note}
        </p>
      )}
    </div>
  );
};

export const WeightProgressChart: React.FC<WeightProgressChartProps> = ({
  weightHistory,
  targetWeightKg,
  onLogNewWeight,
}) => {
  const summary = calculateWeightProgressSummary(weightHistory, targetWeightKg);

  const [isLoggingOpen, setIsLoggingOpen] = useState(false);
  const [newWeightInput, setNewWeightInput] = useState<string>(
    String(Number(Math.max(35, summary.currentWeightKg - 0.6).toFixed(1)))
  );
  const [newNoteInput, setNewNoteInput] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [justSavedFeedback, setJustSavedFeedback] = useState<boolean>(false);

  const allWeights = weightHistory.map((w) => w.weightKg).concat([targetWeightKg]);
  const minWeight = Math.floor(Math.min(...allWeights) - 2);
  const maxWeight = Math.ceil(Math.max(...allWeights) + 2);

  const handleSubmitWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(newWeightInput.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed < 35 || parsed > 250) {
      setValidationError('Insira um peso válido entre 35 kg e 250 kg.');
      return;
    }

    setValidationError('');
    onLogNewWeight(Number(parsed.toFixed(1)), newNoteInput.trim() || undefined);
    setNewNoteInput('');
    setNewWeightInput(String(Number(Math.max(35, parsed - 0.5).toFixed(1))));
    setIsLoggingOpen(false);
    setJustSavedFeedback(true);
    setTimeout(() => setJustSavedFeedback(false), 3000);
  };

  return (
    <section
      aria-label="Evolução Semanal da Perda de Peso"
      data-testid="weight-progress-chart-section"
      className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-6"
    >
      {/* Header & Quick Summary Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              Histórico de Pesagens Semanais
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">
              Início: {summary.startWeightKg.toFixed(1)} kg
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">
              Atual: {summary.currentWeightKg.toFixed(1)} kg
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular text-emerald-400">
              Total eliminado: -{summary.totalLostKg.toFixed(1)} kg ({summary.progressPercentage}% da meta)
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Progresso da Perda de Peso ao Longo das Semanas
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {justSavedFeedback && (
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Pesagem registada!
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setValidationError('');
              setIsLoggingOpen((prev) => !prev);
            }}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isLoggingOpen ? 'Fechar Registo' : 'Registar Pesagem Semanal'}</span>
          </button>
        </div>
      </div>

      {/* Inline Collapsible Form to Log a New Weekly Weigh-In */}
      {isLoggingOpen && (
        <form
          onSubmit={handleSubmitWeight}
          className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="w-full sm:w-44">
              <label
                htmlFor="new-weekly-weight-input"
                className="block text-xs font-medium text-slate-300 mb-1"
              >
                Novo Peso da Semana (kg)
              </label>
              <input
                id="new-weekly-weight-input"
                type="number"
                step="0.1"
                min="35"
                max="250"
                value={newWeightInput}
                onChange={(e) => setNewWeightInput(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono-tabular focus:outline-none focus:border-emerald-500"
                placeholder="Ex: 75.8"
                required
              />
            </div>

            <div className="flex-1">
              <label
                htmlFor="new-weekly-weight-note"
                className="block text-xs font-medium text-slate-300 mb-1"
              >
                Nota da Semana (opcional)
              </label>
              <input
                id="new-weekly-weight-note"
                type="text"
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="Ex: Pesagem em jejum após 4 treinos funcionais"
              />
            </div>

            <button
              type="submit"
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Scale className="w-4 h-4" />
              <span>Salvar Pesagem</span>
            </button>
          </div>

          {validationError && (
            <p role="alert" className="text-xs text-rose-400">
              {validationError}
            </p>
          )}
        </form>
      )}

      {/* Recharts LineChart Container */}
      <div className="w-full h-72 sm:h-80" data-testid="recharts-weight-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={weightHistory}
            margin={{ top: 12, right: 20, left: 0, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1E293B"
              vertical={false}
            />
            <XAxis
              dataKey="weekLabel"
              stroke="#94A3B8"
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#1E293B' }}
            />
            <YAxis
              domain={[minWeight, maxWeight]}
              stroke="#94A3B8"
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              unit=" kg"
              width={58}
            />
            <Tooltip content={<WeightChartTooltip />} />
            <ReferenceLine
              y={targetWeightKg}
              stroke="#38BDF8"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              label={{
                value: `Meta: ${targetWeightKg} kg`,
                position: 'insideTopRight',
                fill: '#38BDF8',
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="weightKg"
              name="Peso Corporal (kg)"
              stroke="#10B981"
              strokeWidth={3}
              dot={{
                r: 5,
                fill: '#090D16',
                stroke: '#10B981',
                strokeWidth: 2.5,
              }}
              activeDot={{
                r: 7,
                fill: '#10B981',
                stroke: '#FFFFFF',
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Scannable Weekly History Strip & Legend */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono-tabular">
          {weightHistory.map((item, idx) => {
            const prevWeight = idx > 0 ? weightHistory[idx - 1].weightKg : item.weightKg;
            const delta = Number((item.weightKg - prevWeight).toFixed(1));
            return (
              <span key={`${item.weekLabel}-${idx}`} className="inline-flex items-center gap-1">
                <strong className="text-slate-300">{item.weekLabel}:</strong>
                <span className="text-white">{item.weightKg.toFixed(1)}kg</span>
                {idx > 0 && delta !== 0 && (
                  <span className={delta < 0 ? 'text-emerald-400' : 'text-amber-400'}>
                    ({delta > 0 ? `+${delta}` : delta}kg)
                  </span>
                )}
              </span>
            );
          })}
        </div>

        <div className="flex items-center gap-4 shrink-0 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
            Peso Registado (kg)
          </span>
          <span className="flex items-center gap-1.5 text-sky-400 font-mono-tabular">
            <span className="w-3 h-0.5 border-b border-dashed border-sky-400 inline-block" />
            Meta ({targetWeightKg.toFixed(1)} kg)
          </span>
        </div>
      </div>
    </section>
  );
};
