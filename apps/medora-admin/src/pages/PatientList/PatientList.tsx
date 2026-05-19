import { useState } from "react";
import { Button, Input } from "@heroui/react";
import { 
  Search, 
  ChevronRight, 
  UserPlus, 
  Filter, 
  FileText, 
  Calendar,
  MoreVertical
} from "lucide-react";

export default function PatientList() {
  const [searchTerm, setSearchTerm] = useState("");

  // Dados mockados para exibição
  const patients = [
    { id: "#8921", name: "Carlos Alberto da Silva", age: 45, gender: "M", phone: "(11) 99888-7766", plan: "Plano Prata", status: "Ativo", lastConsult: "12/05/2026" },
    { id: "#4412", name: "Maria Eduarda Medeiros", age: 28, gender: "F", phone: "(21) 98765-4321", plan: "Particular", status: "Ativo", lastConsult: "Hoje" },
    { id: "#7721", name: "Ricardo Souza Santos", age: 62, gender: "M", phone: "(31) 99111-2233", plan: "Plano Ouro", status: "Inativo", lastConsult: "20/04/2026" },
    { id: "#1043", name: "Ana Beatriz Oliveira", age: 34, gender: "F", phone: "(11) 97766-5544", plan: "Plano Prata", status: "Ativo", lastConsult: "Ontem" },
    { id: "#5591", name: "Fernando Henrique Lima", age: 51, gender: "M", phone: "(19) 98123-4567", plan: "Unimed", status: "Aguardando", lastConsult: "05/05/2026" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full p-6">
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Pacientes</h1>
          <p className="text-text-muted">Gerenciamento, histórico e cadastros de pacientes da clínica.</p>
        </div>
        <Button className="bg-primary-color text-white font-bold flex items-center gap-2 shadow-md">
          <UserPlus size={18} /> Novo Paciente
        </Button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-surface-alt p-4 rounded-xl border border-divider flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="w-full md:max-w-md relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            className="pl-10"
            placeholder="Buscar por nome, CPF ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto justify-end">
          <Button variant="ghost" className="text-text-muted border border-divider flex items-center gap-2">
            <Filter size={16} /> Filtros
          </Button>
          <span className="text-xs text-text-muted flex items-center px-2 font-medium">
            Exibindo {patients.length} pacientes
          </span>
        </div>
      </div>

      {/* Tabela de Pacientes */}
      <div className="bg-surface-alt rounded-xl border border-divider overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider bg-surface/50 text-xs font-bold text-text-muted uppercase tracking-wider">
                <th className="p-4">ID / Nome</th>
                <th className="p-4">Idade / Gênero</th>
                <th className="p-4">Contato</th>
                <th className="p-4">Convênio</th>
                <th className="p-4">Última Consulta</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider text-sm text-text-primary">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-surface/40 transition-colors cursor-pointer group">
                  <td className="p-4">
                    <div className="font-semibold text-text-primary group-hover:text-primary-color transition-colors">
                      {patient.name}
                    </div>
                    <div className="text-xs text-text-muted font-mono mt-0.5">{patient.id}</div>
                  </td>
                  <td className="p-4 text-text-muted">
                    {patient.age} anos ({patient.gender})
                  </td>
                  <td className="p-4 text-text-muted font-medium">
                    {patient.phone}
                  </td>
                  <td className="p-4">
                    <span className="text-xs px-2.5 py-0.5 bg-surface rounded-md border border-divider font-medium">
                      {patient.plan}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <Calendar size={14} />
                      {patient.lastConsult}
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge type={patient.status} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button size="sm" variant="ghost" isIconOnly className="text-text-muted h-8 w-8 min-w-0">
                        <FileText size={16} />
                      </Button>
                      <ChevronRight size={18} className="text-text-muted group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    Ativo: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
    Aguardando: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
    Inativo: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[type] || styles.Inativo}`}>
      {type}
    </span>
  );
}