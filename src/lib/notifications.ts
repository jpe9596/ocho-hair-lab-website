import { sendSMSMessage, TWILIO_CONFIG } from './twilio-config'
import { 
  getConfirmationMessage, 
  getRescheduleMessage, 
  getCancellationMessage,
  getStaffNotificationMessage 
} from './sms-templates'

interface SMSNotificationData {
  to: string
  customerName: string
  service: string
  date: string
  time: string
  stylist?: string
}

interface RescheduleSMSData {
  to: string
  customerName: string
  service: string
  oldDate: string
  oldTime: string
  newDate: string
  newTime: string
  stylist?: string
}

interface CancellationSMSData {
  to: string
  customerName: string
  service: string
  date: string
  time: string
  stylist?: string
}

export async function sendAppointmentSMS(data: SMSNotificationData): Promise<boolean> {
  try {
    const customerMessage = await getConfirmationMessage({
      customerName: data.customerName,
      service: data.service,
      date: data.date,
      time: data.time,
      stylist: data.stylist || 'Our Team'
    })
    
    const staffMessage = getStaffNotificationMessage('newBooking', {
      customerName: data.customerName,
      service: data.service,
      date: data.date,
      time: data.time,
      stylist: data.stylist || 'Our Team'
    })
    
    await Promise.all([
      sendSMSMessage(data.to, customerMessage),
      sendSMSMessage(TWILIO_CONFIG.salonPhone, staffMessage)
    ])

    return true
  } catch (error) {
    console.error('Failed to send SMS notifications:', error)
    return false
  }
}

export async function sendRescheduleSMS(data: RescheduleSMSData): Promise<boolean> {
  try {
    const customerMessage = await getRescheduleMessage({
      customerName: data.customerName,
      service: data.service,
      date: data.newDate,
      time: data.newTime,
      oldDate: data.oldDate,
      oldTime: data.oldTime,
      newDate: data.newDate,
      newTime: data.newTime,
      stylist: data.stylist || 'Our Team'
    })
    
    const staffMessage = getStaffNotificationMessage('reschedule', {
      customerName: data.customerName,
      service: data.service,
      date: data.newDate,
      time: data.newTime,
      oldDate: data.oldDate,
      oldTime: data.oldTime,
      newDate: data.newDate,
      newTime: data.newTime,
      stylist: data.stylist || 'Our Team'
    })
    
    await Promise.all([
      sendSMSMessage(data.to, customerMessage),
      sendSMSMessage(TWILIO_CONFIG.salonPhone, staffMessage)
    ])

    return true
  } catch (error) {
    console.error('Failed to send reschedule SMS notifications:', error)
    return false
  }
}

export async function sendCancellationSMS(data: CancellationSMSData): Promise<boolean> {
  try {
    const customerMessage = await getCancellationMessage({
      customerName: data.customerName,
      service: data.service,
      date: data.date,
      time: data.time,
      stylist: data.stylist || 'Our Team'
    })
    
    const staffMessage = getStaffNotificationMessage('cancellation', {
      customerName: data.customerName,
      service: data.service,
      date: data.date,
      time: data.time,
      stylist: data.stylist || 'Our Team'
    })
    
    await Promise.all([
      sendSMSMessage(data.to, customerMessage),
      sendSMSMessage(TWILIO_CONFIG.salonPhone, staffMessage)
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
