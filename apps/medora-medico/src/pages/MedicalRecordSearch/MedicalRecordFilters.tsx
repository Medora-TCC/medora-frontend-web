import {
  Button,
  DateField,
  DateRangePicker,
  Dropdown,
  Label,
  RangeCalendar,
  SearchField,
  type DateValue,
} from "@heroui/react";
import { ChevronDown, FilterX, ListFilter, RotateCcw, Search } from "lucide-react";
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
  onRefresh: () => void;
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
  onRefresh,
}: MedicalRecordFiltersProps) {
  const statusAtual = statusOptions.find((o) => o.key === status) ?? statusOptions[0];

  return (
    <div className="flex flex-col gap-6">
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
          <Search className="size-4" />
          Pesquisar
        </Button>
      </div>

      {/* ── Filtros ───────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Status (filtrado no backend) */}
          <Dropdown>
            <Button variant="outline" size="sm" aria-label="Filtrar por status">
              <ListFilter className="size-4" />
              {statusAtual.label}
              <ChevronDown className="size-4" />
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu
                selectionMode="single"
                selectedKeys={new Set([status])}
                onSelectionChange={(keys) => {
                  if (keys === "all") return;
                  const val = [...keys][0] as MedicalRecordStatusFilter | undefined;
                  if (val) onStatusChange(val);
                }}
              >
                {statusOptions.map(({ key, label }) => (
                  <Dropdown.Item key={key} id={key} textValue={label}>
                    <Label>{label}</Label>
                    <Dropdown.ItemIndicator />
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>

          {/* Data do último atendimento (intervalo, filtrado no backend) */}
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

        {/* Limpar + Atualizar */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onPress={onClear}
            isDisabled={!hasActiveFilters}
            aria-label="Limpar busca e filtros"
          >
            <FilterX className="size-4" />
            Limpar
          </Button>

          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            onPress={onRefresh}
            isDisabled={isLoading}
            aria-label="Atualizar prontuários"
          >
            <span title="Atualizar prontuários" className="inline-flex">
              <RotateCcw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}