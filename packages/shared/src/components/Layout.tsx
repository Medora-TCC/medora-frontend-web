import { Outlet } from "react-router";

export function Layout() {
 return (
    <div className="min-h-screen w-full bg-surface text-text-primary flex items-center justify-center antialiased selection:bg-primary-subtle selection:text-primary-text">
       <Outlet />
    </div>
  );
}