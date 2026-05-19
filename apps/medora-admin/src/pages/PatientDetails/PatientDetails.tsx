import { 
  Calendar, 
  Clock, 
  FileText, 
  Activity, 
  Heart, 
  AlertTriangle, 
  ArrowLeft, 
  Plus,
  Download
} from "lucide-react";
import { Button } from "@heroui/react";

export default function PatientDetails() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full p-6">
      
      {/* Botão de Voltar e Header */}
      <div className="flex flex-col gap-3">
        <button className="flex items-center gap-2 text-sm text-text-muted hover:text-primary-color font-medium transition-colors w-fit">
          <ArrowLeft size={16} /> Voltar para a listagem
        </button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-blue-500/10 text-blue-600 font-bold text-xl flex items-center justify-center border border-blue-200">
              CA
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-text-primary">Carlos Alberto da Silva</h1>
                <span className="text-xs px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full font-bold uppercase">Ativo</span>
              </div>
              <p className="text-text-muted text-sm">Masculino • 45 anos (15/03/1981) • CPF: 123.456.789-00</p>
            </div>
          </div>
          <Button className="bg-primary-color text-white font-bold h-10 px-4 text-sm shadow-md flex items-center gap-2">
            <Plus size={16} /> Nova Evolução
          </Button>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna da Esquerda: Resumo Clínico e Alergias */}
        <div className="space-y-4 lg:col-span-1">
          {/* Sinais Vitais / Info Rápida */}
          <div className="bg-surface-alt p-5 rounded-xl border border-divider shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-text-muted uppercase tracking-wider">Última Triagem</h3>
            <div className="grid grid-cols-2 gap-3">
              <VitalsCard icon={<Heart className="text-red-500" size={16} />} label="Frec. Cardíaca" value="72 bpm" />
              <VitalsCard icon={<Activity className="text-orange-500" size={16} />} label="P. Arterial" value="12/8" />
            </div>
          </div>

          {/* Alergias e Alertas */}
          <div className="bg-surface-alt p-5 rounded-xl border border-divider shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <AlertTriangle size={18} />
              <h3 className="font-bold text-sm uppercase tracking-wider">Alergias e Restrições</h3>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-xs px-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold rounded-md border border-red-200/50">
                Dipirona Sódica
              </span>
              <span className="text-xs px-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold rounded-md border border-red-200/50">
                AINEs
              </span>
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="bg-surface-alt p-5 rounded-xl border border-divider shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-text-muted uppercase tracking-wider">Dados de Contato</h3>
            <div className="text-xs space-y-2 text-text-primary">
              <p><strong className="text-text-muted">Celular:</strong> (11) 99888-7766</p>
              <p><strong className="text-text-muted">E-mail:</strong> carlos.alberto@email.com</p>
              <p><strong className="text-text-muted">Plano:</strong> Bradesco Saúde - Prata</p>
              <p><strong className="text-text-muted">Titular:</strong> O Próprio</p>
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Histórico de Evoluções (Timeline) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface-alt p-6 rounded-xl border border-divider shadow-sm">
            <h2 className="font-bold text-lg text-text-primary mb-6">Histórico de Atendimento</h2>
            
            {/* Timeline Wrapper */}
            <div className="relative border-l-2 border-divider ml-3 pl-6 space-y-6">
              
              {/* Evento 1 */}
              <div className="relative">
                {/* Indicador Visual Redondo na Linha */}
                <div className="absolute -left-[31px] top-0.5 bg-primary-color text-white h-4 w-4 rounded-full ring-4 ring-surface flex items-center justify-center" />
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-primary-color bg-primary-color/10 px-2 py-0.5 rounded">
                      Consulta de Retorno
                    </span>
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Calendar size={12} /> Hoje às 09:00 • Dr. João
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-text-primary">Evolução Clínica</h4>
                  <p className="text-xs text-text-muted leading-relaxed bg-surface p-3 rounded-lg border border-divider">
                    Paciente relata melhora significativa nos episódios de palpitação após início do uso do beta-bloqueador. Nega efeitos colaterais. Mantida conduta atual e solicitado novo eletrocardiograma para controle em 6 meses.
                  </p>
                </div>
              </div>

              {/* Evento 2 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 bg-slate-400 h-4 w-4 rounded-full ring-4 ring-surface" />
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-text-muted bg-surface border border-divider px-2 py-0.5 rounded">
                      Telemedicina (Primeira Consulta)
                    </span>
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Calendar size={12} /> 12/04/2026 • Dr. João
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-text-primary">Queixa Principal</h4>
                  <p className="text-xs text-text-muted leading-relaxed bg-surface p-3 rounded-lg border border-divider">
                    Paciente refere episódios esporádicos de taquicardia associados a períodos de estresse profissional. Exame físico virtual sem anormalidades evidentes. Prescrito medicamento de controle e solicitados exames laboratoriais.
                  </p>
                  
                  {/* Arquivos anexados a essa evolução */}
                  <div className="flex gap-2 pt-1">
                    <button className="flex items-center gap-1.5 text-[11px] font-medium text-primary-color bg-primary-color/5 hover:bg-primary-color/10 px-2.5 py-1 rounded border border-primary-color/20 transition-colors">
                      <Download size={12} /> Receita_Controlada.pdf
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function VitalsCard({ icon, label, value }: any) {
  return (
    <div className="bg-surface p-3 rounded-lg border border-divider flex items-center gap-3">
      <div className="p-2 bg-surface-alt rounded-md border border-divider">{icon}</div>
      <div>
        <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">{label}</p>
        <p className="text-sm font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
}