import { useState } from 'react';
import { Card, toast, ToastProvider } from '@heroui/react';
import { Clock, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { Button, Input } from '@medora_web/shared';
import { EditAvailabilityModal } from '../../modals/AvailabilityModals/EditAvailability';
import { useNavigate } from 'react-router';

export default function AvailabilityPage() {
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [duration, setDuration] = useState('15');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [generatedSlots, setGeneratedSlots] = useState<string[]>([]);
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([]);
  const navigate = useNavigate();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDayData, setEditingDayData] = useState<any>(null);
  
  const WEEK_DAYS = [
    { label: 'D', value: 0 },
    { label: 'S', value: 1 },
    { label: 'T', value: 2 },
    { label: 'Q', value: 3 },
    { label: 'Q', value: 4 },
    { label: 'S', value: 5 },
    { label: 'S', value: 6 }
  ];

  const mockHistory = [
    { id: 1, date: '2026-05-01', start: '08:00', end: '17:00', duration: 15, slots: 32, isSeries: true },
    { id: 2, date: '2026-05-02', start: '08:00', end: '17:00', duration: 15, slots: 32, isSeries: true },
    { id: 3, date: '2026-05-03', start: '09:00', end: '12:00', duration: 30, slots: 6, isSeries: false },
    { id: 4, date: '2026-05-04', start: '08:00', end: '17:00', duration: 15, slots: 32, isSeries: true },
    { id: 5, date: '2026-05-05', start: '08:00', end: '17:00', duration: 15, slots: 32, isSeries: true },
    { id: 6, date: '2026-05-06', start: '13:00', end: '19:00', duration: 20, slots: 18, isSeries: false },
    { id: 7, date: '2026-05-07', start: '08:00', end: '17:00', duration: 15, slots: 32, isSeries: true },
    { id: 8, date: '2026-05-08', start: '08:00', end: '17:00', duration: 15, slots: 32, isSeries: true },
    { id: 9, date: '2026-05-09', start: '10:00', end: '15:00', duration: 45, slots: 6, isSeries: false },
    { id: 10, date: '2026-05-10', start: '07:00', end: '13:00', duration: 15, slots: 24, isSeries: true },
    { id: 11, date: '2026-05-11', start: '07:00', end: '13:00', duration: 15, slots: 24, isSeries: true },
    { id: 12, date: '2026-05-12', start: '07:00', end: '13:00', duration: 15, slots: 24, isSeries: true },
  ];

  const visibleHistory = mockHistory.filter(item => {
    if (item.date < '2026-05-02') return false; 
    return true;
  }).slice(0, 5);

  const handleGenerateSlots = () => {
    const slots: string[] = [];
    const dur = parseInt(duration, 10);
    
    if (!startDate || !startTime || !endTime || isNaN(dur) || dur <= 0) {
        toast.warning('Preencha pelo menos a data de início e os horários corretamente.');
        return;
    }

    if (startTime >= endTime) {
    toast.warning('O horário inicial deve ser menor que o horário final.');
      return;
    }

    if (dur < 15){
        toast.warning('A duração mínima da consulta é de 15 minutos.');
        return;
    }

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes + dur <= endMinutes) {
      const h = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
      const m = (currentMinutes % 60).toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
      currentMinutes += dur;
    }

    setGeneratedSlots(slots);
    
    setSelectedSlots(slots);
  };

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) => 
      prev.includes(slot) 
        ? prev.filter((s) => s !== slot) 
        : [...prev, slot]
    );
  };

  const handleSave = () => {
    // Send to backEnd
    toast.success('Horários cadastrados com sucesso!');
  };

  return (
    <>
    <ToastProvider/>
    
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-(--primary) text-primary">Configurar Disponibilidade</h1>
        <p className="text-default-500 mt-2">
          Defina seu intervalo de trabalho para gerarmos seus horários de atendimento automaticamente.
        </p>
      </div>

      <Card className="p-4 shadow-sm border border-default-200">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <Input
              id="startDate"
              type="date"
              label="Data de Início"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              id="endDate"
              type="date"
              label="Data de Fim (Opcional)"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-default-700">Repetir nos dias da semana:</label>
              <div className="flex gap-2 flex-wrap">
                {WEEK_DAYS.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => {
                      setSelectedWeekDays(prev => 
                        prev.includes(day.value) 
                          ? prev.filter(d => d !== day.value) 
                          : [...prev, day.value]
                      )
                    }}
                    className={`w-10 h-10 rounded-full border-2 transition-all font-medium ${
                      selectedWeekDays.includes(day.value) 
                        ? 'bg-(--primary) border-(--primary) text-white' 
                        : 'bg-transparent border-default-200 text-default-600 hover:border-primary/50'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <Input
              id="start-time"
              type="time"
              label="Horário Inicial"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Input
              id="end-time"
              type="time"
              label="Horário Final"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
            <Input
              id="duration"
              type="number"
              label="Duração da Consulta (min)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleGenerateSlots}
            className="w-full md:w-auto flex items-center justify-center gap-2 mt-4"
          >
            <Clock size={20} />
            Gerar Template de Horários
          </Button>
        </div>
      </Card>
        <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Dia Modelo (Horários Base)</h2>
              <span className="text-sm text-default-500">
                Selecione os horários que deseja disponibilizar ({selectedSlots.length} de {generatedSlots.length})
              </span>
            </div>
      {generatedSlots.length > 0 && (
        <div className="space-y-6">
          <div className="h-px bg-default-200 w-full" />
          
          <div>
            

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {generatedSlots.map((slot) => {
                const isSelected = selectedSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    onClick={() => toggleSlot(slot)}
                    className={`flex items-center justify-center py-2 px-3 rounded-lg border-2 transition-all duration-200 font-medium ${
                      isSelected 
                        ? 'bg-(--primary) border-(--primary) text-white shadow-md' 
                        : 'bg-default-100 border-default-200 text-default-600 hover:border-primary/50'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              className="w-full md:w-auto bg-(--primary) text-white flex items-center justify-center gap-2"
              onClick={handleSave}
            >
              <CheckCircle2 size={20} />
              Replicar na Agenda e Cadastrar
            </Button>
          </div>
        </div>
      )}

      <div className="mt-12 space-y-4">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
              <h2 className="text-xl font-semibold text-primary">Próximos 5 dias configurados</h2>
              <p className="text-sm text-default-500">
                  Resumo das suas próximas agendas cadastradas.
              </p>
          </div>
        </div>
        
        <div className="max-h-112.5 overflow-y-auto pr-2 custom-scrollbar space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleHistory.map((item) => (
              <Card key={item.id} className="p-4 border border-default-200 shadow-sm flex flex-col gap-3 group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-(--primary) opacity-50" />
              
              <div className="flex justify-between items-start pl-2">
                <div>
                    <span className="font-semibold text-lg flex items-center gap-2">
                        {new Date(item.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                        {item.isSeries && (
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full" title="Gerado em série">
                                Série
                            </span>
                        )}
                    </span>
                    <div className="text-sm text-default-600 flex items-center gap-1 mt-1">
                        <Clock size={14} /> 
                        {item.start} às {item.end}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="px-2 py-1 bg-primary/10 text-(--primary) text-xs font-bold rounded">
                    {item.duration} min
                    </span>
                    <span className="text-xs text-default-400 mt-1">
                        {item.slots} vagas
                    </span>
                </div>
              </div>

              <div className="flex justify-end items-center gap-2 pt-2 border-t border-default-100 pl-2">
                <Button 
                    className="p-2 min-w-0 h-auto bg-transparent text-primary hover:bg-primary-50 rounded"
                    onClick={() => {
                        setEditingDayData(item);
                        setIsEditModalOpen(true);
                    }}
                >
                    <Pencil size={16} />
                </Button>
                <Button className="p-2 min-w-0 h-auto bg-transparent text-danger hover:bg-danger-50 rounded">
                    <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {visibleHistory.length === 0 && (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 mt-4">
             <p className="text-default-500 font-medium">Nenhuma agenda encontrada.</p>
             <p className="text-sm text-default-400 mt-1">Configure novos horários acima.</p>
          </div>
        )}
        
        </div>

        <div className="mt-6 flex justify-center">
            <Button 
              className="bg-transparent text-(--primary) border border-(--primary) hover:bg-primary-50 w-full md:w-auto"
                onClick={() => navigate('/agenda/historico')}   
            >
              Ver agenda completa e editar horários &rarr;
            </Button>
        </div>
      </div>
      
      <EditAvailabilityModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        dayData={editingDayData}
        editType="single"
      />
      
    </div>
    </>
  );
}
