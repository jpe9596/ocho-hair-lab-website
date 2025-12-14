import { useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { checkAndSendReminders } from '@/lib/reminder-system'
import { toast } from 'sonner'
import { Bell } from '@phosphor-icons/react'

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
  reminderSent?: boolean
}

const CHECK_INTERVAL = 60 * 60 * 1000

export function useAppointmentReminders() {
  const [appointments, setAppointments] = useKV<Appointment[]>('appointments', [])
  const intervalRef = useRef<number | null>(null)
  const lastCheckRef = useRef<Date | null>(null)

  useEffect(() => {
    const checkReminders = async () => {
      if (!appointments || appointments.length === 0) {
        return
      }

      const now = new Date()
      if (lastCheckRef.current) {
        const timeSinceLastCheck = now.getTime() - lastCheckRef.current.getTime()
        if (timeSinceLastCheck < 30 * 60 * 1000) {
          return
        }
      }

      lastCheckRef.current = now

      await checkAndSendReminders(appointments, (appointmentId) => {
        setAppointments((currentAppointments) =>
          (currentAppointments || []).map((apt) =>
            apt.id === appointmentId ? { ...apt, reminderSent: true } : apt
          )
        )

        const appointment = appointments.find(apt => apt.id === appointmentId)
        if (appointment) {
          const iconElement = Bell({ size: 20, weight: "fill" })
          toast.success('Reminder Sent', {
            description: `24-hour reminder sent to ${appointment.name} for ${appointment.service}`,
            icon: iconElement
          })
        }
      })
    }

    checkReminders()

    intervalRef.current = window.setInterval(checkReminders, CHECK_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [appointments, setAppointments])

  return { appointments }
}
