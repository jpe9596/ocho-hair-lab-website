import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { SignIn, ArrowLeft } from "@phosphor-icons/react"
import { toast } from "sonner"

interface StaffLoginProps {
  onLogin: (staffMember: StaffMember) => void
  onBack: () => void
}

export interface StaffMember {
  username: string
  name: string
  role: string
  isAdmin: boolean
}

const STAFF_CREDENTIALS: Record<string, { password: string; name: string; role: string; isAdmin: boolean }> = {
  "maria": {
    password: "supersecret",
    name: "Maria Rodriguez",
    role: "Owner & Master Stylist",
    isAdmin: false
  },
  "jessica": {
    password: "supersecret",
    name: "Jessica Chen",
    role: "Senior Stylist",
    isAdmin: false
  },
  "alex": {
    password: "supersecret",
    name: "Alex Thompson",
    role: "Color Specialist",
    isAdmin: false
  },
  "sophia": {
    password: "supersecret",
    name: "Sophia Martinez",
    role: "Stylist",
    isAdmin: false
  },
  "owner@ocholab.com": {
    password: "owner123",
    name: "Admin",
    role: "Owner",
    isAdmin: true
  }
}

export function StaffLogin({ onLogin, onBack }: StaffLoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      const credentials = STAFF_CREDENTIALS[username.toLowerCase().trim()]
      
      if (!credentials) {
        toast.error("Invalid username")
        setIsLoading(false)
        return
      }

      if (credentials.password !== password) {
        toast.error("Invalid password")
        setIsLoading(false)
        return
      }

      toast.success(`Welcome back, ${credentials.name}!`)
      onLogin({
        username: username.toLowerCase().trim(),
        name: credentials.name,
        role: credentials.role,
        isAdmin: credentials.isAdmin
      })
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mr-auto"
            >
              <ArrowLeft className="mr-2" size={16} />
              Back
            </Button>
          </div>
          <CardTitle className="text-3xl font-bold text-center" style={{ fontFamily: 'var(--font-display)' }}>
            Staff Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
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
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              <SignIn className="mr-2" size={18} />
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
