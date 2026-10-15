import { Building2, Monitor, RefreshCw } from 'lucide-react';
import type { AvailabilitySlotType } from '@medora_web/shared';

export type SlotMode = AvailabilitySlotType;

export const MODE_CONFIG: Record<SlotMode, {
  label: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}> = {
  InPerson: {
    label: 'Presencial',
    icon: <Building2 size={13} />,
    colorClass: 'text-primary-text',
    bgClass: 'bg-primary-subtle',
    borderClass: 'border-primary/30',
  },
  Online: {
    label: 'Telemedicina',
    icon: <Monitor size={13} />,
    colorClass: 'text-violet-700',
    bgClass: 'bg-violet-100',
    borderClass: 'border-violet-300',
  },
  Any: {
    label: 'Ambos',
    icon: <RefreshCw size={13} />,
    colorClass: 'text-success-text',
    bgClass: 'bg-success-subtle',
    borderClass: 'border-success/30',
  },
};

export const DURATION_OPTIONS = [
  { label: '15 minutos', value: '15' },
  { label: '20 minutos', value: '20' },
  { label: '30 minutos', value: '30' },
  { label: '45 minutos', value: '45' },
  { label: '60 minutos', value: '60' },
];

export const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const tomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toDateStr(d);
};

export const minutesOf = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};
