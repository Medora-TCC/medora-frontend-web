import { useState } from 'react';
import { Card, Button } from '@heroui/react';
import {
  CheckCircle2, XCircle, Clock, Users,
  MonitorDot, Timer,
  AlertTriangle, Bell, Star,
  FileWarning, UserX, HeartPulse,
  MessageSquare, Stethoscope, BadgeCheck,
  FileLock2, LogIn, DownloadCloud, ShieldAlert,
  ChevronRight, ArrowUpRight, ArrowDownRight,
  Activity, BarChart3
} from 'lucide-react';


const systemStatus = {
  status: 'instability',
  message: 'Instabilidade detectada nos agendamentos',
  detail: 'Lentidão ao confirmar consultas via app mobile. Time técnico notificado.',
  since: '14 min atrás',
};

const pendingCredentials = [
  { id: 1, name: 'Dr. Rafael Augusto Lima',   specialty: 'Cardiologia',    crm: 'CRM-SP 148.392',  submitted: '2 dias atrás', docs: 'ok',      avatar: 'RL' },
  { id: 2, name: 'Dra. Fernanda Melo',         specialty: 'Dermatologia',   crm: 'CRM-RJ 92.714',   submitted: '3 dias atrás', docs: 'pending', avatar: 'FM' },
  { id: 3, name: 'Dr. Cláudio Teixeira',       specialty: 'Psiquiatria',    crm: 'CRM-MG 67.208',   submitted: '5 dias atrás', docs: 'expired', avatar: 'CT' },
  { id: 4, name: 'Dra. Isabela Vasconcelos',   specialty: 'Ginecologia',    crm: 'CRM-BA 31.055',   submitted: '1 dia atrás',  docs: 'ok',      avatar: 'IV' },
];

const docAlerts = [
  { name: 'Dr. Marcus Oliveira',   issue: 'CRM vencido em 15/05/2026',        type: 'expired',  urgency: 'alta'  },
  { name: 'Dra. Patrícia Nunes',   issue: 'Termo de responsabilidade pendente', type: 'pending', urgency: 'média' },
  { name: 'Dr. Jonas Ferreira',    issue: 'RQE não cadastrado',                type: 'missing',  urgency: 'alta'  },
  { name: 'Dra. Camila Rocha',     issue: 'Seguro de responsabilidade civil expirado', type: 'expired', urgency: 'média' },
];

const operationalMetrics = [
  { label: 'Usuários Ativos',       value: '1.842',  delta: 12.4,   icon: <Users size={18} />,        color: '#4F8EF7' },
  { label: 'Consultas Hoje',        value: '619',    delta: 8.1,    icon: <Stethoscope size={18} />,   color: '#34D399' },
  { label: 'Telemedicina Ativas',   value: '87',     delta: 22.1,   icon: <MonitorDot size={18} />,    color: '#A78BFA' },
  { label: 'Taxa de No-Show',       value: '11,3%',  delta: -2.4,   icon: <UserX size={18} />,         color: '#F87171' },
  { label: 'Avaliação Média',       value: '4,7 ★',  delta: 0.3,    icon: <Star size={18} />,          color: '#FBBF24' },
  { label: 'Espera Telemedicina',   value: '3m 12s', delta: -18.5,  icon: <Timer size={18} />,         color: '#34D399' },
];

const auditLogs = [
  { user: 'Admin Rodrigo Silva',  action: 'Exportou relatório de prontuários',       risk: 'high',   time: '08:41',  date: 'Hoje'    },
  { user: 'Dr. Paulo Mendes',     action: 'Acessou prontuário fora do seu paciente', risk: 'high',   time: '07:15',  date: 'Hoje'    },
  { user: 'Sistema',              action: 'Acesso bloqueado: IP estrangeiro (DE)',    risk: 'high',   time: '06:02',  date: 'Hoje'    },
  { user: 'Enf. Clara Dias',      action: 'Visualizou histórico de exames (42 reg.)',risk: 'medium', time: '23:49',  date: 'Ontem'   },
  { user: 'Dr. Tiago Souza',      action: 'Login fora do horário comercial (23h)',   risk: 'medium', time: '23:17',  date: 'Ontem'   },
  { user: 'Admin Rodrigo Silva',  action: 'Criou novo perfil de acesso Admin',       risk: 'low',    time: '15:30',  date: 'Ontem'   },
];

