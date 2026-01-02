import { useKV } from "@github/spark/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface StaffMember {
  username: string
  password: string
  name: string
  role: string
  isAdmin: boolean
  availableServices?: string[]
}

interface Service {
  id: string
  name: string
  duration: number
  category: string
  price: string
}

export function DiagnosticPanel() {
  const [staffMembers] = useKV<StaffMember[]>("staff-members", [])
  const [services] = useKV<Service[]>("salon-services", [])

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] z-50">
      <Card className="shadow-2xl border-2 border-primary">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="text-sm">🔧 Booking System Diagnostics</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <ScrollArea className="h-[60vh]">
            <div className="space-y-4">
              {/* Staff Members Section */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  👥 Staff Members 
                  <Badge variant="secondary">{staffMembers?.length || 0}</Badge>
                </h3>
                {!staffMembers || staffMembers.length === 0 ? (
                  <p className="text-sm text-destructive">❌ No staff members loaded!</p>
                ) : (
                  <div className="space-y-2">
                    {staffMembers.map(staff => (
                      <div key={staff.username} className="text-xs border rounded p-2 bg-card">
                        <div className="font-semibold flex items-center gap-2">
                          {staff.name}
                          {staff.isAdmin && <Badge variant="outline" className="text-[10px]">Admin</Badge>}
                        </div>
                        <div className="text-muted-foreground">
                          Username: {staff.username}
                        </div>
                        <div className="text-muted-foreground">
                          Role: {staff.role}
                        </div>
                        {!staff.isAdmin && (
                          <div className="mt-1">
                            <span className="font-medium">Services: </span>
                            <Badge variant={staff.availableServices && staff.availableServices.length > 0 ? "default" : "destructive"}>
                              {staff.availableServices?.length || 0}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Services Section */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  💇 Services 
                  <Badge variant="secondary">{services?.length || 0}</Badge>
                </h3>
                {!services || services.length === 0 ? (
                  <p className="text-sm text-destructive">❌ No services loaded!</p>
                ) : (
                  <div className="space-y-1">
                    {services.map(service => (
                      <div key={service.id} className="text-xs border rounded p-1.5 bg-card">
                        <div className="font-medium">{service.name}</div>
                        <div className="text-muted-foreground text-[10px]">
                          {service.category} • {service.duration}min • {service.price}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bookable Staff Section */}
              <div>
                <h3 className="font-semibold mb-2">✅ Bookable Stylists</h3>
                {staffMembers && staffMembers.filter(s => !s.isAdmin).length > 0 ? (
                  <div className="space-y-2">
                    {staffMembers.filter(s => !s.isAdmin).map(staff => (
                      <div key={staff.username} className="text-xs border rounded p-2 bg-accent">
                        <div className="font-semibold">{staff.name}</div>
                        <div className="text-[10px] mt-1">
                          {staff.availableServices && staff.availableServices.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {staff.availableServices.slice(0, 3).map(service => (
                                <Badge key={service} variant="outline" className="text-[9px] py-0">
                                  {service}
                                </Badge>
                              ))}
                              {staff.availableServices.length > 3 && (
                                <Badge variant="secondary" className="text-[9px] py-0">
                                  +{staff.availableServices.length - 3} more
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-destructive">No services assigned!</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-destructive">❌ No bookable stylists!</p>
                )}
              </div>

              {/* Summary */}
              <div className="border-t pt-2">
                <h3 className="font-semibold mb-2 text-sm">📊 Summary</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Total Staff:</span>
                    <Badge>{staffMembers?.length || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Bookable Stylists:</span>
                    <Badge>{staffMembers?.filter(s => !s.isAdmin).length || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Services:</span>
                    <Badge>{services?.length || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Maria Services:</span>
                    <Badge variant={staffMembers?.find(s => s.username === 'maria')?.availableServices?.length === services?.length ? "default" : "destructive"}>
                      {staffMembers?.find(s => s.username === 'maria')?.availableServices?.length || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Paula Services:</span>
                    <Badge variant={staffMembers?.find(s => s.username === 'paula')?.availableServices?.length === services?.length ? "default" : "destructive"}>
                      {staffMembers?.find(s => s.username === 'paula')?.availableServices?.length || 0}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="border-t pt-2">
                <h3 className="font-semibold mb-2 text-sm">🎯 Status</h3>
                <div className="space-y-1 text-xs">
                  {staffMembers?.filter(s => !s.isAdmin).length === 2 ? (
                    <div className="text-green-600 dark:text-green-400">✅ Both Maria and Paula are present</div>
                  ) : (
                    <div className="text-destructive">❌ Missing staff members!</div>
                  )}
                  {staffMembers?.find(s => s.username === 'maria')?.availableServices?.length === 14 ? (
                    <div className="text-green-600 dark:text-green-400">✅ Maria has all 14 services</div>
                  ) : (
                    <div className="text-destructive">❌ Maria missing services!</div>
                  )}
                  {staffMembers?.find(s => s.username === 'paula')?.availableServices?.length === 14 ? (
                    <div className="text-green-600 dark:text-green-400">✅ Paula has all 14 services</div>
                  ) : (
                    <div className="text-destructive">❌ Paula missing services!</div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
