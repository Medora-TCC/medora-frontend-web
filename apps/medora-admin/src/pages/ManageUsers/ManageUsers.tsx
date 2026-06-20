import { useState, useCallback, useMemo } from 'react';
import { Card, toast, ToastProvider, Button, Modal } from '@heroui/react';
import {
  Search,
  LogOut,
  UserX,
  KeyRound,
  Users,
  CheckSquare,
  Square,
  ChevronDown,
  Shield,
  ShieldOff,
  Filter,
  RefreshCw,
  MoreHorizontal,
  UserCheck,
  UserMinus,
  Rocket,
} from 'lucide-react';


type UserRole = 'admin' | 'doctor' | 'patient';
type UserStatus = 'active' | 'inactive';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string | null;
  createdAt: string;
  avatar?: string;
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'Ana Beatriz Costa',      email: 'ana.costa@clinica.com',      role: 'doctor',       status: 'active',   lastLogin: '2025-06-15T14:32:00', createdAt: '2024-01-10' },
  { id: '2', name: 'Carlos Eduardo Lima',    email: 'carlos.lima@clinica.com',    role: 'doctor',       status: 'active',   lastLogin: '2025-06-14T09:00:00', createdAt: '2024-02-05' },
  { id: '3', name: 'Mariana Rocha',          email: 'mariana@clinica.com',        role: 'doctor',       status: 'active',   lastLogin: '2025-06-15T08:15:00', createdAt: '2024-03-01' },
  { id: '4', name: 'Roberto Alves',          email: 'roberto.alves@clinica.com',  role: 'admin',        status: 'active',   lastLogin: '2025-06-15T16:45:00', createdAt: '2023-12-01' },
  { id: '5', name: 'Fernanda Souza',         email: 'fernanda.souza@gmail.com',   role: 'patient',      status: 'inactive', lastLogin: '2025-05-20T11:00:00', createdAt: '2024-04-12' },
  { id: '6', name: 'Thiago Mendes',          email: 'thiago.mendes@gmail.com',    role: 'patient',      status: 'active',   lastLogin: null,                  createdAt: '2025-06-01' },
  { id: '7', name: 'Patrícia Nunes',         email: 'patricia.nunes@clinica.com', role: 'doctor',       status: 'inactive', lastLogin: '2025-04-10T10:30:00', createdAt: '2024-01-20' },
  { id: '8', name: 'Lucas Ferreira',         email: 'lucas.ferreira@gmail.com',   role: 'patient',      status: 'active',   lastLogin: '2025-06-13T18:20:00', createdAt: '2024-08-15' },
  { id: '9', name: 'Juliana Pires',          email: 'juliana.pires@clinica.com',  role: 'doctor',       status: 'active',   lastLogin: '2025-06-15T07:50:00', createdAt: '2024-05-05' },
  { id: '10', name: 'Diego Carvalho',        email: 'diego.carvalho@gmail.com',   role: 'patient',      status: 'inactive', lastLogin: '2025-03-05T15:00:00', createdAt: '2024-09-22' },
];

const ROLE_CONFIG: Record<UserRole, { label: string; colorClass: string; bgClass: string }> = {
  admin:        { label: 'Admin',        colorClass: 'text-primary-text',  bgClass: 'bg-primary-subtle' },
  doctor:       { label: 'Médico',       colorClass: 'text-success-text',  bgClass: 'bg-success-subtle' },
  patient:      { label: 'Paciente',     colorClass: 'text-text-secondary', bgClass: 'bg-surface-raised' },
};

const STATUS_CONFIG: Record<UserStatus, { label: string; colorClass: string; dotClass: string }> = {
  active:   { label: 'Ativo',   colorClass: 'text-success-text', dotClass: 'bg-success' },
  inactive: { label: 'Inativo', colorClass: 'text-danger-text',  dotClass: 'bg-danger'  },
};

