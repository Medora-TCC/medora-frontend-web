import { Button } from "@heroui/react";
import { 
  ArrowLeft, 
  Cpu, 
  Search, 
  Filter, 
  CheckCircle2, 
  Activity, 
  XCircle,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router";

const allLogs = [
  { id: 'WRK-9042', task: 'Verificação do médico 873642314', status: 'Sucesso', date: 'Hoje, 21:15', duration: '1.2s' },
  { id: 'WRK-9041', task: 'Verificação de médico 234591232', status: 'Sucesso', date: 'Hoje, 21:02', duration: '0.8s' },
  { id: 'WRK-9040', task: 'Timeout na requisição externa', status: 'Aviso', date: 'Hoje, 20:15', duration: '15.0s' },
  { id: 'WRK-9039', task: 'Verificação de médico 123456789', status: 'Sucesso', date: 'Hoje, 19:30', duration: '4.5s' },
  { id: 'WRK-9038', task: 'Retorno errado na API', status: 'Falha', date: 'Hoje, 18:45', duration: '30.1s' },
  { id: 'WRK-9037', task: 'Limpeza de arquivos temporários', status: 'Sucesso', date: 'Hoje, 12:00', duration: '0.3s' },
  { id: 'WRK-9036', task: 'Geração de relatório diário automático', status: 'Sucesso', date: 'Hoje, 02:00', duration: '12.4s' },
  { id: 'WRK-9035', task: 'Verificação de médico 988273611', status: 'Aviso', date: 'Ontem, 23:10', duration: '8.2s' },
];

export default function WorkerLogs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <main className="py-4 px-6 space-y-5 max-w-7xl mx-auto w-full">
        
        {/* Header e Voltar */}
        <header className="flex flex-col gap-4">
          <Button
            size="sm"
            variant="ghost"
            onPress={() => navigate(-1)} // Volta para a tela anterior
            className="w-fit flex items-center gap-2 text-text-muted hover:text-text-primary px-0 hover:bg-transparent"
          >
            <ArrowLeft size={16} />
            Voltar para o Dashboard
          </Button>

          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Cpu className="text-purple-500" />
              Logs de Processamento do Worker
            </h1>
            <p className="text-sm text-text-muted mt-1">Histórico completo de tarefas executadas em segundo plano.</p>
          </div>
        </header>

        {/* Toolbar (Pesquisa e Filtros) */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-surface-alt p-3 rounded-xl border border-divider shadow-sm">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-text-muted" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome da tarefa ou ID..."
              className="block w-full pl-10 pr-3 py-2 border border-divider rounded-lg leading-5 bg-surface placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary-color focus:border-primary-color sm:text-sm"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none flex items-center gap-2 h-10 border-divider">
              <Filter size={16} />
              Filtrar Status
            </Button>
          </div>
        </div>

        {/* Tabela/Lista de Logs */}
        <div className="bg-surface-alt rounded-xl border border-divider shadow-sm overflow-hidden">
          <div className="divide-y divide-divider">
            {allLogs.map((log) => (
              <LogDetailRow key={log.id} {...log} />
            ))}
          </div>
          
          {/* Paginação Simples */}
          <div className="p-4 border-t border-divider flex items-center justify-between">
            <span className="text-sm text-text-muted">Mostrando <span className="font-bold">1</span> a <span className="font-bold">8</span> de 142 tarefas</span>
            <div className="flex gap-2">
                <Button size="sm" variant="outline" isDisabled className="border-divider">Anterior</Button>
              <Button size="sm" variant="outline" className="border-divider">Próxima</Button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

function LogDetailRow({ id, task, status, date, duration }: any) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-surface/50 transition-colors gap-4">
      
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center justify-center bg-surface border border-divider rounded-lg h-10 w-10 text-center shrink-0 mt-0.5">
          {status === 'Sucesso' && <CheckCircle2 size={20} className="text-green-500" />}
          {status === 'Aviso' && <Activity size={20} className="text-orange-500" />}
          {status === 'Falha' && <XCircle size={20} className="text-red-500" />}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-text-muted bg-surface px-1.5 py-0.5 rounded border border-divider">
              {id}
            </span>
          </div>
          <p className="font-semibold text-base text-text-primary leading-tight">{task}</p>
          <div className="flex items-center gap-4 mt-1.5">
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Clock size={12} />
              {date}
            </span>
            <span className="text-xs font-mono text-text-muted">
              Duração: {duration}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-start sm:justify-end">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          status === 'Sucesso' ? 'bg-green-100 text-green-700' : 
          status === 'Aviso' ? 'bg-orange-100 text-orange-700' : 
          'bg-red-100 text-red-700'
        }`}>
          {status}
        </span>
      </div>

    </div>
  );
}