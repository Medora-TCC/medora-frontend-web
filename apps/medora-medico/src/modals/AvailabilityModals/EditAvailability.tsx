import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@heroui/react';
import type { DayDataAvailabilityDto } from '../../api/dtos/DayDataAvailabilityDto';

interface EditAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayData: DayDataAvailabilityDto | null;
  editType: 'single' | 'series';
}

export function EditAvailabilityModal({ isOpen, onClose, dayData, editType }: EditAvailabilityModalProps) {
  const [activeSlots, setActiveSlots] = useState<string[]>([]);
  const [allSlots, setAllSlots] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && dayData) {

      const slots: string[] = [];
      const dur = 15;
      const [startHour, startMin] = dayData.start.split(':').map(Number);
      const [endHour, endMin] = dayData.end.split(':').map(Number);
      console.log(dayData);
      let currentMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      while (currentMinutes + dur <= endMinutes) {
        const h = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
        const m = (currentMinutes % 60).toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
        currentMinutes += dur;
      }
      
      setAllSlots(slots);
      setActiveSlots(slots);
    }
  }, [isOpen, dayData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !dayData) return null;

  const toggleSlot = (slot: string) => {
    setActiveSlots((prev) => 
      prev.includes(slot) 
        ? prev.filter((s) => s !== slot) 
        : [...prev, slot]
    );
  };

  const handleSave = () => {
    console.log("Saving slots...", {
      type: editType,
      date: dayData.date,
      activeSlots,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
        
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-primary">
              Editar Horários {editType === 'series' && "(Série Múltipla)"}
            </h2>
            <p className="text-sm text-default-500">
              {new Date(dayData.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-default-400 hover:text-danger hover:bg-danger-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
           <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-default-600">
                Selecione ou remova os horários disponíveis para {editType === 'single' ? "este dia" : "esta série"}.
              </span>
              <span className="text-xs font-semibold text-(--primary) bg-primary/10 px-2 py-1 rounded">
                 {activeSlots.length} / {allSlots.length} ativos
              </span>
           </div>

           <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {allSlots.map((slot) => {
                const isActive = activeSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    onClick={() => toggleSlot(slot)}
                    className={`flex items-center justify-center py-2 px-3 rounded-lg border transition-all duration-200 font-medium ${
                      isActive 
                        ? 'bg-(--primary) border-(--primary) text-white shadow-sm' 
                        : 'bg-default-50 border-default-200 text-default-400 line-through decoration-1 hover:border-primary/50'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onPress={onClose}
          >
            Cancelar
          </Button>
          <Button 
            className="bg-(--primary) text-white"
            onPress={handleSave}
          >
            <Save size={18} />
            Salvar Alterações
          </Button>
        </div>

      </div>
    </div>
  );
}