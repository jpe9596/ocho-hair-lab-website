import { logSMSMessage } from './sms-logger'

export const TWILIO_CONFIG = {
  accountSid: 'ACe7262fb35ec470497df636e736ba3d1a',
  authToken: '7ffd32aa4b86b4fa97cad7a97a1e0990',
  whatsappNumber: 'whatsapp:+17752547763',
  templateSid: 'HX797679775dc43a66039095fe7de267d1',
  salonPhone: '+5218116153747'
} as const

function formatMexicoPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('521') && cleaned.length === 13) {
    return `whatsapp:+${cleaned}`
  }
  
  if (cleaned.startsWith('52') && cleaned.length === 12) {
    return `whatsapp:+521${cleaned.substring(2)}`
  }
  
  if (cleaned.length === 10) {
    return `whatsapp:+521${cleaned}`
  }
  
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return `whatsapp:+521${cleaned.substring(1)}`
  }
  
  return `whatsapp:+521${cleaned}`
}

function formatDateForTemplate(date: string): string {
  const dateObj = new Date(date)
  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()
  return `${month}/${day}`
}

function formatTimeForTemplate(time: string): string {
  return time.toLowerCase().replace(' ', '')
}

export async function sendWhatsAppMessage(
  to: string,
  date: string,
  time: string,
  logData?: {
    appointmentId: string
    type: "confirmation" | "reminder" | "custom"
    templateName?: string
    customerName: string
    customerEmail: string
    serviceName: string
  }
): Promise<void> {
  const formattedNumber = formatMexicoPhoneNumber(to)
  const formattedDate = formatDateForTemplate(date)
  const formattedTime = formatTimeForTemplate(time)
  
  try {
    const params = new URLSearchParams()
    params.append('To', formattedNumber)
    params.append('From', TWILIO_CONFIG.whatsappNumber)
    params.append('ContentSid', TWILIO_CONFIG.templateSid)
    params.append('ContentVariables', JSON.stringify({
      "1": formattedDate,
      "2": formattedTime
    }))
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Twilio WhatsApp API error:', errorText)
      
      if (logData) {
        await logSMSMessage({
          ...logData,
          to: formattedNumber,
          message: `WhatsApp: Appointment on ${formattedDate} at ${formattedTime}`,
          status: "failed",
          failureReason: `Twilio API error: ${response.status}`
        })
      }
      
      throw new Error(`Twilio API error: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('WhatsApp message sent via Twilio:', result)
    
    if (logData) {
      await logSMSMessage({
        ...logData,
        to: formattedNumber,
        message: `WhatsApp: Appointment on ${formattedDate} at ${formattedTime}`,
        status: result.status === "queued" || result.status === "sent" ? "sent" : 
                result.status === "delivered" ? "delivered" : "pending"
      })
    }
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error)
    
    if (logData) {
      await logSMSMessage({
        ...logData,
        to: formattedNumber,
        message: `WhatsApp: Appointment on ${formattedDate} at ${formattedTime}`,
        status: "failed",
        failureReason: error instanceof Error ? error.message : "Unknown error"
      })
    }
    
    throw error
  }
}
