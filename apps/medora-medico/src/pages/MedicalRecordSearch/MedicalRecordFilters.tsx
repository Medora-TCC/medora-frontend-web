import {
  Button,
  DateField,
  DateRangePicker,
  Label,
  RangeCalendar,
  SearchField,
  ToggleButton,
  ToggleButtonGroup,
  type DateValue,
} from "@heroui/react";
import { FilterX, Search } from "lucide-react";
import type { MedicalRecordStatusFilter } from "../../api/services/MedicalRecordSearch";

export type DateRange = { start: DateValue; end: DateValue };

const statusOptions: { key: MedicalRecordStatusFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "inProgress", label: "Em andamento" },
  { key: "finalized", label: "Finalizados" },
];

interface MedicalRecordFiltersProps {
  nome: string;
  cpf: string;
  status: MedicalRecordStatusFilter;
  dateRange: DateRange | null;
  hasActiveFilters: boolean;
  isLoading: boolean;
  onNomeChange: (value: string) => void;
  onCpfChange: (value: string) => void;
  onStatusChange: (value: MedicalRecordStatusFilter) => void;
  onDateRangeChange: (value: DateRange | null) => void;
  onSearch: () => void;
  onClear: () => void;
}

export function MedicalRecordFilters({
  nome,
  cpf,
  status,
  dateRange,
  hasActiveFilters,
  isLoading,
  onNomeChange,
  onCpfChange,
  onStatusChange,
  onDateRangeChange,
  onSearch,
  onClear,
}: MedicalRecordFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* ── Busca ─────────────────────────────────────── */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <SearchField
          fullWidth
          name="nome"
          className="flex-1"
          value={nome}
          onChange={onNomeChange}
          onSubmit={onSearch}
        >
          <Label>Nome do paciente</Label>
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Buscar por nome" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

        <SearchField
          fullWidth
          name="cpf"
          className="md:w-60"
          value={cpf}
          onChange={onCpfChange}
          onSubmit={onSearch}
        >
          <Label>CPF</Label>
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="000.000.000-00" inputMode="numeric" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

        <Button variant="primary" onPress={onSearch} isDisabled={isLoading}>
          <Search size={16} />
          Pesquisar
        </Button>
      </div>

      {/* ── Filtros ───────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-fg-muted">Status</span>
            <ToggleButtonGroup
              aria-label="filtrar por status"
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={new Set([status])}
              onSelectionChange={(keys) => {
                const val = [...keys][0] as MedicalRecordStatusFilter | undefined;
                if (val) onStatusChange(val);
              }}
              className="flex flex-wrap gap-2"
            >
              {statusOptions.map(({ key, label }) => (
                <ToggleButton key={key} id={key} size="sm">
                  {label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>

          {/* Data do último atendimento (intervalo) */}
          <DateRangePicker
            className="w-72"
            startName="dataInicio"
            endName="dataFim"
            value={dateRange}
            onChange={onDateRangeChange}
          >
            <Label>Data do último atendimento</Label>
            <DateField.Group fullWidth>
              <DateField.Input slot="start">
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateRangePicker.RangeSeparator />
              <DateField.Input slot="end">
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateField.Suffix>
                <DateRangePicker.Trigger>
                  <DateRangePicker.TriggerIndicator />
                </DateRangePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>
            <DateRangePicker.Popover>
              <RangeCalendar aria-label="Data do último atendimento">
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
                    {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
                  </RangeCalendar.GridHeader>
                  <RangeCalendar.GridBody>
                    {(date) => <RangeCalendar.Cell date={date} />}
                  </RangeCalendar.GridBody>
                </RangeCalendar.Grid>
                <RangeCalendar.YearPickerGrid>
                  <RangeCalendar.YearPickerGridBody>
                    {({ year }) => <RangeCalendar.YearPickerCell year={year} />}
                  </RangeCalendar.YearPickerGridBody>
                </RangeCalendar.YearPickerGrid>
              </RangeCalendar>
            </DateRangePicker.Popover>
          </DateRangePicker>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onPress={onClear}
          isDisabled={!hasActiveFilters}
          aria-label="limpar busca e filtros"
        >
          <FilterX size={16} />
          Limpar
        </Button>
      </div>
    </div>
  );
}