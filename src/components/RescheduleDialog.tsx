import { useState, useEffect } from "react"
import { useKV } from "@github/spark/hooks"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import { CalendarCheck, PaperPlaneTilt } from "@phosphor-icons/react"
import { sendRescheduleSMS, formatAppointmentDate } from "@/lib/notifications"

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
}

interface RescheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: Appointment | null
}

const stylists = [
  "Any Available",
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

    setIsSubmitting(true)

    const updatedAppointment: Appointment = {
      ...appointment,
      date: date,
      time: time,
      stylist: stylist || "Any Available",
      notes: notes
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
              onSelect={setDate}
              disabled={(date) => date < new Date() || date.getDay() === 0}
              className="rounded-md border"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reschedule-time">New Time *</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger id="reschedule-time">
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reschedule-stylist">Preferred Stylist</Label>
              <Select value={stylist} onValueChange={setStylist}>
                <SelectTrigger id="reschedule-stylist">
                  <SelectValue placeholder="Any available" />
                </SelectTrigger>
                <SelectContent>
                  {stylists.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
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
