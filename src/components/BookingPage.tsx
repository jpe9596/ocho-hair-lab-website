import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingDialog } from "@/components/BookingDialog"
import { ArrowLeft, UserCircle, UserPlus } from "@phosphor-icons/react"
import { useKV } from "@github/spark/hooks"
import { toast } from "sonner"

interface Customer {
  phone: string
  email: string
  name: string
  password: string
}

interface Appointment {
  id: string
  name: string
  email: string
  phone: string
  service: string
  services: string[]
  stylist: string
  date: Date
  time: string
  notes: string
  createdAt: Date
}

export function BookingPage() {
  const [customers] = useKV<Customer[]>("customers", [])
  const [appointments] = useKV<Appointment[]>("appointments", [])
  const [loginData, setLoginData] = useState({ phone: "", email: "", password: "" })
  const [signupData, setSignupData] = useState({ name: "", email: "", phone: "", password: "" })
  const [authenticatedCustomer, setAuthenticatedCustomer] = useState<Customer | null>(null)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [newCustomers, setNewCustomers] = useKV<Customer[]>("customers", [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    const customer = (customers || []).find(
      c => (c.phone === loginData.phone || c.email === loginData.email) && c.password === loginData.password
    )

    if (customer) {
      setAuthenticatedCustomer(customer)
      setBookingOpen(true)
      toast.success(`Welcome back, ${customer.name}!`)
    } else {
      toast.error("Invalid credentials. Please check your phone/email and password.")
    }
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    
    const existingCustomer = (customers || []).find(
      c => c.phone === signupData.phone || c.email === signupData.email
    )

    if (existingCustomer) {
      toast.error("An account with this phone or email already exists. Please login instead.")
      return
    }

    const newCustomer: Customer = {
      name: signupData.name,
      email: signupData.email,
      phone: signupData.phone,
      password: signupData.password
    }

    setNewCustomers((current) => [...(current || []), newCustomer])
    setAuthenticatedCustomer(newCustomer)
    setBookingOpen(true)
    toast.success(`Welcome, ${newCustomer.name}!`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-muted to-card flex items-center justify-center p-6">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, oklch(0.15 0 0 / 0.03) 35px, oklch(0.15 0 0 / 0.03) 70px)`
      }} />
      
      <div className="relative z-10 w-full max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => {
            window.location.hash = ""
          }}
          className="mb-6"
        >
          <ArrowLeft className="mr-2" size={20} />
          Home
        </Button>

        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Book Your Appointment
            </CardTitle>
            <CardDescription className="text-base">
              Login to your account or create a new one to get started
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login" className="text-base">
                  <UserCircle className="mr-2" size={20} />
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-base">
                  <UserPlus className="mr-2" size={20} />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="login-phone">Phone Number</Label>
                    <Input
                      id="login-phone"
                      type="tel"
                      placeholder="81 1615 3747"
                      value={loginData.phone}
                      onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter either your phone number or email to continue
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Continue to Booking
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name *</Label>
                    <Input
                      id="signup-name"
                      placeholder="Jane Doe"
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number (Mexico) *</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="81 1615 3747"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll send appointment confirmations to +521 {signupData.phone || "XXXXXXXXXX"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Create Password *</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a secure password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 6 characters
                    </p>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Create Account & Book
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <BookingDialog open={bookingOpen} onOpenChange={setBookingOpen} />
    </div>
  )
}
