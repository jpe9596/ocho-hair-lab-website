interface SMSLog {
  id: string
  appointmentId: string
  to: string
  message: string
  type: "confirmation" | "reminder" | "custom"
  templateName?: string
  status: "sent" | "delivered" | "failed" | "pending"
  sentAt: Date
  deliveredAt?: Date
  failureReason?: string
  customerName: string
  customerEmail: string
  serviceName: string
}

export async function logSMSMessage(data: {
  appointmentId: string
  to: string
  message: string
  type: "confirmation" | "reminder" | "custom"
  templateName?: string
  status: "sent" | "delivered" | "failed" | "pending"
  failureReason?: string
  customerName: string
  customerEmail: string
  serviceName: string
}): Promise<void> {
  const logs = await window.spark.kv.get<SMSLog[]>("sms-logs") || []
  
  const newLog: SMSLog = {
    id: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    appointmentId: data.appointmentId,
    to: data.to,
    message: data.message,
    type: data.type,
    templateName: data.templateName,
    status: data.status,
    sentAt: new Date(),
    failureReason: data.failureReason,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    serviceName: data.serviceName
  }
  
  logs.push(newLog)
  await window.spark.kv.set("sms-logs", logs)
}

export async function updateSMSStatus(
  appointmentId: string, 
  status: "delivered" | "failed",
  failureReason?: string
): Promise<void> {
  const logs = await window.spark.kv.get<SMSLog[]>("sms-logs") || []
  
  const logIndex = logs.findIndex(log => 
    log.appointmentId === appointmentId && 
    log.status === "sent"
  )
  
  if (logIndex !== -1) {
    logs[logIndex].status = status
    if (status === "delivered") {
      logs[logIndex].deliveredAt = new Date()
    }
    if (failureReason) {
      logs[logIndex].failureReason = failureReason
    }
    await window.spark.kv.set("sms-logs", logs)
  }
}
