import { useState, useMemo, useEffect } from "react"
import { useKV } from "@/hooks/spark-compat"
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
import { DiagnosticPanel } from "@/components/DiagnosticPanel"
import type { Service } from "@/components/ServicesManagement"

interface Appointment {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  password: string
  service: string
  services: string[]
  serviceDurations?: Record<string, number>
  stylist: string
  date: Date
  time: string
  notes: string
  createdAt: Date
  confirmationSent?: boolean
  reminderSent?: boolean
  status: "confirmed" | "completed" | "cancelled"
}

interface CustomerAccount {
  email: string
  password: string
  name: string
  phone: string
}

interface StaffMember {
  username: string
  password: string
  name: string
  role: string
  isAdmin: boolean
  availableServices?: string[]
}

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
]

export function BookingPage() {
  const [appointments, setAppointments] = useKV<Appointment[]>("appointments", [])
  const [customerAccounts, setCustomerAccounts] = useKV<CustomerAccount[]>("customer-accounts", [])
  const [schedules] = useKV<StaffSchedule[]>("staff-schedules", [])
  const [staffMembers] = useKV<StaffMember[]>("staff-members", [])
  const [services] = useKV<Service[]>("salon-services", [])
  const [date, setDate] = useState<Date>()
  const [loggedInEmail, setLoggedInEmail] = useState<string>("")
  const [loggedInAccount, setLoggedInAccount] = useState<CustomerAccount | null>(null)
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
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  const stylistNames = useMemo(() => {
    console.log('📆 BookingPage.stylistNames - Computing...')
    if (!staffMembers || staffMembers.length === 0) {
      console.log('📆 BookingPage.stylistNames - No staff members available')
      return []
    }
    const nonAdminStaff = staffMembers.filter(s => !s.isAdmin)
    console.log('📆 BookingPage.stylistNames - Non-admin staff:', nonAdminStaff.length)
    nonAdminStaff.forEach(s => {
      console.log(`   - ${s.name} (${s.username}): ${s.availableServices?.length || 0} services`)
    })
    const names = nonAdminStaff.map(s => s.name)
    console.log('📆 BookingPage.stylistNames - Names array:', names)
    return names
  }, [staffMembers])

  useEffect(() => {
    console.log('📆 BookingPage.useEffect - Data loaded')
    console.log('   - staffMembers:', staffMembers?.length || 0, 'members')
    console.log('   - services:', services?.length || 0, 'services')
    console.log('   - stylistNames:', stylistNames.length, 'names')
    if (staffMembers && staffMembers.length > 0) {
      staffMembers.forEach(staff => {
        if (!staff.isAdmin) {
          console.log(`   - ${staff.name} (${staff.username}): ${staff.availableServices?.length || 0} services`)
        }
      })
    }
  }, [staffMembers, stylistNames, services])

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('customerEmail')
    if (storedEmail && customerAccounts) {
      const account = customerAccounts.find(acc => acc.email?.toLowerCase().trim() === storedEmail.toLowerCase().trim())
      if (account) {
        setLoggedInEmail(storedEmail)
        setLoggedInAccount(account)
        setFormData(prev => ({
          ...prev,
          name: account.name,
          email: account.email,
          phone: account.phone,
          password: account.password
        }))
        console.log('BookingPage: Logged in user detected:', account.email)
      } else {
        console.log('BookingPage: Email in session but no account found:', storedEmail)
      }
    } else {
      console.log('BookingPage: No logged in user detected')
    }
  }, [customerAccounts])

  const availableTimeSlots = useMemo(() => {
    if (!date || !formData.stylist || !schedules) {
      return []
    }
    
    return getAvailableTimeSlots(date, formData.stylist, schedules, appointments || [])
  }, [date, formData.stylist, schedules, appointments, stylistNames])

  const availableStylists = useMemo(() => {
    if (!date || !formData.time || !schedules) return stylistNames
    
    const available = getAvailableStylistsForTime(date, formData.time, schedules, appointments || [])
    return available
  }, [date, formData.time, schedules, appointments, stylistNames])

  const serviceCategories = useMemo(() => {
    if (!services || services.length === 0) return []
    
    const categories = services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = []
      }
      acc[service.category].push(service.name)
      return acc
    }, {} as Record<string, string[]>)

    return Object.entries(categories).map(([name, items]) => ({
      name,
      items
    }))
  }, [services])

  const availableServices = useMemo(() => {
    if (!formData.stylist || formData.stylist === "Any Available" || !staffMembers) {
      console.log('📆 BookingPage: Showing all service categories (no specific stylist selected)')
      return serviceCategories
    }

    const staff = staffMembers.find(s => s.name === formData.stylist)
    if (!staff || !staff.availableServices || staff.availableServices.length === 0) {
      console.log('📆 BookingPage: Staff member not found or has no services, showing all categories')
      return serviceCategories
    }

    console.log(`📆 BookingPage: Filtering services for ${formData.stylist}, they offer ${staff.availableServices.length} services`)
    const filteredCategories = serviceCategories.map(category => ({
      ...category,
      items: category.items.filter(item => staff.availableServices!.includes(item))
    })).filter(category => category.items.length > 0)

    console.log(`📆 BookingPage: Filtered to ${filteredCategories.length} categories with services`)
    return filteredCategories
  }, [formData.stylist, staffMembers, serviceCategories])

  useEffect(() => {
    if (formData.stylist && formData.stylist !== "Any Available" && staffMembers) {
      const staff = staffMembers.find(s => s.name === formData.stylist)
      if (staff && staff.availableServices && staff.availableServices.length > 0) {
        const validServices = formData.services.filter(service => 
          staff.availableServices!.includes(service)
        )
        if (validServices.length !== formData.services.length) {
          setFormData(prev => ({
            ...prev,
            services: validServices,
            service: validServices[0] || ""
          }))
        }
      }
    }
  }, [formData.stylist, staffMembers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!loggedInAccount) {
      if (!date || !formData.name || !formData.email || !formData.phone || !formData.password || formData.services.length === 0 || !formData.time) {
        toast.error("Please fill in all required fields and select at least one service")
        return
      }

      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters long")
        return
      }
    } else {
      if (!date || formData.services.length === 0 || !formData.time) {
        toast.error("Please select date, time, and at least one service")
        return
      }
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
      const customerName = loggedInAccount ? loggedInAccount.name : formData.name
      const customerEmail = loggedInAccount ? loggedInAccount.email : formData.email
      const customerPhone = loggedInAccount ? loggedInAccount.phone : formData.phone
      const customerPassword = loggedInAccount ? loggedInAccount.password : formData.password
      const normalizedEmail = customerEmail.toLowerCase().trim()

      const serviceDurations: Record<string, number> = {}
      formData.services.forEach(serviceName => {
        const service = services?.find(s => s.name === serviceName)
        if (service) {
          serviceDurations[serviceName] = service.duration
        }
      })

      const newAppointment: Appointment = {
        id: Date.now().toString(),
        customerName,
        customerEmail: normalizedEmail,
        customerPhone,
        password: customerPassword,
        service: formData.services[0],
        services: formData.services,
        serviceDurations,
        stylist: finalStylist,
        date,
        time: formData.time,
        notes: formData.notes,
        createdAt: new Date(),
        confirmationSent: false,
        reminderSent: false,
        status: "confirmed"
      }

      await new Promise<void>((resolve) => {
        setAppointments((current) => {
          const updated = [...(current || []), newAppointment]
          console.log('Saving appointment for email:', normalizedEmail)
          console.log('Total appointments after save:', updated.length)
          console.log('New appointment:', newAppointment)
          setTimeout(resolve, 500)
          return updated
        })
      })

      console.log('Appointment saved, waiting for KV sync...')
      await new Promise(resolve => setTimeout(resolve, 300))

      if (!loggedInAccount) {
        const existingAccount = customerAccounts?.find(
          acc => acc.email?.toLowerCase().trim() === normalizedEmail
        )
        
        if (!existingAccount) {
          const newAccount: CustomerAccount = {
            email: normalizedEmail,
            password: formData.password,
            name: formData.name,
            phone: formData.phone
          }
          await new Promise<void>((resolve) => {
            setCustomerAccounts((current) => {
              const updated = [...(current || []), newAccount]
              console.log('Creating new account for:', normalizedEmail)
              console.log('Total accounts after save:', updated.length)
              setTimeout(resolve, 200)
              return updated
            })
          })
        } else {
          console.log('Existing account found for:', normalizedEmail)
        }
      }

      try {
        await sendBookingConfirmation({
          to: newAppointment.customerPhone,
          customerName: newAppointment.customerName,
          customerEmail: newAppointment.customerEmail,
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

      if (loggedInAccount) {
        sessionStorage.setItem('customerEmail', loggedInAccount.email.toLowerCase().trim())
        
        setFormData(prev => ({
          ...prev,
          service: "",
          services: [],
          stylist: "",
          time: "",
          notes: ""
        }))
        setDate(undefined)
        
        setTimeout(() => {
          window.location.hash = "#profile"
        }, 2000)
      } else {
        sessionStorage.setItem('bookingEmail', normalizedEmail)
        sessionStorage.setItem('bookingPassword', formData.password)

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
          window.location.hash = "#customer-login"
        }, 2000)
      }

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
      
      {showDiagnostics && <DiagnosticPanel />}
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => {
              window.location.hash = ""
            }}
          >
            <ArrowLeft className="mr-2" size={20} />
            Home
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
          >
            {showDiagnostics ? "Hide" : "Show"} Diagnostics
          </Button>
        </div>

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
              {loggedInAccount && (
                <div className="p-5 bg-primary/10 border-2 border-primary/20 rounded-lg mb-6">
                  <p className="text-base font-semibold text-primary mb-1">
                    Welcome back, {loggedInAccount.name}!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Booking as: {loggedInAccount.email}
                  </p>
                </div>
              )}

              {!loggedInAccount && (
                <>
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
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="stylist">Preferred Stylist *</Label>
                <Select 
                  value={formData.stylist} 
                  onValueChange={(value) => {
                    setFormData({ ...formData, stylist: value, time: "", services: [] })
                  }}
                >
                  <SelectTrigger id="stylist">
                    <SelectValue placeholder={
                      staffMembers && staffMembers.length === 0 
                        ? "Loading stylists..." 
                        : "Select a stylist first"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any Available">Any Available</SelectItem>
                    {stylistNames.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        {!staffMembers || staffMembers.length === 0 
                          ? "Loading..." 
                          : "No stylists available. Please contact admin."}
                      </div>
                    ) : (
                      stylistNames.map((stylist) => (
                        <SelectItem key={stylist} value={stylist}>{stylist}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {formData.stylist && formData.stylist !== "Any Available" && (
                  <p className="text-xs text-muted-foreground">
                    Showing services available for {formData.stylist}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Services * (Select one or more)</Label>
                {!formData.stylist ? (
                  <div className="h-64 rounded-lg border border-input p-4 bg-muted/30 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Please select a stylist first</p>
                  </div>
                ) : (
                  <>
                    {formData.stylist && formData.stylist !== "Any Available" && availableServices.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No services configured for this stylist. Please contact the salon.
                      </p>
                    )}
                    <ScrollArea className="h-64 rounded-lg border border-input p-4">
                      {availableServices.map((category) => (
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
                  </>
                )}
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
