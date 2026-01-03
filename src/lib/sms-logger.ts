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
  // TODO: Implement SMS status update endpoint
  // For now, log the status change. In production, you would:
  // 1. Add a PUT endpoint: /api/sms-logs/:appointmentId/status
  // 2. Update the database record
  // 3. Call: await api.put(`/sms-logs/${appointmentId}/status`, { status, failureReason })
  console.log('SMS status update (not persisted):', { appointmentId, status, failureReason })
}
