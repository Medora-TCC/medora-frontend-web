import { useState } from 'react';
import { Card, toast, ToastProvider } from '@heroui/react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { Button, Input } from '@medora_web/shared';

export default function AvailabilityPage() {
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [duration, setDuration] = useState('15');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [generatedSlots, setGeneratedSlots] = useState<string[]>([]);

  const handleGenerateSlots = () => {
    const slots: string[] = [];
    const dur = parseInt(duration, 10);
    
    if (!startTime || !endTime || isNaN(dur) || dur <= 0) 
        return;

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
            className="w-full md:w-auto flex items-center justify-center gap-2"
          >
            <Clock size={20} />
            Gerar Horários
          </Button>
        </div>
      </Card>
        <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Horários Disponíveis</h2>
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
              Cadastrar Horários
            </Button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
