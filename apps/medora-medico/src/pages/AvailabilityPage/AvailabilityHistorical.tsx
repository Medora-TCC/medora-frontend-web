import { useState } from 'react';
import { Card, DateField, DateRangePicker, Label, RangeCalendar, Button as HeroButton } from '@heroui/react';
import { Clock, Pencil, Trash2 } from 'lucide-react';
import { EditAvailabilityModal } from '../../modals/AvailabilityModals/EditAvailability';

export default function AvailabilityHistorical() {
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDayData, setEditingDayData] = useState<any>(null);

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
    if (filterStartDate && item.date < filterStartDate) return false;
    if (filterEndDate && item.date > filterEndDate) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-(--primary) text-primary">Gestão de Agenda</h1>
        <p className="text-default-500 mt-2">
          Visualize, filtre, edite ou exclua todos os seus horários cadastrados.
        </p>
      </div>

      <div className="space-y-4">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-4 bg-white rounded-xl shadow-sm border border-default-200">
          <div>
              <h2 className="text-xl font-semibold text-primary">Toda a Agenda</h2>
              <p className="text-sm text-default-500">
                  {visibleHistory.length} registros encontrados
              </p>
          </div>
          
          <div className="flex flex-col w-full md:w-auto">
            <DateRangePicker 
                className="w-full md:w-80" 
                onChange={(range: any) => {
                    if (range && range.start && range.end) {
                        const start = `${range.start.year}-${String(range.start.month).padStart(2, '0')}-${String(range.start.day).padStart(2, '0')}`;
                        const end = `${range.end.year}-${String(range.end.month).padStart(2, '0')}-${String(range.end.day).padStart(2, '0')}`;
                        setFilterStartDate(start);
                        setFilterEndDate(end);
                    } else {
                        setFilterStartDate('');
                        setFilterEndDate('');
                    }
                }}
            >
              <Label className="text-sm font-medium text-default-700 mb-1">Período de filtro</Label>
              <DateField.Group className="bg-white border-2 border-default-200">
                <DateField.Input slot="start">
                  {(segment: any) => <DateField.Segment segment={segment} />}
                </DateField.Input>
                <DateRangePicker.RangeSeparator />
                <DateField.Input slot="end">
                  {(segment: any) => <DateField.Segment segment={segment} />}
                </DateField.Input>
                <DateField.Suffix>
                  <DateRangePicker.Trigger>
                    <DateRangePicker.TriggerIndicator />
                  </DateRangePicker.Trigger>
                </DateField.Suffix>
              </DateField.Group>
              <DateRangePicker.Popover>
                <RangeCalendar aria-label="Datas da Agenda">
                  <RangeCalendar.Header>
                    <RangeCalendar.YearPickerTrigger>
                      <RangeCalendar.YearPickerTriggerHeading />
                      <RangeCalendar.YearPickerTriggerIndicator />
                    </RangeCalendar.YearPickerTrigger>
                    <RangeCalendar.NavButton slot="previous" />
                    <RangeCalendar.NavButton slot="next" />
                  </RangeCalendar.Header>
                  <RangeCalendar.Grid>
                    <RangeCalendar.GridHeader>
                      {(day: any) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
                    </RangeCalendar.GridHeader>
                    <RangeCalendar.GridBody>
                      {(date: any) => <RangeCalendar.Cell date={date} />}
                    </RangeCalendar.GridBody>
                  </RangeCalendar.Grid>
                  <RangeCalendar.YearPickerGrid>
                    <RangeCalendar.YearPickerGridBody>
                      {({year}: any) => <RangeCalendar.YearPickerCell year={year} />}
                    </RangeCalendar.YearPickerGridBody>
                  </RangeCalendar.YearPickerGrid>
                </RangeCalendar>
              </DateRangePicker.Popover>
            </DateRangePicker>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
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
                <HeroButton 
                    isIconOnly
                    aria-label="Editar"
                    onPress={() => {
                        setEditingDayData(item);
                        setIsEditModalOpen(true);
                    }}
                >
                    <Pencil size={16} />
                </HeroButton>
                <HeroButton 
                    isIconOnly
                    aria-label="Excluir"
                >
                    <Trash2 size={16} />
                </HeroButton>
              </div>
            </Card>
          ))}
        </div>

        {visibleHistory.length === 0 && (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 mt-4">
             <p className="text-default-500 font-medium">Nenhuma agenda encontrada para este período.</p>
             <p className="text-sm text-default-400 mt-1">Altere os filtros acima para buscar.</p>
          </div>
        )}
        
      </div>
      
      <EditAvailabilityModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        dayData={editingDayData}
        editType="single"
      />
      
    </div>
  );
}