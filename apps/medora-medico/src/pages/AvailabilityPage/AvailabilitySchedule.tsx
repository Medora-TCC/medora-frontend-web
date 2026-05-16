import { useState, useMemo, useEffect } from 'react';
import { Settings,
   FileText, ChevronLeft, ChevronRight, Video, User, Clock, Trash2, Pencil, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, Button } from '@heroui/react';
import { EditAvailabilityModal } from '../../modals/AvailabilityModals/EditAvailability';
import { Teste } from '@medora_web/shared';
import { type DailyAvailabilitySlotDTO } from "@medora_web/shared";
import  AvailabilityService  from '../../api/services/Availability';


export function AvailabilityHistorical() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2026-05-12T12:00:00Z'));
  const [slots, setSlots] = useState<DailyAvailabilitySlotDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const timelineDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = -2; i <= 2; i++) {
      const d = new Date(selectedDate);
      d.setDate(selectedDate.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  useEffect(() => {
    let active = true;
    const fetchAgenda = async () => {
      setIsLoading(true);
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const res = await AvailabilityService.GetAllAvailabilityByRangeDateAndDoctorId('doctorId', dateStr, dateStr, 'token');
        if (active) {
            setSlots(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) {
            setIsLoading(false);
        }
      }
    };
    fetchAgenda();
    return () => { active = false; };
  }, [selectedDate]);

  const handleConfirm = async (AvailabilityId: string) => {
      try {
          const token = localStorage.getItem('medora_token') || '';
          const res = await AvailabilityService.ApproveAvailabilityById(AvailabilityId, token);
          setSlots(prev => prev.map(s => s.id === AvailabilityId ? { ...s, status: res.status as DailyAvailabilitySlotDTO['status'] } : s));
      } catch (err) {
          console.error(err);
      }
  };

  const handleCancel = async (AvailabilityId: string) => {
      try {
          const token = localStorage.getItem('medora_token') || '';
          const res = await AvailabilityService.DeleteAvailabilityById(AvailabilityId, token);
          setSlots(prev => prev.map(s => s.id === AvailabilityId ? { ...s, status: res.status as DailyAvailabilitySlotDTO['status'] } : s));
      } catch (err) {
          console.error(err);
      }
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const formatDateLabel = (d: Date) => {
    const today = new Date('2026-05-12T12:00:00Z');
    if (d.toDateString() === today.toDateString()) return 'Hoje';
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return 'Amanhã';
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
    
    return d.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' }).replace('.', '');
  };

  return (
    
    <>
    <Teste />
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-(--primary) text-primary">Minha Agenda</h1>
          <p className="text-default-500 mt-2">
            Acompanhe seus horários, consultas marcadas e disponibilidade.
          </p>
        </div>
        
        <Button 
          className="flex items-center gap-2 font-medium bg-secondary/10 text-secondary"
          onClick={() => {
              console.log('Navegar para modelo semanal');
          }}
        >
          <Settings size={18} />
          Configurar Disponibilidade
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-default-200 p-4">
        <div className="flex items-center justify-between mb-2 px-2">
          <h2 className="text-lg font-semibold text-slate-800 capitalize">
             {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
          </h2>
          <div className="flex gap-2">
            <Button isIconOnly variant="ghost" className="text-default-600" onClick={handlePrevDay}><ChevronLeft size={20} /></Button>
            <Button isIconOnly variant="ghost" className="text-default-600" onClick={handleNextDay}><ChevronRight size={20} /></Button>
          </div>
        </div>

        <div className="flex justify-center items-center gap-2 md:gap-4 overflow-x-auto pb-4 pt-2">
          {timelineDays.map((date, idx) => {
            const isCenter = idx === 2; 
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center justify-center rounded-xl p-3 min-w-20 transition-all duration-200 ${
                  isCenter 
                    ? 'bg-(--primary) text-white shadow-md scale-110' 
                    : 'bg-default-50 text-default-600 hover:bg-default-100'
                }`}
              >
                <span className={`text-xs font-semibold uppercase ${isCenter ? 'text-white/80' : 'text-default-500'}`}>
                  {formatDateLabel(date)}
                </span>
                <span className={`text-2xl font-bold mt-1 ${isCenter ? 'text-white' : 'text-slate-700'}`}>
                  {date.getUTCDate().toString().padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="text-(--primary)" size={20} />
                Horários do dia
            </h3>
            <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-default-500"><div className="w-3 h-3 rounded-full bg-default-100 border border-default-200"></div> Disponível</div>
                <div className="flex items-center gap-1.5 text-default-500"><div className="w-3 h-3 rounded-full bg-(--primary)"></div> Presencial</div>
                <div className="flex items-center gap-1.5 text-default-500"><div className="w-3 h-3 rounded-full bg-warning"></div> Telemedicina</div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {slots.map((slot, index) => {
            const isBooked = slot.status !== 'available';
            const todayStr = '2026-05-12';
            const selectedStr = selectedDate.toISOString().split('T')[0];
            const isPast = selectedStr < todayStr;
            const pastStatus = isPast && isBooked ? slot.status : slot.status;
            
            return (
              <Card 
                key={slot.id} 
                className={`border shadow-sm transition-all ${
                    isPast ? 'bg-default-100 border-default-200 opacity-80 pt-2' : 
                    isBooked ? 'border-default-200 bg-content1 hover:shadow-md' : 'border-dashed border-default-200 bg-default-50 hover:shadow-md'
                }`}
              >
                <Card.Header className="flex justify-between items-start pb-0">
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center gap-2">
                        <span className={`text-xl font-bold ${isPast ? 'text-default-500' : 'text-foreground'}`}>{slot.time}</span>
                        {isBooked && (
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full text-white ${
                                isPast ? 'bg-default-400' :
                                slot.type === 'presential' ? 'bg-primary' : 'bg-warning'
                            }`}>
                            {slot.type === 'presential' ? 'Presencial' : 'Vídeo'}
                            </span>
                        )}
                        {!isBooked && !isPast && (
                            <div className="flex gap-1 ml-auto">
                                <Button isIconOnly variant="ghost" size="sm" className="text-default-500">
                                    <Pencil size={14} />
                                </Button>
                                <Button isIconOnly variant="ghost" size="sm" className="text-danger">
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        )}
                    </div>
                  </div>
                </Card.Header>

                <div className="px-4 py-2">
                  {isBooked ? (
                      <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center opacity-80 ${
                              isPast ? 'bg-default-200 text-default-500' :
                              slot.type === 'presential' ? 'bg-primary/20 text-primary' : 'bg-warning-soft-hover text-warning'
                          }`}>
                              {slot.type === 'presential' ? <User size={20} /> : <Video size={20} />}
                          </div>
                          <div>
                              <p className={`text-sm font-semibold ${isPast ? 'text-default-500' : 'text-foreground'}`}>{slot.patientName}</p>
                              {!isPast && (
                                <p className="text-xs text-default-500 flex items-center gap-1 mt-0.5 cursor-pointer hover:text-primary transition-colors">
                                    <FileText size={12} /> Ver prontuário
                                </p>
                              )}
                          </div>
                      </div>
                  ) : (
                      <div className="flex items-center justify-between">
                          <span className={`text-sm text-default-400`}>
                              {isPast ? 'Nenhum agendamento realizado.' : 'Livre para agendamentos.'}
                          </span>
                      </div>
                  )}
                </div>

                {isBooked && !isPast && slot.status === 'scheduled' && (
                    <Card.Footer className="flex justify-end gap-2 pt-0 border-t-0">
                        <Button size="sm" variant="ghost" onPress={() => handleCancel(slot.id)} className="font-medium bg-danger/10 text-danger hover:bg-danger-soft-hover">Recusar</Button>
                        <Button size="sm"  onPress={() => handleConfirm(slot.id)} className="font-medium bg-primary text-white hover:bg-primary/90">Confirmar</Button>
                    </Card.Footer>
                )}
                
                {isBooked && !isPast && slot.status === 'confirmed' && (
                    <Card.Footer className="flex justify-end gap-2 pt-0 border-t-0">
                        <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 flex items-center rounded-md gap-1">
                            <CheckCircle2 size={12} /> Confirmada
                        </span>
                    </Card.Footer>
                )}

                {isBooked && !isPast && slot.status === 'canceled' && (
                    <Card.Footer className="flex justify-end gap-2 pt-0 border-t-0">
                        <span className="text-xs font-medium text-danger bg-danger/10 px-2 py-1 flex items-center rounded-md gap-1">
                            Recusada
                        </span>
                    </Card.Footer>
                )}
                
                {isPast && isBooked && (
                  <Card.Footer className="flex justify-end gap-2 pt-0 border-t-0">
                      {pastStatus === 'completed' ? (
                          <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-md flex items-center gap-1">
                              <CheckCircle2 size={12} /> Realizada
                          </span>
                      ) : (
                          <span className="text-xs font-medium text-danger bg-danger/10 px-2 py-1 rounded-md flex items-center gap-1">
                              Cancelada
                          </span>
                      )}
                  </Card.Footer>
                )}
              </Card>
            );
          })}
        </div>
        
        {slots.length === 0 && (
            <div className="text-center py-12 bg-content1 rounded-xl border border-default-200">
                {isLoading ? (
                    <Loader2 className="mx-auto text-primary mb-3 animate-spin" size={40} />
                ) : (
                    <Clock className="mx-auto text-default-300 mb-3" size={40} />
                )}
                <p className="text-lg font-medium text-foreground">{isLoading ? 'Carregando agenda...' : 'Agenda livre'}</p>
                <p className="text-default-500 text-sm mt-1">{isLoading ? 'Buscando os pacientes e horários' : 'Nenhum horário configurado para este dia.'}</p>
            </div>
        )}
      </div>

      <EditAvailabilityModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        dayData={null}
        editType="single"
      />
    </div>
    </>
  );
}