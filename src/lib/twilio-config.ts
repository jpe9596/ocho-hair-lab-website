export const TWILIO_CONFIG = {
  accountSid: 'ACe7262fb35ec470497df636e736ba3d1a',
  authToken: '340898d89e3226f78f1cf217f7c6717a',
  whatsappNumber: 'whatsapp:+14155238886',
  salonWhatsApp: 'whatsapp:+5218116153747',
  contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e'
} as const

function formatMexicoPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('52')) {
    return `+${cleaned}`
  }
  
  if (cleaned.length === 10) {
    return `+52${cleaned}`
  }
  
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return `+52${cleaned.substring(1)}`
  }
  
  return `+52${cleaned}`
}

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<void> {
  const formattedNumber = formatMexicoPhoneNumber(to)
  const formattedTo = `whatsapp:${formattedNumber}`
  
  try {
    const params = new URLSearchParams()
    params.append('To', formattedTo)
    params.append('From', TWILIO_CONFIG.whatsappNumber)
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
      throw new Error(`Twilio API error: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('WhatsApp message sent via Twilio:', result)
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error)
    throw error
  }
}

export async function sendWhatsAppTemplate(
  to: string,
  variables: { date: string; time: string }
): Promise<void> {
  const formattedNumber = formatMexicoPhoneNumber(to)
  const formattedTo = `whatsapp:${formattedNumber}`
  
  try {
    const params = new URLSearchParams()
    params.append('To', formattedTo)
    params.append('From', TWILIO_CONFIG.whatsappNumber)
    params.append('ContentSid', TWILIO_CONFIG.contentSid)
    params.append('ContentVariables', JSON.stringify({
      "1": variables.date,
      "2": variables.time
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
      console.error('Twilio API error:', errorText)
      throw new Error(`Twilio API error: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('WhatsApp template message sent via Twilio:', result)
  } catch (error) {
    console.error('Failed to send WhatsApp template:', error)
    throw error
  }
}
