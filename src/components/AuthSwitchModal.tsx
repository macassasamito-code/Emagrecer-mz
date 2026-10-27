import React, { useState } from 'react';
import { ClientAccount } from '../data/seedData';
import { Check, Lock, Phone, Shield, UserCheck, X } from 'lucide-react';

interface AuthSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientAccount[];
  activeClientId: string;
  onSelectClient: (clientId: string) => void;
  onOpenAdmin: () => void;
}

export const AuthSwitchModal: React.FC<AuthSwitchModalProps> = ({
  isOpen,
  onClose,
  clients,
  activeClientId,
  onSelectClient,
  onOpenAdmin,
}) => {
  const [phoneOrEmail, setPhoneOrEmail] = useState('+258 84 382 9104');
  const [password, setPassword] = useState('••••••••');
  const [authFeedback, setAuthFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = clients.find(
      (c) =>
        c.email.toLowerCase() === phoneOrEmail.trim().toLowerCase() ||
        c.phone.replace(/\s+/g, '').includes(phoneOrEmail.replace(/\s+/g, ''))
    );
    if (matched) {
      onSelectClient(matched.id);
      setAuthFeedback(`Sessão iniciada como ${matched.name}`);
      setTimeout(() => {
        setAuthFeedback(null);
        onClose();
      }, 600);
    } else {
      onSelectClient(clients[0].id);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <p className="text-xs font-medium text-emerald-400">
              Autenticação Moçambique (Email / Telefone +258)
            </p>
            <h3 id="auth-modal-title" className="text-lg font-bold text-white mt-0.5">
              Acesso à Conta & Simulador de Assinaturas
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de autenticação"
            className="min-h-[40px] min-w-[40px] rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {authFeedback && (
          <div className="rounded-xl bg-emerald-950/80 border border-emerald-600 px-4 py-2.5 text-xs text-emerald-200 font-medium">
            {authFeedback}
          </div>
        )}

        {/* Standard Email / Phone Login Form */}
        <form onSubmit={handleManualLogin} className="space-y-3">
          <div>
            <label htmlFor="auth-identifier" className="block text-xs font-medium text-slate-300 mb-1">
              Telefone (+258 84/85/86/87) ou Email
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-identifier"
                type="text"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                className="w-full min-h-[42px] rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2 text-sm text-white font-mono-tabular focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-medium text-slate-300 mb-1">
              Palavra-passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full min-h-[42px] rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="min-h-[44px] w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Entrar na Plataforma</span>
          </button>
        </form>

        {/* Quick Demo Account Switcher to test Active vs Paywall (Suspended/Expired) */}
        <div className="pt-3 border-t border-slate-800 space-y-2.5">
          <p className="text-xs font-semibold text-slate-300">
            Troca Rápida de Perfil (Teste de Status M-Pesa / Paywall):
          </p>
          <div className="space-y-2">
            {clients.slice(0, 4).map((client) => {
              const isSelected = client.id === activeClientId;
              return (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => {
                    onSelectClient(client.id);
                    onClose();
                  }}
                  className={`min-h-[48px] w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/30 border-emerald-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-white">
                      {client.name} · <span className="font-normal text-slate-400">{client.city}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono-tabular mt-0.5">
                      {client.phone} · Via {client.paymentMethod}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-semibold ${
                        client.subscriptionStatus === 'active'
                          ? 'text-emerald-400'
                          : client.subscriptionStatus === 'pending'
                          ? 'text-sky-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {client.subscriptionStatus.toUpperCase()}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400">Acesso de Gestão:</span>
          <button
            type="button"
            onClick={() => {
              onOpenAdmin();
              onClose();
            }}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Abrir Painel Admin (/admin)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
