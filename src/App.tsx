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
import { AdminPanel } from "@/components/AdminPanel"
import { StaffSchedule } from "@/components/StaffSchedule"
import { CustomerProfile } from "@/components/CustomerProfile"
import { useAppointmentReminders } from "@/hooks/use-appointment-reminders"

function App() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [currentView, setCurrentView] = useState<"home" | "profile">("home")
  
  useAppointmentReminders()

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === "#profile") {
        setCurrentView("profile")
      } else {
        setCurrentView("home")
      }
    }

    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  if (currentView === "profile") {
    return (
      <>
        <CustomerProfile />
        <Toaster position="top-center" />
      </>
    )
  }

  return (
    <div id="home" className="min-h-screen">
      <Navigation onBookClick={() => setBookingOpen(true)} />
      <Hero onBookClick={() => setBookingOpen(true)} />
      <Services />
      <Gallery />
      <Team />
      <StaffSchedule />
      <AdminPanel />
      <Contact />
      <Footer />
      <BookingDialog open={bookingOpen} onOpenChange={setBookingOpen} />
      <Toaster position="top-center" />
    </div>
  )
}

export default App