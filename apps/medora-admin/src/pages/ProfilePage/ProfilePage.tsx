import { Button, Input } from "@heroui/react";
import { ArrowLeft, Shield, Pencil, Check, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function ProfilePage() {
  const navigate = useNavigate();

  // Estado para controlar se está no modo de edição
  const [isEditing, setIsEditing] = useState(false);

  // Estado com os dados reais do usuário
  const [userData, setUserData] = useState({
    name: "Gerson Rodrigues",
    email: "gerson.rodrigues@medora.com",
    phone: "(11) 98765-4321",
  });

  // Estado temporário para guardar as alterações antes de salvar
  const [tempData, setTempData] = useState(userData);

  const handleEdit = () => {
    setTempData(userData); // Reseta o formulário com os dados atuais
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    setUserData(tempData); // Salva as alterações
    setIsEditing(false);
    // Aqui no futuro você pode colocar a chamada para a sua API:
    // api.put('/user/profile', tempData)
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center w-full">
      <main className="w-full max-w-2xl px-6 py-6 flex flex-col gap-8">
        
        {/* HEADER */}
        <header className="flex flex-col gap-4">
          <Button
            size="sm"
            variant="ghost"
            onPress={() => navigate(-1)}
            className="w-fit flex items-center gap-2 text-text-muted hover:text-text-primary px-0 hover:bg-transparent"
          >
            <ArrowLeft size={16} />
            Voltar para o Dashboard
          </Button>
        </header>

        {/* Informações do Usuário e Botões de Ação */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full border border-divider bg-surface-alt flex items-center justify-center shrink-0">
              <Shield className="text-text-muted" size={28} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-text-primary">{userData.name}</h1>
              <div className="flex items-center gap-1.5 text-blue-500 mt-0.5">
                <Shield size={14} />
                <span className="text-sm font-semibold">Acesso Root</span>
              </div>
            </div>
          </div>

          {/* Troca de botões baseado no estado de edição */}
          {!isEditing ? (
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full px-5" 
              size="sm" 
              onPress={handleEdit}
            >
              <Pencil size={14} className="mr-1" />
              Editar Conta
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onPress={handleCancel}
                className="rounded-full px-4 text-text-muted hover:text-text-primary"
              >
                <X size={14} className="mr-1" />
                Cancelar
              </Button>
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white font-medium rounded-full px-5" 
                size="sm" 
                onPress={handleSave}
              >
                <Check size={14} className="mr-1" />
                Salvar
              </Button>
            </div>
          )}
        </div>

        {/* Card: Informações Pessoais */}
        <div className="bg-surface-alt border border-divider rounded-xl overflow-hidden mt-2">
          <div className="px-6 py-4 border-b border-divider">
            <h2 className="text-base font-bold text-text-primary">Informações Pessoais</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-8">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-text-primary">Nome Completo</span>
              {isEditing ? (
                <Input 
                  value={tempData.name} 
                  onChange={(e) => setTempData({ ...tempData, name: e.target.value })} 
                  size={"sm" as any}
                  className="max-w-[250px]"
                />
              ) : (
                <span className="text-sm text-text-muted mt-1">{userData.name}</span>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-text-primary">E-mail Corporativo</span>
              {isEditing ? (
                <Input 
                  value={tempData.email} 
                  onChange={(e) => setTempData({ ...tempData, email: e.target.value })} 
                  size={"sm" as any}
                  type="email"
                  className="max-w-[250px]"
                />
              ) : (
                <span className="text-sm text-text-muted mt-1">{userData.email}</span>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-text-primary">Telefone de Contato</span>
              {isEditing ? (
                <Input 
                  value={tempData.phone} 
                  onChange={(e) => setTempData({ ...tempData, phone: e.target.value })} 
                  size={"sm" as any}
                  className="max-w-[250px]"
                />
              ) : (
                <span className="text-sm text-text-muted mt-1">{userData.phone}</span>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-text-primary">CPF</span>
              {/* Mantido como texto puro pois CPF não deve ser editável */}
              <span className="text-sm text-text-muted mt-1">***.456.789-**</span>
            </div>
          </div>
        </div>

        {/* Card: Permissões de Acesso */}
        <div className="bg-surface-alt border border-divider rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-divider">
            <h2 className="text-base font-bold text-text-primary">Permissões de Acesso</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-8">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-text-primary">Cargo Administrativo</span>
              <span className="text-sm text-text-muted mt-1">Administrador de Sistemas</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-text-primary">Departamento</span>
              <span className="text-sm text-text-muted mt-1">Tecnologia da Informação</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}