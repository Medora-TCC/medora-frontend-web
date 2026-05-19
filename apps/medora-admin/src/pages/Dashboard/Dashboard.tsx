import { useState } from "react";
import { Button, Input } from "@heroui/react";
import {  
  Users, 
  Search,
  ChevronRight,
  Stethoscope,
  Bell,
  Sliders,
  FileText,
  AlertCircle,
  Check,
  X
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"medicos" | "pacientes">("medicos");

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Navbar Superior do Admin */}
      <nav className="flex justify-center w-full px-6 py-2 sticky top-0 z-50">
        <div className="flex items-center justify-between w-full max-w-[1400px] bg-surface-alt border border-divider rounded-2xl px-6 h-16 shadow-lg backdrop-blur-md bg-opacity-80">
          
          <div className="flex items-center gap-2">
            <Sliders size={24} className="text-primary-color" />
            <span className="font-bold text-xl text-primary-color">Medora <span className="text-xs px-2 py-0.5 bg-primary-color/10 rounded-md ml-1 font-medium">Admin</span></span>
          </div>

          <div className="flex items-center gap-4">
            <Button isIconOnly variant="ghost" className="text-text-muted">
              <Bell size={20} />
            </Button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-divider">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-text-primary leading-none">Admin Sistema</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Gestão Geral</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold shadow-sm border-2 border-surface">
                AD
              </div>
            </div>
          </div>

        </div>
      </nav>

      <main className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
        {/* Visão Geral */}
        <header>
          <h1 className="text-2xl font-bold text-text-primary">Painel de Controle</h1>
          <p className="text-text-muted">Gerencie a infraestrutura, profissionais e usuários da plataforma.</p>
        </header>

        {/* Módulos de Status de Gestão */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatBox icon={<Stethoscope className="text-blue-500" />} label="Médicos Ativos" value="28" />
          <StatBox icon={<Users className="text-purple-500" />} label="Total Pacientes" value="342" />
          <StatBox icon={<AlertCircle className="text-orange-500" />} label="Recursos Pendentes" value="04" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Listas Principais (Médicos / Pacientes) */}
          <div className="lg:col-span-2 bg-surface-alt rounded-xl shadow-sm border border-divider overflow-hidden flex flex-col">
            
            {/* Header da Tabela com Tabs */}
            <div className="p-5 border-b border-divider flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex bg-surface p-1 rounded-lg border border-divider">
                <button 
                  onClick={() => setActiveTab("medicos")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "medicos" ? "bg-primary-color text-white shadow-sm" : "text-text-muted hover:text-text-primary"}`}
                >
                  Médicos
                </button>
                <button 
                  onClick={() => setActiveTab("pacientes")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "pacientes" ? "bg-primary-color text-white shadow-sm" : "text-text-muted hover:text-text-primary"}`}
                >
                  Pacientes
                </button>
              </div>
              
              <div className="w-full sm:max-w-[240px] relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <Input size={16} placeholder={`Buscar ${activeTab}...`} className="pl-10" />
              </div>
            </div>

            {/* Conteúdo Dinâmico das Listas */}
            <div className="divide-y divide-divider">
              {activeTab === "medicos" ? (
                <>
                  <RowItem title="Dr. João Silva" subtitle="Cardiologia" badgeText="Disponível" badgeType="success" info="CRM 123456" />
                  <RowItem title="Dra. Mariana Costa" subtitle="Pediatria" badgeText="Em Consulta" badgeType="warning" info="CRM 789012" />
                  <RowItem title="Dr. Henrique Sousa" subtitle="Clínico Geral" badgeText="Ausente" badgeType="danger" info="CRM 345678" />
                </>
              ) : (
                <>
                  <RowItem title="Carlos Alberto" subtitle="Última consulta: Hoje às 09:00" badgeText="Plano Prata" badgeType="info" info="ID: #8921" />
                  <RowItem title="Maria Eduarda" subtitle="Última consulta: Hoje às 09:45" badgeText="Particular" badgeType="muted" info="ID: #4412" />
                  <RowItem title="Ricardo Souza" subtitle="Última consulta: Ontem" badgeText="Plano Ouro" badgeType="info" info="ID: #7721" />
                </>
              )}
            </div>
          </div>

          {/* Lateral: Recursos Solicitados pelos Médicos */}
          <div className="space-y-4">
            <div className="bg-surface-alt p-5 rounded-xl border border-divider shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="text-primary-color" size={20} />
                <h3 className="font-bold text-lg text-text-primary">Pedidos de Recursos</h3>
              </div>
              
              <p className="text-xs text-text-muted mb-4">Solicitações de alterações ou ferramentas vindas do corpo médico.</p>
              
              <div className="space-y-3">
                {/* Solicitação 1 */}
                <ResourceRequestCard 
                  doctor="Dr. João" 
                  request="Adicionar CID-10 de Cardiologia nos favoritos do prontuário." 
                  time="Há 10 min"
                />
                
                {/* Solicitação 2 */}
                <ResourceRequestCard 
                  doctor="Dra. Mariana" 
                  request="Liberar emissão de receitas especiais de controle B2 no perfil." 
                  time="Há 1 hora"
                />

                {/* Solicitação 3 */}
                <ResourceRequestCard 
                  doctor="Dr. Henrique" 
                  request="Ajustar horário de bloqueio da agenda de Quinta-feira para às 16h." 
                  time="Ontem"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Componentes Auxiliares Internos
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

function RowItem({ title, subtitle, badgeText, badgeType, info }: any) {
  const badgeStyles: Record<string, string> = {
    success: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
    warning: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
    danger: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    muted: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-surface transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <div>
          <p className="font-semibold text-text-primary text-sm sm:text-base">{title}</p>
          <p className="text-xs text-text-muted">{subtitle}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline text-xs text-text-muted font-mono">{info}</span>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeStyles[badgeType] || badgeStyles.muted}`}>
          {badgeText}
        </span>
        <ChevronRight size={18} className="text-text-muted" />
      </div>
    </div>
  );
}

function ResourceRequestCard({ doctor, request, time }: any) {
  return (
    <div className="p-3.5 bg-surface rounded-lg border border-divider space-y-3 hover:border-primary-color/40 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold text-primary-color bg-primary-color/10 px-2 py-0.5 rounded">
            {doctor}
          </span>
        </div>
        <span className="text-[10px] text-text-muted">{time}</span>
      </div>
      
      <p className="text-xs text-text-primary leading-relaxed">
        "{request}"
      </p>

      {/* Ações Rápidas do Admin para o recurso */}
      <div className="flex gap-2 justify-end pt-1">
        <Button size="sm" variant="primary" className="bg-primary-color text-white font-bold h-7 px-3 text-xs">
        <Check size={14} className="mr-1" /> Resolver
        </Button>
        <Button size="sm" variant="primary" className="bg-primary-color text-white font-bold h-7 px-3 text-xs">
          <Check size={14} className="mr-1" /> Resolver
        </Button>
      </div>
    </div>
  );
}