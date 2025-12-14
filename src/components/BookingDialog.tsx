import { useState } from "react"
import { useKV } from "@github/spark/hooks"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import { Check, PaperPlaneTilt } from "@phosphor-icons/react"
import { sendBookingConfirmation } from "@/lib/reminder-system"
import { formatAppointmentDate } from "@/lib/notifications"

interface BookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

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

const services = [
  "Precision Cuts",
  "Color Services",
  "Balayage & Highlights",
  "Deep Conditioning",
  "Blowout Styling",
  "Keratin Treatment"
]

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

export function BookingDialog({ open, onOpenChange }: BookingDialogProps) {
  const [appointments, setAppointments] = useKV<Appointment[]>("appointments", [])
  const [date, setDate] = useState<Date>()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    stylist: "",
    time: "",
    notes: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date || !formData.name || !formData.email || !formData.phone || !formData.service || !formData.time) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      service: formData.service,
      stylist: formData.stylist || "Any Available",
      date: date,
      time: formData.time,
      notes: formData.notes,
      createdAt: new Date()
    }

    setAppointments((current) => [...(current || []), newAppointment])

    try {
      await sendBookingConfirmation({
        to: formData.phone,
        customerName: formData.name,
        service: formData.service,
        date: formatAppointmentDate(date),
        time: formData.time,
        stylist: formData.stylist || "Any Available"
      })

      toast.success("Appointment Confirmed!", {
        description: `Confirmation sent via SMS. You'll receive a reminder 8 hours before your appointment on ${formatAppointmentDate(date)} at ${formData.time}!`,
        icon: <PaperPlaneTilt size={20} weight="fill" />,
        action: {
          label: "View",
          onClick: () => window.location.hash = "#profile"
        }
      })
    } catch (error) {
      toast.success("Appointment Booked!", {
        description: `Your ${formData.service} appointment is scheduled. You'll receive a reminder 8 hours before.`,
        icon: <Check size={20} weight="bold" />,
        action: {
          label: "View",
          onClick: () => window.location.hash = "#profile"
        }
      })
    }

    setFormData({
      name: "",
      email: "",
      phone: "",
      service: "",
      stylist: "",
      time: "",
      notes: ""
    })
    setDate(undefined)
    setIsSubmitting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Book Your Appointment
          </DialogTitle>
          <DialogDescription>
            Fill out the form below to book your appointment. You'll receive an immediate confirmation and a reminder 8 hours before your appointment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jane Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jane@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service">Service *</Label>
              <Select value={formData.service} onValueChange={(value) => setFormData({ ...formData, service: value })}>
                <SelectTrigger id="service">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stylist">Preferred Stylist</Label>
              <Select value={formData.stylist} onValueChange={(value) => setFormData({ ...formData, stylist: value })}>
                <SelectTrigger id="stylist">
                  <SelectValue placeholder="Any available" />
                </SelectTrigger>
                <SelectContent>
                  {stylists.map((stylist) => (
                    <SelectItem key={stylist} value={stylist}>
                      {stylist}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preferred Date *</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date() || date.getDay() === 0}
              className="rounded-md border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Preferred Time *</Label>
            <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
              <SelectTrigger id="time">
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any specific requests or information we should know?"
              rows={3}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Request Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
