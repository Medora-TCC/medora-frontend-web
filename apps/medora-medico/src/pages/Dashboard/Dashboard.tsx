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
import ConsultaModal from "../../components/Consulta/ConsultaModal";

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
      {/* Mantido py-3 para garantir o encaixe perfeito na tela */}
      <main className="py-3 px-6 space-y-3 max-w-7xl mx-auto w-full">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Bom dia, Dr. Pedro Silva</h1>
            <p className="text-xs text-text-muted">Você tem <span className="font-bold text-primary-color">8</span> consultas agendadas para hoje.</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onPress={() => navigate("/medico/agenda")}
              className="flex items-center gap-2 h-8.5 font-medium"
            >
              <Calendar size={15} />
              Ver Agenda
            </Button>
          </div>
        </header>

        {/* 1° ROW DE MÉTRICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatBox icon={<Users size={20} className="text-blue-500" />} label="Consultas Hoje" value="12" subtext="+2 em relação a ontem" />
          <StatBox icon={<Clock size={20} className="text-orange-500" />} label="Pendências" value="03" subtext="Requerem atenção" />
          <StatBox icon={<DollarSign size={20} className="text-green-500" />} label="Receita do Mês" value="R$ 14.200" subtext="Meta de 85% batida" />
          <StatBox icon={<Star size={20} className="text-yellow-500" />} label="Avaliação Média" value="4.9" subtext="Baseado em 120 avaliações" />
        </div>

        {/* Bloco Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">

          {/* Coluna da Esquerda */}
          <div className="lg:col-span-2 space-y-3">

            {/* 2° WIDGET: Próximas Consultas do Dia */}
            <div className="bg-surface-alt rounded-xl shadow-sm border border-divider overflow-hidden">
              <div className="p-3 border-b border-divider flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-base">Próximas Consultas do Dia</h2>
                  <p className="text-xs text-text-muted">Acesso rápido aos atendimentos</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary-color font-semibold border-none hover:bg-primary/10 h-7 text-xs"
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

            {/* Fluxo Semanal de Consultas - Ganho sutil de altura (h-26) */}
            <div className="bg-surface-alt p-3 rounded-xl border border-divider shadow-sm">
              <div className="mb-1">
                <h3 className="font-bold text-base">Fluxo Semanal de Consultas</h3>
                <p className="text-xs text-text-muted">Total de atendimentos realizados por dia</p>
              </div>

              <div className="flex items-end justify-between h-26 pt-2 px-2 max-w-md mx-auto">
                {weeklyData.map((day) => (
                  <div key={day.name} className="flex flex-col items-center gap-0.5 flex-1">
                    <span className="text-xs font-bold text-text-primary">
                      {day.consultas}
                    </span>

                    <div className="w-7 bg-zinc-100 rounded-t-sm relative flex items-end h-16 overflow-hidden">
                      <div
                        className="w-full bg-accent rounded-t-sm transition-all duration-500"
                        style={{ height: day.percentage }}
                      />
                    </div>
                    <span className="text-xs text-text-muted font-medium mt-0.5">{day.name}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Coluna da Direita */}
          <div className="space-y-3">

            {/* Teleconsulta Ativa */}
            <div className="bg-primary-color p-4 rounded-xl text-white shadow-lg">
              <h3 className="font-bold text-base mb-0.5">Teleconsulta ativa</h3>
              <p className="text-xs opacity-90 mb-2.5">Inicie sua sala virtual para receber o paciente <span className="font-bold">Carlos Miranda</span>.</p>
              <Button
                size="sm"
                className="bg-white text-primary-color font-bold w-full shadow-md h-8 text-xs"
                onPress={() => navigate("teleconsulta/Vf8kQ2mLpX/pre-sala")}
              >
                Abrir Sala Virtual
              </Button>
            </div>

            {/* 3° WIDGET: Prontuários Pendentes */}
            <div className="bg-surface-alt p-3 rounded-xl border border-divider shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  <FileText size={16} className="text-orange-500" />
                  Prontuários Pendentes
                </h3>
                <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">2 novos</span>
              </div>
              <div className="space-y-1.5">
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
            <div className="bg-surface-alt p-3 rounded-xl border border-divider shadow-sm">
              <h3 className="font-bold text-sm mb-2">Lembretes</h3>
              <ul className="text-xs space-y-1.5">
                <li className="flex gap-2 items-start text-text-muted">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1 shrink-0" />
                  <p>Confirme com Julia Mattos às 16h30 <span className="text-orange-500 font-medium">(5h rest.)</span></p>
                </li>
                <li className="flex gap-2 items-start text-text-muted">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                  <p>Reunião clínica com equipe de cardio às 18h30</p>
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
    <div className="bg-surface-alt p-3 rounded-xl border border-divider flex items-center gap-3 shadow-sm hover:border-gray-300 transition-all">
      <div className="p-2 bg-surface rounded-lg border border-divider shadow-sm shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider leading-none">{label}</p>
        <p className="text-xl font-bold text-text-primary my-0.5">{value}</p>
        {subtext && <p className="text-[10px] text-text-muted/80 leading-none">{subtext}</p>}
      </div>
    </div>
  );
}

function CompactPatientItem({ name, time, type, status, onAction }: any) {
  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-surface/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center justify-center bg-surface border border-divider rounded-lg h-9 w-9 text-center shrink-0">
          <span className="text-primary-color font-bold text-xs leading-none">{time}</span>
        </div>
        <div>
          {/* Aumentado levemente para text-sm para dar mais destaque ao nome */}
          <p className="font-semibold text-sm text-text-primary leading-tight">{name}</p>
          <span className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
            <span className={`h-1.5 w-1.5 rounded-full ${type === 'Telemedicina' ? 'bg-purple-500' : 'bg-blue-500'}`} />
            {type}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide hidden sm:inline-block ${
          status === 'Aguardando' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {status}
        </span>
        {/* Altura ajustada para h-8 para melhor proporção */}
        <Button
          size="sm"
          variant={type === 'Telemedicina' ? 'secondary' : 'primary'}
          onPress={onAction}
          className="flex items-center gap-1 h-8 text-xs px-3 font-medium"
        >
          {type === 'Telemedicina' ? 'Atender' : 'Prontuário'}
          <ArrowUpRight size={13} />
        </Button>
      </div>
    </div>
  );
}

function PendingDocumentItem({ patient, date, onPress }: any) {
  return (
    <div
      onClick={onPress}
      className="p-2.5 bg-surface border border-divider rounded-lg flex items-center justify-between hover:border-orange-200 cursor-pointer transition-all"
    >
      <div>
        {/* Ajustado para text-sm */}
        <p className="text-sm font-medium text-text-primary leading-tight">{patient}</p>
        <p className="text-[10px] text-text-muted mt-0.5">Atendimento em: {date}</p>
      </div>
      <Button size="sm" isIconOnly variant="ghost" className="border-none text-text-muted hover:text-orange-500 h-6 w-6 min-w-6" onPress={onPress}>
        <ChevronRight size={14} />
      </Button>
    </div>
  );
}