import { Button, Input } from "@heroui/react";
import {
  Users,
  Video,
  Clock,
  Search,
  ChevronRight,
  Stethoscope,
  Bell
} from "lucide-react";
import { useNavigate } from "react-router";

export default function Dashboard() {

  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-surface flex flex-col">

      <main className="p-6 space-y-6 max-w-350 mx-auto w-full">
        <header>
          <h1 className="text-2xl font-bold text-text-primary">Bom dia, Dr. João</h1>
          <p className="text-text-muted">Você tem <span className="font-bold">8</span> consultas agendadas para hoje.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatBox icon={<Users className="text-blue-500" />} label="Consultas" value="12" />
          <StatBox icon={<Video className="text-green-500" />} label="Teleconsultas" value="05" />
          <StatBox icon={<Clock className="text-orange-500" />} label="Pendentes" value="03" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface-alt rounded-xl shadow-sm border border-divider overflow-hidden">
            <div className="p-5 border-b border-divider flex justify-between items-center">
              <h2 className="font-bold text-lg">Próximos Pacientes</h2>
              <div className="max-w-50">
              </div>
            </div>
            <div className="p-0">
              <PatientItem name="Carlos Alberto" time="09:00" type="Presencial" status="Confirmado" />
              <PatientItem name="Maria Eduarda" time="09:45" type="Telemedicina" status="Aguardando" />
              <PatientItem name="Ricardo Souza" time="10:30" type="Retorno" status="Confirmado" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-primary-color p-6 rounded-xl text-white shadow-lg">
              <h3 className="font-bold text-lg mb-2">Teleconsulta ativa</h3>
              <p className="text-sm opacity-90 mb-4">Inicie sua sala de teleconsulta agora para receber o paciente <span className="font-bold">Carlos Miranda</span>.</p>
              <Button
                className="bg-white text-primary-color font-bold w-full"
                onPress={() => navigate("teleconsulta/Vf8kQ2mLpX/pre-sala")}
              >
                Abrir Sala Virtual
              </Button>
            </div>

            <div className="bg-surface-alt p-5 rounded-xl border border-divider">
              <h3 className="font-bold mb-3">Lembretes</h3>
              <ul className="text-sm space-y-3">
                <li className="flex gap-2 items-start text-text-muted">
                  <div className="h-2 w-2 rounded-full bg-orange-500 mt-1.5" />
                  Confirme sua consulta com Julia Mattos às 16h30 (5h restantes)
                </li>
                <li className="flex gap-2 items-start text-text-muted">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                  Consulta com Marcos Antonio às 16h30
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Componentes internos para não depender de imports externos quebrados
function StatBox({ icon, label, value }: any) {
  return (
    <div className="bg-surface-alt p-5 rounded-xl border border-divider flex items-center gap-4 shadow-sm">
      <div className="p-3 bg-surface rounded-lg">{icon}</div>
      <div>
        <p className="text-xs text-text-muted font-bold uppercase">{label}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function PatientItem({ name, time, type, status }: any) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-divider last:border-0 hover:bg-surface transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <span className="text-primary-color font-bold w-12">{time}</span>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-xs text-text-muted">{type}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${status === 'Aguardando' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
          }`}>
          {status}
        </span>
        <ChevronRight size={18} className="text-text-muted" />
      </div>
    </div>
  );
}