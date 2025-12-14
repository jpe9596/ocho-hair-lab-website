import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { List, X, UserCircle } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface NavigationProps {
  onBookClick?: () => void
}

export function Navigation({ onBookClick }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
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

  const handleStaffLoginClick = () => {
    window.location.hash = "#staff"
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
                onClick={handleStaffLoginClick}
                className="text-foreground/70 hover:text-foreground transition-colors font-medium flex items-center gap-2"
              >
                <UserCircle size={18} weight="fill" />
                Staff Login
              </button>
              <Button onClick={handleProfileClick} size="sm">
                Book Appointment
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
                onClick={handleStaffLoginClick}
                className="block w-full text-left py-2 text-foreground/70 hover:text-foreground transition-colors font-medium flex items-center gap-2"
              >
                <UserCircle size={18} weight="fill" />
                Staff Login
              </button>
              <Button onClick={handleProfileClick} className="w-full">
                Book Appointment
              </Button>
            </div>
          </div>
        )}
      </nav>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-md border-t border-border">
        <Button onClick={handleProfileClick} className="w-full" size="lg">
          Book Appointment
        </Button>
      </div>
    </>
  )
}
