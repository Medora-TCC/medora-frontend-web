import { useState } from 'react';
import { Card, Chip, Button } from '@heroui/react';
import {
  Server, Cpu, Wifi, Activity, AlertTriangle,
  CheckCircle2, XCircle, Clock, Users, UserCheck, CalendarDays,
  TrendingUp, BarChart3, Zap, Database, Globe,
  Bell, ShieldCheck, ArrowUpRight, ArrowDownRight,
  MonitorDot, Timer, Layers, HeartPulse
} from 'lucide-react';


interface ServiceStatus {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  latency: number;
  uptime: number;
}

interface MetricCard {
  label: string;
  value: string;
  delta: number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'accent';
}


const services: ServiceStatus[] = [
  { name: 'API Gateway',       status: 'online',   latency: 42,  uptime: 99.98 },
  { name: 'Auth Service',      status: 'online',   latency: 18,  uptime: 99.99 },
  { name: 'Database Primary',  status: 'online',   latency: 8,   uptime: 99.97 },
  { name: 'Database Replica',  status: 'degraded', latency: 240, uptime: 98.12 },
  { name: 'File Storage',      status: 'online',   latency: 56,  uptime: 99.95 },
  { name: 'Email Service',     status: 'online',   latency: 112, uptime: 99.80 },
  { name: 'Notification Svc',  status: 'offline',  latency: 0,   uptime: 94.32 },
  { name: 'WebSocket Server',  status: 'online',   latency: 11,  uptime: 99.94 },
];

const engagementMetrics: MetricCard[] = [
  { label: 'Usuários Ativos',      value: '1.842',  delta: 12.4,  icon: <Users size={20} />,       color: 'primary'  },
  { label: 'Consultas Agendadas',  value: '3.291',  delta: 8.7,   icon: <CalendarDays size={20} />, color: 'accent'   },
  { label: 'Novos Cadastros',      value: '214',    delta: -3.2,  icon: <UserCheck size={20} />,    color: 'success'  },
  { label: 'Telemedicina Hoje',    value: '87',     delta: 22.1,  icon: <MonitorDot size={20} />,   color: 'warning'  },
  { label: 'Tempo Médio Sessão',   value: '8m 41s', delta: 5.3,   icon: <Timer size={20} />,        color: 'primary'  },
  { label: 'Taxa de Retorno',      value: '68,4%',  delta: 1.8,   icon: <TrendingUp size={20} />,   color: 'accent'   },
];

const resourceUsage = [
  { label: 'CPU',     value: 34,  color: 'primary'  as const },
  { label: 'Memória', value: 61,  color: 'warning'  as const },
  { label: 'Disco',   value: 47,  color: 'success'  as const },
  { label: 'Rede',    value: 22,  color: 'accent'   as const },
];

const alerts = [
  { level: 'warning',  message: 'Database Replica com latência elevada (240ms)',   time: '3 min atrás' },
  { level: 'danger',   message: 'Notification Service offline desde 14:22',        time: '38 min atrás' },
  { level: 'info',     message: 'Deploy v2.4.1 concluído com sucesso em produção', time: '2h atrás' },
  { level: 'warning',  message: 'Uso de memória acima de 60% no pod api-3',        time: '4h atrás' },
];

const sparklineData = [42, 58, 51, 73, 67, 81, 75, 90, 84, 96, 88, 102];


function StatusDot({ status }: { status: ServiceStatus['status'] }) {
  const map = {
    online:   'bg-(--success)',
    degraded: 'bg-(--warning)',
    offline:  'bg-(--danger)',
  };
  const pulse = status === 'online' ? 'animate-pulse' : '';
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${map[status]} ${pulse}`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${map[status]}`} />
    </span>
  );
}

function StatusChip({ status }: { status: ServiceStatus['status'] }) {
  const map = {
    online:   { color: 'success' as const,  label: 'Online'    },
    degraded: { color: 'warning' as const,  label: 'Degradado' },
    offline:  { color: 'danger'  as const,  label: 'Offline'   },
  };
  return <Chip color={map[status].color} size="sm">{map[status].label}</Chip>;
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const W = 120, H = 32;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / (max - min)) * H;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="opacity-60">
      <polyline fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

