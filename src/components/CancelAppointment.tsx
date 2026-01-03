import { useState, useEffect } from "react"
import { useKV } from "@/hooks/spark-compat"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, CheckCircle, ArrowLeft, Calendar, Clock, Scissors, User } from "@phosphor-icons/react"
import { toast } from "sonner"

interface Appointment {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  service: string
  services?: string[]
  serviceDurations?: Record<string, number>
  stylist: string
  date: Date | string
  time: string
  notes?: string
  createdAt: Date | string
  confirmationSent?: boolean
  reminderSent?: boolean
  status?: "confirmed" | "completed" | "cancelled"
  password?: string
}

interface CancelAppointmentProps {
  appointmentId: string
  onBack: () => void
}

export function CancelAppointment({ appointmentId, onBack }: CancelAppointmentProps) {
  const [appointments, setAppointments] = useKV<Appointment[]>("appointments", [])
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [cancelled, setCancelled] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    const found = (appointments || []).find((apt) => apt.id === appointmentId)
    setAppointment(found || null)
  }, [appointmentId, appointments])

  const handleCancel = async () => {
    if (!appointment) return

    setCancelling(true)

    try {
      setAppointments((current) =>
        (current || []).filter((apt) => apt.id !== appointmentId)
      )

      setCancelled(true)
      toast.success("Appointment Cancelled", {
        description: "Your appointment has been cancelled"
      })
    } catch (error) {
      console.error("Failed to cancel appointment:", error)
      toast.error("Cancellation Failed", {
        description: "Please contact the salon directly"
      })
    } finally {
      setCancelling(false)
    }
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <X size={24} weight="fill" className="text-destructive" />
              Appointment Not Found
            </CardTitle>
            <CardDescription>
              The appointment you're trying to cancel could not be found. It may have already been cancelled or completed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full">
              <ArrowLeft size={20} weight="bold" className="mr-2" />
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (cancelled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle size={24} weight="fill" />
              Appointment Cancelled
            </CardTitle>
            <CardDescription>
              Your appointment has been successfully cancelled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 bg-muted/50">
              <AlertDescription>
                We're sorry you can't make it. Contact us anytime to book a new appointment!
              </AlertDescription>
            </Alert>
            <Button onClick={onBack} className="w-full">
              <ArrowLeft size={20} weight="bold" className="mr-2" />
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const serviceName = appointment.services 
    ? appointment.services.join(", ") 
    : appointment.service

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Cancel Appointment</CardTitle>
          <CardDescription>
            Are you sure you want to cancel this appointment?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <User size={20} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Customer</p>
                <p className="text-sm text-muted-foreground">{appointment.customerName}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Scissors size={20} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Service</p>
                <p className="text-sm text-muted-foreground">{serviceName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar size={20} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-muted-foreground">
                  {formatAppointmentDate(new Date(appointment.date))}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={20} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm text-muted-foreground">{appointment.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User size={20} className="text-muted-foreground mt-0.5" weight="fill" />
              <div>
                <p className="text-sm font-medium">Stylist</p>
                <p className="text-sm text-muted-foreground">{appointment.stylist}</p>
              </div>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              You'll receive a cancellation confirmation via SMS. Contact us anytime to reschedule.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1"
              disabled={cancelling}
            >
              <ArrowLeft size={20} weight="bold" className="mr-2" />
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              className="flex-1"
              disabled={cancelling}
            >
              {cancelling ? (
                <>Cancelling...</>
              ) : (
                <>
                  <X size={20} weight="bold" className="mr-2" />
                  Cancel Appointment
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function formatAppointmentDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}
