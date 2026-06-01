import { useEffect, useState } from "react";
import { Button, Input, toast, ToastProvider } from "@heroui/react";
import { UserCircle, Pencil, ShieldCheck } from "lucide-react";
import ProfileService from "../../api/services/Profile";
import { type ProfessionalProfileDTO } from "../../api/dtos/ProfessionalProfileDTO";

export default function ProfessionalProfilePage() {
  const [profile, setProfile] = useState<ProfessionalProfileDTO | null>(null);
  const [form, setForm] = useState<ProfessionalProfileDTO | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ProfileService.GetProfessionalProfile("", "")
      .then((data) => {
        setProfile(data);
        setForm(data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (field: keyof ProfessionalProfileDTO, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleCancel = () => {
    // descarta o que foi digitado: volta o `form` pro que está salvo em `profile`
    setForm(profile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!form) return;
    try {
      const updated = await ProfileService.UpdateProfessionalProfile(form, "");
      setProfile(updated);
      setForm(updated);
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
      // ana (regra que você definiu): se CRM/RQE/UF mudaram, o cadastro deve ser
      // RE-VERIFICADO. isso é decisão do backend (não temos ainda) — quem dispara
      // a verificação é a API ao receber o PUT, não esta tela. fica anotado.
    } catch {
      // mantém em modo edição de propósito: não joga fora o que o usuário digitou
      toast.warning("Não foi possível salvar. Tente novamente.");
    }
  };

  if (isLoading || !profile || !form) {
    return <div className="p-6 text-text-muted">Carregando perfil...</div>;
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <main className="p-6 space-y-6 max-w-3xl mx-auto w-full">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-surface-alt rounded-full flex items-center justify-center border border-divider">
              <UserCircle className="text-text-muted" size={40} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{profile.name}</h1>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
                <ShieldCheck size={14} /> Verificado
              </span>
            </div>
          </div>

          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="ghost" onPress={handleCancel}>Cancelar</Button>
              <Button className="bg-primary-color text-white font-bold" onPress={handleSave}>Salvar</Button>
            </div>
          ) : (
            <Button className="bg-primary-color text-white font-bold" onPress={() => setIsEditing(true)}>
              <Pencil size={16} /> Editar
            </Button>
          )}
        </header>

        {/* Dados pessoais: viram Input no modo edição */}
        <section className="bg-surface-alt rounded-xl border border-divider p-6 space-y-4">
          <h2 className="font-bold text-lg">Dados pessoais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome" value={form.name} isEditing={isEditing} onChange={(v) => handleChange("name", v)} />
            <Field label="E-mail" value={form.email} isEditing={isEditing} onChange={(v) => handleChange("email", v)} />
            <Field label="Telefone" value={form.phone} isEditing={isEditing} onChange={(v) => handleChange("phone", v)} />
            <Field label="Especialidade" value={form.specialty} isEditing={isEditing} onChange={(v) => handleChange("specialty", v)} />
          </div>
        </section>

        {/* Credenciais: CRM/RQE/UF são editáveis (médico pode mudar de estado,
            adicionar especialidade). CPF fica read-only — documento imutável. */}
        <section className="bg-surface-alt rounded-xl border border-divider p-6 space-y-4">
          <h2 className="font-bold text-lg">Credenciais profissionais</h2>
          {isEditing && (
            <p className="text-xs text-orange-600">
              Alterar CRM, RQE ou UF exige uma nova verificação do seu cadastro.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="CRM" value={form.crm} isEditing={isEditing} onChange={(v) => handleChange("crm", v)} />
            <Field label="RQE" value={form.rqe} isEditing={isEditing} onChange={(v) => handleChange("rqe", v)} />
            <Field label="UF" value={form.state} isEditing={isEditing} onChange={(v) => handleChange("state", v)} />
            <ReadOnlyField label="CPF" value={profile.cpf} />
          </div>
        </section>

        <ToastProvider />
      </main>
    </div>
  );
}

function Field({ label, value, isEditing, onChange }: Readonly<{
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
}>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-text-muted font-bold uppercase">{label}</label>
      {isEditing ? (
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <p className="text-text-primary">{value}</p>
      )}
    </div>
  );
}

function ReadOnlyField({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-text-muted font-bold uppercase">{label}</label>
      <p className="text-text-primary">{value}</p>
    </div>
  );
}
