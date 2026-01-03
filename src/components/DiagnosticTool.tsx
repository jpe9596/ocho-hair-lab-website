import { useState, useEffect } from "react"
import { useKV } from "@/hooks/spark-compat"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bug, CheckCircle, WarningCircle, X } from "@phosphor-icons/react"
import type { Service } from "@/components/ServicesManagement"
import type { StaffSchedule } from "@/components/StaffSchedule"

interface StaffMember {
  username: string
  password: string
  name: string
  role: string
  isAdmin: boolean
  availableServices?: string[]
}

interface CustomerAccount {
  email: string
  password: string
  name: string
  phone: string
}

interface Appointment {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  password?: string
  service: string
  services?: string[]
  serviceDurations?: Record<string, number>
  stylist: string
  date: Date | string
  time: string
  notes?: string
  createdAt: Date | string
  status?: "confirmed" | "completed" | "cancelled"
}

interface DiagnosticResult {
  category: string
  status: "pass" | "warning" | "error"
  message: string
  details?: string
}

export function DiagnosticTool({ onClose }: { onClose: () => void }) {
  const [appointments] = useKV<Appointment[]>("appointments", [])
  const [customerAccounts] = useKV<CustomerAccount[]>("customer-accounts", [])
  const [staffMembers] = useKV<StaffMember[]>("staff-members", [])
  const [services] = useKV<Service[]>("salon-services", [])
  const [schedules] = useKV<StaffSchedule[]>("staff-schedules", [])
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    const diagnostics: DiagnosticResult[] = []

    await new Promise(resolve => setTimeout(resolve, 500))

    // Check 1: Staff Members
    if (!staffMembers || staffMembers.length === 0) {
      diagnostics.push({
        category: "Staff",
        status: "error",
        message: "No staff members found",
        details: "Staff members should auto-initialize. Try refreshing the page."
      })
    } else {
      const nonAdminStaff = staffMembers.filter(s => !s.isAdmin)
      if (nonAdminStaff.length === 0) {
        diagnostics.push({
          category: "Staff",
          status: "error",
          message: "No non-admin staff members found",
          details: "You need at least one stylist to accept bookings. Add staff in Admin → Staff & Accounts."
        })
      } else {
        diagnostics.push({
          category: "Staff",
          status: "pass",
          message: `${nonAdminStaff.length} stylist(s) configured`,
          details: nonAdminStaff.map(s => s.name).join(", ")
        })
      }
    }

    // Check 2: Services
    if (!services || services.length === 0) {
      diagnostics.push({
        category: "Services",
        status: "error",
        message: "No services found",
        details: "Services should auto-initialize from defaults. Go to Admin → Services to initialize."
      })
    } else {
      diagnostics.push({
        category: "Services",
        status: "pass",
        message: `${services.length} service(s) available`,
        details: `Categories: ${[...new Set(services.map(s => s.category))].join(", ")}`
      })
    }

    // Check 3: Staff Schedules
    if (!schedules || schedules.length === 0) {
      diagnostics.push({
        category: "Schedules",
        status: "error",
        message: "No staff schedules configured",
        details: "Schedules should auto-initialize. Go to Admin → Staff Management → Schedules tab."
      })
    } else {
      const nonAdminStaff = staffMembers?.filter(s => !s.isAdmin) || []
      const staffWithSchedules = nonAdminStaff.filter(staff =>
        schedules.some(sched => sched.stylistName === staff.name)
      )
      
      if (staffWithSchedules.length < nonAdminStaff.length) {
        diagnostics.push({
          category: "Schedules",
          status: "warning",
          message: `Only ${staffWithSchedules.length}/${nonAdminStaff.length} stylists have schedules`,
          details: "Missing schedules for: " + nonAdminStaff
            .filter(s => !schedules.some(sched => sched.stylistName === s.name))
            .map(s => s.name).join(", ")
        })
      } else {
        diagnostics.push({
          category: "Schedules",
          status: "pass",
          message: `All ${schedules.length} stylist(s) have schedules configured`
        })
      }
    }

    // Check 4: Staff Service Assignments
    const nonAdminStaff = staffMembers?.filter(s => !s.isAdmin) || []
    const staffWithoutServices = nonAdminStaff.filter(s => 
      !s.availableServices || s.availableServices.length === 0
    )
    
    if (staffWithoutServices.length > 0) {
      diagnostics.push({
        category: "Service Assignments",
        status: "warning",
        message: `${staffWithoutServices.length} stylist(s) have no services assigned`,
        details: `${staffWithoutServices.map(s => s.name).join(", ")} - Assign services in Admin → Staff & Accounts → Manage Services`
      })
    } else if (nonAdminStaff.length > 0) {
      diagnostics.push({
        category: "Service Assignments",
        status: "pass",
        message: "All stylists have services assigned"
      })
    }

    // Check 5: Customer Accounts
    if (!customerAccounts || customerAccounts.length === 0) {
      diagnostics.push({
        category: "Customers",
        status: "warning",
        message: "No customer accounts yet",
        details: "Accounts are created automatically when customers book. This is normal for new installations."
      })
    } else {
      diagnostics.push({
        category: "Customers",
        status: "pass",
        message: `${customerAccounts.length} customer account(s)`,
        details: customerAccounts.map(c => c.email).join(", ")
      })
    }

    // Check 6: Appointments
    if (!appointments || appointments.length === 0) {
      diagnostics.push({
        category: "Appointments",
        status: "warning",
        message: "No appointments yet",
        details: "This is normal for new installations or if all appointments have been deleted."
      })
    } else {
      const upcoming = appointments.filter(apt => {
        const aptDate = new Date(apt.date)
        return aptDate >= new Date() && apt.status !== "cancelled"
      })
      diagnostics.push({
        category: "Appointments",
        status: "pass",
        message: `${appointments.length} total, ${upcoming.length} upcoming`,
        details: `Stylists: ${[...new Set(appointments.map(a => a.stylist))].join(", ")}`
      })

      // Check 7: Appointment Data Integrity
      const appointmentsWithoutServices = appointments.filter(apt => 
        !apt.services || apt.services.length === 0
      )
      if (appointmentsWithoutServices.length > 0) {
        diagnostics.push({
          category: "Data Integrity",
          status: "warning",
          message: `${appointmentsWithoutServices.length} appointment(s) missing services array`,
          details: "Older appointments may need migration. They should still work."
        })
      }

      const appointmentsWithoutDurations = appointments.filter(apt =>
        !apt.serviceDurations && apt.services && apt.services.length > 0
      )
      if (appointmentsWithoutDurations.length > 0) {
        diagnostics.push({
          category: "Data Integrity",
          status: "warning",
          message: `${appointmentsWithoutDurations.length} appointment(s) missing duration tracking`,
          details: "Service duration changes won't affect these appointments. Book new ones to fix."
        })
      }
    }

    // Check 8: Email Normalization
    if (customerAccounts && customerAccounts.length > 0) {
      const emailsNotNormalized = customerAccounts.filter(acc => {
        const email = acc.email || ""
        return email !== email.toLowerCase().trim()
      })
      
      if (emailsNotNormalized.length > 0) {
        diagnostics.push({
          category: "Data Quality",
          status: "error",
          message: `${emailsNotNormalized.length} customer email(s) not normalized`,
          details: "This can cause login issues. Emails: " + emailsNotNormalized.map(a => a.email).join(", ")
        })
      }
    }

    if (appointments && appointments.length > 0) {
      const appointmentEmailsNotNormalized = appointments.filter(apt => {
        const email = apt.customerEmail || ""
        return email !== email.toLowerCase().trim()
      })

      if (appointmentEmailsNotNormalized.length > 0) {
        diagnostics.push({
          category: "Data Quality",
          status: "error",
          message: `${appointmentEmailsNotNormalized.length} appointment(s) with non-normalized emails`,
          details: "Customers may not see these appointments in their profile."
        })
      }
    }

    setResults(diagnostics)
    setIsRunning(false)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const passCount = results.filter(r => r.status === "pass").length
  const warningCount = results.filter(r => r.status === "warning").length
  const errorCount = results.filter(r => r.status === "error").length

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bug size={24} />
                System Diagnostics
              </CardTitle>
              <CardDescription>
                Checking configuration and data integrity
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          {isRunning ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Running diagnostics...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="bg-green-50 dark:bg-green-950">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle size={20} weight="fill" className="text-green-600" />
                      <span className="font-semibold text-green-600">{passCount} Passed</span>
                    </div>
                    <p className="text-xs text-green-600/70">Everything looks good</p>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-50 dark:bg-yellow-950">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <WarningCircle size={20} weight="fill" className="text-yellow-600" />
                      <span className="font-semibold text-yellow-600">{warningCount} Warnings</span>
                    </div>
                    <p className="text-xs text-yellow-600/70">May need attention</p>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 dark:bg-red-950">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <X size={20} weight="bold" className="text-red-600" />
                      <span className="font-semibold text-red-600">{errorCount} Errors</span>
                    </div>
                    <p className="text-xs text-red-600/70">Requires fixes</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="all" className="h-full">
                <TabsList>
                  <TabsTrigger value="all">All ({results.length})</TabsTrigger>
                  <TabsTrigger value="errors">Errors ({errorCount})</TabsTrigger>
                  <TabsTrigger value="warnings">Warnings ({warningCount})</TabsTrigger>
                </TabsList>

                <ScrollArea className="h-96 mt-4">
                  <TabsContent value="all" className="space-y-3 mt-0">
                    {results.map((result, index) => (
                      <DiagnosticResultCard key={index} result={result} />
                    ))}
                  </TabsContent>

                  <TabsContent value="errors" className="space-y-3 mt-0">
                    {results.filter(r => r.status === "error").map((result, index) => (
                      <DiagnosticResultCard key={index} result={result} />
                    ))}
                    {errorCount === 0 && (
                      <p className="text-center text-muted-foreground py-8">No errors found! 🎉</p>
                    )}
                  </TabsContent>

                  <TabsContent value="warnings" className="space-y-3 mt-0">
                    {results.filter(r => r.status === "warning").map((result, index) => (
                      <DiagnosticResultCard key={index} result={result} />
                    ))}
                    {warningCount === 0 && (
                      <p className="text-center text-muted-foreground py-8">No warnings! ✨</p>
                    )}
                  </TabsContent>
                </ScrollArea>
              </Tabs>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button onClick={runDiagnostics} variant="outline">
                  Re-run Diagnostics
                </Button>
                <Button onClick={onClose} className="ml-auto">
                  Close
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DiagnosticResultCard({ result }: { result: DiagnosticResult }) {
  const getIcon = () => {
    switch (result.status) {
      case "pass":
        return <CheckCircle size={20} weight="fill" className="text-green-600 flex-shrink-0" />
      case "warning":
        return <WarningCircle size={20} weight="fill" className="text-yellow-600 flex-shrink-0" />
      case "error":
        return <X size={20} weight="bold" className="text-red-600 flex-shrink-0" />
    }
  }

  const getBgClass = () => {
    switch (result.status) {
      case "pass":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"
      case "error":
        return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
    }
  }

  return (
    <Card className={getBgClass()}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {result.category}
              </Badge>
              <span className="font-semibold text-sm">{result.message}</span>
            </div>
            {result.details && (
              <p className="text-xs text-muted-foreground mt-1 break-words">
                {result.details}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
