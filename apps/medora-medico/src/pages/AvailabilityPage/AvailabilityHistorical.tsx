import { useState, useMemo } from 'react';
import { Clock, Pencil, Trash2 } from 'lucide-react';
import { Card, Pagination, DateRangePicker, DateField, Label, RangeCalendar, Button } from '@heroui/react';
import type { DayDataAvailabilityDto } from '../../api/dtos/DayDataAvailabilityDto';
import { EditAvailabilityModal } from '../../modals/AvailabilityModals/EditAvailability';

const generateMockHistory = (): DayDataAvailabilityDto[] => {
  const history: DayDataAvailabilityDto[] = [];
  const baseDate = new Date('2026-05-01');
  
  for (let i = 0; i < 45; i++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    history.push({
      id: i + 1,
      date: dateStr,
      start: i % 2 === 0 ? '08:00' : '09:00',
      end: i % 2 === 0 ? '17:00' : '15:00',
      duration: 15,
      slots: i % 2 === 0 ? 36 : 24,
      isSeries: i % 3 === 0, 
    });
  }
  return history;
};

const mockHistory = generateMockHistory();

export function AvailabilityHistorical() {
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; 

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDayData, setEditingDayData] = useState<DayDataAvailabilityDto | null>(null);

  const filteredHistory = useMemo(() => {
    return mockHistory.filter((item) => {
      if (filterStartDate && item.date < filterStartDate) return false;
      if (filterEndDate && item.date > filterEndDate) return false;
      return true;
    });
  }, [filterStartDate, filterEndDate]);

  const pages = Math.ceil(filteredHistory.length / itemsPerPage);
  
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredHistory.slice(start, end);
  }, [filteredHistory, currentPage]);

  const handleFilterChange = (range: any) => {
    if (range && range.start && range.end) {
        const start = `${range.start.year}-${String(range.start.month).padStart(2, '0')}-${String(range.start.day).padStart(2, '0')}`;
        const end = `${range.end.year}-${String(range.end.month).padStart(2, '0')}-${String(range.end.day).padStart(2, '0')}`;
        setFilterStartDate(start);
        setFilterEndDate(end);
    } else {
        setFilterStartDate('');
        setFilterEndDate('');
    }
    setCurrentPage(1); 
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-(--primary) text-primary">Gestão de Agenda</h1>
        <p className="text-default-500 mt-2">
          Visão completa de todos os seus horários configurados. Utilize os filtros, edite ou exclua agendas configuradas.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Filtrar Período</h2>
          <p className="text-xs text-slate-500">Total de {filteredHistory.length} agendas encontradas</p>
        </div>
        
        <div className="flex flex-col w-full md:w-auto">
            <Label className="text-sm font-medium text-default-700 mb-1">Selecione o intervalo</Label>
            <DateRangePicker 
                className="w-full md:w-80 bg-white" 
                onChange={handleFilterChange}
            >
              
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentItems.map((item) => (
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
                          >
                              <Trash2 size={18} />
                          </Button>
                        </div>
                      </Card>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 mt-4">
           <p className="text-default-500 font-medium">Nenhuma agenda encontrada.</p>
           <p className="text-sm text-default-400 mt-1">Modifique os filtros do calendário acima.</p>
        </div>
      )}

      {pages > 1 && (
        <div className="flex flex-col items-center justify-center mt-6">
          <Pagination>
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={currentPage === 1 ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
                >
                  <span>Anterior</span>
                </Pagination.Previous>
              </Pagination.Item>
              
              {Array.from({ length: pages }).map((_, i) => {
                const pageNum = i + 1;
                
                if (
                  pageNum === 1 || 
                  pageNum === pages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <Pagination.Item key={pageNum}>
                      <Pagination.Link 
                        isActive={currentPage === pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </Pagination.Link>
                    </Pagination.Item>
                  );
                }
                
                if (
                  pageNum === currentPage - 2 || 
                  pageNum === currentPage + 2
                ) {
                  return (
                    <Pagination.Item key={pageNum}>
                      <Pagination.Ellipsis />
                    </Pagination.Item>
                  );
                }
                
                return null;
              })}

              <Pagination.Item>
                <Pagination.Next 
                  onClick={() => setCurrentPage(prev => Math.min(pages, prev + 1))}
                  className={currentPage === pages ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
                >
                  <span>Próxima</span>
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </div>
      )}

      <EditAvailabilityModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        dayData={editingDayData}
        editType="single"
      />
    </div>
  );
}