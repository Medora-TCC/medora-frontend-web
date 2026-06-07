import { Button } from "@heroui/react";
import {
  Users,
  Clock,
  ChevronRight,
  DollarSign,
  Star,
  FileText,
  ArrowUpRight,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router";

// Dados fictícios para o gráfico em Tailwind puro
const weeklyData = [
  { name: 'Seg', consultas: 8, percentage: '53%' },
  { name: 'Ter', consultas: 12, percentage: '80%' },
  { name: 'Qua', consultas: 10, percentage: '66%' },
  { name: 'Qui', consultas: 15, percentage: '100%' },
  { name: 'Sex', consultas: 9, percentage: '60%' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Bom dia, Dr. Pedro Silva</h1>
            <p className="text-text-muted">Você tem <span className="font-bold text-primary-color">8</span> consultas agendadas para hoje.</p>
          </div>
          <div className="flex gap-2">
            {/* AJUSTADO: Agora aponta exatamente para a rota desejada */}
            <Button
              size="sm"
              variant="outline"
              onPress={() => navigate("/medico/agenda")}
              className="flex items-center gap-2"
            >
              <Calendar size={16} />
              Ver Agenda
            </Button>
          </div>
        </header>

        {/* 1° ROW DE MÉTRICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBox icon={<Users className="text-blue-500" />} label="Consultas Hoje" value="12" subtext="+2 em relação a ontem" />
          <StatBox icon={<Clock className="text-orange-500" />} label="Pendências" value="03" subtext="Requerem atenção" />
          <StatBox icon={<DollarSign className="text-green-500" />} label="Receita do Mês" value="R$ 14.200" subtext="Meta de 85% batida" />
          <StatBox icon={<Star className="text-yellow-500" />} label="Avaliação Média" value="4.9" subtext="Baseado em 120 avaliações" />
        </div>

        {/* Bloco Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Coluna da Esquerda */}
          <div className="lg:col-span-2 space-y-6">

            {/* 2° WIDGET: Próximas Consultas do Dia */}
            <div className="bg-surface-alt rounded-xl shadow-sm border border-divider overflow-hidden">
              <div className="p-5 border-b border-divider flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-lg">Próximas Consultas do Dia</h2>
                  <p className="text-xs text-text-muted">Acesso rápido aos atendimentos</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary-color font-semibold border-none hover:bg-primary/10"
                  onPress={() => navigate("/consultas")}
                >
                  Ver todas
                </Button>
              </div>
              <div className="divide-y divide-divider">
                <CompactPatientItem
                  name="Carlos Alberto"
                  time="09:00"
                  type="Presencial"
                  status="Confirmado"
                  onAction={() => navigate("/prontuario/carlos-alberto")}
                />
                <CompactPatientItem
                  name="Maria Eduarda"
                  time="09:45"
                  type="Telemedicina"
                  status="Aguardando"
                  onAction={() => navigate("teleconsulta/Vf8kQ2mLpX/pre-sala")}
                />
                <CompactPatientItem
                  name="Ricardo Souza"
                  time="10:30"
                  type="Retorno"
                  status="Confirmado"
                  onAction={() => navigate("/prontuario/ricardo-souza")}
                />
              </div>
            </div>

            {/* 4° GRÁFICO SEMANAL */}
            <div className="bg-surface-alt p-5 rounded-xl border border-divider shadow-sm">
              <div className="mb-4">
                <h3 className="font-bold text-lg">Fluxo Semanal de Consultas</h3>
                <p className="text-xs text-text-muted">Total de atendimentos realizados por dia</p>
              </div>

              {/* Container do Gráfico Customizado */}
              <div className="flex items-end justify-between h-48 pt-6 px-2 max-w-md mx-auto">
                {weeklyData.map((day) => (
                  <div key={day.name} className="flex flex-col items-center gap-1 flex-1">
                    {/* AJUSTADO: Número agora fixo e visível o tempo todo */}
                    <span className="text-xs font-bold text-text-primary mb-1">
                      {day.consultas}
                    </span>

                    {/* Barra do Gráfico */}
                    <div className="w-8 bg-zinc-100 rounded-t-md relative flex items-end h-28 overflow-hidden">
                      <div
                        className="w-full bg-blue-500 rounded-t-md transition-all duration-500"
                        style={{ height: day.percentage }}
                      />
                    </div>
                    {/* Legenda do Dia */}
                    <span className="text-xs text-text-muted font-medium mt-1">{day.name}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Coluna da Direita */}
          <div className="space-y-6">

            {/* Teleconsulta Ativa */}
            <div className="bg-primary-color p-6 rounded-xl text-white shadow-lg">
              <h3 className="font-bold text-lg mb-2">Teleconsulta ativa</h3>
              <p className="text-sm opacity-90 mb-4">Inicie sua sala de teleconsulta agora para receber o paciente <span className="font-bold">Carlos Miranda</span>.</p>
              <Button
                className="bg-white text-primary-color font-bold w-full shadow-md"
                onPress={() => navigate("teleconsulta/Vf8kQ2mLpX/pre-sala")}
              >
                Abrir Sala Virtual
              </Button>
            </div>

            {/* 3° WIDGET: Prontuários Pendentes */}
            <div className="bg-surface-alt p-5 rounded-xl border border-divider shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <FileText size={18} className="text-orange-500" />
                  Prontuários Pendentes
                </h3>
                <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">2 novos</span>
              </div>
              <div className="space-y-3">
                <PendingDocumentItem
                  patient="Mariana Costa"
                  date="Ontem, 17:30"
                  onPress={() => navigate("/prontuarios/editar/mariana-costa")}
                />
                <PendingDocumentItem
                  patient="Arnaldo Vieira"
                  date="04/06, 14:15"
                  onPress={() => navigate("/prontuarios/editar/arnaldo-vieira")}
                />
              </div>
            </div>

            {/* Lembretes */}
            <div className="bg-surface-alt p-5 rounded-xl border border-divider shadow-sm">
              <h3 className="font-bold mb-3">Lembretes</h3>
              <ul className="text-sm space-y-3">
                <li className="flex gap-2 items-start text-text-muted">
                  <div className="h-2 w-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <p>Confirme sua consulta com Julia Mattos às 16h30 <span className="text-orange-500 font-medium">(5h restantes)</span></p>
                </li>
                <li className="flex gap-2 items-start text-text-muted">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <p>Reunião clínica com a equipe de cardiologia às 18h30</p>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function StatBox({ icon, label, value, subtext }: any) {
  return (
    <div className="bg-surface-alt p-5 rounded-xl border border-divider flex items-center gap-4 shadow-sm hover:border-gray-300 transition-all">
      <div className="p-3 bg-surface rounded-xl border border-divider shadow-sm">{icon}</div>
      <div>
        <p className="text-xs text-text-muted font-bold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-text-primary my-0.5">{value}</p>
        {subtext && <p className="text-[11px] text-text-muted/80">{subtext}</p>}
      </div>
    </div>
  );
}

function CompactPatientItem({ name, time, type, status, onAction }: any) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-surface/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center justify-center bg-surface border border-divider rounded-lg h-12 w-12 text-center">
          <span className="text-primary-color font-bold text-sm leading-none">{time}</span>
        </div>
        <div>
          <p className="font-semibold text-sm text-text-primary">{name}</p>
          <span className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
            <span className={`h-1.5 w-1.5 rounded-full ${type === 'Telemedicina' ? 'bg-purple-500' : 'bg-blue-500'}`} />
            {type}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide hidden sm:inline-block ${status === 'Aguardando' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
          }`}>
          {status}
        </span>
        <Button
          size="sm"
          variant={type === 'Telemedicina' ? 'secondary' : 'primary'}
          onPress={onAction}
          className="flex items-center gap-1"
        >
          {type === 'Telemedicina' ? 'Atender' : 'Prontuário'}
          <ArrowUpRight size={14} />
        </Button>
      </div>
    </div>
  );
}

function PendingDocumentItem({ patient, date, onPress }: any) {
  return (
    <div
      onClick={onPress}
      className="p-3 bg-surface border border-divider rounded-lg flex items-center justify-between hover:border-orange-200 cursor-pointer transition-all"
    >
      <div>
        <p className="text-sm font-medium text-text-primary">{patient}</p>
        <p className="text-xs text-text-muted">Atendimento em: {date}</p>
      </div>
      <Button size="sm" isIconOnly variant="ghost" className="border-none text-text-muted hover:text-orange-500" onPress={onPress}>
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}