import { sendSMSMessage, TWILIO_CONFIG } from './twilio-config'
import { 
  getConfirmationMessage, 
  getReminderMessage, 
  getStaffNotificationMessage 
} from './sms-templates'

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
          customerEmail: appointment.email,
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
  customerEmail?: string
  service: string
  date: string
  time: string
  stylist: string
  appointmentId: string
}): Promise<void> {
  const customerMessage = await getConfirmationMessage({
    customerName: data.customerName,
    service: data.service,
    date: data.date,
    time: data.time,
    stylist: data.stylist,
    appointmentId: data.appointmentId
  })
  
  const staffMessage = getStaffNotificationMessage('newBooking', {
    customerName: data.customerName,
    service: data.service,
    date: data.date,
    time: data.time,
    stylist: data.stylist
  })
  
  await Promise.all([
    sendSMSMessage(data.to, customerMessage, {
      appointmentId: data.appointmentId,
      type: "confirmation",
      templateName: "Booking Confirmation",
      customerName: data.customerName,
      customerEmail: data.customerEmail || "",
      serviceName: data.service
    }),
    sendSMSMessage(TWILIO_CONFIG.salonPhone, staffMessage, {
      appointmentId: data.appointmentId,
      type: "custom",
      templateName: "Staff Notification - New Booking",
      customerName: "Salon Staff",
      customerEmail: "",
      serviceName: data.service
    })
  ])
}

async function sendReminderNotifications(data: {
  to: string
  customerName: string
  customerEmail?: string
  service: string
  date: string
  time: string
  stylist: string
  appointmentId: string
}): Promise<void> {
  const customerMessage = await getReminderMessage({
    customerName: data.customerName,
    service: data.service,
    date: data.date,
    time: data.time,
    stylist: data.stylist,
    appointmentId: data.appointmentId
  })
  
  const staffMessage = getStaffNotificationMessage('reminder', {
    customerName: data.customerName,
    service: data.service,
    date: data.date,
    time: data.time,
    stylist: data.stylist
  })
  
  await Promise.all([
    sendSMSMessage(data.to, customerMessage, {
      appointmentId: data.appointmentId,
      type: "reminder",
      templateName: "8-Hour Reminder",
      customerName: data.customerName,
      customerEmail: data.customerEmail || "",
      serviceName: data.service
    }),
    sendSMSMessage(TWILIO_CONFIG.salonPhone, staffMessage, {
      appointmentId: data.appointmentId,
      type: "custom",
      templateName: "Staff Notification - Reminder",
      customerName: "Salon Staff",
      customerEmail: "",
      serviceName: data.service
    })
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
