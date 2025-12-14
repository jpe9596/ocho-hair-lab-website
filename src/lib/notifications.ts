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
    const customerMessage = `Hi ${data.customerName}! Your appointment request for ${data.service} on ${data.date} at ${data.time} has been received. We'll confirm within 24 hours. - Ocho Hair Lab`
    
    const salonMessage = `New appointment request:
Name: ${data.customerName}
Service: ${data.service}
Date: ${data.date}
Time: ${data.time}
Phone: ${data.to}`

    await Promise.all([
      sendWhatsAppMessage(data.to, customerMessage),
      sendWhatsAppMessage(TWILIO_CONFIG.salonWhatsApp, salonMessage)
    ])

    return true
  } catch (error) {
    console.error('Failed to send SMS notifications:', error)
    return false
  }
}

export async function sendRescheduleSMS(data: RescheduleSMSData): Promise<boolean> {
  try {
    const customerMessage = `Hi ${data.customerName}! Your ${data.service} appointment has been rescheduled from ${data.oldDate} at ${data.oldTime} to ${data.newDate} at ${data.newTime}. See you then! - Ocho Hair Lab`
    
    const salonMessage = `Appointment rescheduled:
Name: ${data.customerName}
Service: ${data.service}
Previous: ${data.oldDate} at ${data.oldTime}
New: ${data.newDate} at ${data.newTime}
Phone: ${data.to}`

    await Promise.all([
      sendWhatsAppMessage(data.to, customerMessage),
      sendWhatsAppMessage(TWILIO_CONFIG.salonWhatsApp, salonMessage)
    ])

    return true
  } catch (error) {
    console.error('Failed to send reschedule SMS notifications:', error)
    return false
  }
}

export async function sendCancellationSMS(data: CancellationSMSData): Promise<boolean> {
  try {
    const customerMessage = `Hi ${data.customerName}! Your ${data.service} appointment on ${data.date} at ${data.time} has been cancelled. We hope to see you soon! - Ocho Hair Lab`
    
    const salonMessage = `Appointment cancelled:
Name: ${data.customerName}
Service: ${data.service}
Date: ${data.date}
Time: ${data.time}
Phone: ${data.to}`

    await Promise.all([
      sendWhatsAppMessage(data.to, customerMessage),
      sendWhatsAppMessage(TWILIO_CONFIG.salonWhatsApp, salonMessage)
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
