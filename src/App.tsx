import { useState } from "react"
import { Toaster } from "@/components/ui/sonner"
import { Navigation } from "@/components/Navigation"
import { Hero } from "@/components/Hero"
import { Services } from "@/components/Services"
import { Team } from "@/components/Team"
import { Contact } from "@/components/Contact"
import { Footer } from "@/components/Footer"
import { BookingDialog } from "@/components/BookingDialog"
import { AdminPanel } from "@/components/AdminPanel"

function App() {
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <div id="home" className="min-h-screen">
      <Navigation onBookClick={() => setBookingOpen(true)} />
      <Hero onBookClick={() => setBookingOpen(true)} />
      <Services />
      <Team />
      <AdminPanel />
      <Contact />
      <Footer />
      <BookingDialog open={bookingOpen} onOpenChange={setBookingOpen} />
      <Toaster position="top-center" />
    </div>
  )
}

export default App