function AlertRow({ alert }: { alert: typeof alerts[0] }) {
  const iconMap: Record<string, React.ReactNode> = {
    warning: <AlertTriangle size={16} className="text-(--warning)" />,
    danger:  <XCircle      size={16} className="text-(--danger)"  />,
    info:    <CheckCircle2 size={16} className="text-(--success)" />,
  };
  const bgMap: Record<string, string> = {
    warning: 'border-l-(--warning) bg-(--warning-subtle)',
    danger:  'border-l-(--danger)  bg-(--danger-subtle)',
    info:    'border-l-(--success) bg-(--success-subtle)',
  };
  return (
    <div className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border-l-4 ${bgMap[alert.level]}`}>
      <span className="mt-0.5 shrink-0">{iconMap[alert.level]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-(--text-primary) leading-snug">{alert.message}</p>
        <p className="text-xs text-(--text-muted) mt-0.5">{alert.time}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1200);
  };

  const onlineCount  = services.filter(s => s.status === 'online').length;
  const degradedCount = services.filter(s => s.status === 'degraded').length;
  const offlineCount = services.filter(s => s.status === 'offline').length;

  const colorVarMap: Record<string, string> = {
    primary: 'var(--primary)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger:  'var(--danger)',
    accent:  'var(--accent)',
  };

  return (
    <div className="min-h-screen bg-(--surface-alt) font-sans">
      <header className="sticky top-0 z-30 bg-(--surface) border-b border-(--border) px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-(--primary) flex items-center justify-center">
            <Layers size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-(--text-primary) leading-none">Admin Dashboard</h1>
            <p className="text-xs text-(--text-muted) mt-0.5">Visão geral do sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-(--text-muted) hidden sm:block">
            Atualizado: {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <div className="relative">
            <Button isIconOnly size="sm" className="relative">
              <Bell size={16} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-(--danger) rounded-full" />
            </Button>
          </div>
          <Button
            size="sm"
            onClick={handleRefresh}
          >
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <HeartPulse size={18} className="text-(--primary)" />
            <h2 className="text-lg font-bold text-(--text-primary)">Saúde do Sistema & Infraestrutura</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--success-subtle) border border-(--success)/20">
              <CheckCircle2 size={14} className="text-(--success)" />
              <span className="text-sm font-semibold text-(--success-text)">{onlineCount} Online</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--warning-subtle) border border-(--warning)/20">
              <AlertTriangle size={14} className="text-(--warning)" />
              <span className="text-sm font-semibold text-(--warning-text)">{degradedCount} Degradado</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--danger-subtle) border border-(--danger)/20">
              <XCircle size={14} className="text-(--danger)" />
              <span className="text-sm font-semibold text-(--danger-text)">{offlineCount} Offline</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <Card className="lg:col-span-2 border border-(--border) shadow-sm bg-(--surface)">
              <div className="p-4 pb-2 flex items-center gap-2">
                <Server size={16} className="text-(--primary)" />
                <span className="font-semibold text-sm text-(--text-primary)">Status dos Serviços</span>
              </div>
              <div className="p-4 pt-0">
                <div className="divide-y divide-(--border)">
                  {services.map((svc) => (
                    <div key={svc.name} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <StatusDot status={svc.status} />
                        <span className="text-sm font-medium text-(--text-primary) truncate">{svc.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {svc.status !== 'offline' && (
                          <span className="text-xs text-(--text-muted) hidden sm:block">
                            {svc.latency}ms
                          </span>
                        )}
                        <div className="relative">
                          <span><StatusChip status={svc.status} /></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <Card className="border border-(--border) shadow-sm bg-(--surface)">
                <div className="p-4 pb-2 flex items-center gap-2">
                  <Cpu size={16} className="text-(--primary)" />
                  <span className="font-semibold text-sm text-(--text-primary)">Recursos do Servidor</span>
                </div>
                <div className="p-4 pt-0 space-y-3">
                  {resourceUsage.map((r) => (
                    <div key={r.label}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-(--text-secondary)">{r.label}</span>
                        <span className="text-xs font-bold" style={{ color: colorVarMap[r.color] }}>{r.value}%</span>
                      </div>
                      <div className="w-full bg-default-100 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ width: `${r.value}%`, backgroundColor: colorVarMap[r.color] }} 
                          role="progressbar" 
                          aria-label={r.label}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border border-(--border) shadow-sm bg-(--surface)">
                <div className="p-4 flex flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-(--success)" />
                    <div>
                      <p className="text-xs text-(--text-muted)">Uptime global</p>
                      <p className="text-lg font-bold text-(--success-text)">99.94%</p>
                    </div>
                  </div>
                  <Sparkline data={sparklineData} />
                </div>
              </Card>
            </div>
          </div>

          <Card className="border border-(--border) shadow-sm bg-(--surface)">
            <div className="p-4 pb-2 flex items-center gap-2">
              <Bell size={16} className="text-(--danger)" />
              <span className="font-semibold text-sm text-(--text-primary)">Alertas Recentes</span>
            </div>
            <div className="p-4 pt-0 space-y-2">
              {alerts.map((alert, i) => <AlertRow key={i} alert={alert} />)}
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-(--accent)" />
            <h2 className="text-lg font-bold text-(--text-primary)">Engajamento & Uso da Plataforma</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
            {engagementMetrics.map((m) => (
              <Card key={m.label} className="border border-(--border) shadow-sm bg-(--surface) hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${colorVarMap[m.color]}18`, color: colorVarMap[m.color] }}
                    >
                      {m.icon}
                    </div>
                    <div className={`flex items-center gap-0.5 text-xs font-semibold ${m.delta >= 0 ? 'text-(--success-text)' : 'text-(--danger-text)'}`}>
                      {m.delta >= 0
                        ? <ArrowUpRight size={13} />
                        : <ArrowDownRight size={13} />
                      }
                      {Math.abs(m.delta)}%
                    </div>
                  </div>
                  <p className="text-xl font-bold text-(--text-primary) leading-none">{m.value}</p>
                  <p className="text-xs text-(--text-muted) mt-1 leading-snug">{m.label}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <Card className="border border-(--border) shadow-sm bg-(--surface)">
              <div className="p-4 pb-2 flex items-center gap-2">
                <Zap size={16} className="text-(--accent)" />
                <span className="font-semibold text-sm text-(--text-primary)">Ações Mais Realizadas Hoje</span>
              </div>
              <div className="p-4 pt-0 space-y-3">
                {[
                  { label: 'Agendamentos criados',   count: 842, pct: 82 },
                  { label: 'Consultas realizadas',   count: 619, pct: 61 },
                  { label: 'Prescrições emitidas',   count: 411, pct: 40 },
                  { label: 'Prontuários acessados',  count: 987, pct: 97 },
                  { label: 'Laudos registrados',     count: 214, pct: 21 },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-(--text-secondary)">{row.label}</span>
                      <span className="font-bold text-(--text-primary)">{row.count.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="w-full bg-default-100 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${row.pct}%` }} role="progressbar" aria-label={row.label} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border border-(--border) shadow-sm bg-(--surface)">
              <div className="p-4 pb-2 flex items-center gap-2">
                <Globe size={16} className="text-(--accent)" />
                <span className="font-semibold text-sm text-(--text-primary)">Sessões por Tipo de Acesso</span>
              </div>
              <div className="p-4 pt-0 space-y-3">
                {[
                  { label: 'Web (desktop)',  value: 1204, pct: 65, color: 'primary'  as const },
                  { label: 'Web (mobile)',   value: 482,  pct: 26, color: 'accent'   as const },
                  { label: 'App nativo',     value: 156,  pct: 9,  color: 'warning'  as const },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-(--text-secondary)">{row.label}</span>
                        <span className="font-bold" style={{ color: colorVarMap[row.color] }}>
                          {row.pct}% <span className="text-(--text-muted) font-normal">({row.value.toLocaleString('pt-BR')})</span>
                        </span>
                      </div>
                      <div className="w-full bg-default-100 rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ width: `${row.pct}%`, backgroundColor: colorVarMap[row.color] }} role="progressbar" aria-label={row.label} />
                      </div>
                    </div>
                  </div>
                ))}

                <hr className="my-2 border-t border-(--border)" />

                <div className="grid grid-cols-3 gap-3 pt-1">
                  {[
                    { icon: <Activity size={14} />,  label: 'Pico diário',   value: '11h–12h', color: 'var(--primary)' },
                    { icon: <Database size={14} />,  label: 'Req/min',       value: '3.841',   color: 'var(--accent)'  },
                    { icon: <Wifi size={14} />,      label: 'Latência p95',  value: '128ms',   color: 'var(--warning)' },
                  ].map((stat) => (
                    <div key={stat.label} className="flex flex-col items-center p-2 rounded-lg bg-(--surface-alt) border border-(--border)">
                      <span style={{ color: stat.color }}>{stat.icon}</span>
                      <span className="text-sm font-bold text-(--text-primary) mt-1">{stat.value}</span>
                      <span className="text-[10px] text-(--text-muted) text-center leading-snug">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <Card className="border border-(--border) shadow-sm bg-(--surface)">
            <div className="p-4 pb-2 flex items-center gap-2">
              <Clock size={16} className="text-(--text-muted)" />
              <span className="font-semibold text-sm text-(--text-primary)">Atividade Recente de Usuários</span>
            </div>
            <div className="p-4 pt-0">
              <div className="divide-y divide-(--border)">
                {[
                  { user: 'Dr. Mariana Costa',    action: 'Emitiu prescrição',         time: '1 min atrás',  type: 'success'  },
                  { user: 'Admin Rodrigo Silva',   action: 'Acessou painel de admin',   time: '3 min atrás',  type: 'primary'  },
                  { user: 'Dra. Juliana Alves',    action: 'Iniciou teleconsulta',      time: '7 min atrás',  type: 'accent'   },
                  { user: 'Dr. Pedro Mendes',      action: 'Atualizou disponibilidade', time: '12 min atrás', type: 'warning'  },
                  { user: 'Enf. Carla Souza',      action: 'Cadastrou novo paciente',   time: '21 min atrás', type: 'success'  },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: colorVarMap[row.type] }}
                      >
                        {row.user.split(' ').slice(-1)[0][0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-(--text-primary) leading-none">{row.user}</p>
                        <p className="text-xs text-(--text-muted) mt-0.5">{row.action}</p>
                      </div>
                    </div>
                    <span className="text-xs text-(--text-muted) shrink-0">{row.time}</span>
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