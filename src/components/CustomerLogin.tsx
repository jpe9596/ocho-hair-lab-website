import { useState, useEffect } from "react"
import { useKV } from "@github/spark/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, SignIn } from "@phosphor-icons/react"
import { toast } from "sonner"

interface CustomerAccount {
  email: string
  password: string
  name: string
  phone: string
}

interface CustomerLoginProps {
  onLogin: (email: string) => void
  onBack: () => void
}

export function CustomerLogin({ onLogin, onBack }: CustomerLoginProps) {
  const [accounts] = useKV<CustomerAccount[]>("customer-accounts", [])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const bookingEmail = sessionStorage.getItem('bookingEmail')
    const bookingPassword = sessionStorage.getItem('bookingPassword')
    
    if (bookingEmail && bookingPassword) {
      setEmail(bookingEmail)
      setPassword(bookingPassword)
      sessionStorage.removeItem('bookingEmail')
      sessionStorage.removeItem('bookingPassword')
      
      setTimeout(() => {
        const normalizedEmail = bookingEmail.toLowerCase().trim()
        const account = accounts?.find(
          acc => acc.email?.toLowerCase().trim() === normalizedEmail && acc.password === bookingPassword
        )
        
        if (account) {
          toast.success(`Welcome, ${account.name}! Your appointment has been booked.`)
          sessionStorage.setItem('customerEmail', normalizedEmail)
          onLogin(normalizedEmail)
        }
      }, 800)
    }
  }, [accounts, onLogin])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const normalizedEmail = email.toLowerCase().trim()
    const account = accounts?.find(
      acc => acc.email?.toLowerCase().trim() === normalizedEmail && acc.password === password
    )

    if (account) {
      toast.success(`Welcome back, ${account.name}!`)
      sessionStorage.setItem('customerEmail', normalizedEmail)
      onLogin(normalizedEmail)
    } else {
      toast.error("Invalid email or password")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-muted to-card py-12 px-6 flex items-center justify-center">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, oklch(0.15 0 0 / 0.03) 35px, oklch(0.15 0 0 / 0.03) 70px)`
      }} />
      
      <div className="relative z-10 w-full max-w-md">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="mr-2" size={20} />
          Home
        </Button>

        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Customer Login
            </CardTitle>
            <CardDescription>
              Access your appointments and manage bookings
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                <SignIn className="mr-2" size={20} weight="bold" />
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Your password is created when you book your first appointment</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
