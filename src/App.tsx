import { useState, useEffect } from "react"
import { Toaster } from "@/components/ui/sonner"
import { Navigation } from "@/components/Navigation"
import { Hero } from "@/components/Hero"
import { Services } from "@/components/Services"
import { Gallery } from "@/components/Gallery"
import { Team } from "@/components/Team"
import { Contact } from "@/components/Contact"
import { Footer } from "@/components/Footer"
import { BookingDialog } from "@/components/BookingDialog"
import { BookingPage } from "@/components/BookingPage"
import { CustomerProfile } from "@/components/CustomerProfile"
import { AdminDashboard } from "@/components/AdminDashboard"
import { StaffLogin, StaffMember } from "@/components/StaffLogin"
import { StaffDashboard } from "@/components/StaffDashboard"
import { useAppointmentReminders } from "@/hooks/use-appointment-reminders"

function App() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [currentView, setCurrentView] = useState<"home" | "profile" | "admin" | "staff" | "booking">("home")
  const [staffMember, setStaffMember] = useState<StaffMember | null>(null)
  
  useAppointmentReminders()

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === "#profile") {
        setCurrentView("profile")
        setStaffMember(null)
      } else if (hash === "#admin") {
        setCurrentView("admin")
        setStaffMember(null)
      } else if (hash === "#staff") {
        setCurrentView("staff")
      } else if (hash === "#booking") {
        setCurrentView("booking")
        setStaffMember(null)
      } else {
        setCurrentView("home")
        setStaffMember(null)
      }
    }

    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  if (currentView === "booking") {
    return (
      <>
        <BookingPage />
        <Toaster position="top-center" />
      </>
    )
  }

  if (currentView === "profile") {
    return (
      <>
        <CustomerProfile />
        <Toaster position="top-center" />
      </>
    )
  }

  if (currentView === "admin") {
    return (
      <>
        <AdminDashboard />
        <Toaster position="top-center" />
      </>
    )
  }

  if (currentView === "staff") {
    if (!staffMember) {
      return (
        <>
          <StaffLogin
            onLogin={(member) => {
              if (member.isAdmin) {
                window.location.hash = "#admin"
                setCurrentView("admin")
              } else {
                setStaffMember(member)
              }
            }}
            onBack={() => {
              window.location.hash = ""
              setCurrentView("home")
            }}
          />
          <Toaster position="top-center" />
        </>
      )
    }

    return (
      <>
        <StaffDashboard
          staffMember={staffMember}
          onLogout={() => {
            setStaffMember(null)
            window.location.hash = ""
            setCurrentView("home")
          }}
        />
        <Toaster position="top-center" />
      </>
    )
  }

  return (
    <div id="home" className="min-h-screen">
      <Navigation />
      <Hero />
      <Services />
      <Gallery />
      <Team />
      <Contact />
      <Footer />
      <BookingDialog open={bookingOpen} onOpenChange={setBookingOpen} />
      <Toaster position="top-center" />
    </div>
  )
}

export default App