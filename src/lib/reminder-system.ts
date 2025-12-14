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
          service: appointment.service,
          date: formatAppointmentDate(new Date(appointment.date)),
          time: appointment.time,
          stylist: appointment.stylist
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
  service: string
  date: string
  time: string
  stylist: string
}): Promise<void> {
  const salonPhone = '+528116153747'
  
  const customerMessage = `Hi ${data.customerName}! Your appointment for ${data.service} on ${data.date} at ${data.time} with ${data.stylist} has been confirmed. We look forward to seeing you! - Ocho Hair Lab`
  
  const salonMessage = `New appointment booked:
Name: ${data.customerName}
Service: ${data.service}
Date: ${data.date}
Time: ${data.time}
Stylist: ${data.stylist}
Customer Phone: ${data.to}`

  await Promise.all([
    sendSMSViaTwilio(data.to, customerMessage),
    sendSMSViaTwilio(salonPhone, salonMessage)
  ])
}

async function sendReminderNotifications(data: {
  to: string
  customerName: string
  service: string
  date: string
  time: string
  stylist: string
}): Promise<void> {
  const salonPhone = '+528116153747'
  
  const customerMessage = `Hi ${data.customerName}! Reminder: You have a ${data.service} appointment in 8 hours (${data.date}) at ${data.time} with ${data.stylist}. We look forward to seeing you! - Ocho Hair Lab`
  
  const salonMessage = `8-hour reminder sent to ${data.customerName} for upcoming appointment:
Service: ${data.service}
Time: ${data.time}
Stylist: ${data.stylist}
Customer Phone: ${data.to}`

  await Promise.all([
    sendSMSViaTwilio(data.to, customerMessage),
    sendSMSViaTwilio(salonPhone, salonMessage)
  ])
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
  
Simulate sending an SMS reminder with the following details:
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
  
  console.log('Reminder SMS sent (simulated):', result)
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
