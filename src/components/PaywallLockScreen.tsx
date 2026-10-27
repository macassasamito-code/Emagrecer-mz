import React, { useState } from 'react';
import { ClientAccount } from '../data/seedData';
import { formatMzn } from '../utils/nutrition';
import { CheckCircle2, Lock, PhoneCall, ShieldAlert, Smartphone } from 'lucide-react';

interface PaywallLockScreenProps {
  client: ClientAccount;
  onReactivateNow: (method: 'M-Pesa' | 'e-Mola', transactionCode: string) => void;
  onOpenAdminPanel: () => void;
}

export const PaywallLockScreen: React.FC<PaywallLockScreenProps> = ({
  client,
  onReactivateNow,
  onOpenAdminPanel,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'M-Pesa' | 'e-Mola'>(client.paymentMethod);
  const [txCode, setTxCode] = useState('MP261026.884K');

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    onReactivateNow(selectedMethod, txCode.trim() || 'MP261026.AUTO');
  };

  return (
    <div className="max-w-2xl mx-auto my-6 rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
            <ShieldAlert className="w-4 h-4" />
            <span>
              Assinatura {client.subscriptionStatus === 'suspended' ? 'Suspensa / Pausada' : 'Vencida'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Renove o seu acesso ao CorpoFit MZ
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Olá, <strong>{client.name}</strong>! O teu plano personalizado e o histórico na Coach Fit IA estão guardados em segurança. Efetua a renovação mensal de{' '}
            <strong className="text-emerald-400 font-mono-tabular">
              {formatMzn(client.monthlyFeeMzn)}
            </strong>{' '}
            via <strong>M-Pesa</strong> ou <strong>e-Mola</strong> para desbloquear o acesso imediato.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
          <Lock className="w-6 h-6 text-amber-400" />
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => {
            setSelectedMethod('M-Pesa');
            setTxCode('MP261026.884K');
          }}
          className={`min-h-[68px] p-4 rounded-xl border text-left transition-colors flex items-center justify-between cursor-pointer ${
            selectedMethod === 'M-Pesa'
              ? 'bg-emerald-950/30 border-emerald-500 text-white'
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div>
            <p className="text-sm font-bold text-white">Vodacom M-Pesa</p>
            <p className="text-xs text-slate-400 font-mono-tabular mt-0.5">
              Marque *150# · Agente / Conta 84 900 1234
            </p>
          </div>
          <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedMethod('e-Mola');
            setTxCode('EM261026.551M');
          }}
          className={`min-h-[68px] p-4 rounded-xl border text-left transition-colors flex items-center justify-between cursor-pointer ${
            selectedMethod === 'e-Mola'
              ? 'bg-emerald-950/30 border-emerald-500 text-white'
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div>
            <p className="text-sm font-bold text-white">Movitel e-Mola</p>
            <p className="text-xs text-slate-400 font-mono-tabular mt-0.5">
              Marque *898# · Conta Comercial 86 900 1234
            </p>
          </div>
          <PhoneCall className="w-5 h-5 text-emerald-400 shrink-0" />
        </button>
      </div>

      {/* Step-by-step instructions */}
      <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300">
          Instruções Rápidas de Reativação ({selectedMethod}):
        </h3>
        <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 leading-relaxed">
          <li>
            No seu telemóvel, marque{' '}
            <strong className="font-mono-tabular text-white">
              {selectedMethod === 'M-Pesa' ? '*150#' : '*898#'}
            </strong>{' '}
            e selecione <strong>Transferir / Pagamentos</strong>.
          </li>
          <li>
            Envie o valor da mensalidade:{' '}
            <strong className="text-emerald-400 font-mono-tabular">
              {formatMzn(client.monthlyFeeMzn)}
            </strong>{' '}
            para a conta CorpoFit MZ.
          </li>
          <li>
            Insira abaixo o código de confirmação SMS para libertar imediatamente o Plano e o Chat Coach Fit IA.
          </li>
        </ol>
      </div>

      <form onSubmit={handleConfirm} className="space-y-4">
        <div>
          <label htmlFor="tx-code-input" className="block text-xs font-medium text-slate-300 mb-1.5">
            Código SMS de Confirmação ({selectedMethod})
          </label>
          <input
            id="tx-code-input"
            type="text"
            value={txCode}
            onChange={(e) => setTxCode(e.target.value)}
            className="w-full min-h-[44px] rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm font-mono-tabular text-white focus:border-emerald-500 focus:outline-none"
            placeholder="Ex: MP261026.884K"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="min-h-[48px] flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar Pagamento {selectedMethod} & Desbloquear</span>
          </button>

          <button
            type="button"
            onClick={onOpenAdminPanel}
            className="min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            Ir ao Painel Admin (/admin)
          </button>
        </div>
      </form>
    </div>
  );
};