const ROLE_FILTER_OPTIONS = [
  { label: 'Todos os perfis', value: 'all' },
  { label: 'Admin',           value: 'admin' },
  { label: 'Médico',          value: 'doctor' },
  { label: 'Paciente',        value: 'patient' },
];

const STATUS_FILTER_OPTIONS = [
  { label: 'Todos os status', value: 'all' },
  { label: 'Ativo',           value: 'active' },
  { label: 'Inativo',         value: 'inactive' },
];

function formatLastLogin(iso: string | null): string {
  if (!iso) return 'Nunca acessou';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-[11px]' : 'w-9 h-9 text-sm';
  return (
    <div
      className={`${sizeClass} rounded-full bg-primary-subtle text-primary-text font-semibold
        flex items-center justify-center shrink-0 select-none`}
    >
      {getInitials(name)}
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const cfg = ROLE_CONFIG[role];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${cfg.bgClass} ${cfg.colorClass}`}>
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
      {cfg.label}
    </span>
  );
}

function SelectFilter({
  value,
  onChange,
  options,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center border border-border rounded-lg bg-surface h-9 px-3 gap-1.5 focus-within:border-primary-hover transition-colors">
      {icon && <span className="text-text-muted shrink-0">{icon}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full bg-transparent outline-none text-sm text-text-primary cursor-pointer appearance-none pr-5"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface text-text-primary">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 pointer-events-none text-text-muted" />
    </div>
  );
}


export default function UserManagementPage() {
  const [users, setUsers]               = useState<User[]>(MOCK_USERS);
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [search, setSearch]             = useState('');
  const [roleFilter, setRoleFilter]     = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'logout' | 'inactivate' | 'reset' | 'reactivate' | null;
  }>({ open: false, type: null });

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole   = roleFilter   === 'all' || u.role   === roleFilter;
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const allVisibleIds = useMemo(() => filteredUsers.map((u) => u.id), [filteredUsers]);
  const allSelected   = allVisibleIds.length > 0 && allVisibleIds.every((id) => selected.has(id));
  const someSelected  = allVisibleIds.some((id) => selected.has(id)) && !allSelected;

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        allVisibleIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => new Set([...prev, ...allVisibleIds]));
    }
  }, [allSelected, allVisibleIds]);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  const selectedCount = selected.size;
  const selectedUsers = users.filter((u) => selected.has(u.id));
  const hasSelection  = selectedCount > 0;

  const handleLogout = () => {
    toast.success(`${selectedCount} usuário(s) deslogado(s) com sucesso.`);
    selectedUsers.forEach((u) => {
      users.find((usr) => usr.id === u.id)!.lastLogin = null; 
    });
    clearSelection();
  };

  const handleInactivate = () => {
    setUsers((prev) =>
      prev.map((u) => selected.has(u.id) ? { ...u, status: 'inactive' } : u),
    );
    toast.success(`${selectedCount} usuário(s) inativado(s).`);
    clearSelection();
  };

  const handleActivate = () => {
    setUsers((prev) =>
      prev.map((u) => selected.has(u.id) ? { ...u, status: 'active' } : u),
    );
    toast.success(`${selectedCount} usuário(s) ativado(s).`);
    clearSelection();
  }

  const handleResetPassword = () => {
    toast.success(`Link de redefinição enviado para ${selectedCount} usuário(s).`);
    clearSelection();
  };

  const openConfirm = (type: 'logout' | 'inactivate' | 'reset' | 'reactivate') => {
    setConfirmModal({ open: true, type });
  };

  const confirmAction = () => {
    const actions = {
      logout:     handleLogout,
      inactivate: handleInactivate,
      reset:      handleResetPassword,
      reactivate:   handleActivate
    };
    if (confirmModal.type) actions[confirmModal.type]();
  };

  const CONFIRM_CONFIG = {
    logout:     { title: 'Deslogar usuários',      description: 'Você está prestes a encerrar a sessão de', confirmLabel: 'Deslogar',         confirmVariant: 'warning' as const },
    inactivate: { title: 'Inativar usuários',      description: 'Esta ação irá desativar o acesso de',       confirmLabel: 'Inativar',         confirmVariant: 'danger'  as const },
    reset:      { title: 'Resetar senha',          description: 'Um e-mail de redefinição será enviado para', confirmLabel: 'Enviar e-mail',   confirmVariant: 'primary' as const },
    reactivate: { title: 'Reativar usuários',      description: 'Esta ação irá reativar o acesso de',       confirmLabel: 'Reativar',         confirmVariant: 'success' as const },
  };

  const currentConfirm = confirmModal.type ? CONFIRM_CONFIG[confirmModal.type] : null;

  const stats = useMemo(() => ({
    total:    users.length,
    active:   users.filter((u) => u.status === 'active').length,
    inactive: users.filter((u) => u.status === 'inactive').length,
    doctors:  users.filter((u) => u.role === 'doctor').length,
  }), [users]);

  return (
    <>
      <ToastProvider />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-primary-text">Usuários</h1>
            <p className="text-text-secondary mt-1 text-sm">
              Gerencie contas, permissões e acessos da plataforma.
            </p>
          </div>
          <button
            onClick={() => toast.success('Lista atualizada.')}
            className="flex items-center gap-2 px-3.5 h-9 rounded-lg border border-border
              text-sm text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors"
          >
            <RefreshCw size={14} />
            Atualizar
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total de usuários', value: stats.total,    icon: <Users size={15} />,     color: 'text-primary-text' },
            { label: 'Ativos',            value: stats.active,   icon: <UserCheck size={15} />, color: 'text-success-text' },
            { label: 'Inativos',          value: stats.inactive, icon: <UserMinus size={15} />, color: 'text-danger-text'  },
            { label: 'Médicos',           value: stats.doctors,  icon: <Shield size={15} />,    color: 'text-primary-text' },
          ].map((s) => (
            <Card key={s.label} className="p-4 border border-border bg-surface shadow-none rounded-xl">
              <div className={`flex items-center gap-1.5 text-xs text-text-muted mb-1.5`}>
                <span className={s.color}>{s.icon}</span>
                {s.label}
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </Card>
          ))}
        </div>

        <Card className="border border-border bg-surface shadow-none rounded-xl overflow-hidden">

          <div className="px-4 py-3.5 border-b border-border flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-8 pr-3 rounded-lg border border-border bg-surface
                  text-sm text-text-primary placeholder:text-text-muted outline-none
                  focus:border-primary-hover transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <SelectFilter
                value={roleFilter}
                onChange={setRoleFilter}
                options={ROLE_FILTER_OPTIONS}
                icon={<Filter size={13} />}
              />
              <SelectFilter
                value={statusFilter}
                onChange={setStatusFilter}
                options={STATUS_FILTER_OPTIONS}
              />
            </div>
          </div>

          <div
            className={`px-4 py-2.5 border-b border-border bg-surface-alt flex items-center gap-2 flex-wrap
              transition-all duration-200 ${hasSelection ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 py-0 border-b-0 overflow-hidden'}`}
          >
            <span className="text-xs font-medium text-text-secondary mr-1">
              {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <Button onClick={() => openConfirm('logout')} 
              className="bg-warning-subtle text-warning hover:bg-warning-subtle hover:text-warning-text border-warning-soft-hover" >
                <LogOut size={14} />
                Deslogar
              </Button>
              <Button onClick={() => {
                const type = selectedUsers.every((u) => u.status === 'active') ? 'inactivate' : 'reactivate';
                openConfirm(type);
              }} 
              className={selectedUsers.every((u) => u.status === 'active') ?
               'bg-danger-subtle text-danger hover:bg-danger-subtle hover:text-danger-text border-danger-soft-hover' :
                'bg-success-subtle text-success hover:bg-success-subtle hover:text-success-text border-success-soft-hover'} >
                <ShieldOff size={14} />
                {selectedUsers.every((u) => u.status === 'active') ? 'Inativar' : 'Reativar'}
              </Button>
              <Button onClick={() => openConfirm('reset')} 
              className="bg-primary-subtle text-primary hover:bg-primary-subtle hover:text-primary-text border-primary/20" >
                <KeyRound size={14} />
                Resetar senha
              </Button>
            </div>
            <button
              onClick={clearSelection}
              className="ml-auto text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              Limpar seleção
            </button>
          </div>

          <div className="grid grid-cols-[2.5rem_1fr_1fr_auto_auto_2.5rem] gap-3 px-4 py-2.5
            border-b border-border bg-surface-alt text-xs font-medium text-text-muted uppercase tracking-wide">
            <div className="flex items-center">
              <button
                onClick={toggleAll}
                className="text-text-muted hover:text-primary-text transition-colors"
                aria-label={allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
              >
                {allSelected
                  ? <CheckSquare size={16} className="text-primary" />
                  : someSelected
                    ? <MoreHorizontal size={16} className="text-primary" />
                    : <Square size={16} />}
              </button>
            </div>
            <span>Usuário</span>
            <span className="hidden sm:block">E-mail</span>
            <span>Perfil</span>
            <span>Status</span>
            <span />
          </div>

          {filteredUsers.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={32} className="mx-auto text-text-muted opacity-30 mb-3" />
              <p className="text-sm font-medium text-text-secondary">Nenhum usuário encontrado</p>
              <p className="text-xs text-text-muted mt-1">Tente ajustar os filtros.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredUsers.map((user) => {
                const isSelected = selected.has(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleSelect(user.id)}
                    className={`grid grid-cols-[2.5rem_1fr_1fr_auto_auto_2.5rem] gap-3 px-4 py-3
                      items-center cursor-pointer transition-colors group
                      ${isSelected ? 'bg-primary-subtle/60' : 'hover:bg-surface-alt'}`}
                  >
                    <div className="flex items-center">
                      <span className={`transition-colors ${isSelected ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'}`}>
                        {isSelected
                          ? <CheckSquare size={16} />
                          : <Square size={16} />}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar name={user.name} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
                        <p className="text-xs text-text-muted truncate hidden sm:block">
                          Último acesso: {formatLastLogin(user.lastLogin)}
                        </p>
                      </div>
                    </div>

                    <span className="text-sm text-text-secondary truncate hidden sm:block">
                      {user.email}
                    </span>

                    <RoleBadge role={user.role} />

                    <StatusBadge status={user.status} />

                    <div className="flex items-center justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(new Set([user.id]));
                          openConfirm(user.status === 'active' ? 'inactivate' : 'reactivate');
                        }}
                        className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger-subtle
                          transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label={user.status === 'active' ? 'Inativar usuário' : 'Reativar usuário'}
                      >
                        <UserX size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="px-4 py-3 border-t border-border bg-surface-alt flex items-center justify-between">
            <span className="text-xs text-text-muted">
              {filteredUsers.length} de {users.length} usuários
            </span>
            {hasSelection && (
              <span className="text-xs font-medium text-primary">
                {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </Card>

      </div>

      {currentConfirm && (
        <>
        <Modal key={"blur"} isOpen={confirmModal.open} onOpenChange={(open) => setConfirmModal((prev) => ({ ...prev, open }))}>
          <Modal.Backdrop variant={"blur"}>
            <Modal.Container>
              <Modal.Dialog className="sm:max-w-90">
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Icon className="bg-default text-foreground">
                    <Rocket className="size-5" />
                  </Modal.Icon>
                  <Modal.Heading>
                    {currentConfirm.title}
                  </Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  {currentConfirm.description} <span className="font-semibold">{selectedCount} {selectedCount === 1 ? 'usuário' : 'usuários'}</span>.
                </Modal.Body>
                <Modal.Footer>
                  <Button className="w-full bg-danger" slot="close">
                    Cancelar
                  </Button>
                  <Button className="w-full bg-primary" slot="close" onClick={confirmAction}>
                    Continue
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
        </>
      )}
    </>
  );
}
