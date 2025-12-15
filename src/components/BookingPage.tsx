import { useState, useMemo } from "react"
import { useKV } from "@github/spark/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Check, PaperPlaneTilt } from "@phosphor-icons/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { WeekCalendar } from "@/components/WeekCalendar"
import { toast } from "sonner"
import { sendBookingConfirmation } from "@/lib/reminder-system"
import { formatAppointmentDate } from "@/lib/notifications"
import { getAvailableTimeSlots, getAvailableStylistsForTime } from "@/lib/scheduling"
import { StaffSchedule } from "@/components/StaffSchedule"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Appointment {
  id: string
  name: string
  email: string
  phone: string
  password: string
  service: string
  services: string[]
  stylist: string
  date: Date
  time: string
  notes: string
  createdAt: Date
  confirmationSent?: boolean
  reminderSent?: boolean
}

interface CustomerAccount {
  email: string
  password: string
  name: string
  phone: string
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

export function BookingPage() {
  const [appointments, setAppointments] = useKV<Appointment[]>("appointments", [])
  const [customerAccounts, setCustomerAccounts] = useKV<CustomerAccount[]>("customer-accounts", [])
  const [schedules] = useKV<StaffSchedule[]>("staff-schedules", [])
  const [date, setDate] = useState<Date>()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
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

    if (!date || !formData.name || !formData.email || !formData.phone || !formData.password || formData.services.length === 0 || !formData.time) {
      toast.error("Please fill in all required fields and select at least one service")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    let finalStylist = formData.stylist || "Any Available"
    
    if (finalStylist === "Any Available" && schedules && schedules.length > 0) {
      const available = getAvailableStylistsForTime(date, formData.time, schedules, appointments || [])
      if (available.length > 0) {
        finalStylist = available[0]
      }
    }

    setIsSubmitting(true)

    try {
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        service: formData.services[0],
        services: formData.services,
        stylist: finalStylist,
        date,
        time: formData.time,
        notes: formData.notes,
        createdAt: new Date(),
        confirmationSent: false,
        reminderSent: false
      }

      setAppointments((current) => [...(current || []), newAppointment])

      const existingAccount = customerAccounts?.find(
        acc => acc.email?.toLowerCase().trim() === formData.email.toLowerCase().trim()
      )
      
      if (!existingAccount) {
        const newAccount: CustomerAccount = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone
        }
        setCustomerAccounts((current) => [...(current || []), newAccount])
      }

      try {
        await sendBookingConfirmation({
          to: newAppointment.phone,
          customerName: newAppointment.name,
          customerEmail: newAppointment.email,
          service: newAppointment.services.join(", "),
          date: formatAppointmentDate(newAppointment.date),
          time: newAppointment.time,
          stylist: newAppointment.stylist,
          appointmentId: newAppointment.id
        })
        toast.success("Appointment booked successfully! Check your WhatsApp for confirmation.", {
          duration: 5000,
          icon: <Check size={20} weight="bold" />
        })
      } catch (error) {
        console.error("Failed to send confirmation:", error)
        toast.success("Appointment booked successfully!", {
          duration: 5000,
          icon: <Check size={20} weight="bold" />
        })
      }

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        service: "",
        services: [],
        stylist: "",
        time: "",
        notes: ""
      })
      setDate(undefined)
      
      setTimeout(() => {
        window.location.hash = ""
      }, 2000)

    } catch (error) {
      toast.error("Failed to book appointment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleService = (serviceName: string) => {
    setFormData(prev => {
      const services = prev.services.includes(serviceName)
        ? prev.services.filter(s => s !== serviceName)
        : [...prev.services, serviceName]
      return { ...prev, services, service: services[0] || "" }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-muted to-card py-12 px-6">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, oklch(0.15 0 0 / 0.03) 35px, oklch(0.15 0 0 / 0.03) 70px)`
      }} />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => {
            window.location.hash = ""
          }}
          className="mb-6"
        >
          <ArrowLeft className="mr-2" size={20} />
          Home
        </Button>

        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Book Your Appointment
            </CardTitle>
            <CardDescription className="text-base">
              Fill out the form below to schedule your visit
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Mexico) *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="81 1615 3747"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  We'll send appointment confirmations to WhatsApp: +521 {formData.phone || "XXXXXXXXXX"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password (min. 6 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Use this password to login and manage your appointments
                </p>
              </div>

              <div className="space-y-3">
                <Label>Services * (Select one or more)</Label>
                <ScrollArea className="h-64 rounded-lg border border-input p-4">
                  {serviceCategories.map((category) => (
                    <div key={category.name} className="mb-6 last:mb-0">
                      <h3 className="font-semibold text-sm text-muted-foreground mb-3">{category.name}</h3>
                      <div className="space-y-3">
                        {category.items.map((service) => (
                          <div key={service} className="flex items-center space-x-3">
                            <Checkbox
                              id={service}
                              checked={formData.services.includes(service)}
                              onCheckedChange={() => toggleService(service)}
                            />
                            <label
                              htmlFor={service}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {service}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
                {formData.services.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.services.map(service => (
                      <Badge key={service} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stylist">Preferred Stylist</Label>
                <Select value={formData.stylist} onValueChange={(value) => setFormData({ ...formData, stylist: value, time: "" })}>
                  <SelectTrigger id="stylist">
                    <SelectValue placeholder="Any Available" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any Available">Any Available</SelectItem>
                    {stylists.map((stylist) => (
                      <SelectItem key={stylist} value={stylist}>{stylist}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Date *</Label>
                <WeekCalendar
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </div>

              {date && formData.stylist && (
                <div className="space-y-2">
                  <Label htmlFor="time">Select Time *</Label>
                  <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
                    <SelectTrigger id="time">
                      <SelectValue placeholder="Choose a time" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimeSlots.length > 0 ? (
                        availableTimeSlots.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-slots" disabled>No available slots</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests or information we should know..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Booking..."
                ) : (
                  <>
                    <PaperPlaneTilt className="mr-2" size={20} weight="fill" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
