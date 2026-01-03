import { useState, useEffect } from "react"
import { useKV } from "@/hooks/spark-compat"
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

interface StoredStaffMember extends StaffMember {
  password: string
}

export function StaffLogin({ onLogin, onBack }: StaffLoginProps) {
  const [staffMembers] = useKV<StoredStaffMember[]>("staff-members", [])
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    console.log('👤 StaffLogin: Component mounted')
    console.log('👤 StaffLogin: Staff members loaded:', staffMembers?.length || 0)
    if (staffMembers && staffMembers.length > 0) {
      staffMembers.forEach(s => {
        console.log(`   - ${s.name}: username="${s.username}", password="${s.password}", isAdmin=${s.isAdmin}`)
      })
    }
  }, [staffMembers])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      console.log('🔐 Staff Login Attempt:')
      console.log('   - Username entered:', username)
      console.log('   - Password entered:', password ? '(provided)' : '(empty)')
      console.log('   - Available staff:', staffMembers?.length || 0)
      
      if (!staffMembers || staffMembers.length === 0) {
        console.log('❌ Login failed: No staff members loaded')
        toast.error("System is initializing. Please wait a moment and try again.")
        setIsLoading(false)
        return
      }
      
      staffMembers.forEach(s => {
        console.log(`   - Checking ${s.name}: username="${s.username}", password="${s.password}", isAdmin=${s.isAdmin}`)
      })
      
      const staff = staffMembers.find(
        s => s.username.toLowerCase().trim() === username.toLowerCase().trim() && s.password === password.trim()
      )
      
      if (!staff) {
        console.log('❌ Login failed: No matching credentials')
        console.log(`   - Tried username: "${username.toLowerCase().trim()}"`)
        console.log(`   - Tried password: "${password.trim()}"`)
        toast.error("Invalid username or password")
        setIsLoading(false)
        return
      }

      console.log(`✅ Login successful: ${staff.name} (${staff.role})`)
      toast.success(`Welcome back, ${staff.name}!`)
      onLogin({
        username: staff.username,
        name: staff.name,
        role: staff.role,
        isAdmin: staff.isAdmin
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
          {(!staffMembers || staffMembers.length === 0) && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-xs text-yellow-800 text-center">
                System is loading... Please wait a moment.
              </p>
            </div>
          )}
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
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !staffMembers || staffMembers.length === 0}
            >
              <SignIn className="mr-2" size={18} />
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
