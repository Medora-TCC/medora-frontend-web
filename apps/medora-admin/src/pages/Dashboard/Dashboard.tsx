import { Button } from "@heroui/react";
import {
  Users,
  Video,
  UserX,
  Stethoscope,
  Activity,
  Server,
  Cpu,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router";
import AdminHeader from "../../components/Header/Header";

const monthlyRegistrations = [
  { name: 'Fev', total: 120, percentage: '45%' },
  { name: 'Mar', total: 185, percentage: '65%' },
  { name: 'Abr', total: 240, percentage: '85%' },
  { name: 'Mai', total: 310, percentage: '100%' },
  { name: 'Jun', total: 215, percentage: '70%' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <AdminHeader />

      <main className="py-4 px-6 space-y-5 max-w-7xl mx-auto w-full">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Visão Geral do Sistema</h1>
            <p className="text-sm text-text-muted mt-0.5">Bem-vindo(a). O sistema está operando <span className="font-bold text-green-500">normalmente</span> hoje.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBox icon={<Users size={24} className="text-blue-500" />} label="Clientes Ativos" value="1.248" subtext="+45 esta semana" />
          <StatBox icon={<Stethoscope size={24} className="text-teal-500" />} label="Médicos Ativos" value="342" subtext="+12 este mês" />
          <StatBox icon={<Video size={24} className="text-purple-500" />} label="Teleconsultas Ativas" value="18" subtext="Neste exato momento" />
          <StatBox icon={<UserX size={24} className="text-red-500" />} label="Cadastros Inválidos" value="07" subtext="Na última semana" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-surface-alt rounded-xl shadow-sm border border-divider overflow-hidden">
              <div className="p-4 border-b border-divider flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Cpu size={20} className="text-purple-500" />
                    Últimas Respostas do Worker
                  </h2>
                  <p className="text-sm text-text-muted mt-0.5">Logs de processamento em segundo plano</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary-color font-semibold border-none hover:bg-primary/10 h-8 text-sm px-3"
                  onPress={() => navigate("/admin/logs")} 
                >
                  Ver todos
                </Button>
              </div>
              <div className="divide-y divide-divider">
                <WorkerLogItem
                  task="Verificação do médico 873642314"
                  status="Sucesso"
                  time="Há 2 min"
                />
                <WorkerLogItem
                  task="Verificação de médico 234591232"
                  status="Sucesso"
                  time="Há 15 min"
                />
                <WorkerLogItem
                  task="Lentidão na requisição externa"
                  status="Aviso"
                  time="Há 1 hora"
                />
              </div>
            </div>

            <div className="bg-surface-alt p-5 rounded-xl border border-divider shadow-sm">
              <div className="mb-4">
                <h3 className="font-bold text-lg">Fluxo Mensal de Cadastros</h3>
                <p className="text-sm text-text-muted mt-0.5">Volume de novos usuários (Médicos e Pacientes) nos últimos meses</p>
              </div>

              <div className="flex items-end justify-between h-48 pt-2 px-2 max-w-lg mx-auto">
                {monthlyRegistrations.map((month) => (
                  <div key={month.name} className="flex flex-col items-center gap-1.5 flex-1">
                    <span className="text-sm font-bold text-text-primary">
                      {month.total}
                    </span>

                    <div className="w-10 bg-zinc-100 rounded-t-md relative flex items-end h-28 overflow-hidden">
                      <div
                        className="w-full bg-teal-500 rounded-t-md transition-all duration-500"
                        style={{ height: month.percentage }}
                      />
                    </div>
                    <span className="text-sm text-text-muted font-semibold mt-1">{month.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna da Direita */}
          <div className="space-y-5">
            {/* Status do Sistema / Logs */}
            <div className="bg-surface-alt p-5 rounded-xl border border-divider shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Server size={20} className="text-gray-500" />
                Status dos Serviços
              </h3>
              <ul className="text-sm space-y-4">
                <li className="flex gap-3 items-center text-text-muted">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500 shrink-0 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                  <p className="flex-1 font-medium">API de Telemedicina</p>
                  <span className="font-mono text-xs">98ms</span>
                </li>
                <li className="flex gap-3 items-center text-text-muted">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500 shrink-0 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                  <p className="flex-1 font-medium">Worker</p>
                  <span className="font-mono text-xs text-green-600 font-bold uppercase">Ok</span>
                </li>
                <li className="flex gap-3 items-center text-text-muted">
                  <div className="h-2.5 w-2.5 rounded-full bg-orange-500 shrink-0" />
                  <p className="flex-1 font-medium">Serviço de Email (Fila)</p>
                  <span className="font-mono text-xs text-orange-500">1.2s</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatBox({ icon, label, value, subtext }: any) {
  return (
    <div className="bg-surface-alt p-5 rounded-xl border border-divider flex items-center gap-4 shadow-sm hover:border-gray-300 transition-all">
      <div className="p-3 bg-surface rounded-lg border border-divider shadow-sm shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-text-muted font-bold uppercase tracking-wider leading-none">{label}</p>
        <p className="text-3xl font-bold text-text-primary my-1.5">{value}</p>
        {subtext && <p className="text-xs text-text-muted/80 leading-none">{subtext}</p>}
      </div>
    </div>
  );
}

function WorkerLogItem({ task, status, time }: any) {
  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-surface/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center justify-center bg-surface border border-divider rounded-lg h-10 w-10 text-center shrink-0">
          {status === 'Sucesso' ? (
            <CheckCircle2 size={20} className="text-green-500" />
          ) : (
            <Activity size={20} className="text-orange-500" />
          )}
        </div>
        <div>
          <p className="font-semibold text-base text-text-primary leading-tight">{task}</p>
          <p className="text-xs text-text-muted mt-1">{time}</p>
        </div>
      </div>

      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
        status === 'Sucesso' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
      }`}>
        {status}
      </span>
    </div>
  );
}