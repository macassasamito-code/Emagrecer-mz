import React, { useState } from 'react';
import {
  CalculatedMetrics,
  FOCUS_LABELS,
  UserProfileInput,
} from '../utils/nutrition';
import { ChatMessage } from '../data/seedData';
import { CoachAvatarIllustration } from './CulinaryArt';
import { Send, Sparkles } from 'lucide-react';

interface CoachChatViewProps {
  profile: UserProfileInput;
  metrics: CalculatedMetrics;
  messages: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
}

const QUICK_PROMPTS = [
  'O que comer ao lanche hoje?',
  'Como substituir o pão de manhã?',
  'Dói-me as costas nos agachamentos',
  'Posso comer xima ou matapa ao almoço?',
];

export const CoachChatView: React.FC<CoachChatViewProps> = ({
  profile,
  metrics,
  messages,
  onAddMessage,
}) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
    };

    onAddMessage(userMsg);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          profile: {
            name: profile.name,
            age: profile.age,
            gender: profile.gender,
            currentWeightKg: profile.currentWeightKg,
            targetWeightKg: profile.targetWeightKg,
            heightCm: profile.heightCm,
            focusGoalLabel: FOCUS_LABELS[profile.focusGoal],
            dailyCaloriesKcal: metrics.dailyCaloriesKcal,
            dailyProteinGrams: metrics.dailyProteinGrams,
            bmrKcal: metrics.bmrKcal,
          },
        }),
      });

      const data = (await response.json()) as { reply?: string };
      const coachMsg: ChatMessage = {
        id: `coach-${Date.now()}`,
        sender: 'coach',
        text:
          data.reply ||
          `Estou aqui contigo, ${profile.name}! Mantém o foco na tua meta de ${metrics.dailyCaloriesKcal} kcal/dia e ${metrics.dailyProteinGrams}g de proteína.`,
        timestamp: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
      };
      onAddMessage(coachMsg);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `coach-${Date.now()}`,
        sender: 'coach',
        text: `${profile.name}, para manteres a tua meta de ${metrics.dailyCaloriesKcal} kcal e ${metrics.dailyProteinGrams}g de proteína em Moçambique, aposta em mandioca ou batata-doce cozida com ovos de manhã, e peixe grelhado com feijão nhemba e couve ao almoço!`,
        timestamp: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
      };
      onAddMessage(fallbackMsg);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(input);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Context Summary */}
      <aside className="lg:col-span-4 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-5">
        <div className="flex items-center gap-3.5">
          <CoachAvatarIllustration className="w-12 h-12" />
          <div>
            <h2 className="text-base font-bold text-white">Coach Amina IA</h2>
            <p className="text-xs text-slate-400">
              Nutricionista & Personal Trainer · Moçambique
            </p>
          </div>
        </div>

        <div className="py-4 border-y border-slate-800 space-y-2.5 text-xs">
          <p className="font-semibold text-emerald-400">
            Contexto Biométrico Sincronizado
          </p>
          <div className="flex justify-between text-slate-300">
            <span>Cliente:</span>
            <span className="font-semibold text-white">{profile.name}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Peso Atual → Alvo:</span>
            <span className="font-mono-tabular font-semibold text-white">
              {profile.currentWeightKg} kg → {profile.targetWeightKg} kg
            </span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Meta Calórica:</span>
            <span className="font-mono-tabular font-semibold text-emerald-400">
              {metrics.dailyCaloriesKcal} kcal/dia
            </span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Meta de Proteína:</span>
            <span className="font-mono-tabular font-semibold text-white">
              {metrics.dailyProteinGrams} g/dia
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-400">
            Perguntas Rápidas Frequentes:
          </p>
          <div className="flex flex-col gap-2">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendQuestion(q)}
                disabled={isTyping}
                className="min-h-[42px] text-left px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                “{q}”
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Right Chat Stream */}
      <section className="lg:col-span-8 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col h-[580px]">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">
              Consultoria Direta — Coach Fit IA (Gemini)
            </h3>
            <p className="text-xs text-slate-400">
              Respostas personalizadas para os teus alimentos locais e treino em casa
            </p>
          </div>
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
        </div>

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => {
            const isCoach = msg.sender === 'coach';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  isCoach ? 'justify-start' : 'justify-end'
                }`}
              >
                {isCoach && <CoachAvatarIllustration className="w-8 h-8 mt-1" />}
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    isCoach
                      ? 'bg-slate-950 border border-slate-800 text-slate-200'
                      : 'bg-emerald-500 text-slate-950 font-medium'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1.5 font-mono-tabular ${
                      isCoach ? 'text-slate-500' : 'text-slate-900/80'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-3" role="status" aria-label="Coach Amina está a escrever">
              <CoachAvatarIllustration className="w-8 h-8" />
              <div className="rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 flex items-center gap-2">
                <span className="text-xs text-slate-400">Coach Amina está a analisar o teu plano</span>
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input form */}
        <form
          onSubmit={handleFormSubmit}
          className="p-4 border-t border-slate-800 flex items-center gap-3 bg-slate-950/60 rounded-b-2xl"
        >
          <label htmlFor="coach-chat-input" className="sr-only">
            Escreva a sua dúvida para a Coach Fit IA
          </label>
          <input
            id="coach-chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunta sobre substituições locais, lanches ou dores no treino..."
            className="flex-1 min-h-[44px] rounded-xl bg-slate-900 border border-slate-800 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar</span>
          </button>
        </form>
      </section>
    </div>
  );
};
