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
import { CustomerLogin } from "@/components/CustomerLogin"
import { AdminDashboard } from "@/components/AdminDashboard"
import { StaffLogin, StaffMember } from "@/components/StaffLogin"
import { StaffDashboard } from "@/components/StaffDashboard"
import { CancelAppointment } from "@/components/CancelAppointment"
import { useAppointmentReminders } from "@/hooks/use-appointment-reminders"

function App() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [currentView, setCurrentView] = useState<"home" | "profile" | "customer-login" | "admin" | "staff" | "booking" | "cancel">("home")
  const [staffMember, setStaffMember] = useState<StaffMember | null>(null)
  const [cancelAppointmentId, setCancelAppointmentId] = useState<string | null>(null)
  const [customerEmail, setCustomerEmail] = useState<string | null>(null)
  
  useAppointmentReminders()

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === "#profile") {
        setCurrentView("profile")
        setStaffMember(null)
        setCancelAppointmentId(null)
      } else if (hash === "#customer-login") {
        setCurrentView("customer-login")
        setStaffMember(null)
        setCancelAppointmentId(null)
      } else if (hash === "#admin") {
        setCurrentView("admin")
        setStaffMember(null)
        setCancelAppointmentId(null)
      } else if (hash === "#staff") {
        setCurrentView("staff")
        setCancelAppointmentId(null)
      } else if (hash === "#booking") {
        setCurrentView("booking")
        setStaffMember(null)
        setCancelAppointmentId(null)
      } else if (hash.startsWith("#cancel-")) {
        const appointmentId = hash.replace("#cancel-", "")
        setCancelAppointmentId(appointmentId)
        setCurrentView("cancel")
        setStaffMember(null)
      } else {
        setCurrentView("home")
        setStaffMember(null)
        setCancelAppointmentId(null)
      }
    }

    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  if (currentView === "customer-login") {
    return (
      <>
        <CustomerLogin
          onLogin={(email) => {
            setCustomerEmail(email)
            window.location.hash = "#profile"
            setCurrentView("profile")
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

  if (currentView === "cancel" && cancelAppointmentId) {
    return (
      <>
        <CancelAppointment
          appointmentId={cancelAppointmentId}
          onBack={() => {
            window.location.hash = ""
            setCurrentView("home")
          }}
        />
        <Toaster position="top-center" />
      </>
    )
  }

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
        <CustomerProfile
          customerEmail={customerEmail || undefined}
          onLogout={() => {
            setCustomerEmail(null)
            window.location.hash = ""
            setCurrentView("home")
          }}
        />
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