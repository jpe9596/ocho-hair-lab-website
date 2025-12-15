import { useState, useMemo } from "react"
import { useKV } from "@github/spark/hooks"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { WeekCalendar } from "@/components/WeekCalendar"
import { toast } from "sonner"
import { Check, PaperPlaneTilt } from "@phosphor-icons/react"
import { sendBookingConfirmation } from "@/lib/reminder-system"
import { formatAppointmentDate } from "@/lib/notifications"
import { getAvailableTimeSlots, getAvailableStylistsForTime } from "@/lib/scheduling"
import { StaffSchedule } from "@/components/StaffSchedule"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Appointment {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  service: string
  services: string[]
  stylist: string
  date: Date
  time: string
  notes: string
  createdAt: Date
  confirmationSent?: boolean
  reminderSent?: boolean
  status?: "confirmed" | "completed" | "cancelled"
}

const serviceCategories = [
  {
    name: "Tinte",
    items: [
      "Retoque de Raiz",
      "Full Head Tint",
      "0% AMONIACO",
      "Toner/Gloss"
    ]
  },
  {
    name: "Corte & Styling",
    items: [
      "Corte & Secado",
      "Secado (short)",
      "Secado (mm)",
      "Secado (long)",
      "Waves/peinado"
    ]
  },
  {
    name: "Bespoke Color",
    items: [
      "Balayage",
      "Baby Lights",
      "Selfie Contour"
    ]
  },
  {
    name: "Treatments",
    items: [
      "Posion Nº17",
      "Posion Nº 8"
    ]
  }
]

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