const supportTickets = [
  { id: '#4821', user: 'Paciente: Ana Lima',        issue: 'Não consigo acessar minha câmera na teleconsulta', category: 'Técnico',   priority: 'alta',  status: 'aberto',      time: '18 min' },
  { id: '#4820', user: 'Dr. Felipe Costa',          issue: 'Prontuário não salva alterações no Safari',       category: 'Técnico',   priority: 'alta',  status: 'em andamento', time: '1h 04min' },
  { id: '#4819', user: 'Paciente: José Pereira',    issue: 'Cobrança duplicada na consulta do dia 01/06',      category: 'Financeiro', priority: 'média', status: 'aberto',      time: '3h 22min' },
  { id: '#4818', user: 'Dra. Renata Alves',         issue: 'Agenda não sincronizando com Google Calendar',    category: 'Integração', priority: 'baixa', status: 'aberto',      time: '1 dia'   },
  { id: '#4817', user: 'Paciente: Marcos Silva',    issue: 'Receita médica não chegou por e-mail',            category: 'Notificação', priority: 'média', status: 'resolvido',  time: '1 dia'   },
];

const recentActivity = [
  { user: 'Dr. Mariana Costa',   action: 'Emitiu prescrição digital',    time: '1 min',   color: '#34D399' },
  { user: 'Dra. Juliana Alves',  action: 'Iniciou teleconsulta',         time: '7 min',   color: '#A78BFA' },
  { user: 'Enf. Carla Souza',    action: 'Cadastrou novo paciente',      time: '21 min',  color: '#34D399' },
  { user: 'Dr. Pedro Mendes',    action: 'Atualizou disponibilidade',    time: '32 min',  color: '#FBBF24' },
  { user: 'Admin Rodrigo Silva', action: 'Aprovou credencial médica',    time: '45 min',  color: '#4F8EF7' },
];


function SystemStatusBanner() {
  const config = {
    ok:          { bg: 'bg-emerald-50 border-emerald-200',     icon: <CheckCircle2 size={18} className="text-emerald-600" />, textColor: 'text-emerald-800',  badgeBg: 'bg-emerald-100 text-emerald-700' },
    instability: { bg: 'bg-amber-50 border-amber-200',         icon: <AlertTriangle size={18} className="text-amber-600" />, textColor: 'text-amber-900',    badgeBg: 'bg-amber-100 text-amber-700'   },
    outage:      { bg: 'bg-red-50 border-red-200',             icon: <XCircle size={18} className="text-red-600" />,         textColor: 'text-red-900',      badgeBg: 'bg-red-100 text-red-700'       },
  };
  const c = config[systemStatus.status as keyof typeof config];
  return (
    <div className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${c.bg}`}>
      <span className="mt-0.5 shrink-0">{c.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-semibold ${c.textColor}`}>{systemStatus.message}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.badgeBg}`}>{systemStatus.since}</span>
        </div>
        <p className={`text-xs mt-0.5 opacity-80 ${c.textColor}`}>{systemStatus.detail}</p>
      </div>
      <button className={`text-xs font-medium underline underline-offset-2 shrink-0 mt-0.5 ${c.textColor} opacity-70 hover:opacity-100`}>Ver detalhes</button>
    </div>
  );
}

function DocsStatus({ status }: { status: string }) {
  if (status === 'ok') return <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle2 size={12} /> Documentação OK</span>;
  if (status === 'pending') return <span className="flex items-center gap-1 text-xs font-medium text-amber-600"><Clock size={12} /> Docs pendentes</span>;
  if (status === 'expired') return <span className="flex items-center gap-1 text-xs font-medium text-red-500"><FileWarning size={12} /> Doc vencido</span>;
  return null;
}

function RiskBadge({ risk }: { risk: string }) {
  const map: Record<string, string> = {
    high:   'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low:    'bg-slate-100 text-slate-600 border-slate-200',
  };
  const label: Record<string, string> = { high: 'Alto risco', medium: 'Médio risco', low: 'Rotina' };
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${map[risk]}`}>{label[risk]}</span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    alta:  'bg-red-100 text-red-700',
    média: 'bg-amber-100 text-amber-700',
    baixa: 'bg-slate-100 text-slate-600',
  };
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${map[priority]}`}>{priority}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'aberto':        'bg-red-100 text-red-700',
    'em andamento':  'bg-blue-100 text-blue-700',
    'resolvido':     'bg-emerald-100 text-emerald-700',
  };
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${map[status] ?? 'bg-slate-100 text-slate-500'}`}>{status}</span>;
}


