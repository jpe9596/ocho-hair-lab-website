import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, List, X, ShieldCheck } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface NavigationProps {
  onBookClick: () => void
}

export function Navigation({ onBookClick }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    async function checkOwner() {
      try {
        const user = await window.spark.user()
        setIsOwner(user?.isOwner || false)
      } catch {
        setIsOwner(false)
      }
    }
    checkOwner()
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setIsMobileMenuOpen(false)
    }
  }

  const navLinks = [
    { label: "Home", id: "home" },
    { label: "Services", id: "services" },
    { label: "Gallery", id: "gallery" },
    { label: "Team", id: "team" },
    { label: "Contact", id: "contact" },
  ]

  const handleProfileClick = () => {
    window.location.hash = "#profile"
    setIsMobileMenuOpen(false)
  }

  const handleAdminClick = () => {
    window.location.hash = "#admin"
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-md" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex items-center justify-between h-20">
            <button 
              onClick={() => scrollToSection("home")}
              className="text-2xl font-bold tracking-tight text-primary hover:opacity-80 transition-opacity"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              ocho
            </button>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-foreground/70 hover:text-foreground transition-colors font-medium"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={handleProfileClick}
                className="text-foreground/70 hover:text-foreground transition-colors font-medium"
              >
                My Appointments
              </button>
              {isOwner && (
                <button
                  onClick={handleAdminClick}
                  className="text-primary/80 hover:text-primary transition-colors font-medium flex items-center gap-2"
                  title="Admin Dashboard"
                >
                  <ShieldCheck size={18} weight="fill" />
                  Admin
                </button>
              )}
              <Button onClick={onBookClick} size="sm">
                <Calendar className="mr-2" size={18} />
                Book Now
              </Button>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border">
            <div className="px-6 py-4 space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="block w-full text-left py-2 text-foreground/70 hover:text-foreground transition-colors font-medium"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={handleProfileClick}
                className="block w-full text-left py-2 text-foreground/70 hover:text-foreground transition-colors font-medium"
              >
                My Appointments
              </button>
              {isOwner && (
                <button
                  onClick={handleAdminClick}
                  className="block w-full text-left py-2 text-primary/80 hover:text-primary transition-colors font-medium flex items-center gap-2"
                >
                  <ShieldCheck size={18} weight="fill" />
                  Admin Dashboard
                </button>
              )}
              <Button onClick={onBookClick} className="w-full">
                <Calendar className="mr-2" size={18} />
                Book Appointment
              </Button>
            </div>
          </div>
        )}
      </nav>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-md border-t border-border">
        <Button onClick={onBookClick} className="w-full" size="lg">
          <Calendar className="mr-2" size={20} />
          Book Now
        </Button>
      </div>
    </>
  )
}
