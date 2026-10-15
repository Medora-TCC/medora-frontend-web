import { ChevronDown } from 'lucide-react';
import { MODE_CONFIG, type SlotMode } from './availabilityConfig';

export function SelectField({
  label,
  icon,
  value,
  onChange,
  options,
}: Readonly<{
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <div className="relative flex items-center border border-border rounded-lg bg-surface h-10 focus-within:border-primary-hover transition-colors">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full px-3 pr-8 bg-transparent outline-none text-sm text-text-primary cursor-pointer appearance-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-surface text-text-primary">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 pointer-events-none text-text-muted" />
      </div>
    </div>
  );
}

export function ModeSelect({
  value,
  onChange,
}: Readonly<{
  value: SlotMode;
  onChange: (v: SlotMode) => void;
}>) {
  const cfg = MODE_CONFIG[value];
  return (
    <div className={`relative flex items-center border rounded-lg h-9 px-2.5 pr-7 text-xs font-medium cursor-pointer transition-colors ${cfg.bgClass} ${cfg.borderClass} ${cfg.colorClass}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SlotMode)}
        className="absolute inset-0 w-full h-full opacity-0 text-text-primary cursor-pointer bg-surface"
      >
        {(Object.keys(MODE_CONFIG) as SlotMode[]).map((k) => (
          <option key={k} value={k}>{MODE_CONFIG[k].label}</option>
        ))}
      </select>
      <span className="flex items-center gap-1.5 pointer-events-none whitespace-nowrap">
        {cfg.icon}
        {cfg.label}
      </span>
      <ChevronDown size={11} className="absolute right-2 pointer-events-none opacity-50" />
    </div>
  );
}

export function TimeInput({
  value,
  onChange,
  hasError,
}: Readonly<{
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}>) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-9 px-2.5 rounded-lg border text-sm text-text-primary bg-surface outline-none transition-colors
        focus:border-primary-hover
        ${hasError ? 'border-danger bg-danger-subtle' : 'border-border'}`}
    />
  );
}

export function DateInput({
  value,
  onChange,
  min,
}: Readonly<{
  value: string;
  onChange: (v: string) => void;
  min?: string;
}>) {
  return (
    <input
      type="date"
      value={value}
      min={min}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 px-2.5 rounded-lg border border-border text-sm text-text-primary bg-surface outline-none transition-colors focus:border-primary-hover"
    />
  );
}