export default function HealthAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'pendente' | 'alertas'>('pendente');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => { setLastUpdated(new Date()); setIsRefreshing(false); }, 1200);
  };

  const pendingCount = pendingCredentials.length;
  const openTickets  = supportTickets.filter(t => t.status !== 'resolvido').length;
  const highRiskLogs = auditLogs.filter(l => l.risk === 'high').length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <HeartPulse size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 leading-none">HealthConnect</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">Painel Administrativo</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {pendingCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
              <BadgeCheck size={13} /> {pendingCount} credenciais pendentes
            </div>
          )}
          {openTickets > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
              <MessageSquare size={13} /> {openTickets} chamados abertos
            </div>
          )}
          <span className="text-xs text-slate-400 hidden md:block">
            {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="relative">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
              <Bell size={15} className="text-slate-500" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
          </div>
          <Button size="sm" variant="ghost" onClick={handleRefresh} className="text-xs">
            {isRefreshing ? 'Atualizando…' : 'Atualizar'}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        <SystemStatusBanner />

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-500" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Visão Geral de Hoje</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            {operationalMetrics.map((m) => (
              <Card key={m.label} className="border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow cursor-default">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${m.color}18`, color: m.color }}>
                      {m.icon}
                    </div>
                    <div className={`flex items-center gap-0.5 text-xs font-semibold ${m.delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {m.delta >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(m.delta)}%
                    </div>
                  </div>
                  <p className="text-xl font-bold text-slate-800 leading-none">{m.value}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{m.label}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BadgeCheck size={16} className="text-amber-500" />
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Credenciamento Médico</h2>
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700">{pendingCount}</span>
            </div>
          </div>

          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
            {(['pendente', 'alertas'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors capitalize ${activeTab === tab ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab === 'pendente' ? `Aprovações Pendentes (${pendingCount})` : `Alertas de Documentação (${docAlerts.length})`}
              </button>
            ))}
          </div>

          {activeTab === 'pendente' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {pendingCredentials.map((doc) => (
                <Card key={doc.id} className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                        {doc.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 leading-snug truncate">{doc.name}</p>
                        <p className="text-xs text-slate-500">{doc.specialty}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-slate-400 font-mono">{doc.crm}</p>
                      <DocsStatus status={doc.docs} />
                      <p className="text-[11px] text-slate-400">Enviado {doc.submitted}</p>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">Aprovar</button>
                      <button className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Recusar</button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'alertas' && (
            <Card className="border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {docAlerts.map((alert, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 shrink-0 ${alert.type === 'expired' ? 'text-red-500' : 'text-amber-500'}`}>
                        {alert.type === 'expired' ? <FileWarning size={16} /> : <Clock size={16} />}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{alert.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{alert.issue}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${alert.urgency === 'alta' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        urgência {alert.urgency}
                      </span>
                      <button className="text-xs text-blue-600 hover:underline font-medium">Notificar</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileLock2 size={16} className="text-purple-500" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Auditoria &amp; LGPD</h2>
                {highRiskLogs > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-red-100 text-red-600">{highRiskLogs}</span>
                )}
              </div>
              <button className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-0.5">
                Ver relatório completo <ChevronRight size={12} />
              </button>
            </div>
            <Card className="border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {auditLogs.map((log, i) => (
                  <div key={i} className="flex items-start justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className={`mt-0.5 shrink-0 ${log.risk === 'high' ? 'text-red-500' : log.risk === 'medium' ? 'text-amber-500' : 'text-slate-400'}`}>
                        {log.risk === 'high'
                          ? <ShieldAlert size={14} />
                          : log.action.includes('xportou') || log.action.includes('Exportou')
                          ? <DownloadCloud size={14} />
                          : <LogIn size={14} />
                        }
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{log.user}</p>
                        <p className="text-xs text-slate-500 leading-snug mt-0.5">{log.action}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <RiskBadge risk={log.risk} />
                      <span className="text-[10px] text-slate-400">{log.date} {log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-rose-500" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Suporte &amp; Chamados</h2>
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-red-100 text-red-600">{openTickets}</span>
              </div>
              <button className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-0.5">
                Abrir central <ChevronRight size={12} />
              </button>
            </div>
            <Card className="border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[11px] font-mono text-slate-400">{ticket.id}</span>
                          <span className="text-xs font-semibold text-slate-700 truncate">{ticket.user}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-snug">{ticket.issue}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{ticket.category}</span>
                          <PriorityBadge priority={ticket.priority} />
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <StatusBadge status={ticket.status} />
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Clock size={10} /> {ticket.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-slate-500" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Atividade Recente</h2>
          </div>
          <Card className="border border-slate-200 bg-white shadow-sm">
            <div className="p-4">
              <div className="divide-y divide-slate-100">
                {recentActivity.map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: row.color }}
                      >
                        {row.user.split(' ').pop()?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 leading-none">{row.user}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{row.action}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
                      <Clock size={11} /> {row.time} atrás
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

      </main>
    </div>
  );
}
