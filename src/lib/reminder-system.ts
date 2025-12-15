import { sendWhatsAppMessage, TWILIO_CONFIG } from './twilio-config'

interface Appointment {
  id: string
  name: string
  email: string
  phone: string
  service: string
  stylist: string
  date: Date
  time: string
  notes: string
  createdAt: Date
  confirmationSent?: boolean
  reminderSent?: boolean
}

interface ReminderRecord {
  appointmentId: string
  sentAt: Date
}

const REMINDER_HOURS_BEFORE = 8

export async function checkAndSendReminders(
  appointments: Appointment[],
  onReminderSent: (appointmentId: string) => void
): Promise<void> {
  const now = new Date()
  const reminderThreshold = new Date(now.getTime() + REMINDER_HOURS_BEFORE * 60 * 60 * 1000)

  for (const appointment of appointments) {
    if (appointment.reminderSent) {
      continue
    }

    const appointmentDateTime = combineDateAndTime(new Date(appointment.date), appointment.time)
    
    const timeDiff = appointmentDateTime.getTime() - now.getTime()
    const hoursUntilAppointment = timeDiff / (1000 * 60 * 60)

    if (hoursUntilAppointment <= REMINDER_HOURS_BEFORE && hoursUntilAppointment > 0) {
      try {
        await sendReminderNotifications({
          to: appointment.phone,
          customerName: appointment.name,
          service: appointment.service,
          date: formatAppointmentDate(new Date(appointment.date)),
          time: appointment.time,
          stylist: appointment.stylist,
          appointmentId: appointment.id
        })
        
        onReminderSent(appointment.id)
        
        console.log(`Reminder sent for appointment ${appointment.id}`)
      } catch (error) {
        console.error(`Failed to send reminder for appointment ${appointment.id}:`, error)
      }
    }
  }
}

export async function sendBookingConfirmation(data: {
  to: string
  customerName: string
  service: string
  date: string
  time: string
  stylist: string
  appointmentId: string
}): Promise<void> {
  await Promise.all([
    sendWhatsAppMessage(data.to, data.date, data.time),
    sendWhatsAppMessage(TWILIO_CONFIG.salonWhatsApp, data.date, data.time)
  ])
}

async function sendReminderNotifications(data: {
  to: string
  customerName: string
  service: string
  date: string
  time: string
  stylist: string
  appointmentId: string
}): Promise<void> {
  await Promise.all([
    sendWhatsAppMessage(data.to, data.date, data.time),
    sendWhatsAppMessage(TWILIO_CONFIG.salonWhatsApp, data.date, data.time)
  ])
}

function combineDateAndTime(date: Date, timeString: string): Date {
  const [time, period] = timeString.split(' ')
  let [hours, minutes] = time.split(':').map(Number)
  
  if (period === 'PM' && hours !== 12) {
    hours += 12
  } else if (period === 'AM' && hours === 12) {
    hours = 0
  }
  
  const combined = new Date(date)
  combined.setHours(hours, minutes || 0, 0, 0)
  
  return combined
}

function formatAppointmentDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}
