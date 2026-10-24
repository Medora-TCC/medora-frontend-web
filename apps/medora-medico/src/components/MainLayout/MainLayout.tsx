import { Outlet, useLocation } from "react-router";
import Navbar from "../Header/Header";
import Footer from "../Footer/Footer";
import { Sidebar, SidebarToggle } from "../../../../../packages/shared/src/components/components";
import { Activity, Calendar, CircleDollarSign, ClipboardList, ClipboardPlus, FilePenLine, LayoutDashboard, Settings, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getDoctorRqes } from "../../api/services/DoctorService";
import type { DoctorRqesDto } from "../../api/dtos/Doctors/DoctorRqesDto";
import MainSpecialtiesModal from "../../modals/MainSpecialtiesModal/MainSpecialtiesModal";
import type { RqeItemDto } from "../../api/dtos/Doctors/DoctorRqesDto";

const EMPTY_RQES: RqeItemDto[] = [];

export default function MainLayout() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const [doctorRqes, setDoctorRqes] = useState<DoctorRqesDto | null>(null);
  const [isSpecialtiesModalOpen, setIsSpecialtiesModalOpen] = useState(false);
  const { accessToken } = useAuth();
  const [isLoadingRqes, setIsLoadingRqes] = useState(false);


  
  const loadRqes = useCallback(async () => {
  if (!accessToken) return null;
  setIsLoadingRqes(true);
  try {
    const data = await getDoctorRqes();
    setDoctorRqes(data);
    return data;
  } finally {
    setIsLoadingRqes(false);
  }
}, [accessToken]);

  const openSpecialtiesModal = () => {
  setIsSpecialtiesModalOpen(true);
  loadRqes().catch((error) => console.error(error));
};
  useEffect(() => {
    loadRqes()
      .then((data) => {
        const hasMainSpecialty = data?.rqes.some((r) => r.priority !== null);
        if (data && !hasMainSpecialty) setIsSpecialtiesModalOpen(true);
      })
      .catch((error) => console.error(error));
  }, [loadRqes]);

  const rankedRqes = (doctorRqes?.rqes ?? [])
  .filter((r) => r.priority !== null)
  .sort((a, b) => a.priority! - b.priority!);
  const mainSpecialty = rankedRqes[0]?.specialtyName ?? null;
  const extraSpecialtiesCount = Math.max(rankedRqes.length - 1, 0); 
  // Liste os caminhos completos como eles aparecem na URL
  const locationsSidebar = ['/', '/home', '/medico/teleconsulta'];
  const locationsFooter = ['/medico/prontuario', '/medico/consulta', '/medico/prescricao', '/medico/agenda', '/medico/assinatura'];

  const isPreSala = /\/medico\/teleconsulta\/.*\/pre-sala/.test(location.pathname);
  const isSala = /\/medico\/teleconsulta\/.*\/sala/.test(location.pathname);

  // A lógica de verificação permanece a mesma
  const hideSidebar = locationsSidebar.includes(location.pathname) || isPreSala || isSala;
  const hideFooter = locationsFooter.includes(location.pathname) || isPreSala || isSala;

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-text-primary antialiased selection:bg-primary-subtle selection:text-primary-text">
      {!hideSidebar && (
        <>
          <SidebarToggle isOpen={isSidebarOpen} onOpen={toggleSidebar} />

          <Sidebar.Root isOpen={isSidebarOpen} onClose={closeSidebar}>

            <Sidebar.Header>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-overlay rounded-xl shrink-0 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Activity size={48} color="#2563eb" strokeWidth={1.25} />
                </div>
                <div className="flex flex-col whitespace-nowrap transition-all duration-300 opacity-0 group-hover:opacity-100 max-md:opacity-100">
                  <span className="text-text-primary font-bold text-lg leading-tight">Medora</span>
                  <span className="text-primary-color text-[10px] uppercase tracking-widest font-semibold">Medical System</span>
                </div>
              </div>
            </Sidebar.Header>

            <div className="flex-1 py-4">
              <Sidebar.Section title="Geral" />
              <Sidebar.Item
                icon={LayoutDashboard}
                label="Dashboard"
                isActive={location.pathname === '/medico'}
                href="/medico" />

              <Sidebar.Item
                icon={ClipboardList}
                label="Consultas"
                isActive={location.pathname.startsWith('/medico/consulta')}
                href="/medico/consulta" />

              <Sidebar.Item
                icon={Calendar}
                label="Agenda"
                isActive={location.pathname.startsWith('/medico/agenda')}
                href="/medico/agenda" />


              <Sidebar.Item
                icon={ClipboardPlus }
                label="Meus Prontuários"
                isActive={location.pathname.startsWith('/medico/prontuario')}
                href="/medico/prontuario" />

              <Sidebar.Item
                icon={FilePenLine}
                label="Assinar Documentos"
                isActive={location.pathname.startsWith('/medico/assinatura')}
                href="/medico/assinatura" />

                <Sidebar.Item
                icon={CircleDollarSign }
                label="Financeiro"
                isActive={location.pathname.startsWith('/medico/financeiro')}
                href="/medico/financeiro" />

              <Sidebar.Item
                icon={Users}
                label="Configurar Horários"
                isActive={location.pathname.startsWith('/medico/disponibilidade')}
                href="/medico/disponibilidade" />
              {/* <Sidebar.Item icon={Users} label="Pacientes">
                <Sidebar.SubItem label="Listagem Geral" href="/pacientes" />
                <Sidebar.SubItem label="Prontuários" href="/prontuarios" />
                <Sidebar.SubItem label="Novo Cadastro" href="/pacientes/novo" />
              </Sidebar.Item> */}



              {/* <Sidebar.Item icon={MessageSquare} label="Mensagens" /> */}
              <Sidebar.Item
                icon={Settings}
                label="Ajustes"
                isActive={location.pathname.startsWith('/medico/configuracoes')}
                href="/medico/configuracoes" />
            </div>

          </Sidebar.Root>
        </>
      )}


      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar
          doctorName={doctorRqes?.doctorName ?? null}
          mainSpecialty={mainSpecialty}
          extraSpecialtiesCount={extraSpecialtiesCount}
          onOpenSpecialties={openSpecialtiesModal}
        />
        <MainSpecialtiesModal
          isOpen={isSpecialtiesModalOpen}
          isLoading={isLoadingRqes}
          onClose={() => setIsSpecialtiesModalOpen(false)}
          rqes={doctorRqes?.rqes ?? EMPTY_RQES}
          onSaved={loadRqes}
        />
        <main className="flex-1 w-full">
          <Outlet />
        </main>

        {!hideFooter && <Footer />}
      </div>
    </div>
  );
}