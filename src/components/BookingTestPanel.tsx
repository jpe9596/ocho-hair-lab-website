import { useEffect, useState } from "react"
import { useKV } from "@github/spark/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Info } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

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

export function BookingTestPanel() {
  const [staffMembers] = useKV<StaffMember[]>("staff-members", [])
  const [services] = useKV<Service[]>("salon-services", [])
  const [testResults, setTestResults] = useState<{
    mariaServiceCount: number
    paulaServiceCount: number
    totalServices: number
    mariaServices: string[]
    paulaServices: string[]
  } | null>(null)

  useEffect(() => {
    if (staffMembers && services) {
      const maria = staffMembers.find(s => s.username === "maria")
      const paula = staffMembers.find(s => s.username === "paula")

      setTestResults({
        mariaServiceCount: maria?.availableServices?.length || 0,
        paulaServiceCount: paula?.availableServices?.length || 0,
        totalServices: services.length,
        mariaServices: maria?.availableServices || [],
        paulaServices: paula?.availableServices || []
      })

      console.log("🧪 Test Panel - Staff Members:", staffMembers)
      console.log("🧪 Test Panel - Services:", services)
      console.log("🧪 Test Panel - Maria:", maria)
      console.log("🧪 Test Panel - Paula:", paula)
    }
  }, [staffMembers, services])

  const runDiagnostics = () => {
    console.group("📋 Booking Diagnostics")
    console.log("Staff Members Total:", staffMembers?.length)
    console.log("Services Total:", services?.length)
    
    const maria = staffMembers?.find(s => s.username === "maria")
    const paula = staffMembers?.find(s => s.username === "paula")
    
    console.log("\n👩 Maria:")
    console.log("  - Username:", maria?.username)
    console.log("  - Name:", maria?.name)
    console.log("  - Service Count:", maria?.availableServices?.length)
    console.log("  - Services:", maria?.availableServices)
    
    console.log("\n👩 Paula:")
    console.log("  - Username:", paula?.username)
    console.log("  - Name:", paula?.name)
    console.log("  - Service Count:", paula?.availableServices?.length)
    console.log("  - Services:", paula?.availableServices)
    
    console.log("\n💇 All Services:")
    services?.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.name} (${s.category})`)
    })
    
    console.groupEnd()
  }

  if (!testResults) {
    return (
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info size={20} />
            Loading Test Data...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const mariaPass = testResults.mariaServiceCount === 14
  const paulaPass = testResults.paulaServiceCount === 14
  const allPass = mariaPass && paulaPass && testResults.totalServices === 14

  return (
    <Card className={`border-2 ${allPass ? "border-green-500" : "border-yellow-500"}`}>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          {allPass ? (
            <CheckCircle size={24} weight="fill" className="text-green-500" />
          ) : (
            <XCircle size={24} weight="fill" className="text-yellow-500" />
          )}
          Booking Test Panel
        </CardTitle>
        <CardDescription>
          Verify Maria and Paula have all 14 services configured
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-card border">
            <div className="text-sm text-muted-foreground mb-1">Total Services</div>
            <div className="text-3xl font-bold">{testResults.totalServices}</div>
            <Badge variant={testResults.totalServices === 14 ? "default" : "destructive"} className="mt-2">
              {testResults.totalServices === 14 ? "✓ Correct" : "✗ Expected 14"}
            </Badge>
          </div>

          <div className="p-4 rounded-lg bg-card border">
            <div className="text-sm text-muted-foreground mb-1">Maria's Services</div>
            <div className="text-3xl font-bold">{testResults.mariaServiceCount}</div>
            <Badge variant={mariaPass ? "default" : "destructive"} className="mt-2">
              {mariaPass ? "✓ All 14" : `✗ Has ${testResults.mariaServiceCount}`}
            </Badge>
          </div>

          <div className="p-4 rounded-lg bg-card border">
            <div className="text-sm text-muted-foreground mb-1">Paula's Services</div>
            <div className="text-3xl font-bold">{testResults.paulaServiceCount}</div>
            <Badge variant={paulaPass ? "default" : "destructive"} className="mt-2">
              {paulaPass ? "✓ All 14" : `✗ Has ${testResults.paulaServiceCount}`}
            </Badge>
          </div>
        </div>

        {allPass && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold flex items-center gap-2">
              <CheckCircle size={20} weight="fill" />
              All Tests Passed!
            </p>
            <p className="text-green-700 text-sm mt-1">
              Both Maria and Paula have all 14 services configured. Ready to test booking!
            </p>
          </div>
        )}

        {!allPass && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-semibold">Configuration Issue Detected</p>
            <p className="text-yellow-700 text-sm mt-1">
              Expected both stylists to have 14 services each. Check console for details.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Service Categories</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span>Tinte</span>
              <Badge variant="outline">4 services</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span>Corte & Styling</span>
              <Badge variant="outline">5 services</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span>Bespoke Color</span>
              <Badge variant="outline">3 services</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span>Treatments</span>
              <Badge variant="outline">2 services</Badge>
            </div>
          </div>
        </div>

        <Button onClick={runDiagnostics} variant="outline" className="w-full">
          Run Console Diagnostics
        </Button>

        <details className="text-sm">
          <summary className="cursor-pointer font-semibold mb-2">View All Services</summary>
          <div className="space-y-1 pl-4 text-muted-foreground">
            {services?.map((service, i) => (
              <div key={service.id}>
                {i + 1}. {service.name} ({service.category}) - {service.duration}min - {service.price}
              </div>
            ))}
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
