import { useState, useEffect } from "react"
import { useKV } from "@github/spark/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignOut, Calendar, Clock, User, Phone, Envelope } from "@phosphor-icons/react"
import { format, isPast, isFuture, isToday } from "date-fns"
import { StaffMember } from "./StaffLogin"
import { AdminDashboard } from "./AdminDashboard"

interface StaffDashboardProps {
  staffMember: StaffMember
  onLogout: () => void
}

interface Appointment {
  id: string
  customerName: string
  customerPhone: string
  customerEmail: string
  stylist: string
  services: string[]
  date: string
  time: string
  status: "confirmed" | "completed" | "cancelled"
  createdAt: string
}

export function StaffDashboard({ staffMember, onLogout }: StaffDashboardProps) {
  const [appointments] = useKV<Appointment[]>("appointments", [])
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([])
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    const staffAppointments = (appointments || []).filter(
      (apt) => apt.stylist === staffMember.name && apt.status !== "cancelled"
    )

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const upcoming: Appointment[] = []
    const past: Appointment[] = []
    const todayApts: Appointment[] = []

    staffAppointments.forEach((apt) => {
      const aptDate = new Date(apt.date)
      const aptDateTime = new Date(`${apt.date}T${apt.time}`)
      
      if (aptDate.toDateString() === today.toDateString()) {
        todayApts.push(apt)
      } else if (isFuture(aptDate)) {
        upcoming.push(apt)
      } else if (isPast(aptDateTime)) {
        past.push(apt)
      }
    })

    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    todayApts.sort((a, b) => a.time.localeCompare(b.time))

    setUpcomingAppointments(upcoming)
    setPastAppointments(past)
    setTodayAppointments(todayApts)
  }, [appointments, staffMember.name])

  if (staffMember.isAdmin) {
    return <AdminDashboard />
  }

  const renderAppointmentCard = (apt: Appointment, showDate = true) => (
    <Card key={apt.id} className="mb-4">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User size={18} className="text-muted-foreground" />
                <span className="font-semibold text-lg">{apt.customerName}</span>
              </div>
              {showDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={16} />
                  <span>{format(new Date(apt.date), "EEEE, MMMM d, yyyy")}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={16} />
                <span>{apt.time}</span>
              </div>
            </div>
            <Badge variant={apt.status === "completed" ? "secondary" : "default"}>
              {apt.status}
            </Badge>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-2">Services:</p>
            <div className="flex flex-wrap gap-2">
              {apt.services.map((service, idx) => (
                <Badge key={idx} variant="outline">
                  {service}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone size={16} />
              <span>{apt.customerPhone}</span>
            </div>
            {apt.customerEmail && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Envelope size={16} />
                <span>{apt.customerEmail}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Welcome, {staffMember.name.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground">{staffMember.role}</p>
          </div>
          <Button onClick={onLogout} variant="outline">
            <SignOut className="mr-2" size={18} />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayAppointments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{upcomingAppointments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pastAppointments.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">
              Today ({todayAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-6">
            {todayAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No appointments today</p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {todayAppointments.map((apt) => renderAppointmentCard(apt, false))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No upcoming appointments</p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {upcomingAppointments.map((apt) => renderAppointmentCard(apt))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No past appointments</p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {pastAppointments.map((apt) => renderAppointmentCard(apt))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
