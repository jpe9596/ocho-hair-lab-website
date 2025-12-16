import { sendWhatsAppMessage, TWILIO_CONFIG } from './twilio-config'

interface WhatsAppNotificationData {
  to: string
  customerName: string
  service: string
  date: string
  time: string
  stylist?: string
}

interface RescheduleWhatsAppData {
  to: string
  customerName: string
  service: string
  oldDate: string
  oldTime: string
  newDate: string
  newTime: string
  stylist?: string
}

interface CancellationWhatsAppData {
  to: string
  customerName: string
  service: string
  date: string
  time: string
  stylist?: string
}

export async function sendAppointmentSMS(data: WhatsAppNotificationData): Promise<boolean> {
  try {
    await sendWhatsAppMessage(data.to, data.date, data.time)
    return true
  } catch (error) {
    console.error('Failed to send WhatsApp notification:', error)
    return false
  }
}

export async function sendRescheduleSMS(data: RescheduleWhatsAppData): Promise<boolean> {
  try {
    await sendWhatsAppMessage(data.to, data.newDate, data.newTime)
    return true
  } catch (error) {
    console.error('Failed to send reschedule WhatsApp notification:', error)
    return false
  }
}

export async function sendCancellationSMS(data: CancellationWhatsAppData): Promise<boolean> {
  try {
    return true
  } catch (error) {
    console.error('Failed to send cancellation WhatsApp notification:', error)
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
