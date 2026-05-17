import { useState, useCallback, useEffect } from 'react';
import { Card, toast, ToastProvider, Button, ToggleButton } from '@heroui/react';
import { Clock, CheckCircle2, Pencil, Trash2, MousePointer2, Circle } from 'lucide-react';
import { Input } from '@medora_web/shared';
import { EditAvailabilityModal } from '../../modals/AvailabilityModals/EditAvailability';
import AvailabilityService from '../../api/services/Availability';

export type SlotStatus = 'inactive' | 'presential' | 'telemedicine' | 'hybrid';

export interface Slot {
  time: string;
  status: SlotStatus;
  hasConflict?: boolean;
}

export default function AvailabilityPage() {
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [duration, setDuration] = useState('15');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generatedSlots, setGeneratedSlots] = useState<Slot[]>([]);
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([]);
  const [repeatWeeks, setRepeatWeeks] = useState<number>(2);
  
  const [brushMode, setBrushMode] = useState<SlotStatus>('presential');
  const [isMouseDown, setIsMouseDown] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDayData, setEditingDayData] = useState<any>(null);
  
  const [isSelectedFirstButton, setisSelectedFirstButton] = useState(false);

  const WEEK_DAYS = [
    { label: 'D', value: 0 },
    { label: 'S', value: 1 },
    { label: 'T', value: 2 },
    { label: 'Q', value: 3 },
    { label: 'Q', value: 4 },
    { label: 'S', value: 5 },
    { label: 'S', value: 6 }
  ];

  const [loading, setLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [visibleHistory, setVisibleHistory] = useState<any[]>([]);

  const doctorId = '1';
  const token = 'seu-token-de-auth';


  const fetchAvailabilityHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await AvailabilityService.GetAllAvailabilityByRangeDateAndDoctorId(doctorId, startDate, endDate, token);
      
      if (Array.isArray(response)) {
        const agrupadoPorDia: Record<string, any> = {};

        response.forEach((slot: any) => {
           if (!slot.startDateTime) return;
           const dateKey = slot.startDateTime.split('T')[0];
           
           if (!agrupadoPorDia[dateKey]) {
              agrupadoPorDia[dateKey] = {
                  id: slot.id,
                  date: dateKey,
                  start: slot.time,
                  end: slot.time,
                  duration: 15,
                  slots: 0,
                  isSeries: false,
              };
           }

           agrupadoPorDia[dateKey].slots += 1;
           if (slot.time < agrupadoPorDia[dateKey].start) {
               agrupadoPorDia[dateKey].start = slot.time;
           }
           
           const timeEnd = slot.endDateTime ? new Date(slot.endDateTime).toISOString().split('T')[1].substring(0, 5) : slot.time;
           if (timeEnd > agrupadoPorDia[dateKey].end) {
               agrupadoPorDia[dateKey].end = timeEnd;
           }
        });

        const dadosFormatados = Object.values(agrupadoPorDia).sort((a: any, b: any) => a.date.localeCompare(b.date));
        setVisibleHistory(dadosFormatados);
      } else {
        setVisibleHistory([]);
      }
    } catch (error) {
      toast.danger('Erro ao carregar os horários cadastrados.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchAvailabilityHistory();
  }, []);

  const handleGenerateSlots = () => {
    const slots: Slot[] = [];
    const dur = parseInt(duration, 10);
    
    if (!startTime || !endTime || isNaN(dur) || dur <= 0) {
        toast.warning('Preencha os horários e a duração corretamente.');
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
      slots.push({ time: `${h}:${m}`, status: 'presential' });
      currentMinutes += dur;
    }

    setGeneratedSlots(slots);
  };

  const handleSlotPaint = useCallback((index: number) => {
    setGeneratedSlots(prevSlots => {
      const newSlots = [...prevSlots];
      newSlots[index] = { ...newSlots[index], status: brushMode };
      return newSlots;
    });
  }, [brushMode]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const payload = {
        doctorId,
        repeatWeeks,
        weekDays: selectedWeekDays,
        startTime,
        endTime,
        duration: parseInt(duration, 10),
        slots: generatedSlots.filter(s => s.status !== 'inactive')
      };

      await AvailabilityService.CreateDailyAvailability(payload, token);
      
      toast.success('Horários cadastrados com sucesso!');
      setGeneratedSlots([]);
      fetchAvailabilityHistory();
    } catch (error) {
      toast.danger('Erro ao cadastrar horários.');
    } finally {
      setLoading(false);
    }
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
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-default-700">Repetir as configurações por quantas semanas?</label>
            <div className="flex gap-2">
              {[2, 4, 6, 8].map((weeks) => (
                <button
                  key={weeks}
                  onClick={() => setRepeatWeeks(weeks)}
                  className={`px-4 py-2 text-sm rounded-md transition-all font-medium border-2
                    ${repeatWeeks === weeks 
                      ? 'bg-(--primary) border-(--primary) text-white shadow-sm' 
                      : 'bg-transparent border-default-200 text-default-600 hover:border-primary/50'}`}
                >
                  {weeks} semanas
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
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
            className="w-full md:w-auto flex items-center justify-center gap-2 mt-4 hover:scale-[1.02] transition-all"
          >
            <Clock size={20} />
            Gerar Template de Horários
          </Button>
        </div>
      </Card>
        <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Dia Modelo (Horários Base)</h2>
              <span className="text-sm text-default-500">
                Selecione a disponibilidade dos horários
              </span>
            </div>
      {generatedSlots.length > 0 && (
        <div className="space-y-6">
          <div className="h-px bg-default-200 w-full" />
          
          <div className="flex gap-4 items-center p-3 bg-default-50 rounded-lg border border-default-200">
            <MousePointer2 size={18} className="text-default-500" />
            <span className="text-sm font-medium text-default-700">Modo do Pincel:</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setBrushMode('presential')}
                className={`px-3 py-1.5 text-sm rounded-md transition-all font-medium 
                  ${brushMode === 'presential' ? 'bg-(--primary) text-white shadow-sm' :
                     'bg-white border border-default-200 text-default-600 hover:bg-default-100'}`}
              >
                Presencial
              </button>
              <button 
                onClick={() => setBrushMode('telemedicine')}
                className={`px-3 py-1.5 text-sm rounded-md transition-all font-medium 
                  ${brushMode === 'telemedicine' ? 'bg-warning text-white shadow-sm' 
                    : 'bg-white border border-default-200 text-default-600 hover:bg-default-100'}`}
              >
                Telemedicina
              </button>
              <button 
                onClick={() => setBrushMode('hybrid')}
                className={`px-3 py-1.5 text-sm rounded-md transition-all font-medium 
                  ${brushMode === 'hybrid' ? 'text-white shadow-sm bg-gradient-to-br from-warning from-50% to-[var(--primary)] to-50%' 
                    : 'bg-white border border-default-200 text-default-600 hover:bg-default-100'}`}
              >
                Ambos
              </button>
              <button 
                onClick={() => setBrushMode('inactive')}
                className={`px-3 py-1.5 text-sm rounded-md transition-all font-medium 
                  ${brushMode === 'inactive' ? 'bg-default-200 text-default-700 shadow-sm' 
                    : 'bg-white border border-default-200 text-default-600 hover:bg-default-100'}`}
              >
                Desativar
              </button>
            </div>
          </div>

          <div 
            className="select-none touch-none" 
            onMouseLeave={() => setIsMouseDown(false)}
            onMouseUp={() => setIsMouseDown(false)}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {generatedSlots.map((slot, index) => {
                let slotStyles = 'bg-default-100 border-default-200 text-default-600';
                if (slot.status === 'presential') {
                  slotStyles = 'bg-(--primary) border-(--primary) text-white shadow-md';
                } else if (slot.status === 'telemedicine') {
                  slotStyles = 'bg-warning border-warning text-white shadow-md';
                } else if (slot.status === 'hybrid') {
                  slotStyles = 'bg-gradient-to-br from-warning from-50% to-[var(--primary)] to-50% border-transparent text-white shadow-md';
                } else if (slot.status === 'inactive') {
                  slotStyles = 'bg-transparent border-dashed border-default-300 text-default-400 opacity-60';
                }

                return (
                  <button
                    key={slot.time + index}
                    onMouseDown={() => {
                      setIsMouseDown(true);
                      handleSlotPaint(index);
                    }}
                    onMouseEnter={() => {
                      if (isMouseDown) {
                        handleSlotPaint(index);
                      }
                    }}
                    onMouseUp={() => setIsMouseDown(false)}
                    className={`flex items-center justify-center py-2 px-3 rounded-lg border-2 transition-colors duration-75 font-medium cursor-pointer select-none ${slotStyles}`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <div className="text-right w-full md:w-auto">
              <Button 
                className="w-full md:w-auto bg-(--primary) text-white flex items-center justify-center gap-2 hover:scale-[1.02] hover:opacity-90 transition-all mb-1"
                onClick={handleSave}
                
              >
                <CheckCircle2 size={20} />
                Cadastrar
              </Button>
              <span className="text-xs text-default-500">Isso definirá sua agenda básica.</span>
            </div>
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
          {isLoadingHistory ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 mt-4">
               <p className="text-default-500 font-medium animate-pulse">Carregando próximas agendas...</p>
            </div>
          ) : (
            <>
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
                    isIconOnly
                    variant="ghost"
                    className="text-primary hover:bg-primary/20 hover:scale-105 transition-all"
                    onClick={() => {
                        setEditingDayData(item);
                        setIsEditModalOpen(true);
                    }}
                >
                    <Pencil size={18} />
                </Button>
                <Button 
                    isIconOnly
                    variant="ghost"
                    className="text-danger hover:bg-danger-soft-hover hover:scale-105 transition-all"
                    onClick={async () => {
                        try {
                          await AvailabilityService.DeleteAvailabilityById(item.id, token);
                          toast.success('Agenda excluída com sucesso!');
                          fetchAvailabilityHistory();
                        } catch (error) {
                          toast.danger('Erro ao excluir agenda.');
                        }
                    }}
                >
                    <Trash2 size={18} />
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
        </>
      )}
      </div>

        <div className="mt-6 flex justify-center">
            <Button 
              className="bg-transparent text-(--primary) border border-(--primary) hover:bg-primary-50 w-full md:w-auto"
              onClick={() => console.log('Navegar para Gestão de Agenda')}
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
