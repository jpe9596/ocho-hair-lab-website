import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { AdminAnalytics } from "@/components/AdminAnalytics"
import { StaffSchedule } from "@/components/StaffSchedule"
import { SMSTemplateManager } from "@/components/SMSTemplateManager"
import { SMSAnalyticsDashboard } from "@/components/SMSAnalyticsDashboard"
import { StaffManagement } from "@/components/StaffManagement"
import { ArrowLeft, Lock, ShieldCheck } from "@phosphor-icons/react"
import { toast } from "sonner"

export function AdminDashboard() {
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<{ login: string; email: string } | null>(null)

  useEffect(() => {
    async function checkOwner() {
      try {
        const user = await window.spark.user()
        setIsOwner(user?.isOwner || false)
        if (user?.isOwner) {
          setUserInfo({ login: user.login, email: user.email || "" })
        }
      } catch {
        setIsOwner(false)
      } finally {
        setLoading(false)
      }
    }
    checkOwner()
  }, [])

  useEffect(() => {
    if (!loading && !isOwner) {
      toast.error("Access denied - Owner authentication required")
    }
  }, [loading, isOwner])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <ShieldCheck size={48} className="mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Verifying credentials...</p>
        </div>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <Lock size={64} className="mx-auto mb-6 text-destructive" />
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Access Denied
            </h2>
            <p className="text-muted-foreground mb-6">
              This admin dashboard is only accessible to the website owner. Please log in with your GitHub account to continue.
            </p>
            <Button onClick={() => window.location.hash = ""}>
              <ArrowLeft className="mr-2" size={18} />
              Return to Website
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
          <TabsList className="grid w-full max-w-4xl grid-cols-5">
            <TabsTrigger value="analytics">Analytics & Appointments</TabsTrigger>
            <TabsTrigger value="sms-analytics">SMS Analytics</TabsTrigger>
            <TabsTrigger value="schedules">Staff Schedules</TabsTrigger>
            <TabsTrigger value="sms-templates">SMS Templates</TabsTrigger>
            <TabsTrigger value="staff-management">Staff & Accounts</TabsTrigger>
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

          <TabsContent value="sms-templates" className="space-y-6">
            <SMSTemplateManager />
          </TabsContent>

          <TabsContent value="staff-management" className="space-y-6">
            <StaffManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
