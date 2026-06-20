import { Outlet, useLocation } from "react-router";
import { Activity, UserRoundCog } from "lucide-react";
import { useState } from "react";
import { Sidebar, SidebarToggle } from "@medora_web/shared";


export default function MainLayout() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const locationsSidebar = ['/', '/home', ''];

  const hideSidebar = locationsSidebar.includes(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-text-primary antialiased selection:bg-primary-subtle selection:text-primary-text">
      {!hideSidebar && (
        <>
          <SidebarToggle isOpen={isSidebarOpen} onOpen={toggleSidebar} />

          <Sidebar.Root isOpen={isSidebarOpen} onClose={closeSidebar}>

            <Sidebar.Header>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-color rounded-xl shrink-0 flex items-center justify-center shadow-lg shadow-indigo-500/20">
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
                icon={UserRoundCog }
                label="Dashboard"
                isActive={location.pathname === '/medico'}
                href="/home"/>
               
              <Sidebar.Item 
              icon={UserRoundCog} 
              label="Gerenciar Usuarios"
              isActive={location.pathname.startsWith('/manage-users')}
              href="/manage-users"/>
            </div>

          </Sidebar.Root>
        </>
      )}


      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 w-full">
          <Outlet />
        </main>

      </div>
    </div>
  );
}