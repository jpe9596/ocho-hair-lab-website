import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminAnalytics } from "@/components/AdminAnalytics"
import { StaffSchedule } from "@/components/StaffSchedule"
import { SMSAnalyticsDashboard } from "@/components/SMSAnalyticsDashboard"
import { StaffManagement } from "@/components/StaffManagement"
import { ServicesManagement } from "@/components/ServicesManagement"
import { ArrowLeft, ShieldCheck } from "@phosphor-icons/react"

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck size={28} className="text-primary" weight="fill" />
              <div>
                <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                  Admin Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Ocho Hair Lab Management Portal
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => window.location.hash = ""}
              >
                <ArrowLeft className="mr-2" size={18} />
                Exit Admin
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full max-w-5xl grid-cols-5">
            <TabsTrigger value="analytics">Analytics & Appointments</TabsTrigger>
            <TabsTrigger value="sms-analytics">WhatsApp Analytics</TabsTrigger>
            <TabsTrigger value="schedules">Staff Schedules</TabsTrigger>
            <TabsTrigger value="staff-management">Staff & Accounts</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="sms-analytics" className="space-y-6">
            <SMSAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="schedules" className="space-y-6">
            <StaffSchedule />
          </TabsContent>

          <TabsContent value="staff-management" className="space-y-6">
            <StaffManagement />
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <ServicesManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
