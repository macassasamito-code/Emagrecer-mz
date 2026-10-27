import React, { useState } from 'react';
import { ClientAccount } from '../data/seedData';
import { formatMzn, SubscriptionStatus } from '../utils/nutrition';
import { SUPABASE_POSTGRES_SCHEMA_SQL } from '../data/supabaseSchema';
import {
  Check,
  Copy,
  Database,
  Eye,
  PauseCircle,
  PlayCircle,
  Search,
  UserPlus,
  XCircle,
} from 'lucide-react';

interface AdminDashboardViewProps {
  clients: ClientAccount[];
  activeClientId: string;
  onUpdateClientStatus: (clientId: string, newStatus: SubscriptionStatus) => void;
  onSelectActiveClient: (clientId: string) => void;
  onAddNewClient: (client: Omit<ClientAccount, 'id' | 'registeredAt' | 'lastPaymentRef' | 'nextBillingDate'>) => void;
}

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'Ativo (Pago)',
  pending: 'Pendente Confirmação',
  suspended: 'Suspenso (Bloqueado)',
  expired: 'Vencido (Paywall)',
};

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  clients,
  activeClientId,
  onUpdateClientStatus,
  onSelectActiveClient,
  onAddNewClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SubscriptionStatus>('all');
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('+258 84 ');
  const [newEmail, setNewEmail] = useState('');
  const [newCity, setNewCity] = useState('Maputo');
  const [newMethod, setNewMethod] = useState<'M-Pesa' | 'e-Mola'>('M-Pesa');

  const activeCount = clients.filter((c) => c.subscriptionStatus === 'active').length;
  const blockedCount = clients.filter(
    (c) => c.subscriptionStatus === 'suspended' || c.subscriptionStatus === 'expired'
  ).length;
  const mrrMzn = activeCount * 450;

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || client.subscriptionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopySql = () => {
    navigator.clipboard?.writeText(SUPABASE_POSTGRES_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleCreateClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;
    onAddNewClient({
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim() || '+258 84 000 0000',
      city: newCity.trim() || 'Maputo',
      subscriptionStatus: 'active',
      paymentMethod: newMethod,
      monthlyFeeMzn: 450,
      age: 30,
      gender: 'female',
      currentWeightKg: 75,
      heightCm: 165,
      targetWeightKg: 65,
      activityLevel: 'moderate',
      focusGoal: 'abdomen',
    });
    setNewName('');
    setNewEmail('');
    setNewPhone('+258 84 ');
    setShowNewUserModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <p className="text-xs font-medium text-emerald-400">
            Painel Administrativo Secreto (/admin)
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
            Gestão de Assinaturas, Acesso IA & M-Pesa / e-Mola
          </h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setShowSqlModal(true)}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ver Esquema SQL (Supabase)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewUserModal(true)}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Cadastrar Cliente MZ</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
          <span className="text-xs text-slate-400">Total de Clientes</span>
          <p className="text-2xl font-bold text-white font-mono-tabular mt-1">
            {clients.length}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Maputo, Matola, Beira, Nampula
          </span>
        </div>

        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
          <span className="text-xs text-slate-400">Assinaturas Ativas</span>
          <p className="text-2xl font-bold text-emerald-400 font-mono-tabular mt-1">
            {activeCount}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Acesso total liberado
          </span>
        </div>

        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
          <span className="text-xs text-slate-400">Receita Mensal (MRR)</span>
          <p className="text-2xl font-bold text-white font-mono-tabular mt-1">
            {formatMzn(mrrMzn)}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Via M-Pesa & e-Mola (450 MZN/mês)
          </span>
        </div>

        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
          <span className="text-xs text-slate-400">Suspensos / Vencidos</span>
          <p className="text-2xl font-bold text-amber-400 font-mono-tabular mt-1">
            {blockedCount}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Em tela de Paywall M-Pesa
          </span>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <label htmlFor="admin-search" className="sr-only">
            Pesquisar cliente por nome, telefone ou email
          </label>
          <input
            id="admin-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome, telefone (+258 84/86), email ou cidade..."
            className="w-full min-h-[42px] rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'active', label: 'Ativos' },
            { id: 'pending', label: 'Pendentes' },
            { id: 'suspended', label: 'Suspensos' },
            { id: 'expired', label: 'Vencidos' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
              className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* High-Density Client Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 bg-slate-950/60">
                <th className="py-3.5 px-4">Cliente & Cidade</th>
                <th className="py-3.5 px-4">Telefone & Email</th>
                <th className="py-3.5 px-4">Cadastro & Via</th>
                <th className="py-3.5 px-4">Status da Mensalidade</th>
                <th className="py-3.5 px-4 text-right">Ações Rápidas (1 Clique)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredClients.map((client) => {
                const isSimulatedUser = client.id === activeClientId;
                return (
                  <tr
                    key={client.id}
                    className={`transition-colors ${
                      isSimulatedUser ? 'bg-emerald-950/15' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{client.name}</span>
                        {isSimulatedUser && (
                          <span className="text-[11px] font-normal text-emerald-400">
                            · Sessão Atual
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 mt-0.5">
                        {client.city} · Meta: {client.currentWeightKg}kg → {client.targetWeightKg}kg
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono-tabular text-slate-200">{client.phone}</div>
                      <div className="text-slate-400 mt-0.5">{client.email}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono-tabular">
                      <div className="text-slate-200">{client.registeredAt}</div>
                      <div className="text-slate-400 mt-0.5">
                        {client.paymentMethod} · {formatMzn(client.monthlyFeeMzn)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          client.subscriptionStatus === 'active'
                            ? 'text-emerald-400'
                            : client.subscriptionStatus === 'pending'
                            ? 'text-sky-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {STATUS_LABELS[client.subscriptionStatus]}
                      </span>
                      <div className="text-[11px] text-slate-500 font-mono-tabular mt-0.5">
                        Ref: {client.lastPaymentRef}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onUpdateClientStatus(client.id, 'active')}
                          disabled={client.subscriptionStatus === 'active'}
                          aria-label={`Ativar assinatura de ${client.name}`}
                          className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 disabled:opacity-35 text-emerald-300 font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <PlayCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Ativar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onUpdateClientStatus(client.id, 'suspended')}
                          disabled={client.subscriptionStatus === 'suspended'}
                          aria-label={`Pausar assinatura de ${client.name}`}
                          className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 disabled:opacity-35 text-amber-300 font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <PauseCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Pausar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onUpdateClientStatus(client.id, 'expired')}
                          disabled={client.subscriptionStatus === 'expired'}
                          aria-label={`Cancelar assinatura de ${client.name}`}
                          className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 disabled:opacity-35 text-rose-300 font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Cancelar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectActiveClient(client.id)}
                          aria-label={`Simular visão do cliente ${client.name}`}
                          className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Simular</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Client Registration */}
      {showNewUserModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-client-modal-title"
        >
          <form
            onSubmit={handleCreateClientSubmit}
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4"
          >
            <h3 id="new-client-modal-title" className="text-base font-bold text-white">
              Cadastrar Novo Cliente Moçambicano
            </h3>

            <div>
              <label htmlFor="new-client-name" className="block text-xs text-slate-300 mb-1">
                Nome Completo
              </label>
              <input
                id="new-client-name"
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Inocêncio Mabote"
                className="w-full min-h-[42px] rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label htmlFor="new-client-phone" className="block text-xs text-slate-300 mb-1">
                Telefone (Vodacom 84/85 ou Movitel 86/87)
              </label>
              <input
                id="new-client-phone"
                type="text"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full min-h-[42px] rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-sm font-mono-tabular text-white"
              />
            </div>

            <div>
              <label htmlFor="new-client-email" className="block text-xs text-slate-300 mb-1">
                Email de Acesso
              </label>
              <input
                id="new-client-email"
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="inocencio@gmail.com"
                className="w-full min-h-[42px] rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-sm text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="new-client-city" className="block text-xs text-slate-300 mb-1">
                  Cidade / Província
                </label>
                <input
                  id="new-client-city"
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full min-h-[42px] rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="new-client-method" className="block text-xs text-slate-300 mb-1">
                  Via de Pagamento
                </label>
                <select
                  id="new-client-method"
                  value={newMethod}
                  onChange={(e) => setNewMethod(e.target.value as 'M-Pesa' | 'e-Mola')}
                  className="w-full min-h-[42px] rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-sm text-white"
                >
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="e-Mola">e-Mola</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowNewUserModal(false)}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-800 text-xs font-medium text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="min-h-[42px] px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-semibold cursor-pointer"
              >
                Salvar & Ativar Acesso
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: PostgreSQL / Supabase SQL Schema */}
      {showSqlModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sql-schema-title"
        >
          <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 id="sql-schema-title" className="text-base font-bold text-white">
                  Esquema PostgreSQL / Supabase (Users, Profiles, Plans, Posts, Subscriptions)
                </h3>
                <p className="text-xs text-slate-400">
                  Compatível com Supabase Auth, RLS e webhooks M-Pesa / e-Mola.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopySql}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Esquema Copiado' : 'Copiar SQL'}</span>
              </button>
            </div>

            <pre className="flex-1 overflow-y-auto rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs font-mono-tabular text-emerald-300 leading-relaxed">
              {SUPABASE_POSTGRES_SCHEMA_SQL}
            </pre>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="min-h-[42px] px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer"
              >
                Fechar Esquema
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
