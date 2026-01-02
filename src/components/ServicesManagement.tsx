import { useState } from "react"
import { useKV } from "@github/spark/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash, Clock, Scissors } from "@phosphor-icons/react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface Service {
  id: string
  name: string
  duration: number
  category: string
}

interface Appointment {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  password?: string
  service: string
  services: string[]
  stylist: string
  date: Date
  time: string
  notes: string
  createdAt: Date
  confirmationSent?: boolean
  reminderSent?: boolean
  status?: "confirmed" | "completed" | "cancelled"
  serviceDurations?: Record<string, number>
}

const serviceCategories = [
  "Tinte",
  "Corte & Styling",
  "Bespoke Color",
  "Treatments"
]

export function ServicesManagement() {
  const [services, setServices] = useKV<Service[]>("salon-services", [
    { id: "1", name: "Retoque de Raiz", duration: 90, category: "Tinte" },
    { id: "2", name: "Full Head Tint", duration: 120, category: "Tinte" },
    { id: "3", name: "0% AMONIACO", duration: 90, category: "Tinte" },
    { id: "4", name: "Toner/Gloss", duration: 60, category: "Tinte" },
    { id: "5", name: "Corte & Secado", duration: 60, category: "Corte & Styling" },
    { id: "6", name: "Secado (short)", duration: 30, category: "Corte & Styling" },
    { id: "7", name: "Secado (mm)", duration: 45, category: "Corte & Styling" },
    { id: "8", name: "Secado (long)", duration: 60, category: "Corte & Styling" },
    { id: "9", name: "Waves/peinado", duration: 45, category: "Corte & Styling" },
    { id: "10", name: "Balayage", duration: 180, category: "Bespoke Color" },
    { id: "11", name: "Baby Lights", duration: 150, category: "Bespoke Color" },
    { id: "12", name: "Selfie Contour", duration: 120, category: "Bespoke Color" },
    { id: "13", name: "Posion Nº17", duration: 90, category: "Treatments" },
    { id: "14", name: "Posion Nº 8", duration: 60, category: "Treatments" }
  ])
  const [appointments, setAppointments] = useKV<Appointment[]>("appointments", [])
  
  const [newService, setNewService] = useState({
    name: "",
    duration: 60,
    category: ""
  })
  
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const handleCreateService = () => {
    if (!newService.name || !newService.category) {
      toast.error("Please fill in all fields")
      return
    }

    if (newService.duration < 15 || newService.duration > 600) {
      toast.error("Duration must be between 15 and 600 minutes")
      return
    }

    const exists = services?.some(s => s.name.toLowerCase() === newService.name.toLowerCase())
    if (exists) {
      toast.error("Service already exists")
      return
    }

    const id = Date.now().toString()
    setServices((current) => [...(current || []), {
      id,
      name: newService.name,
      duration: newService.duration,
      category: newService.category
    }])

    toast.success(`Service "${newService.name}" created successfully`)
    setNewService({ name: "", duration: 60, category: "" })
    setCreateDialogOpen(false)
  }

  const handleUpdateService = () => {
    if (!editingService) return

    if (!editingService.name || !editingService.category) {
      toast.error("Please fill in all fields")
      return
    }

    if (editingService.duration < 15 || editingService.duration > 600) {
      toast.error("Duration must be between 15 and 600 minutes")
      return
    }

    const oldService = services?.find(s => s.id === editingService.id)
    const durationChanged = oldService && oldService.duration !== editingService.duration

    setServices((current) =>
      (current || []).map(s =>
        s.id === editingService.id ? editingService : s
      )
    )

    if (durationChanged) {
      updateFutureAppointments(editingService.name, editingService.duration)
      toast.success(`Service "${editingService.name}" updated. Future appointments will reflect the new ${editingService.duration}-minute duration.`)
    } else {
      toast.success(`Service "${editingService.name}" updated successfully`)
    }

    setEditDialogOpen(false)
    setEditingService(null)
  }

  const updateFutureAppointments = (serviceName: string, newDuration: number) => {
    const now = new Date()
    
    setAppointments((current) =>
      (current || []).map(apt => {
        const aptDate = new Date(apt.date)
        const isFutureAppointment = aptDate >= now && apt.status !== "cancelled" && apt.status !== "completed"
        
        if (isFutureAppointment && apt.services?.includes(serviceName)) {
          const updatedDurations = { ...(apt.serviceDurations || {}) }
          updatedDurations[serviceName] = newDuration
          
          return {
            ...apt,
            serviceDurations: updatedDurations
          }
        }
        
        return apt
      })
    )
  }

  const handleDeleteService = () => {
    if (!serviceToDelete) return

    const service = services?.find(s => s.id === serviceToDelete)
    if (!service) return

    const activeAppointments = appointments?.filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate >= new Date() && 
             apt.status !== "cancelled" && 
             apt.services?.includes(service.name)
    })

    if (activeAppointments && activeAppointments.length > 0) {
      toast.error(`Cannot delete "${service.name}". There are ${activeAppointments.length} future appointment(s) using this service.`)
      setDeleteDialogOpen(false)
      setServiceToDelete(null)
      return
    }

    setServices((current) => (current || []).filter(s => s.id !== serviceToDelete))
    toast.success(`Service "${service.name}" deleted successfully`)
    setDeleteDialogOpen(false)
    setServiceToDelete(null)
  }

  const openEditDialog = (service: Service) => {
    setEditingService({ ...service })
    setEditDialogOpen(true)
  }

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  const groupedServices = services?.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = []
    }
    acc[service.category].push(service)
    return acc
  }, {} as Record<string, Service[]>) || {}

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scissors size={24} />
                Services Management
              </CardTitle>
              <CardDescription>Manage salon services and their durations</CardDescription>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2" size={18} />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Service</DialogTitle>
                  <DialogDescription>
                    Add a new service to your salon offerings
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-service-name">Service Name</Label>
                    <Input
                      id="new-service-name"
                      placeholder="e.g., Balayage Highlights"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-service-category">Category</Label>
                    <Select 
                      value={newService.category}
                      onValueChange={(value) => setNewService({ ...newService, category: value })}
                    >
                      <SelectTrigger id="new-service-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-service-duration">Duration (minutes)</Label>
                    <Input
                      id="new-service-duration"
                      type="number"
                      min="15"
                      max="600"
                      step="15"
                      value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: parseInt(e.target.value) || 60 })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: 15-600 minutes
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateService}>
                    Create Service
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {serviceCategories.map((category) => {
              const categoryServices = groupedServices[category] || []
              if (categoryServices.length === 0) return null

              return (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-3">{category}</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service Name</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryServices.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock size={16} className="text-muted-foreground" />
                              {formatDuration(service.duration)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(service)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setServiceToDelete(service.id)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )
            })}
            
            {services && services.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No services found. Add your first service to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update service details. Duration changes will apply to all future appointments.
            </DialogDescription>
          </DialogHeader>
          {editingService && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-service-name">Service Name</Label>
                <Input
                  id="edit-service-name"
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-service-category">Category</Label>
                <Select 
                  value={editingService.category}
                  onValueChange={(value) => setEditingService({ ...editingService, category: value })}
                >
                  <SelectTrigger id="edit-service-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-service-duration">Duration (minutes)</Label>
                <Input
                  id="edit-service-duration"
                  type="number"
                  min="15"
                  max="600"
                  step="15"
                  value={editingService.duration}
                  onChange={(e) => setEditingService({ ...editingService, duration: parseInt(e.target.value) || 60 })}
                />
                <p className="text-xs text-muted-foreground">
                  Changes to duration will update all future appointments
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateService}>
              Update Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot be undone. Services with future appointments cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteService}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
