import { NavLink, Outlet, useOutletContext } from "react-router";
import { Shield, Stethoscope, UserRound } from "lucide-react";
import AccountHeader from "./AccountHeader";

const SECTIONS = [
  { to: "dados-pessoais", label: "Dados pessoais", icon: UserRound },
  { to: "dados-profissionais", label: "Dados profissionais", icon: Stethoscope },
  { to: "seguranca", label: "Segurança", icon: Shield },
];

export default function AccountLayout() {
  const parentContext = useOutletContext();

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-6">
      <div className="mb-6">
        <AccountHeader />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <nav className="flex md:flex-col gap-1 md:w-56 shrink-0 overflow-x-auto">
          {SECTIONS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-primary-subtle text-primary-text font-semibold"
                    : "text-text-secondary hover:bg-surface-alt hover:text-text-primary"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <section className="flex-1 min-w-0 min-h-[60vh]">
          <Outlet context={parentContext} />
        </section>
      </div>
    </div>
  );
}