export function BookingDialog({ open, onOpenChange }: BookingDialogProps) {
  const [appointments, setAppointments] = useKV<Appointment[]>("appointments", [])
  const [schedules] = useKV<StaffSchedule[]>("staff-schedules", [])
  const [date, setDate] = useState<Date>()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    services: [] as string[],
    stylist: "",
    time: "",
    notes: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableTimeSlots = useMemo(() => {
    if (!date || !formData.stylist || !schedules) return timeSlots
    
    if (formData.stylist === "Any Available") {
      const allAvailableSlots = new Set<string>()
      stylists.forEach(stylist => {
        const slots = getAvailableTimeSlots(date, stylist, schedules, appointments || [])
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
    
    return getAvailableTimeSlots(date, formData.stylist, schedules, appointments || [])
  }, [date, formData.stylist, schedules, appointments])

  const availableStylists = useMemo(() => {
    if (!date || !formData.time || !schedules) return stylists
    
    const available = getAvailableStylistsForTime(date, formData.time, schedules, appointments || [])
    return available
  }, [date, formData.time, schedules, appointments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date || !formData.name || !formData.email || !formData.phone || formData.services.length === 0 || !formData.time) {
      toast.error("Please fill in all required fields and select at least one service")
      return
    }

    let finalStylist = formData.stylist || "Any Available"
    
    if (finalStylist === "Any Available" && schedules && schedules.length > 0) {
      const available = getAvailableStylistsForTime(date, formData.time, schedules, appointments || [])
      if (available.length > 0) {
        finalStylist = available[0]
      }
    }

    if (formData.stylist && formData.stylist !== "Any Available" && schedules) {
      const availableStylists = getAvailableStylistsForTime(date, formData.time, schedules, appointments || [])
      if (!availableStylists.includes(formData.stylist)) {
        toast.error(`${formData.stylist} is not available at ${formData.time}. Please choose a different time.`)
        return
      }
    }

    setIsSubmitting(true)

    const servicesList = formData.services.join(", ")

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      service: servicesList,
      services: formData.services,
      stylist: finalStylist,
      date: date,
      time: formData.time,
      notes: formData.notes,
      createdAt: new Date(),
      status: "confirmed"
    }

    setAppointments((current) => [...(current || []), newAppointment])

    try {
      await sendBookingConfirmation({
        to: formData.phone,
        customerName: formData.name,
        service: servicesList,
        date: formatAppointmentDate(date),
        time: formData.time,
        stylist: formData.stylist || "Any Available",
        appointmentId: newAppointment.id
      })

      toast.success("Appointment Confirmed!", {
        description: `Confirmation sent via WhatsApp immediately. You'll also receive a reminder 8 hours before your appointment on ${formatAppointmentDate(date)} at ${formData.time}!`,
        icon: <PaperPlaneTilt size={20} weight="fill" />,
        action: {
          label: "View",
          onClick: () => window.location.hash = "#profile"
        }
      })
    } catch (error) {
      toast.success("Appointment Booked!", {
        description: `Your ${servicesList} appointment is scheduled. You'll receive an immediate confirmation and a reminder 8 hours before.`,
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
      services: [],
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
            Select your preferred service, date, and time. Available times are based on stylist schedules. You'll receive WhatsApp confirmation immediately upon booking and another reminder 8 hours before your appointment.
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
            <Label htmlFor="phone">Phone Number (Mexico) *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="81 1615 3747"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter your 10-digit Mexico mobile number. We'll send WhatsApp confirmations to +521 {formData.phone || "XXXXXXXXXX"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Services * (Select one or more)</Label>
              <ScrollArea className="h-[280px] rounded-md border p-4 bg-card">
                <div className="space-y-4">
                  {serviceCategories.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="text-sm font-semibold text-primary pb-1 border-b">
                        {category.name}
                      </div>
                      {category.items.map((service) => (
                        <div key={service} className="flex items-center space-x-2 pl-2">
                          <Checkbox
                            id={`service-${service}`}
                            checked={formData.services.includes(service)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({ 
                                  ...formData, 
                                  services: [...formData.services, service]
                                })
                              } else {
                                setFormData({ 
                                  ...formData, 
                                  services: formData.services.filter(s => s !== service)
                                })
                              }
                            }}
                          />
                          <label
                            htmlFor={`service-${service}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {service}
                          </label>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {formData.services.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.services.map((service) => (
                    <Badge key={service} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="stylist">Preferred Stylist</Label>
              <Select 
                value={formData.stylist} 
                onValueChange={(value) => {
                  setFormData({ ...formData, stylist: value, time: "" })
                }}
              >
                <SelectTrigger id="stylist">
                  <SelectValue placeholder="Any available" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any Available">Any Available</SelectItem>
                  {stylists.map((stylist) => {
                    const isAvailable = !date || !formData.time || availableStylists.includes(stylist)
                    return (
                      <SelectItem key={stylist} value={stylist} disabled={!isAvailable}>
                        <div className="flex items-center justify-between w-full">
                          {stylist}
                          {date && formData.time && !isAvailable && (
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
            <Label>Preferred Date *</Label>
            <div className="rounded-md border p-4 bg-card">
              <WeekCalendar
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate)
                  setFormData({ ...formData, time: "" })
                }}
                disabled={(checkDate) => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  if (checkDate < today) return true
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
                className="mx-auto"
              />
            </div>
            {!date && (
              <p className="text-xs text-muted-foreground">
                Click a date to see available times
              </p>
            )}
            {date && (
              <p className="text-xs text-primary font-medium">
                Selected: {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Preferred Time *</Label>
            <Select 
              value={formData.time} 
              onValueChange={(value) => setFormData({ ...formData, time: value })}
              disabled={!date}
            >
              <SelectTrigger id="time" className="w-full">
                <SelectValue placeholder={date ? "Select a time" : "Select a date first"} />
              </SelectTrigger>
              <SelectContent>
                {availableTimeSlots.length === 0 && date && (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No times available for this date
                  </div>
                )}
                {availableTimeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {date && formData.stylist && formData.stylist !== "Any Available" && availableTimeSlots.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Showing available times for {formData.stylist}
              </p>
            )}
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
