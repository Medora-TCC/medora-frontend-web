import { http, HttpResponse, delay } from 'msw';
import { type DailyAvailabilitySlotDTO } from "@medora_web/shared";

function getIsoDateWithOffset(daysOffset: number, time: string) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const dateString = date.toISOString().split('T')[0];
  return `${dateString}T${time}:00.000Z`;
}

const mockAvailabilityList: DailyAvailabilitySlotDTO[] = [
  {
    id: "slot-001",
    startDateTime: getIsoDateWithOffset(0, "08:00"),
    endDateTime: getIsoDateWithOffset(0, "08:30"),
    time: "08:00",
    status: "available",
    type: "presential",
  },
  {
    id: "slot-002",
    startDateTime: getIsoDateWithOffset(0, "09:00"),
    endDateTime: getIsoDateWithOffset(0, "09:30"),
    time: "09:00",
    status: "scheduled",
    type: "telemedicine",
    patientId: "pat-123",
    patientName: "João Silva",
    appointmentId: "app-123",
  },
  {
    id: "slot-003",
    startDateTime: getIsoDateWithOffset(0, "10:30"),
    endDateTime: getIsoDateWithOffset(0, "11:00"),
    time: "10:30",
    status: "confirmed",
    type: "presential",
    patientId: "pat-456",
    patientName: "Maria Souza",
    appointmentId: "app-456",
  },
  {
    id: "slot-004",
    startDateTime: getIsoDateWithOffset(1, "09:00"),
    endDateTime: getIsoDateWithOffset(1, "10:00"),
    time: "09:00",
    status: "available",
    type: "telemedicine",
  },
  {
    id: "slot-005",
    startDateTime: getIsoDateWithOffset(-1, "15:00"),
    endDateTime: getIsoDateWithOffset(-1, "15:30"),
    time: "15:00",
    status: "completed",
    type: "presential",
    patientId: "pat-789",
    patientName: "Carlos Mendes",
    appointmentId: "app-789",
  }
];

export const availabilityHandlers = [
  http.get('/doctors/availability/daily', async ({ request }) => {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    await delay(800);
    
    let result = [...mockAvailabilityList];

    if (startDate && endDate) {
      const start = startDate.split('T')[0];
      const end = endDate.split('T')[0];
      
      result = result.filter(slot => {
        if (!slot.startDateTime) return false;
        const slotDate = slot.startDateTime.split('T')[0];
        return slotDate >= start && slotDate <= end;
      });
    } else if (startDate) {
      const startPrefix = startDate.split('T')[0];
      result = result.filter(slot => slot.startDateTime?.startsWith(startPrefix));
    }
    
    return HttpResponse.json(result);
  }),

  http.get('/doctors/availability/daily/:id', ({ params }) => {
    const slot = mockAvailabilityList.find(s => s.id === params.id);

    if (!slot) {
      return HttpResponse.json({ message: "Disponibilidade não encontrada" }, { status: 404 });
    }

    return HttpResponse.json(slot);
  }),

  http.post('/doctors/availability/daily', async ({ request }) => {
    const body = await request.json() as any;
    
    const { doctorId, repeatWeeks, weekDays, duration, slots } = body;
    const createdSlots: DailyAvailabilitySlotDTO[] = [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < (repeatWeeks * 7); i++) {
       const currentDate = new Date(today);
       currentDate.setDate(today.getDate() + i);
       
       if (weekDays.includes(currentDate.getDay())) {
         const dateString = currentDate.toISOString().split('T')[0];
         
         slots.forEach((s: any, index: number) => {
            const startDateTime = `${dateString}T${s.time}:00.000Z`;
            const [hours, minutes] = s.time.split(':').map(Number);
            const endTotalMinutes = hours * 60 + minutes + (duration || 15);
            const endHours = Math.floor(endTotalMinutes / 60).toString().padStart(2, '0');
            const endMins = (endTotalMinutes % 60).toString().padStart(2, '0');
            const endDateTime = `${dateString}T${endHours}:${endMins}:00.000Z`;
            
            const nova: DailyAvailabilitySlotDTO = {
               id: `slot-${Date.now()}-${i}-${index}`,
               startDateTime,
               endDateTime,
               time: s.time,
               status: 'available',
               type: s.status === 'telemedicine' ? 'telemedicine' : (s.status === 'hybrid' ? 'hybrid' : 'presential'),
               doctorId: doctorId || '1'
            } as DailyAvailabilitySlotDTO;
            
            mockAvailabilityList.push(nova);
            createdSlots.push(nova);
         });
       }
    }
    
    return HttpResponse.json({ message: "Horários cadastrados", slots: createdSlots }, { status: 201 });
  }),
  
  http.post('/doctors/availability/daily/:id/approve', async ({ params }) => {
    await delay(500);
    const slotIndex = mockAvailabilityList.findIndex(s => s.id === params.id);
    
    if (slotIndex === -1) {
      return HttpResponse.json({ message: "Disponibilidade não encontrada" }, { status: 404 });
    }
    
    mockAvailabilityList[slotIndex].status = 'confirmed';
    
    return HttpResponse.json({ status: 'confirmed' });
  }),
  
  http.delete('/doctors/availability/daily/:id', async ({ params }) => {
    await delay(300);
    const slotIndex = mockAvailabilityList.findIndex(s => s.id === params.id);
    
    if (slotIndex === -1) {
      return HttpResponse.json({ message: "Disponibilidade não encontrada" }, { status: 404 });
    }
    
    mockAvailabilityList.splice(slotIndex, 1);
    
    return HttpResponse.json({ status: 'canceled' });
  }),

  http.patch('/doctors/availability/daily/:id/type', async ({ params, request }) => {
    await delay(300);
    const { type } = await request.json() as any;
    const index = mockAvailabilityList.findIndex(s => s.id === params.id);
    if (index !== -1) {
      mockAvailabilityList[index].type = type;
      return HttpResponse.json(mockAvailabilityList[index]);
    }
    return HttpResponse.json({ error: 'not found' }, { status: 404 });
  })
];
    