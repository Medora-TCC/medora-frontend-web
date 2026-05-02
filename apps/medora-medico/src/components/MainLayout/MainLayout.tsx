import { Outlet } from "react-router";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-text-primary antialiased selection:bg-primary-subtle selection:text-primary-text">
      <Navbar />

      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}