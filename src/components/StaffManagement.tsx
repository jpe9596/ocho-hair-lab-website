import { useState } from "react"
import { useKV } from "@/hooks/spark-compat"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash, Key, Users, UserCircle, ShieldCheck, Scissors } from "@phosphor-icons/react"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Service } from "@/components/ServicesManagement"

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

export function StaffManagement() {
  const [staffMembers, setStaffMembers] = useKV<StaffMember[]>("staff-members", [])
  const [customerAccounts, setCustomerAccounts] = useKV<CustomerAccount[]>("customer-accounts", [])
  const [services] = useKV<Service[]>("salon-services", [])
  
  const [newStaff, setNewStaff] = useState({
    username: "",
    password: "",
    name: "",
    role: "",
    isAdmin: false,
    availableServices: [] as string[]
  })
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false)
  const [staffForServices, setStaffForServices] = useState<string | null>(null)
  
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<{ type: 'staff' | 'customer', identifier: string } | null>(null)
  const [newPassword, setNewPassword] = useState("")
  
  const [deleteCustomerDialogOpen, setDeleteCustomerDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null)

  const allServices = services?.map(s => s.name) || []

  const handleCreateStaff = () => {
    if (!newStaff.username || !newStaff.password || !newStaff.name || !newStaff.role) {
      toast.error("Please fill in all fields")
      return
    }

    const exists = staffMembers?.some(s => s.username.toLowerCase() === newStaff.username.toLowerCase())
    if (exists) {
      toast.error("Username already exists")
      return
    }

    setStaffMembers((current) => [...(current || []), {
      username: newStaff.username.toLowerCase().trim(),
      password: newStaff.password,
      name: newStaff.name,
      role: newStaff.role,
      isAdmin: newStaff.isAdmin
    }])

    toast.success(`Staff member ${newStaff.name} created successfully`)
    setNewStaff({ username: "", password: "", name: "", role: "", isAdmin: false, availableServices: [] })
    setCreateDialogOpen(false)
  }

  const handleDeleteStaff = () => {
    if (!staffToDelete) return

    const staff = staffMembers?.find(s => s.username === staffToDelete)
    if (staff?.isAdmin) {
      toast.error("Cannot delete admin account")
      setDeleteDialogOpen(false)
      setStaffToDelete(null)
      return
    }

    setStaffMembers((current) => (current || []).filter(s => s.username !== staffToDelete))
    toast.success(`Staff member deleted successfully`)
    setDeleteDialogOpen(false)
    setStaffToDelete(null)
  }

  const handleResetPassword = () => {
    if (!resetTarget || !newPassword) {
      toast.error("Please enter a new password")
      return
    }

    if (resetTarget.type === 'staff') {
      setStaffMembers((current) => 
        (current || []).map(s => 
          s.username === resetTarget.identifier 
            ? { ...s, password: newPassword }
            : s
        )
      )
      toast.success("Staff password reset successfully")
    } else if (resetTarget.type === 'customer') {
      setCustomerAccounts((current) =>
        (current || []).map(c =>
          c.email === resetTarget.identifier
            ? { ...c, password: newPassword }
            : c
        )
      )
      toast.success("Customer password reset successfully")
    }

    setResetPasswordDialogOpen(false)
    setResetTarget(null)
    setNewPassword("")
  }

  const openResetDialog = (type: 'staff' | 'customer', identifier: string) => {
    setResetTarget({ type, identifier })
    setNewPassword("")
    setResetPasswordDialogOpen(true)
  }

  const handleDeleteCustomer = () => {
    if (!customerToDelete) return

    setCustomerAccounts((current) => (current || []).filter(c => c.email !== customerToDelete))
    toast.success("Customer account deleted successfully")
    setDeleteCustomerDialogOpen(false)
    setCustomerToDelete(null)
  }

  const handleUpdateServices = (services: string[]) => {
    if (!staffForServices) return

    setStaffMembers((current) =>
      (current || []).map(s =>
        s.username === staffForServices
          ? { ...s, availableServices: services }
          : s
      )
    )
    toast.success("Services updated successfully")
  }

  const openServiceDialog = (username: string) => {
    setStaffForServices(username)
    setServiceDialogOpen(true)
  }

  const getCurrentServices = (): string[] => {
    if (!staffForServices) return []
    const staff = staffMembers?.find(s => s.username === staffForServices)
    return staff?.availableServices || []
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="staff" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="staff">
            <Users className="mr-2" size={18} />
            Staff Members
          </TabsTrigger>
          <TabsTrigger value="customers">
            <UserCircle className="mr-2" size={18} />
            Customers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users size={24} />
                    Staff Members
                  </CardTitle>
                  <CardDescription>Manage staff accounts and permissions</CardDescription>
                </div>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2" size={18} />
                      Add Staff
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Staff Member</DialogTitle>
                      <DialogDescription>
                        Add a new staff member to the system
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-username">Username</Label>
                        <Input
                          id="new-username"
                          placeholder="e.g., john.doe"
                          value={newStaff.username}
                          onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-name">Full Name</Label>
                        <Input
                          id="new-name"
                          placeholder="e.g., John Doe"
                          value={newStaff.name}
                          onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-role">Role</Label>
                        <Input
                          id="new-role"
                          placeholder="e.g., Senior Stylist"
                          value={newStaff.role}
                          onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Enter password"
                          value={newStaff.password}
                          onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="new-admin"
                          checked={newStaff.isAdmin}
                          onChange={(e) => setNewStaff({ ...newStaff, isAdmin: e.target.checked })}
                          className="rounded border-input"
                        />
                        <Label htmlFor="new-admin" className="cursor-pointer">
                          Admin privileges
                        </Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateStaff}>
                        Create Staff Member
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffMembers && staffMembers.length > 0 ? (
                    staffMembers.map((staff) => (
                      <TableRow key={staff.username}>
                        <TableCell className="font-medium">{staff.username}</TableCell>
                        <TableCell>{staff.name}</TableCell>
                        <TableCell>{staff.role}</TableCell>
                        <TableCell>
                          {staff.isAdmin ? (
                            <Badge variant="default" className="gap-1">
                              <ShieldCheck size={14} weight="fill" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Staff</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {!staff.isAdmin && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openServiceDialog(staff.username)}
                              >
                                <Scissors size={16} className="mr-1" />
                                Services
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openResetDialog('staff', staff.username)}
                            >
                              <Key size={16} className="mr-1" />
                              Reset Password
                            </Button>
                            {!staff.isAdmin && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setStaffToDelete(staff.username)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash size={16} />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No staff members found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle size={24} />
                Customer Accounts
              </CardTitle>
              <CardDescription>Manage customer passwords and accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerAccounts && customerAccounts.length > 0 ? (
                    customerAccounts.map((customer) => (
                      <TableRow key={customer.email}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openResetDialog('customer', customer.email)}
                            >
                              <Key size={16} className="mr-1" />
                              Reset Password
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setCustomerToDelete(customer.email)
                                setDeleteCustomerDialogOpen(true)
                              }}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No customer accounts found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this staff member? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteStaff}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteCustomerDialogOpen} onOpenChange={setDeleteCustomerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this customer account? This action cannot be undone and will remove their account information.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCustomerDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCustomer}>
              Delete Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              {resetTarget?.type === 'staff' 
                ? `Reset password for staff member: ${resetTarget.identifier}`
                : `Reset password for customer: ${resetTarget?.identifier}`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password">New Password</Label>
              <Input
                id="reset-password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword}>
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scissors size={24} />
              Manage Available Services
            </DialogTitle>
            <DialogDescription>
              Select which services {staffMembers?.find(s => s.username === staffForServices)?.name} can perform
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 py-4">
              {allServices.map((service) => {
                const currentServices = getCurrentServices()
                const isChecked = currentServices.includes(service)
                
                return (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const updated = checked
                          ? [...currentServices, service]
                          : currentServices.filter(s => s !== service)
                        handleUpdateServices(updated)
                      }}
                    />
                    <Label
                      htmlFor={`service-${service}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {service}
                    </Label>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setServiceDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
