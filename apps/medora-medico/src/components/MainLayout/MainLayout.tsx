import { Outlet, useLocation, useNavigate } from "react-router";
import Navbar from "../Header/Header";
import Footer from "../Footer/Footer";
import { Sidebar, SidebarToggle } from "../../../../../packages/shared/src/components/components";
import { Calendar, ClipboardList, LayoutDashboard, LogOut, MessageSquare, Settings, Stethoscope, UserCircle, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@heroui/react";

export default function MainLayout() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Liste os caminhos completos como eles aparecem na URL
  const locationsSidebar = ['/', '/home', '/medico/teleconsulta'];
  const locationsFooter = ['/medico/prontuario', '/medico/consulta'];

  const isPreSala = /\/medico\/teleconsulta\/.*\/pre-sala/.test(location.pathname);
  const isSala = /\/medico\/teleconsulta\/.*\/sala/.test(location.pathname);

  // A lógica de verificação permanece a mesma
  const hideSidebar = locationsSidebar.includes(location.pathname) || isPreSala || isSala;
  const hideFooter = locationsFooter.includes(location.pathname) || isPreSala || isSala;

  const handleLogOut = () => {
    navigate("/")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-text-primary antialiased selection:bg-primary-subtle selection:text-primary-text">
      {!hideSidebar && (
        <>
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
              <Sidebar.Section title="Agenda" />
              <Sidebar.Item icon={Users} label="Disponibilidade">
                <Sidebar.SubItem label="Cadastrar Disponibilidade" href="/medico/disponibilidade" />
                <Sidebar.SubItem label="Agenda" href="/medico/agenda" />
              </Sidebar.Item>


              <Sidebar.Section title="Gestão" />
              {/* <Sidebar.Item icon={Users} label="Pacientes">
                <Sidebar.SubItem label="Listagem Geral" href="/pacientes" />
                <Sidebar.SubItem label="Prontuários" href="/prontuarios" />
                <Sidebar.SubItem label="Novo Cadastro" href="/pacientes/novo" />
              </Sidebar.Item> */}

              <Sidebar.Item icon={ClipboardList} label="Consultas">
                <Sidebar.SubItem label="Consultas" href="/medico/consulta" />
              </Sidebar.Item>

              {/* <Sidebar.Item icon={MessageSquare} label="Mensagens" /> */}
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
                  <Button
                  isIconOnly variant="ghost" className="hover:text-red-400 text-gray-500  transition-colors"
                  onPress={handleLogOut}
                  >
                  <LogOut size={18} />
                  </Button>
                </div>
              </div>
            </Sidebar.Footer>

          </Sidebar.Root>
        </>
      )}


      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="flex-1 w-full">
          <Outlet />
        </main>

        {!hideFooter && <Footer />}
      </div>
    </div>
  );
}