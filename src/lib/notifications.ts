import { sendSMSMessage, TWILIO_CONFIG } from './twilio-config'

interface SMSNotificationData {
  to: string
  customerName: string
  service: string
  date: string
  time: string
}

interface RescheduleSMSData {
  to: string
  customerName: string
  service: string
  oldDate: string
  oldTime: string
  newDate: string
  newTime: string
}

interface CancellationSMSData {
  to: string
  customerName: string
  service: string
  date: string
  time: string
}

export async function sendAppointmentSMS(data: SMSNotificationData): Promise<boolean> {
  try {
    const message = `Hello ${data.customerName}, this is a confirmation from Ocho Hair Lab for your ${data.service} appointment on ${data.date} at ${data.time}.`
    
    await Promise.all([
      sendSMSMessage(data.to, message),
      sendSMSMessage(TWILIO_CONFIG.salonPhone, `New booking: ${data.customerName} - ${data.service} on ${data.date} at ${data.time}`)
    ])

    return true
  } catch (error) {
    console.error('Failed to send SMS notifications:', error)
    return false
  }
}

export async function sendRescheduleSMS(data: RescheduleSMSData): Promise<boolean> {
  try {
    const message = `Hello ${data.customerName}, your ${data.service} appointment has been rescheduled from ${data.oldDate} at ${data.oldTime} to ${data.newDate} at ${data.newTime}.`
    
    await Promise.all([
      sendSMSMessage(data.to, message),
      sendSMSMessage(TWILIO_CONFIG.salonPhone, `Rescheduled: ${data.customerName} - ${data.service} from ${data.oldDate} ${data.oldTime} to ${data.newDate} ${data.newTime}`)
    ])

    return true
  } catch (error) {
    console.error('Failed to send reschedule SMS notifications:', error)
    return false
  }
}

export async function sendCancellationSMS(data: CancellationSMSData): Promise<boolean> {
  try {
    const message = `Hello ${data.customerName}, your ${data.service} appointment on ${data.date} at ${data.time} has been cancelled.`
    
    await Promise.all([
      sendSMSMessage(data.to, message),
      sendSMSMessage(TWILIO_CONFIG.salonPhone, `Cancelled: ${data.customerName} - ${data.service} on ${data.date} at ${data.time}`)
    ])

    return true
  } catch (error) {
    console.error('Failed to send cancellation SMS notifications:', error)
    return false
  }
}

export function formatAppointmentDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}
