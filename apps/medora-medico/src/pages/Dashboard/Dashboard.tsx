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

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Navbar Superior Simples */}
{/* Removi o w-full e bg-surface-alt da nav externa para não pintar a tela toda */}
<nav className="flex justify-center w-full px-6 py-2 sticky top-0 z-50">
  
  {/* Este div interno é quem faz a mágica: ele tem o fundo escuro, as bordas arredondadas e a largura limitada */}
  <div className="flex items-center justify-between w-full max-w-[1400px] bg-surface-alt border border-divider rounded-2xl px-6 h-16 shadow-lg backdrop-blur-md bg-opacity-80">
    
    <div className="flex items-center gap-2">
      <Stethoscope size={24} className="text-primary-color" />
      <span className="font-bold text-xl text-primary-color">Medora</span>
    </div>

    <div className="flex items-center gap-4">
      <Button isIconOnly variant="ghost" className="text-text-muted">
        <Bell size={20} />
      </Button>
      
      <div className="flex items-center gap-3 pl-4 border-l border-divider">
        <div className="hidden md:block text-right">
          <p className="text-sm font-bold text-text-primary leading-none">Dr. João</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Cardiologista</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary-color flex items-center justify-center text-white font-bold shadow-sm border-2 border-surface">
          DR
        </div>
      </div>
    </div>

  </div>
</nav>

      <main className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
        {/* Saudação */}
        <header>
          <h1 className="text-2xl font-bold text-text-primary">Bom dia, Dr. João</h1>
          <p className="text-text-muted">Você tem 8 consultas agendadas para hoje.</p>
        </header>

        {/* Grid de Cards de Status (Usando Divs com Tailwind em vez de Card do HeroUI) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatBox icon={<Users className="text-blue-500" />} label="Pacientes" value="12" />
          <StatBox icon={<Video className="text-green-500" />} label="Teleconsultas" value="05" />
          <StatBox icon={<Clock className="text-orange-500" />} label="Pendentes" value="03" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Atendimento */}
          <div className="lg:col-span-2 bg-surface-alt rounded-xl shadow-sm border border-divider overflow-hidden">
            <div className="p-5 border-b border-divider flex justify-between items-center">
              <h2 className="font-bold text-lg">Próximos Pacientes</h2>
              <div className="max-w-[200px] flex items-center gap-2 border border-divider rounded-2xl px-3 py-2">
                <Search size={16} className="text-text-muted" />
                <Input size={16} placeholder="Buscar..." className="w-full border-none bg-transparent focus:ring-0" />
              </div>
            </div>
            <div className="p-0">
              <PatientItem name="Carlos Alberto" time="09:00" type="Presencial" status="Confirmado" />
              <PatientItem name="Maria Eduarda" time="09:45" type="Telemedicina" status="Aguardando" />
              <PatientItem name="Ricardo Souza" time="10:30" type="Retorno" status="Confirmado" />
            </div>
          </div>

          {/* Lateral: Ações Rápidas */}
          <div className="space-y-4">
            <div className="bg-primary-color p-6 rounded-xl text-white shadow-lg">
              <h3 className="font-bold text-lg mb-2">Plantão Ativo</h3>
              <p className="text-sm opacity-90 mb-4">Inicie sua sala de telemedicina agora para receber pacientes.</p>
              <Button className="bg-white text-primary-color font-bold w-full">
                Abrir Sala Virtual
              </Button>
            </div>
            
            <div className="bg-surface-alt p-5 rounded-xl border border-divider">
              <h3 className="font-bold mb-3">Lembretes</h3>
              <ul className="text-sm space-y-3">
                <li className="flex gap-2 items-start text-text-muted">
                  <div className="h-2 w-2 rounded-full bg-orange-500 mt-1.5" />
                  Revisar laudos de exames pendentes
                </li>
                <li className="flex gap-2 items-start text-text-muted">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                  Reunião clínica às 18h
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
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
          status === 'Aguardando' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {status}
        </span>
        <ChevronRight size={18} className="text-text-muted" />
      </div>
    </div>
  );
}