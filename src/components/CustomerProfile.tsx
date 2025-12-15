import { useState } from "react"
import { useKV } from "@github/spark/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Scissors, User, Trash, MagnifyingGlass, SignOut, CalendarCheck, Plus, House } from "@phosphor-icons/react"
import { formatAppointmentDate, sendCancellationSMS } from "@/lib/notifications"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { RescheduleDialog } from "@/components/RescheduleDialog"
import { BookingDialog } from "@/components/BookingDialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CustomerAccount {
  email: string
  password: string
  name: string
  phone: string
}

interface Appointment {
  id: string
  name: string
  email: string
  phone: string
  password: string
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

interface CustomerProfileProps {
  customerEmail?: string
  onLogout?: () => void
}

export function CustomerProfile({ customerEmail, onLogout }: CustomerProfileProps) {
  const [appointments, setAppointments] = useKV<Appointment[]>("appointments", [])
  const [customerAccounts] = useKV<CustomerAccount[]>("customer-accounts", [])
  const [email, setEmail] = useState(customerEmail || "")
  const [password, setPassword] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(!!customerEmail)
  const [customerData, setCustomerData] = useState<CustomerAccount | null>(
    customerEmail ? customerAccounts?.find(acc => acc.email === customerEmail) || null : null
  )
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    if (!password) {
      toast.error("Please enter your password")
      return
    }

    const account = (customerAccounts || []).find(
      acc => acc.email?.toLowerCase().trim() === email.toLowerCase().trim() && acc.password === password
    )

    if (!account) {
      toast.error("Invalid email or password")
      return
    }

    setCustomerData(account)
    setIsLoggedIn(true)
    
    const customerAppointments = (appointments || []).filter(apt => {
      const appointmentEmail = apt.email?.toLowerCase().trim() || ''
      const accountEmail = account.email?.toLowerCase().trim() || ''
      return appointmentEmail === accountEmail
    })

    if (customerAppointments.length === 0) {
      toast.success(`Welcome, ${account.name}!`, {
        description: "You don't have any appointments yet. Book your first one!"
      })
    } else {
      toast.success(`Welcome back, ${account.name}!`, {
        description: `You have ${customerAppointments.length} appointment${customerAppointments.length > 1 ? 's' : ''}`
      })
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCustomerData(null)
    setEmail("")
    setPassword("")
    if (onLogout) onLogout()
  }

  const handleGoHome = () => {
    window.location.hash = ""
  }

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setRescheduleDialogOpen(true)
  }

  const handleCancelClick = (appointment: Appointment) => {
    setAppointmentToCancel(appointment)
    setCancelDialogOpen(true)
  }

  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel) return

    const serviceName = appointmentToCancel.services && appointmentToCancel.services.length > 1
      ? `${appointmentToCancel.services.length} services`
      : appointmentToCancel.service

    setAppointments((current) => (current || []).filter(apt => apt.id !== appointmentToCancel.id))
    
    try {
      await sendCancellationSMS({
        to: appointmentToCancel.phone,
        customerName: appointmentToCancel.name,
        service: serviceName,
        date: formatAppointmentDate(new Date(appointmentToCancel.date)),
        time: appointmentToCancel.time
      })

      toast.success("Appointment Cancelled", {
        description: `WhatsApp confirmation sent for your ${serviceName} appointment.`
      })
    } catch (error) {
      toast.success("Appointment Cancelled", {
        description: `Your ${serviceName} appointment on ${formatAppointmentDate(new Date(appointmentToCancel.date))} at ${appointmentToCancel.time} has been cancelled.`
      })
    }

    setCancelDialogOpen(false)
    setAppointmentToCancel(null)
  }

  const customerAppointments = isLoggedIn && customerData
    ? (appointments || []).filter(apt => {
        const appointmentEmail = apt.email?.toLowerCase().trim() || ''
        const customerEmailLower = customerData.email?.toLowerCase().trim() || ''
        return appointmentEmail === customerEmailLower
      }).sort((a, b) => {
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
        <Button 
          onClick={handleGoHome} 
          variant="ghost" 
          size="sm"
          className="fixed top-6 left-6 z-50"
        >
          <House className="mr-2" size={18} />
          Home
        </Button>
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
                  Enter your email and password to view your bookings
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
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-password">Password</Label>
                    <Input
                      id="profile-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
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
            <div className="flex gap-2">
              <Button onClick={handleGoHome} variant="outline">
                <House className="mr-2" size={18} />
                Home
              </Button>
              <Button onClick={() => setBookingDialogOpen(true)} variant="default">
                <Plus className="mr-2" size={18} />
                Book New
              </Button>
              <Button onClick={handleLogout} variant="outline">
                <SignOut className="mr-2" size={18} />
                Sign Out
              </Button>
            </div>
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
                <Button onClick={() => setBookingDialogOpen(true)}>
                  <Plus className="mr-2" size={18} />
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
                                <CardTitle className="text-2xl mb-2">
                                  {appointment.services && appointment.services.length > 1 
                                    ? "Multiple Services" 
                                    : appointment.service}
                                </CardTitle>
                                {appointment.services && appointment.services.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {appointment.services.map((svc) => (
                                      <Badge key={svc} variant="secondary" className="text-xs">
                                        {svc}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
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
                                  onClick={() => handleCancelClick(appointment)}
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
                                  <p className="text-sm text-muted-foreground">
                                    {appointment.services && appointment.services.length > 1 ? "Services" : "Service"}
                                  </p>
                                  <p className="font-medium">
                                    {appointment.services && appointment.services.length > 1 
                                      ? `${appointment.services.length} services`
                                      : appointment.service}
                                  </p>
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
      <BookingDialog 
        open={bookingDialogOpen} 
        onOpenChange={setBookingDialogOpen}
      />
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              {appointmentToCancel && (
                <div className="space-y-2">
                  <p>Are you sure you want to cancel this appointment?</p>
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
                    <p className="font-medium">
                      {appointmentToCancel.services && appointmentToCancel.services.length > 1 
                        ? "Multiple Services" 
                        : appointmentToCancel.service}
                    </p>
                    <p className="text-sm">
                      {formatAppointmentDate(new Date(appointmentToCancel.date))} at {appointmentToCancel.time}
                    </p>
                    <p className="text-sm">with {appointmentToCancel.stylist}</p>
                  </div>
                  <p className="text-sm mt-4">This action cannot be undone.</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelAppointment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
