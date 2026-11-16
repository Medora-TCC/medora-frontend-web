import {
  Button,
  Calendar,
  DateField,
  DatePicker,
  Dropdown,
  Label,
  SearchField,
  type DateValue,
} from "@heroui/react";
import { ChevronDown, FilterX, ListFilter, RotateCcw, Search } from "lucide-react";
import type { MedicalRecordStatusFilter } from "../../api/services/MedicalRecordSearch";

const statusOptions: { key: MedicalRecordStatusFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "inProgress", label: "Em andamento" },
  { key: "finalized", label: "Finalizados" },
];

// ─── Campo de data (um calendário por campo) ──────────────────────────────────
interface DateFilterProps {
  label: string;
  name: string;
  value: DateValue | null;
  onChange: (value: DateValue | null) => void;
  minValue?: DateValue;
  maxValue?: DateValue;
}

function DateFilter({ label, name, value, onChange, minValue, maxValue }: DateFilterProps) {
  return (
    <DatePicker
      className="w-44"
      name={name}
      value={value}
      onChange={onChange}
      minValue={minValue}
      maxValue={maxValue}
    >
      <Label>{label}</Label>
      <DateField.Group fullWidth>
        <DateField.Input>
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover>
        <Calendar aria-label={label}>
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
          </Calendar.Grid>
          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>
              {({ year }) => <Calendar.YearPickerCell year={year} />}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
}

// ─── Filtros ──────────────────────────────────────────────────────────────────
interface MedicalRecordFiltersProps {
  nome: string;
  cpf: string;
  status: MedicalRecordStatusFilter;
  dateFrom: DateValue | null;
  dateTo: DateValue | null;
  hasActiveFilters: boolean;
  isLoading: boolean;
  onNomeChange: (value: string) => void;
  onCpfChange: (value: string) => void;
  onStatusChange: (value: MedicalRecordStatusFilter) => void;
  onDateFromChange: (value: DateValue | null) => void;
  onDateToChange: (value: DateValue | null) => void;
  onSearch: () => void;
  onClear: () => void;
  onRefresh: () => void;
}

export function MedicalRecordFilters({
  nome,
  cpf,
  status,
  dateFrom,
  dateTo,
  hasActiveFilters,
  isLoading,
  onNomeChange,
  onCpfChange,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
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

          {/* Data do último atendimento: de / até (um limita o outro) */}
          <DateFilter
            label="Atendimento de"
            name="dataInicio"
            value={dateFrom}
            onChange={onDateFromChange}
            maxValue={dateTo ?? undefined}
          />
          <DateFilter
            label="Atendimento até"
            name="dataFim"
            value={dateTo}
            onChange={onDateToChange}
            minValue={dateFrom ?? undefined}
          />
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