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

export async function sendAppointmentSMS(data: SMSNotificationData): Promise<boolean> {
  try {
    const salonPhone = '+528116153747'
    
    const customerMessage = `Hi ${data.customerName}! Your appointment request for ${data.service} on ${data.date} at ${data.time} has been received. We'll confirm within 24 hours. - Ocho Hair Lab`
    
    const salonMessage = `New appointment request:
Name: ${data.customerName}
Service: ${data.service}
Date: ${data.date}
Time: ${data.time}
Phone: ${data.to}`

    await Promise.all([
      sendSMSViaTwilio(data.to, customerMessage),
      sendSMSViaTwilio(salonPhone, salonMessage)
    ])

    return true
  } catch (error) {
    console.error('Failed to send SMS notifications:', error)
    return false
  }
}

export async function sendRescheduleSMS(data: RescheduleSMSData): Promise<boolean> {
  try {
    const salonPhone = '+528116153747'
    
    const customerMessage = `Hi ${data.customerName}! Your ${data.service} appointment has been rescheduled from ${data.oldDate} at ${data.oldTime} to ${data.newDate} at ${data.newTime}. See you then! - Ocho Hair Lab`
    
    const salonMessage = `Appointment rescheduled:
Name: ${data.customerName}
Service: ${data.service}
Previous: ${data.oldDate} at ${data.oldTime}
New: ${data.newDate} at ${data.newTime}
Phone: ${data.to}`

    await Promise.all([
      sendSMSViaTwilio(data.to, customerMessage),
      sendSMSViaTwilio(salonPhone, salonMessage)
    ])

    return true
  } catch (error) {
    console.error('Failed to send reschedule SMS notifications:', error)
    return false
  }
}

async function sendSMSViaTwilio(to: string, message: string): Promise<void> {
  const twilioData = {
    to,
    message,
    from: 'TWILIO_PHONE_NUMBER',
    accountSid: 'TWILIO_ACCOUNT_SID',
    authToken: 'TWILIO_AUTH_TOKEN'
  }

  const promptText = `You are a Twilio SMS notification simulator. 
  
Simulate sending an SMS with the following details:
To: ${twilioData.to}
From: ${twilioData.from}
Message: ${twilioData.message}

Return a JSON object with:
{
  "success": true,
  "messageSid": "SM[random_32_char_hex]",
  "status": "queued",
  "to": "${twilioData.to}",
  "timestamp": "[current_iso_timestamp]"
}

Note: This is a simulated response for development. In production, replace with actual Twilio API call.`

  const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
  const result = JSON.parse(response)
  
  console.log('SMS sent (simulated):', result)
}

export function formatAppointmentDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}
