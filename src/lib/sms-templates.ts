interface TemplateData {
  customerName: string
  service: string
  date: string
  time: string
  stylist?: string
  appointmentId?: string
  oldDate?: string
  oldTime?: string
  newDate?: string
  newTime?: string
}

type ServiceCategory = 
  | 'tinte'
  | 'corte'
  | 'bespoke'
  | 'tratamiento'
  | 'default'

type MessageType = 'confirmation' | 'reminder' | 'reschedule' | 'cancellation'

interface CustomTemplates {
  confirmation?: Partial<Record<ServiceCategory, string>>
  reminder?: Partial<Record<ServiceCategory, string>>
  reschedule?: Partial<Record<ServiceCategory, string>>
  cancellation?: Partial<Record<ServiceCategory, string>>
}

export const SMS_TEMPLATES = {
  confirmation: {
    tinte: (data: TemplateData) => 
      `¡Hola ${data.customerName}! ✨ Tu cita para ${data.service} está confirmada en Ocho Hair Lab.\n\n📅 ${data.date}\n⏰ ${data.time}\n💇 Estilista: ${data.stylist}\n\nTe esperamos para transformar tu color. ¡Nos vemos pronto!`,
    
    corte: (data: TemplateData) => 
      `¡Hola ${data.customerName}! ✂️ Tu cita está confirmada en Ocho Hair Lab.\n\n📅 ${data.date}\n⏰ ${data.time}\n💇 Estilista: ${data.stylist}\n\nListos para darte el mejor look. ¡Te esperamos!`,
    
    bespoke: (data: TemplateData) => 
      `¡Hola ${data.customerName}! 🌟 Tu cita para ${data.service} está confirmada en Ocho Hair Lab.\n\n📅 ${data.date}\n⏰ ${data.time}\n💇 Estilista: ${data.stylist}\n\nPrepárate para una transformación única. Esta cita puede tomar varias horas. ¡Nos vemos!`,
    
    tratamiento: (data: TemplateData) => 
      `¡Hola ${data.customerName}! 💆 Tu cita para ${data.service} está confirmada en Ocho Hair Lab.\n\n📅 ${data.date}\n⏰ ${data.time}\n💇 Estilista: ${data.stylist}\n\nTu cabello merece el mejor cuidado. ¡Te esperamos!`,
    
    default: (data: TemplateData) => 
      `¡Hola ${data.customerName}! Confirmamos tu cita en Ocho Hair Lab.\n\n📅 ${data.date}\n⏰ ${data.time}\n💇 Estilista: ${data.stylist}\nServicio: ${data.service}\n\n¡Nos vemos pronto!`
  },

  reminder: {
    tinte: (data: TemplateData) => 
      `¡Hola ${data.customerName}! 💇 Recordatorio: Tu cita para ${data.service} es mañana.\n\n📅 ${data.date}\n⏰ ${data.time}\n💇 Estilista: ${data.stylist}\n\n💡 Tip: Llega con el cabello limpio y seco para mejores resultados.\n\nOcho Hair Lab te espera.`,
    
    corte: (data: TemplateData) => 
      `¡Hola ${data.customerName}! ✂️ Recordatorio: Tu cita está cerca.\n\n📅 ${data.date}\n⏰ ${data.time}\n💇 Estilista: ${data.stylist}\n\n¿Tienes alguna foto de inspiración? Tráela para compartir tu visión.\n\nNos vemos en Ocho Hair Lab.`,
    
    bespoke: (data: TemplateData) => 
      `¡Hola ${data.customerName}! 🌟 Recordatorio: Tu cita para ${data.service} está próxima.\n\n📅 ${data.date}\n⏰ ${data.time}\n💇 Estilista: ${data.stylist}\n\n⏱️ Esta transformación tomará tiempo. Por favor llega puntual y con disponibilidad de 3-5 horas.\n\nOcho Hair Lab`,
    
    tratamiento: (data: TemplateData) => 
      `¡Hola ${data.customerName}! 💆 Recordatorio: Tu tratamiento ${data.service} es mañana.\n\n📅 ${data.date}\n⏰ ${data.time}\n💇 Estilista: ${data.stylist}\n\n💡 Llega con el cabello recién lavado para optimizar la absorción del tratamiento.\n\nOcho Hair Lab`,
    
    default: (data: TemplateData) => 
      `¡Hola ${data.customerName}! Recordatorio de tu cita en Ocho Hair Lab.\n\n📅 ${data.date}\n⏰ ${data.time}\n💇 Estilista: ${data.stylist}\nServicio: ${data.service}\n\n¡Te esperamos!`
  },

  reschedule: {
    tinte: (data: TemplateData) => 
      `Hola ${data.customerName}, tu cita para ${data.service} ha sido reagendada.\n\n❌ Anterior: ${data.oldDate} a las ${data.oldTime}\n✅ Nueva: ${data.newDate} a las ${data.newTime}\n\nOcho Hair Lab`,
    
    corte: (data: TemplateData) => 
      `Hola ${data.customerName}, tu cita ha sido reagendada.\n\n❌ Anterior: ${data.oldDate} a las ${data.oldTime}\n✅ Nueva: ${data.newDate} a las ${data.newTime}\n\nOcho Hair Lab`,
    
    bespoke: (data: TemplateData) => 
      `Hola ${data.customerName}, tu cita para ${data.service} ha sido reagendada.\n\n❌ Anterior: ${data.oldDate} a las ${data.oldTime}\n✅ Nueva: ${data.newDate} a las ${data.newTime}\n\n⏱️ Recuerda: Esta cita requiere 3-5 horas.\n\nOcho Hair Lab`,
    
    tratamiento: (data: TemplateData) => 
      `Hola ${data.customerName}, tu tratamiento ${data.service} ha sido reagendado.\n\n❌ Anterior: ${data.oldDate} a las ${data.oldTime}\n✅ Nueva: ${data.newDate} a las ${data.newTime}\n\nOcho Hair Lab`,
    
    default: (data: TemplateData) => 
      `Hola ${data.customerName}, tu cita para ${data.service} ha sido reagendada.\n\n❌ Anterior: ${data.oldDate} a las ${data.oldTime}\n✅ Nueva: ${data.newDate} a las ${data.newTime}\n\nOcho Hair Lab`
  },

  cancellation: {
    tinte: (data: TemplateData) => 
      `Hola ${data.customerName}, tu cita para ${data.service} el ${data.date} a las ${data.time} ha sido cancelada.\n\nEsperamos verte pronto en Ocho Hair Lab. Para reservar nuevamente, visita nuestro sitio web.`,
    
    corte: (data: TemplateData) => 
      `Hola ${data.customerName}, tu cita el ${data.date} a las ${data.time} ha sido cancelada.\n\nEsperamos verte pronto en Ocho Hair Lab. Para reservar nuevamente, visita nuestro sitio web.`,
    
    bespoke: (data: TemplateData) => 
      `Hola ${data.customerName}, tu cita para ${data.service} el ${data.date} a las ${data.time} ha sido cancelada.\n\nCuando estés listo para tu transformación, estaremos aquí. Ocho Hair Lab.`,
    
    tratamiento: (data: TemplateData) => 
      `Hola ${data.customerName}, tu tratamiento ${data.service} el ${data.date} a las ${data.time} ha sido cancelado.\n\nTu cabello merece cuidado cuando estés listo. Ocho Hair Lab.`,
    
    default: (data: TemplateData) => 
      `Hola ${data.customerName}, tu cita para ${data.service} el ${data.date} a las ${data.time} ha sido cancelada.\n\nGracias por contactar a Ocho Hair Lab.`
  },

  staff: {
    newBooking: (data: TemplateData) => 
      `📅 Nueva Reserva\n\n👤 ${data.customerName}\n💇 ${data.service}\n📅 ${data.date}\n⏰ ${data.time}\n💼 Estilista: ${data.stylist}`,
    
    reminder: (data: TemplateData) => 
      `🔔 Recordatorio Enviado\n\n👤 ${data.customerName}\n💇 ${data.service}\n📅 ${data.date}\n⏰ ${data.time}\n💼 Estilista: ${data.stylist}`,
    
    reschedule: (data: TemplateData) => 
      `🔄 Cita Reagendada\n\n👤 ${data.customerName}\n💇 ${data.service}\n❌ De: ${data.oldDate} ${data.oldTime}\n✅ A: ${data.newDate} ${data.newTime}\n💼 Estilista: ${data.stylist}`,
    
    cancellation: (data: TemplateData) => 
      `❌ Cita Cancelada\n\n👤 ${data.customerName}\n💇 ${data.service}\n📅 ${data.date}\n⏰ ${data.time}\n💼 Estilista: ${data.stylist}`
  }
}

