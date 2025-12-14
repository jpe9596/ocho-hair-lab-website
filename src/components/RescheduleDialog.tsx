import { useState, useEffect, useMemo } from "react"
import { useKV } from "@github/spark/hooks"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CalendarCheck, PaperPlaneTilt } from "@phosphor-icons/react"
import { sendRescheduleSMS, formatAppointmentDate } from "@/lib/notifications"
import { getAvailableTimeSlots, getAvailableStylistsForTime } from "@/lib/scheduling"
import { StaffSchedule } from "@/components/StaffSchedule"

interface Appointment {
  id: string
  name: string
  email: string
  phone: string
  service: string
  services?: string[]
  stylist: string
  date: Date
  time: string
  notes: string
  createdAt: Date
  confirmationSent?: boolean
  reminderSent?: boolean
}

interface RescheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: Appointment | null
}

const stylists = [
  "Maria Rodriguez",
  "Jessica Chen",
  "Alex Thompson",
  "Sophia Martinez"
]

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
]

export function RescheduleDialog({ open, onOpenChange, appointment }: RescheduleDialogProps) {
  const [appointments, setAppointments] = useKV<Appointment[]>("appointments", [])
  const [schedules] = useKV<StaffSchedule[]>("staff-schedules", [])
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState("")
  const [stylist, setStylist] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (appointment && open) {
      setDate(new Date(appointment.date))
      setTime(appointment.time)
      setStylist(appointment.stylist)
      setNotes(appointment.notes)
    }
  }, [appointment, open])

  const availableTimeSlots = useMemo(() => {
    if (!date || !stylist || !schedules || !appointment) return timeSlots
    
    if (stylist === "Any Available") {
      const allAvailableSlots = new Set<string>()
      stylists.forEach(s => {
        const otherAppointments = (appointments || []).filter(apt => apt.id !== appointment.id)
        const slots = getAvailableTimeSlots(date, s, schedules, otherAppointments)
        slots.forEach(slot => allAvailableSlots.add(slot))
      })
      return Array.from(allAvailableSlots).sort((a, b) => {
        const parseTime = (time: string) => {
          const [t, period] = time.split(' ')
          let [hours, mins] = t.split(':').map(Number)
          if (period === 'PM' && hours !== 12) hours += 12
          if (period === 'AM' && hours === 12) hours = 0
          return hours * 60 + mins
        }
        return parseTime(a) - parseTime(b)
      })
    }
    
    const otherAppointments = (appointments || []).filter(apt => apt.id !== appointment.id)
    return getAvailableTimeSlots(date, stylist, schedules, otherAppointments)
  }, [date, stylist, schedules, appointments, appointment])

  const availableStylists = useMemo(() => {
    if (!date || !time || !schedules || !appointment) return stylists
    
    const otherAppointments = (appointments || []).filter(apt => apt.id !== appointment.id)
    return getAvailableStylistsForTime(date, time, schedules, otherAppointments)
  }, [date, time, schedules, appointments, appointment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date || !time || !appointment) {
      toast.error("Please select a new date and time")
      return
    }

    const originalDate = new Date(appointment.date)
    const originalTime = appointment.time

    if (
      date.getTime() === originalDate.getTime() &&
      time === originalTime &&
      stylist === appointment.stylist &&
      notes === appointment.notes
    ) {
      toast.error("No changes made", {
        description: "Please select a different date, time, or stylist to reschedule."
      })
      return
    }

    let finalStylist = stylist || "Any Available"
    
    if (finalStylist === "Any Available" && schedules && schedules.length > 0) {
      const otherAppointments = (appointments || []).filter(apt => apt.id !== appointment.id)
      const available = getAvailableStylistsForTime(date, time, schedules, otherAppointments)
      if (available.length > 0) {
        finalStylist = available[0]
      }
    }

    if (stylist && stylist !== "Any Available" && schedules) {
      const otherAppointments = (appointments || []).filter(apt => apt.id !== appointment.id)
      const availableStylists = getAvailableStylistsForTime(date, time, schedules, otherAppointments)
      if (!availableStylists.includes(stylist)) {
        toast.error(`${stylist} is not available at ${time}. Please choose a different time.`)
        return
      }
    }

    setIsSubmitting(true)

    const updatedAppointment: Appointment = {
      ...appointment,
      date: date,
      time: time,
      stylist: finalStylist,
      notes: notes,
      reminderSent: false
    }

    setAppointments((current) =>
      (current || []).map(apt => apt.id === appointment.id ? updatedAppointment : apt)
    )

    try {
      await sendRescheduleSMS({
        to: appointment.phone,
        customerName: appointment.name,
        service: appointment.service,
        oldDate: formatAppointmentDate(originalDate),
        oldTime: originalTime,
        newDate: formatAppointmentDate(date),
        newTime: time
      })

      toast.success("Appointment Rescheduled!", {
        description: `Your appointment has been moved to ${formatAppointmentDate(date)} at ${time}.`,
        icon: <PaperPlaneTilt size={20} weight="fill" />
      })
    } catch (error) {
      toast.success("Appointment Rescheduled!", {
        description: `Your appointment has been moved to ${formatAppointmentDate(date)} at ${time}.`,
        icon: <CalendarCheck size={20} weight="bold" />
      })
    }

    setIsSubmitting(false)
    onOpenChange(false)
  }

  if (!appointment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Reschedule Appointment
          </DialogTitle>
          <DialogDescription>
            Update your {appointment.service} appointment details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">Current Appointment</h3>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p><span className="font-medium text-foreground">Date:</span> {formatAppointmentDate(new Date(appointment.date))}</p>
              <p><span className="font-medium text-foreground">Time:</span> {appointment.time}</p>
              <p><span className="font-medium text-foreground">Stylist:</span> {appointment.stylist}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>New Date *</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate)
                setTime("")
              }}
              disabled={(checkDate) => {
                if (checkDate < new Date()) return true
                if (checkDate.getDay() === 0) return true
                
                if (!schedules || schedules.length === 0) return false
                
                const dateStr = checkDate.toISOString().split('T')[0]
                const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' })
                
                const anyOneWorking = schedules.some(schedule => {
                  const isBlocked = schedule.blockedDates.includes(dateStr)
                  const daySchedule = schedule.workingHours[dayName]
                  const isWorking = daySchedule && daySchedule.isWorking
                  return !isBlocked && isWorking
                })
                
                return !anyOneWorking
              }}
              className="rounded-md border"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reschedule-time">New Time *</Label>
              <Select 
                value={time} 
                onValueChange={setTime}
                disabled={!date}
              >
                <SelectTrigger id="reschedule-time">
                  <SelectValue placeholder={date ? "Select a time" : "Select a date first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableTimeSlots.length === 0 && date && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No times available for this date
                    </div>
                  )}
                  {availableTimeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reschedule-stylist">Preferred Stylist</Label>
              <Select 
                value={stylist} 
                onValueChange={(value) => {
                  setStylist(value)
                  setTime("")
                }}
              >
                <SelectTrigger id="reschedule-stylist">
                  <SelectValue placeholder="Any available" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any Available">Any Available</SelectItem>
                  {stylists.map((s) => {
                    const isAvailable = !date || !time || availableStylists.includes(s)
                    return (
                      <SelectItem key={s} value={s} disabled={!isAvailable}>
                        <div className="flex items-center justify-between w-full">
                          {s}
                          {date && time && !isAvailable && (
                            <Badge variant="secondary" className="ml-2 text-xs">Unavailable</Badge>
                          )}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reschedule-notes">Additional Notes</Label>
            <Textarea
              id="reschedule-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific requests or information we should know?"
              rows={3}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1" 
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Confirm Reschedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
