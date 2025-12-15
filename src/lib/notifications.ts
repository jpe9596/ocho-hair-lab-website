import { sendWhatsAppMessage, TWILIO_CONFIG } from './twilio-config'

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
    await Promise.all([
      sendWhatsAppMessage(data.to, data.date, data.time),
      sendWhatsAppMessage(TWILIO_CONFIG.salonWhatsApp, data.date, data.time)
    ])

    return true
  } catch (error) {
    console.error('Failed to send SMS notifications:', error)
    return false
  }
}

export async function sendRescheduleSMS(data: RescheduleSMSData): Promise<boolean> {
  try {
    await Promise.all([
      sendWhatsAppMessage(data.to, data.newDate, data.newTime),
      sendWhatsAppMessage(TWILIO_CONFIG.salonWhatsApp, data.newDate, data.newTime)
    ])

    return true
  } catch (error) {
    console.error('Failed to send reschedule SMS notifications:', error)
    return false
  }
}

export async function sendCancellationSMS(data: CancellationSMSData): Promise<boolean> {
  try {
    await Promise.all([
      sendWhatsAppMessage(data.to, data.date, data.time),
      sendWhatsAppMessage(TWILIO_CONFIG.salonWhatsApp, data.date, data.time)
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
