import { http, HttpResponse, delay } from 'msw';
import { type DailyAvailabilitySlotDTO, type AvailabilitySlotStatus, type AvailabilitySlotType } from "@medora_web/shared";

function generateDailyAgenda(dateString: string): DailyAvailabilitySlotDTO[] {
  const date = new Date(dateString);
  const seed = date.getDate();
  const slots: DailyAvailabilitySlotDTO[] = [];
  const hours = [8, 9, 10, 11, 14, 15, 16];
  
  const isPastDate = date < new Date('2026-05-12T00:00:00Z');

  hours.forEach((hour, index) => {
    const statusOptions = isPastDate 
      ? ['completed', 'canceled', 'absent'] 
      : ['available', 'scheduled', 'confirmed'];
    
    const status = statusOptions[(seed + index) % statusOptions.length] as AvailabilitySlotStatus;
    
    const startDateTime = new Date(date);
    startDateTime.setUTCHours(hour, 0, 0, 0);
    
    const endDateTime = new Date(date);
    endDateTime.setUTCHours(hour + 1, 0, 0, 0);

    const typeOptions = ['presential', 'telemedicine'];
    const type = typeOptions[(seed + index) % typeOptions.length] as AvailabilitySlotType;
    
    const hasPatient = ['scheduled', 'confirmed', 'completed', 'absent'].includes(status);

    slots.push({
      id: `slot-${dateString}-${hour}`,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      time: `${hour.toString().padStart(2, '0')}:00`,
      status,
      type,
      ...(hasPatient && {
        patientId: `pat-${seed}-${index}`,
        patientName: `Paciente ${index + 1}`,
        appointmentId: `app-${seed}-${index}`
      })
    });
  });

  return slots;
}

export const availabilityHandlers = [
  http.get('/doctors/availability/daily', async ({ request }) => {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    
    await delay(800);
    
    if (startDate) {
      const data = generateDailyAgenda(startDate);
      return HttpResponse.json(data);
    }
    
    return HttpResponse.json([]);
  }),
  
  http.post('/doctors/availability/daily/:id/approve', async ({ params }) => {
    await delay(500);
    return HttpResponse.json({ status: 'confirmed' });
  }),
  
  http.delete('/doctors/availability/daily/:id', async ({ params }) => {
    await delay(500);
    return HttpResponse.json({ status: 'canceled' });
  })
];
    