export function getServiceCategory(serviceName: string): ServiceCategory {
  const service = serviceName.toLowerCase()
  
  if (service.includes('tinte') || 
      service.includes('retoque') || 
      service.includes('full head') || 
      service.includes('amoniaco') || 
      service.includes('toner') || 
      service.includes('gloss')) {
    return 'tinte'
  }
  
  if (service.includes('corte') || 
      service.includes('secado') || 
      service.includes('waves') || 
      service.includes('peinado')) {
    return 'corte'
  }
  
  if (service.includes('balayage') || 
      service.includes('baby lights') || 
      service.includes('selfie contour')) {
    return 'bespoke'
  }
  
  if (service.includes('posion') || 
      service.includes('tratamiento') || 
      service.includes('treatment')) {
    return 'tratamiento'
  }
  
  return 'default'
}

function applyTemplate(template: string, data: TemplateData): string {
  return template
    .replace(/{CUSTOMER_NAME}/g, data.customerName)
    .replace(/{SERVICE}/g, data.service)
    .replace(/{DATE}/g, data.date)
    .replace(/{TIME}/g, data.time)
    .replace(/{STYLIST}/g, data.stylist || 'Our Team')
    .replace(/{OLD_DATE}/g, data.oldDate || '')
    .replace(/{OLD_TIME}/g, data.oldTime || '')
    .replace(/{NEW_DATE}/g, data.newDate || '')
    .replace(/{NEW_TIME}/g, data.newTime || '')
}

