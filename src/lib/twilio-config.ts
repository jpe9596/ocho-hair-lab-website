import { logSMSMessage } from './sms-logger'

export const TWILIO_CONFIG = {
  accountSid: 'ACe7262fb35ec470497df636e736ba3d1a',
  authToken: '7ffd32aa4b86b4fa97cad7a97a1e0990',
  smsNumber: '+17752547763',
  salonPhone: '+5218116153747'
} as const

function formatMexicoPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('521') && cleaned.length === 13) {
    return `+${cleaned}`
  }
  
  if (cleaned.startsWith('52') && cleaned.length === 12) {
    return `+521${cleaned.substring(2)}`
  }
  
  if (cleaned.length === 10) {
    return `+521${cleaned}`
  }
  
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return `+521${cleaned.substring(1)}`
  }
  
  return `+521${cleaned}`
}

export async function sendSMSMessage(
  to: string,
  message: string,
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
  
  try {
    const params = new URLSearchParams()
    params.append('To', formattedNumber)
    params.append('From', TWILIO_CONFIG.smsNumber)
    params.append('Body', message)
    
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
      console.error('Twilio API error:', errorText)
      
      if (logData) {
        await logSMSMessage({
          ...logData,
          to: formattedNumber,
          message,
          status: "failed",
          failureReason: `Twilio API error: ${response.status}`
        })
      }
      
      throw new Error(`Twilio API error: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('SMS message sent via Twilio:', result)
    
    if (logData) {
      await logSMSMessage({
        ...logData,
        to: formattedNumber,
        message,
        status: result.status === "queued" || result.status === "sent" ? "sent" : 
                result.status === "delivered" ? "delivered" : "pending"
      })
    }
  } catch (error) {
    console.error('Failed to send SMS message:', error)
    
    if (logData) {
      await logSMSMessage({
        ...logData,
        to: formattedNumber,
        message,
        status: "failed",
        failureReason: error instanceof Error ? error.message : "Unknown error"
      })
    }
    
    throw error
  }
}
