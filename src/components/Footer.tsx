export function Footer() {
  return (
    <footer className="bg-background py-12 px-6 md:px-8 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-2xl font-bold mb-2 text-primary" style={{ fontFamily: 'var(--font-display)' }}>
              ocho
            </p>
            <p className="text-sm tracking-[0.2em] text-muted-foreground">
              HAIR LAB
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a 
              href="/#home" 
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Home
            </a>
            <a 
              href="/#services" 
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Services
            </a>
            <a 
              href="/#contact" 
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Contact
            </a>
            <a 
              href="#profile" 
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              My Appointments
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-foreground/60">
            © {new Date().getFullYear()} Ocho Hair Lab. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
