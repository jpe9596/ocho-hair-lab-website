import { useEffect, useState, useMemo } from "react"
import { useKV } from "@github/spark/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Calendar, Clock, User, Phone, Envelope, Scissors, Trash, TrendUp, CurrencyCircleDollar, ChartBar, Users, CalendarCheck, Sparkle, CalendarBlank, X } from "@phosphor-icons/react"
import { formatAppointmentDate } from "@/lib/notifications"
import { toast } from "sonner"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, startOfDay, endOfDay } from "date-fns"

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

interface ServiceStats {
  name: string
  count: number
  revenue: number
}

interface StylistStats {
  name: string
  appointments: number
  revenue: number
}

const servicePrices: Record<string, number> = {
  "Retoque de Raiz": 1200,
  "Full Head Tint": 1800,
  "0% AMONIACO": 1500,
  "Toner/Gloss": 800,
  "Corte & Secado": 600,
  "Secado (short)": 300,
  "Secado (mm)": 350,
  "Secado (long)": 400,
  "Waves/peinado": 450,
  "Balayage": 2500,
  "Baby Lights": 2200,
  "Selfie Contour": 2000,
  "Posion Nº17": 1800,
  "Posion Nº 8": 1600
}

export function AdminAnalytics() {
  const [appointments, setAppointments] = useKV<Appointment[]>("appointments", [])
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  useEffect(() => {
    async function checkOwner() {
      try {
        const user = await window.spark.user()
        setIsOwner(user?.isOwner || false)
      } catch {
        setIsOwner(false)
      } finally {
        setLoading(false)
      }
    }
    checkOwner()
  }, [])

  const applyQuickFilter = (filterType: string) => {
    const now = new Date()
    let from: Date
    let to: Date

    switch (filterType) {
      case "thisWeek":
        from = startOfWeek(now, { weekStartsOn: 0 })
        to = endOfWeek(now, { weekStartsOn: 0 })
        break
      case "thisMonth":
        from = startOfMonth(now)
        to = endOfMonth(now)
        break
      case "last30Days":
        from = subDays(now, 30)
        to = now
        break
      case "last7Days":
        from = subDays(now, 7)
        to = now
        break
      default:
        return
    }

    setDateRange({ from: startOfDay(from), to: endOfDay(to) })
    setActiveFilter(filterType)
  }

  const clearFilters = () => {
    setDateRange({ from: undefined, to: undefined })
    setActiveFilter(null)
  }

  const filteredAppointments = useMemo(() => {
    if (!dateRange.from && !dateRange.to) {
      return appointments || []
    }

    return (appointments || []).filter(apt => {
      const aptDate = new Date(apt.date)
      aptDate.setHours(0, 0, 0, 0)

      if (dateRange.from && dateRange.to) {
        const from = new Date(dateRange.from)
        from.setHours(0, 0, 0, 0)
        const to = new Date(dateRange.to)
        to.setHours(23, 59, 59, 999)
        return aptDate >= from && aptDate <= to
      }

      if (dateRange.from) {
        const from = new Date(dateRange.from)
        from.setHours(0, 0, 0, 0)
        return aptDate >= from
      }

      if (dateRange.to) {
        const to = new Date(dateRange.to)
        to.setHours(23, 59, 59, 999)
        return aptDate <= to
      }

      return true
    })
  }, [appointments, dateRange])

  const { pastAppointments, upcomingAppointments } = useMemo(() => {
    const now = new Date()
    const allAppointments = filteredAppointments
    
    const past = allAppointments.filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate < now
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const upcoming = allAppointments.filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate >= now
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return { pastAppointments: past, upcomingAppointments: upcoming }
  }, [filteredAppointments])

  const serviceStats = useMemo(() => {
    const stats = new Map<string, ServiceStats>()
    
    filteredAppointments.forEach(apt => {
      const services = apt.services || [apt.service]
      services.forEach(service => {
        const existing = stats.get(service) || { name: service, count: 0, revenue: 0 }
        existing.count += 1
        existing.revenue += servicePrices[service] || 0
        stats.set(service, existing)
      })
    })

    return Array.from(stats.values()).sort((a, b) => b.count - a.count)
  }, [filteredAppointments])

  const stylistStats = useMemo(() => {
    const stats = new Map<string, StylistStats>()
    
    filteredAppointments.forEach(apt => {
      const existing = stats.get(apt.stylist) || { name: apt.stylist, appointments: 0, revenue: 0 }
      existing.appointments += 1
      
      const services = apt.services || [apt.service]
      services.forEach(service => {
        existing.revenue += servicePrices[service] || 0
      })
      
      stats.set(apt.stylist, existing)
    })

    return Array.from(stats.values()).sort((a, b) => b.revenue - a.revenue)
  }, [filteredAppointments])

  const totalRevenue = useMemo(() => {
    return filteredAppointments.reduce((sum, apt) => {
      const services = apt.services || [apt.service]
      const aptRevenue = services.reduce((s, service) => s + (servicePrices[service] || 0), 0)
      return sum + aptRevenue
    }, 0)
  }, [filteredAppointments])

  const deleteAppointment = (id: string) => {
    setAppointments((current) => (current || []).filter(apt => apt.id !== id))
    toast.success("Appointment deleted")
  }

  if (loading) {
    return null
  }

  if (!isOwner) {
    return null
  }

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card key={appointment.id}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-xl">{appointment.name}</CardTitle>
            </div>
            <CardDescription>
              Booked {new Date(appointment.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteAppointment(appointment.id)}
          >
            <Trash size={20} weight="fill" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={18} className="text-muted-foreground" />
              <span>{formatAppointmentDate(new Date(appointment.date))}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={18} className="text-muted-foreground" />
              <span>{appointment.time}</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Scissors size={18} className="text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                {appointment.services && appointment.services.length > 0 ? (
                  appointment.services.map((svc) => (
                    <Badge key={svc} variant="secondary" className="text-xs w-fit">
                      {svc}
                    </Badge>
                  ))
                ) : (
                  <span>{appointment.service}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User size={18} className="text-muted-foreground" />
              <span>{appointment.stylist}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Phone size={18} className="text-muted-foreground" />
              <a href={`tel:${appointment.phone}`} className="hover:underline">
                {appointment.phone}
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Envelope size={18} className="text-muted-foreground" />
              <a href={`mailto:${appointment.email}`} className="hover:underline truncate">
                {appointment.email}
              </a>
            </div>
            {appointment.notes && (
              <div className="pt-2">
                <Badge variant="outline" className="font-normal">
                  Note: {appointment.notes}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="py-20 px-4 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Admin Dashboard
              </h2>
              <p className="text-muted-foreground">
                Complete overview of appointments, analytics, and performance
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarBlank className="mr-2" size={18} />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM d, yyyy")
                      )
                    ) : (
                      <span>Custom date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      setDateRange({
                        from: range?.from,
                        to: range?.to,
                      })
                      setActiveFilter(null)
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              
              {(dateRange.from || dateRange.to) && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={clearFilters}
                >
                  <X size={18} />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              variant={activeFilter === "thisWeek" ? "default" : "outline"}
              size="sm"
              onClick={() => applyQuickFilter("thisWeek")}
            >
              This Week
            </Button>
            <Button 
              variant={activeFilter === "thisMonth" ? "default" : "outline"}
              size="sm"
              onClick={() => applyQuickFilter("thisMonth")}
            >
              This Month
            </Button>
            <Button 
              variant={activeFilter === "last7Days" ? "default" : "outline"}
              size="sm"
              onClick={() => applyQuickFilter("last7Days")}
            >
              Last 7 Days
            </Button>
            <Button 
              variant={activeFilter === "last30Days" ? "default" : "outline"}
              size="sm"
              onClick={() => applyQuickFilter("last30Days")}
            >
              Last 30 Days
            </Button>
          </div>
          
          {(dateRange.from || dateRange.to) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarBlank size={16} />
              <span>
                Showing data for {dateRange.from && format(dateRange.from, "MMM d, yyyy")}
                {dateRange.from && dateRange.to && " to "}
                {dateRange.to && format(dateRange.to, "MMM d, yyyy")}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <CalendarCheck size={18} />
                Total Appointments
              </CardDescription>
              <CardTitle className="text-3xl">{filteredAppointments.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendUp size={18} />
                Upcoming
              </CardDescription>
              <CardTitle className="text-3xl">{upcomingAppointments.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <ChartBar size={18} />
                Completed
              </CardDescription>
              <CardTitle className="text-3xl">{pastAppointments.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <CurrencyCircleDollar size={18} />
                Total Revenue
              </CardDescription>
              <CardTitle className="text-3xl">${totalRevenue.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CalendarCheck size={24} />
                Upcoming Appointments ({upcomingAppointments.length})
              </h3>
              {upcomingAppointments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No upcoming appointments</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ChartBar size={24} />
                Past Appointments ({pastAppointments.length})
              </h3>
              {pastAppointments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No past appointments</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {pastAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkle size={24} />
                Service Analytics
              </h3>
              {serviceStats.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Scissors size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No service data yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {serviceStats.map((stat, index) => (
                    <Card key={stat.name}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{stat.name}</CardTitle>
                              <CardDescription>
                                ${servicePrices[stat.name]?.toLocaleString() || 0} per service
                              </CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {stat.count} booking{stat.count !== 1 ? 's' : ''}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ${stat.revenue.toLocaleString()} total
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users size={24} />
                Staff Performance
              </h3>
              {stylistStats.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No staff data yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {stylistStats.map((stat, index) => (
                    <Card key={stat.name}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-foreground font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{stat.name}</CardTitle>
                              <CardDescription>
                                {stat.appointments} appointment{stat.appointments !== 1 ? 's' : ''}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              ${stat.revenue.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ${(stat.revenue / stat.appointments).toFixed(0)} avg
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CurrencyCircleDollar size={24} />
                Sales Analytics
              </h3>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Revenue Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
                      <div className="text-3xl font-bold text-primary">${totalRevenue.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Average per Appointment</div>
                      <div className="text-3xl font-bold">
                        ${filteredAppointments.length ? (totalRevenue / filteredAppointments.length).toFixed(0) : 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Total Bookings</div>
                      <div className="text-3xl font-bold">{filteredAppointments.length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Revenue Services</CardTitle>
                  <CardDescription>Ranked by total revenue generated</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {serviceStats.slice(0, 10).map((stat, index) => (
                      <div key={stat.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={index < 3 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                          <div>
                            <div className="font-medium">{stat.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {stat.count} booking{stat.count !== 1 ? 's' : ''} × ${servicePrices[stat.name]?.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${stat.revenue.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {((stat.revenue / totalRevenue) * 100).toFixed(1)}% of total
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
