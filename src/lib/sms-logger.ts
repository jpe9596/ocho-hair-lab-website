import { api } from '@/hooks/useApiState'

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
  try {
    await api.post('/sms-logs', data)
  } catch (error) {
    console.error('Failed to log SMS message:', error)
  }
}

export async function updateSMSStatus(
  appointmentId: string, 
  status: "delivered" | "failed",
  failureReason?: string
): Promise<void> {
  // Note: This would require a custom endpoint to update SMS status
  // For now, we'll just log it
  console.log('SMS status update:', { appointmentId, status, failureReason })
}
