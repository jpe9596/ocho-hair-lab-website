import { useMemo, useState } from "react"
import { useKV } from "@/hooks/spark-compat"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { 
  ChatCircleDots, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendUp, 
  Users, 
  ChartLine,
  CalendarBlank,
  X,
  Envelope,
  Phone,
  Warning,
  ArrowUp,
  ArrowDown
} from "@phosphor-icons/react"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, startOfDay, endOfDay } from "date-fns"

interface SMSLog {
  id: string
  appointmentId: string
  to: string
  message: string
  type: "confirmation" | "reminder" | "custom"
  templateName?: string
  status: "sent" | "delivered" | "failed" | "pending"
  sentAt: Date
  deliveredAt?: Date
  failureReason?: string
  customerName: string
  customerEmail: string
  serviceName: string
}

interface Appointment {
  id: string
  name: string
  email: string
  phone: string
  service: string
  services?: string[]
  date: Date
  confirmationSent?: boolean
  reminderSent?: boolean
}

export function SMSAnalyticsDashboard() {
  const [smsLogs] = useKV<SMSLog[]>("sms-logs", [])
  const [appointments] = useKV<Appointment[]>("appointments", [])
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

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

  const filteredLogs = useMemo(() => {
    if (!dateRange.from && !dateRange.to) {
      return smsLogs || []
    }

    return (smsLogs || []).filter(log => {
      const logDate = new Date(log.sentAt)
      logDate.setHours(0, 0, 0, 0)

      if (dateRange.from && dateRange.to) {
        const from = new Date(dateRange.from)
        from.setHours(0, 0, 0, 0)
        const to = new Date(dateRange.to)
        to.setHours(23, 59, 59, 999)
        return logDate >= from && logDate <= to
      }

      if (dateRange.from) {
        const from = new Date(dateRange.from)
        from.setHours(0, 0, 0, 0)
        return logDate >= from
      }

      if (dateRange.to) {
        const to = new Date(dateRange.to)
        to.setHours(23, 59, 59, 999)
        return logDate <= to
      }

      return true
    })
  }, [smsLogs, dateRange])

  const analytics = useMemo(() => {
    const total = filteredLogs.length
    const sent = filteredLogs.filter(log => log.status === "sent" || log.status === "delivered").length
    const delivered = filteredLogs.filter(log => log.status === "delivered").length
    const failed = filteredLogs.filter(log => log.status === "failed").length
    const pending = filteredLogs.filter(log => log.status === "pending").length

    const deliveryRate = total > 0 ? (delivered / total) * 100 : 0
    const failureRate = total > 0 ? (failed / total) * 100 : 0
    const pendingRate = total > 0 ? (pending / total) * 100 : 0

    const confirmations = filteredLogs.filter(log => log.type === "confirmation").length
    const reminders = filteredLogs.filter(log => log.type === "reminder").length
    const custom = filteredLogs.filter(log => log.type === "custom").length

    const averageDeliveryTime = filteredLogs
      .filter(log => log.deliveredAt && log.sentAt)
      .reduce((sum, log) => {
        const diff = new Date(log.deliveredAt!).getTime() - new Date(log.sentAt).getTime()
        return sum + diff
      }, 0) / delivered || 0

    const templateStats = filteredLogs.reduce((acc, log) => {
      if (log.templateName) {
        if (!acc[log.templateName]) {
          acc[log.templateName] = { total: 0, delivered: 0, failed: 0 }
        }
        acc[log.templateName].total++
        if (log.status === "delivered") acc[log.templateName].delivered++
        if (log.status === "failed") acc[log.templateName].failed++
      }
      return acc
    }, {} as Record<string, { total: number; delivered: number; failed: number }>)

    const totalAppointments = (appointments || []).length
    const appointmentsWithConfirmation = (appointments || []).filter(apt => apt.confirmationSent).length
    const appointmentsWithReminder = (appointments || []).filter(apt => apt.reminderSent).length
    const coverageRate = totalAppointments > 0 ? (appointmentsWithConfirmation / totalAppointments) * 100 : 0

    return {
      total,
      sent,
      delivered,
      failed,
      pending,
      deliveryRate,
      failureRate,
      pendingRate,
      confirmations,
      reminders,
      custom,
      averageDeliveryTime,
      templateStats,
      totalAppointments,
      appointmentsWithConfirmation,
      appointmentsWithReminder,
      coverageRate
    }
  }, [filteredLogs, appointments])

  const recentFailures = useMemo(() => {
    return filteredLogs
      .filter(log => log.status === "failed")
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      .slice(0, 10)
  }, [filteredLogs])

  const topEngagingTemplates = useMemo(() => {
    return Object.entries(analytics.templateStats)
      .map(([name, stats]) => ({
        name,
        ...stats,
        deliveryRate: stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0
      }))
      .sort((a, b) => b.deliveryRate - a.deliveryRate)
      .slice(0, 5)
  }, [analytics.templateStats])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            WhatsApp Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Track delivery rates, customer engagement, and WhatsApp messaging performance
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

      <div className="flex flex-wrap gap-2">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <ChatCircleDots size={18} />
              Total SMS Sent
            </CardDescription>
            <CardTitle className="text-3xl">{analytics.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {analytics.confirmations} confirmations · {analytics.reminders} reminders · {analytics.custom} custom
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle size={18} />
              Delivery Rate
            </CardDescription>
            <CardTitle className="text-3xl">{analytics.deliveryRate.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={analytics.deliveryRate} className="h-2 mb-2" />
            <div className="text-xs text-muted-foreground">
              {analytics.delivered} of {analytics.total} delivered
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <XCircle size={18} />
              Failure Rate
            </CardDescription>
            <CardTitle className="text-3xl">{analytics.failureRate.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={analytics.failureRate} className="h-2 mb-2" />
            <div className="text-xs text-muted-foreground">
              {analytics.failed} failed · {analytics.pending} pending
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock size={18} />
              Avg Delivery Time
            </CardDescription>
            <CardTitle className="text-3xl">
              {analytics.averageDeliveryTime > 0 
                ? `${(analytics.averageDeliveryTime / 1000).toFixed(1)}s`
                : "N/A"
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Time from sent to delivered
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Users size={18} />
              Customer Coverage
            </CardDescription>
            <CardTitle className="text-3xl">{analytics.coverageRate.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={analytics.coverageRate} className="h-2 mb-3" />
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Appointments</span>
                <span className="font-medium">{analytics.totalAppointments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">With Confirmations</span>
                <span className="font-medium">{analytics.appointmentsWithConfirmation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">With Reminders</span>
                <span className="font-medium">{analytics.appointmentsWithReminder}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendUp size={20} />
              Message Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Confirmations</span>
                <span className="text-sm font-medium">{analytics.confirmations}</span>
              </div>
              <Progress 
                value={analytics.total > 0 ? (analytics.confirmations / analytics.total) * 100 : 0} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Reminders</span>
                <span className="text-sm font-medium">{analytics.reminders}</span>
              </div>
              <Progress 
                value={analytics.total > 0 ? (analytics.reminders / analytics.total) * 100 : 0} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Custom Messages</span>
                <span className="text-sm font-medium">{analytics.custom}</span>
              </div>
              <Progress 
                value={analytics.total > 0 ? (analytics.custom / analytics.total) * 100 : 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="templates">Template Performance</TabsTrigger>
          <TabsTrigger value="failures">Recent Failures</TabsTrigger>
          <TabsTrigger value="logs">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartLine size={20} />
                Top Performing Templates
              </CardTitle>
              <CardDescription>
                Ranked by delivery success rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topEngagingTemplates.length === 0 ? (
                <div className="py-12 text-center">
                  <Envelope size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No template data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topEngagingTemplates.map((template, index) => (
                    <div key={template.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={index === 0 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {template.total} sent · {template.delivered} delivered · {template.failed} failed
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {template.deliveryRate >= 90 ? (
                            <ArrowUp size={16} className="text-green-600" weight="bold" />
                          ) : template.deliveryRate < 70 ? (
                            <ArrowDown size={16} className="text-red-600" weight="bold" />
                          ) : null}
                          <span className="font-bold text-lg">{template.deliveryRate.toFixed(1)}%</span>
                        </div>
                      </div>
                      <Progress value={template.deliveryRate} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warning size={20} />
                Recent Delivery Failures
              </CardTitle>
              <CardDescription>
                Latest SMS messages that failed to deliver
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentFailures.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircle size={48} className="mx-auto mb-4 text-green-600" />
                  <p className="text-muted-foreground">No recent failures - excellent!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentFailures.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="font-medium">{log.customerName}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone size={14} />
                            {log.to}
                          </div>
                        </div>
                        <Badge variant="destructive">Failed</Badge>
                      </div>
                      <div className="text-sm">
                        <div className="text-muted-foreground mb-1">Service: {log.serviceName}</div>
                        <div className="text-muted-foreground mb-1">Type: {log.type}</div>
                        <div className="text-muted-foreground">
                          Sent: {format(new Date(log.sentAt), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                      {log.failureReason && (
                        <div className="text-sm bg-destructive/10 text-destructive p-2 rounded">
                          <strong>Reason:</strong> {log.failureReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChatCircleDots size={20} />
                Recent SMS Activity
              </CardTitle>
              <CardDescription>
                Latest 20 SMS messages sent
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredLogs.length === 0 ? (
                <div className="py-12 text-center">
                  <ChatCircleDots size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No SMS activity yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs
                    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
                    .slice(0, 20)
                    .map((log) => (
                      <div key={log.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{log.customerName}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone size={12} />
                              {log.to}
                            </div>
                          </div>
                          <Badge 
                            variant={
                              log.status === "delivered" ? "default" : 
                              log.status === "failed" ? "destructive" : 
                              "secondary"
                            }
                          >
                            {log.status}
                          </Badge>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="text-muted-foreground">
                            Type: <span className="capitalize">{log.type}</span>
                            {log.templateName && ` · Template: ${log.templateName}`}
                          </div>
                          <div className="text-muted-foreground">
                            {format(new Date(log.sentAt), "MMM d, yyyy 'at' h:mm a")}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