async function getCustomTemplate(
  messageType: MessageType,
  category: ServiceCategory
): Promise<string | null> {
  try {
    const customTemplates = await window.spark.kv.get<CustomTemplates>('sms-custom-templates')
    return customTemplates?.[messageType]?.[category] || null
  } catch {
    return null
  }
}

export async function getConfirmationMessage(data: TemplateData): Promise<string> {
  const category = getServiceCategory(data.service)
  const customTemplate = await getCustomTemplate('confirmation', category)
  
  if (customTemplate) {
    return applyTemplate(customTemplate, data)
  }
  
  return SMS_TEMPLATES.confirmation[category](data)
}

export async function getReminderMessage(data: TemplateData): Promise<string> {
  const category = getServiceCategory(data.service)
  const customTemplate = await getCustomTemplate('reminder', category)
  
  if (customTemplate) {
    return applyTemplate(customTemplate, data)
  }
  
  return SMS_TEMPLATES.reminder[category](data)
}

export async function getRescheduleMessage(data: TemplateData): Promise<string> {
  const category = getServiceCategory(data.service)
  const customTemplate = await getCustomTemplate('reschedule', category)
  
  if (customTemplate) {
    return applyTemplate(customTemplate, data)
  }
  
  return SMS_TEMPLATES.reschedule[category](data)
}

export async function getCancellationMessage(data: TemplateData): Promise<string> {
  const category = getServiceCategory(data.service)
  const customTemplate = await getCustomTemplate('cancellation', category)
  
  if (customTemplate) {
    return applyTemplate(customTemplate, data)
  }
  
  return SMS_TEMPLATES.cancellation[category](data)
}

export function getStaffNotificationMessage(
  type: 'newBooking' | 'reminder' | 'reschedule' | 'cancellation',
  data: TemplateData
): string {
  return SMS_TEMPLATES.staff[type](data)
}
