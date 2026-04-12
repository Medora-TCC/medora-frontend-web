import { useState } from 'react';
import { Sidebar, SidebarToggle, ThemeProvider, Layout } from '@medora_web/shared'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut,
  ChevronRight,
  Stethoscope,
  ClipboardList,
  UserCircle
} from 'lucide-react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <ThemeProvider>
      <Layout>
        <div className="flex min-h-screen w-full bg-[#151521] overflow-x-hidden font-sans">
          
          <SidebarToggle isOpen={isSidebarOpen} onOpen={toggleSidebar} />

          <Sidebar.Root isOpen={isSidebarOpen} onClose={closeSidebar}>
            
            <Sidebar.Header>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl shrink-0 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Stethoscope className="text-white" size={24} />
                </div>
                <div className="flex flex-col whitespace-nowrap transition-all duration-300 opacity-0 group-hover:opacity-100 max-md:opacity-100">
                  <span className="text-white font-bold text-lg leading-tight">healthConnect</span>
                  <span className="text-indigo-400 text-[10px] uppercase tracking-widest font-semibold">Medical System</span>
                </div>
              </div>
            </Sidebar.Header>

            <div className="flex-1 py-4">
              <Sidebar.Section title="Principal" />
              <Sidebar.Item icon={LayoutDashboard} label="Dashboard" isActive />
              <Sidebar.Item icon={Calendar} label="Agenda Médica" />
              
              <Sidebar.Section title="Gestão" />
              <Sidebar.Item icon={Users} label="Pacientes">
                <Sidebar.SubItem label="Listagem Geral" href="/pacientes" />
                <Sidebar.SubItem label="Prontuários" href="/prontuarios" />
                <Sidebar.SubItem label="Novo Cadastro" href="/pacientes/novo" />
              </Sidebar.Item>

              <Sidebar.Item icon={ClipboardList} label="Consultas">
                <Sidebar.SubItem label="Hoje" href="/consultas/hoje" />
                <Sidebar.SubItem label="Histórico" href="/consultas/historico" />
              </Sidebar.Item>

              <Sidebar.Item icon={MessageSquare} label="Mensagens" />
              
              <Sidebar.Section title="Configurações" />
              <Sidebar.Item icon={Settings} label="Ajustes" />
            </div>

            <Sidebar.Footer>
              <div className="flex items-center gap-3 group/footer cursor-pointer">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center border-2 border-indigo-500/30">
                    <UserCircle className="text-slate-300" size={24} />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1e1e2d] rounded-full"></div>
                </div>
                
                <div className="flex items-center justify-between w-full transition-all duration-300 opacity-0 group-hover:opacity-100 max-md:opacity-100">
                  <div className="flex flex-col whitespace-nowrap">
                    <span className="text-sm font-bold text-white">Dr. Pedro Silva</span>
                    <span className="text-xs text-gray-500">CRM 12345-SP</span>
                  </div>
                  <LogOut className="text-gray-500 hover:text-red-400 transition-colors" size={18} />
                </div>
              </div>
            </Sidebar.Footer>

          </Sidebar.Root>

          <main className="flex-1 flex flex-col min-w-0">
            <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-[#1e1e2d]/30 backdrop-blur-md sticky top-0 z-30">
              <h1 className="text-xl font-semibold text-white">Dashboard de Visão Geral</h1>
              <div className="hidden md:flex items-center gap-4 text-sm text-gray-400">
                <span>12 de Abril, 2024</span>
              </div>
            </header>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-32 bg-[#1e1e2d] rounded-2xl border border-white/5 p-6 shadow-sm">
                   <p className="text-gray-500 text-sm">Consultas de Hoje</p>
                   <p className="text-white text-3xl font-bold mt-2">14</p>
                </div>
                <div className="h-32 bg-[#1e1e2d] rounded-2xl border border-white/5 p-6 shadow-sm">
                   <p className="text-gray-500 text-sm">Pacientes Novos</p>
                   <p className="text-white text-3xl font-bold mt-2">08</p>
                </div>
                <div className="h-32 bg-[#1e1e2d] rounded-2xl border border-white/5 p-6 shadow-sm">
                   <p className="text-gray-500 text-sm">Pendências</p>
                   <p className="text-white text-3xl font-bold mt-2">03</p>
                </div>
              </div>

              <div className="mt-8 h-96 bg-[#1e1e2d] rounded-2xl border border-white/5 p-6 shadow-sm flex items-center justify-center">
                 <p className="text-gray-600 italic">Área de gráficos e tabelas do healthConnect...</p>
              </div>
            </div>
          </main>

        </div>
      </Layout>
    </ThemeProvider>
  );
}

export default App;