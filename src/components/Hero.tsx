import { UserCircle } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

interface HeroProps {
  onBookClick?: () => void
}

export function Hero({ onBookClick }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-muted to-card">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, oklch(0.15 0 0 / 0.03) 35px, oklch(0.15 0 0 / 0.03) 70px)`
      }} />
      
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="inline-block mb-8 p-8 bg-secondary/40 backdrop-blur-sm rounded-2xl">
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-primary" style={{ fontFamily: 'var(--font-display)' }}>
              ocho
            </h1>
            <p className="text-xl md:text-2xl font-medium tracking-[0.3em] text-primary/90" style={{ fontFamily: 'var(--font-sans)' }}>
              HAIR LAB
            </p>
          </div>
        </div>
        
        <div className="text-xl md:text-2xl text-foreground/80 mb-12 max-w-2xl mx-auto leading-relaxed">
          <p>Experts in blended color designs.</p>
          <p>Damage-free extensions with plant-based products.</p>
        </div>
        
        <Button 
          size="lg" 
          onClick={() => window.location.hash = "#booking"}
          className="text-lg px-8 py-6 hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl"
        >
          <UserCircle className="mr-2" size={24} weight="fill" />
          Book Appointment
        </Button>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 bg-primary/50 rounded-full" />
        </div>
      </div>
    </section>
  )
}
