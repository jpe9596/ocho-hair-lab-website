import { useEffect, useState } from "react"
import { useKV } from "@github/spark/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Phone, Envelope, Scissors, Trash } from "@phosphor-icons/react"
import { formatAppointmentDate } from "@/lib/notifications"
import { toast } from "sonner"

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

export function AdminPanel() {
  const [appointments, setAppointments] = useKV<Appointment[]>("appointments", [])
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)

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

  const sortedAppointments = [...(appointments || [])].sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateA.getTime() - dateB.getTime()
  })

  return (
    <div className="py-20 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Appointment Manager
          </h2>
          <p className="text-muted-foreground">
            {appointments?.length || 0} total appointments
          </p>
        </div>

        {!appointments || appointments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No appointments yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-1">{appointment.name}</CardTitle>
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
                      <div className="flex items-center gap-2 text-sm">
                        <Scissors size={18} className="text-muted-foreground" />
                        <span>{appointment.service}</span>
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
