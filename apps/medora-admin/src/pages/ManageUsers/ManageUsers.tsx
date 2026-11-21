import { useCallback, useEffect, useState } from "react";
import { Button, Card, Spinner } from "@heroui/react";
import {
  CheckSquare, ChevronDown, Filter, LogOut, MoreHorizontal, RefreshCw, Search,
  Shield, ShieldOff, Square, UserCheck, UserMinus, Users,
  Wifi,
} from "lucide-react";
import { revokeUserSessions, searchUsers, setUserActive } from "../../api/services/AdminUserService";
import type { AdminUserItem, AdminUserSummary, UserRole } from "../../api/dtos/users";
import { ROLE_CONFIG } from "../../api/mappers/userLabels";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import { useConfirm } from "../../components/ConfirmDialog/useConfirm";

const PAGE_SIZE = 25;
const EMPTY_SUMMARY: AdminUserSummary = {
  total: 0, active: 0, inactive: 0, doctors: 0,
  patients: 0,
  onlineNow: 0
};

type StatusFilter = "all" | "active" | "inactive" | "online";

function formatLastAccess(iso: string | null): string {
  if (!iso) return "Sem acesso registrado";
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })} · ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

function initialsOf(user: AdminUserItem) {
  const base = user.name ?? user.email;
  return base.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [summary, setSummary] = useState<AdminUserSummary>(EMPTY_SUMMARY);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const { confirm, dialogProps } = useConfirm();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await searchUsers({
        search: search || undefined,
        role: roleFilter === "all" ? undefined : roleFilter,
        isActive: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
        onlyOnline: statusFilter === "online" || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setUsers(data.items);
      setTotal(data.total);
      setSummary(data.summary);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao carregar os usuários." });
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const changeFilter = (apply: () => void) => {
    apply();
    setPage(1);
    setSelected(new Set());
  };

  const selectedUsers = users.filter((u) => selected.has(u.id));
  const allSelected = users.length > 0 && users.every((u) => selected.has(u.id));
  const someSelected = selectedUsers.length > 0 && !allSelected;
  const allSelectedActive = selectedUsers.every((u) => u.isActive);

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(users.map((u) => u.id)));

  // executa a ação em cada usuário e informa quantas deram certo
  async function runForUsers(targets: AdminUserItem[], action: (user: AdminUserItem) => Promise<void>, verb: string) {
    setBusy(true);
    setMessage(null);

    const results = await Promise.allSettled(targets.map(action));
    const failures = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
    const succeeded = targets.length - failures.length;

    if (failures.length === 0) {
      setMessage({ type: "success", text: `${succeeded} usuário(s) ${verb}.` });
    } else {
      const reason = failures[0].reason instanceof Error ? failures[0].reason.message : "Erro inesperado.";
      setMessage({ type: "error", text: `${succeeded} de ${targets.length} usuário(s) ${verb}. ${reason}` });
    }

    setSelected(new Set());
    setBusy(false);
    await load();
  }

  async function changeStatus(targets: AdminUserItem[], isActive: boolean) {
    const who = targets.length === 1 ? (targets[0].name ?? targets[0].email) : `${targets.length} usuários`;
    const confirmed = await confirm(
      isActive
        ? { title: "Reativar acesso?", description: `${who} poderá(ão) entrar no sistema novamente.`, confirmLabel: "Reativar" }
        : {
            title: "Desativar acesso?",
            description: `${who} perderá(ão) o acesso imediatamente: as sessões abertas são encerradas e o login fica bloqueado.`,
            confirmLabel: "Desativar",
            tone: "danger",
          },
    );
    if (!confirmed) return;

    await runForUsers(targets, (u) => setUserActive(u.id, isActive), isActive ? "reativado(s)" : "desativado(s)");
  }

  async function revokeSessions(targets: AdminUserItem[]) {
    const confirmed = await confirm({
      title: "Encerrar sessões?",
      description: "As sessões abertas serão encerradas na hora. A conta continua ativa, e a pessoa pode entrar de novo com a senha.",
      confirmLabel: "Encerrar sessões",
    });
    if (!confirmed) return;

    await runForUsers(targets, (u) => revokeUserSessions(u.id), "deslogado(s)");
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Usuários</h1>
          <p className="text-text-secondary mt-1 text-sm">Gerencie o acesso das contas da plataforma.</p>
        </div>
        <button
          onClick={load}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 h-9 rounded-lg border border-divider text-sm text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors"
        >
          <RefreshCw size={14} />
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total de usuários", value: summary.total, icon: <Users size={15} />, color: "text-primary-text" },
          { label: "Ativos", value: summary.active, icon: <UserCheck size={15} />, color: "text-success-text" },
          { label: "Inativos", value: summary.inactive, icon: <UserMinus size={15} />, color: "text-danger-text" },
          { label: "Médicos", value: summary.doctors, icon: <Shield size={15} />, color: "text-primary-text" },
          { label: "Online agora", value: summary.onlineNow, icon: <Wifi size={15} />, color: "text-success-text" },
        ].map((s) => (
          <Card key={s.label} className="p-4 border border-divider bg-surface shadow-none rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1.5">
              <span className={s.color}>{s.icon}</span>
              {s.label}
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {message && (
        <p className={`px-4 py-3 rounded-lg text-sm ${message.type === "error" ? "bg-danger-subtle text-danger-text" : "bg-success-subtle text-success-text"}`}>
          {message.text}
        </p>
      )}

      <Card className="border border-divider bg-surface shadow-none rounded-xl overflow-hidden">
        <div className="px-4 py-3.5 border-b border-divider flex flex-col sm:flex-row gap-3">
          <form
            className="relative flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              changeFilter(() => setSearch(searchDraft.trim()));
            }}
          >
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="search"
              placeholder="Buscar por nome ou e-mail e pressionar Enter"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-lg border border-divider bg-surface text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary-hover transition-colors"
            />
          </form>
          <div className="flex gap-2">
            <SelectFilter
              value={roleFilter}
              onChange={(v) => changeFilter(() => setRoleFilter(v as "all" | UserRole))}
              options={[
                { label: "Todos os perfis", value: "all" },
                ...Object.entries(ROLE_CONFIG).map(([value, config]) => ({ label: config.label, value })),
              ]}
              icon={<Filter size={13} />}
            />
            <SelectFilter
              value={statusFilter}
              onChange={(v) => changeFilter(() => setStatusFilter(v as StatusFilter))}
              options={[
                { label: "Todos os status", value: "all" },
                { label: "Ativo", value: "active" },
                { label: "Inativo", value: "inactive" },
              ]}
            />
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <div className="px-4 py-2.5 border-b border-divider bg-surface-alt flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-text-secondary mr-1">
              {selectedUsers.length} selecionado{selectedUsers.length !== 1 ? "s" : ""}
            </span>
            <Button size="sm" variant="outline" isDisabled={busy} onPress={() => revokeSessions(selectedUsers)}>
              <LogOut size={14} /> Encerrar sessões
            </Button>
            <Button
              size="sm"
              isDisabled={busy}
              className={allSelectedActive ? "bg-danger text-white" : "bg-success text-white"}
              onPress={() => changeStatus(selectedUsers, !allSelectedActive)}
            >
              <ShieldOff size={14} /> {allSelectedActive ? "Desativar" : "Reativar"}
            </Button>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-text-muted hover:text-text-secondary">
              Limpar seleção
            </button>
          </div>
        )}

        <div className="grid grid-cols-[2.5rem_1fr_1fr_auto_auto_2.5rem] gap-3 px-4 py-2.5 border-b border-divider bg-surface-alt text-xs font-medium text-text-muted uppercase tracking-wide">
          <button onClick={toggleAll} className="text-text-muted hover:text-primary-text" aria-label={allSelected ? "Desmarcar todos" : "Selecionar todos"}>
            {allSelected ? <CheckSquare size={16} className="text-primary" /> : someSelected ? <MoreHorizontal size={16} className="text-primary" /> : <Square size={16} />}
          </button>
          <span>Usuário</span>
          <span className="hidden sm:block">E-mail</span>
          <span>Perfil</span>
          <span>Status</span>
          <span />
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center"><Spinner /></div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={32} className="mx-auto text-text-muted opacity-30 mb-3" />
            <p className="text-sm font-medium text-text-secondary">Nenhum usuário encontrado</p>
            <p className="text-xs text-text-muted mt-1">Tente ajustar os filtros.</p>
          </div>
        ) : (
          <div className="divide-y divide-divider">
            {users.map((user) => {
              const isSelected = selected.has(user.id);
              const role = ROLE_CONFIG[user.role];
              return (
                <div
                  key={user.id}
                  onClick={() => toggleSelect(user.id)}
                  className={`grid grid-cols-[2.5rem_1fr_1fr_auto_auto_2.5rem] gap-3 px-4 py-3 items-center cursor-pointer transition-colors group ${isSelected ? "bg-primary-subtle/60" : "hover:bg-surface-alt"}`}
                >
                  <span className={isSelected ? "text-primary" : "text-text-muted"}>
                    {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  </span>

                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full bg-primary-subtle text-primary-text text-sm font-semibold flex items-center justify-center">
                        {initialsOf(user)}
                      </div>
                      {user.isOnline && (
                        <span
                          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-surface"
                          title="Online agora"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{user.name ?? user.email}</p>
                      <p className="text-xs text-text-muted truncate hidden sm:block">
                          {user.isOnline ? "Online agora" : `Último acesso: ${formatLastAccess(user.lastAccessAt)}`}
                        </p>
                    </div>
                  </div>

                  <span className="text-sm text-text-secondary truncate hidden sm:block">{user.email}</span>

                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${role.className}`}>{role.label}</span>

                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.isActive ? "text-success-text" : "text-danger-text"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-success" : "bg-danger"}`} />
                    {user.isActive ? "Ativo" : "Inativo"}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      changeStatus([user], !user.isActive);
                    }}
                    disabled={busy}
                    className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger-subtle opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                    aria-label={user.isActive ? "Desativar usuário" : "Reativar usuário"}
                  >
                    {user.isActive ? <UserMinus size={14} /> : <UserCheck size={14} />}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="px-4 py-3 border-t border-divider bg-surface-alt flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {total} {total === 1 ? "usuário" : "usuários"} · página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" isDisabled={page <= 1 || isLoading} onPress={() => setPage((p) => p - 1)}>Anterior</Button>
            <Button size="sm" variant="outline" isDisabled={page >= totalPages || isLoading} onPress={() => setPage((p) => p + 1)}>Próxima</Button>
          </div>
        </div>
      </Card>

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

function SelectFilter({ value, onChange, options, icon }: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center border border-divider rounded-lg bg-surface h-9 px-3 gap-1.5 focus-within:border-primary-hover transition-colors">
      {icon && <span className="text-text-muted shrink-0">{icon}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full bg-transparent outline-none text-sm text-text-primary cursor-pointer appearance-none pr-5"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface text-text-primary">{o.label}</option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 pointer-events-none text-text-muted" />
    </div>
  );
}