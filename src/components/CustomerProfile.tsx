import { useState } from "react"
import { useKV } from "@github/spark/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Scissors, User, Trash, MagnifyingGlass, SignOut, CalendarCheck } from "@phosphor-icons/react"
import { formatAppointmentDate } from "@/lib/notifications"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { RescheduleDialog } from "@/components/RescheduleDialog"

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

export function CustomerProfile() {
  const [appointments, setAppointments] = useKV<Appointment[]>("appointments", [])
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [customerData, setCustomerData] = useState<{ email: string; phone: string } | null>(null)
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email && !phone) {
      toast.error("Please enter your email or phone number")
      return
    }

    const customerAppointments = (appointments || []).filter(apt => 
      (email && apt.email.toLowerCase() === email.toLowerCase()) ||
      (phone && apt.phone.replace(/\D/g, '') === phone.replace(/\D/g, ''))
    )

    if (customerAppointments.length === 0) {
      toast.error("No appointments found", {
        description: "Please check your email or phone number and try again."
      })
      return
    }

    setCustomerData({ email, phone })
    setIsLoggedIn(true)
    toast.success("Welcome back!", {
      description: `Found ${customerAppointments.length} appointment${customerAppointments.length > 1 ? 's' : ''}`
    })
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCustomerData(null)
    setEmail("")
    setPhone("")
  }

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setRescheduleDialogOpen(true)
  }

  const cancelAppointment = (id: string, service: string, date: Date, time: string) => {
    setAppointments((current) => (current || []).filter(apt => apt.id !== id))
    toast.success("Appointment Cancelled", {
      description: `Your ${service} appointment on ${formatAppointmentDate(date)} at ${time} has been cancelled.`
    })
  }

  const customerAppointments = isLoggedIn && customerData
    ? (appointments || []).filter(apt => 
        (customerData.email && apt.email.toLowerCase() === customerData.email.toLowerCase()) ||
        (customerData.phone && apt.phone.replace(/\D/g, '') === customerData.phone.replace(/\D/g, ''))
      ).sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateA.getTime() - dateB.getTime()
      })
    : []

  const upcomingAppointments = customerAppointments.filter(apt => new Date(apt.date) >= new Date())
  const pastAppointments = customerAppointments.filter(apt => new Date(apt.date) < new Date())

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 bg-background">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  My Appointments
                </CardTitle>
                <CardDescription>
                  Enter your email or phone number to view your bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="profile-email">Email Address</Label>
                    <Input
                      id="profile-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 border-t border-border"></div>
                    <span className="text-sm text-muted-foreground">OR</span>
                    <div className="flex-1 border-t border-border"></div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-phone">Phone Number</Label>
                    <Input
                      id="profile-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <MagnifyingGlass className="mr-2" size={20} />
                    View My Appointments
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                My Appointments
              </h1>
              <p className="text-muted-foreground">
                {customerData?.email || customerData?.phone}
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <SignOut className="mr-2" size={18} />
              Sign Out
            </Button>
          </div>
        </motion.div>

        {customerAppointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="py-16 text-center">
                <Calendar size={64} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No appointments found</h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any appointments scheduled yet.
                </p>
                <Button onClick={() => window.location.href = "/#home"}>
                  Book Your First Appointment
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {upcomingAppointments.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                  Upcoming Appointments
                </h2>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {upcomingAppointments.map((appointment, index) => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="border-2 border-primary/10">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="default" className="bg-primary">
                                    Upcoming
                                  </Badge>
                                  <Badge variant="outline">
                                    Booked {new Date(appointment.createdAt).toLocaleDateString()}
                                  </Badge>
                                </div>
                                <CardTitle className="text-2xl">
                                  {appointment.service}
                                </CardTitle>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-primary hover:text-primary hover:bg-primary/10"
                                  onClick={() => handleReschedule(appointment)}
                                >
                                  <CalendarCheck size={20} weight="fill" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => cancelAppointment(
                                    appointment.id,
                                    appointment.service,
                                    new Date(appointment.date),
                                    appointment.time
                                  )}
                                >
                                  <Trash size={20} weight="fill" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Calendar size={20} className="text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Date</p>
                                  <p className="font-medium">{formatAppointmentDate(new Date(appointment.date))}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Clock size={20} className="text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Time</p>
                                  <p className="font-medium">{appointment.time}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <User size={20} className="text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Stylist</p>
                                  <p className="font-medium">{appointment.stylist}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Scissors size={20} className="text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Service</p>
                                  <p className="font-medium">{appointment.service}</p>
                                </div>
                              </div>
                            </div>

                            {appointment.notes && (
                              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                                <p className="text-sm">{appointment.notes}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {pastAppointments.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                  Past Appointments
                </h2>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {pastAppointments.map((appointment, index) => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="opacity-75">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <Badge variant="secondary" className="mb-2">
                                  Completed
                                </Badge>
                                <CardTitle className="text-xl">
                                  {appointment.service}
                                </CardTitle>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground mb-1">Date</p>
                                <p className="font-medium">{new Date(appointment.date).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1">Time</p>
                                <p className="font-medium">{appointment.time}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1">Stylist</p>
                                <p className="font-medium">{appointment.stylist}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1">Service</p>
                                <p className="font-medium">{appointment.service}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <RescheduleDialog 
        open={rescheduleDialogOpen} 
        onOpenChange={setRescheduleDialogOpen}
        appointment={selectedAppointment}
      />
    </div>
  )
}
