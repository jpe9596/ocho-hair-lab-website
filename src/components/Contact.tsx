import { MapPin, Phone, Envelope, InstagramLogo, Clock } from "@phosphor-icons/react"

export function Contact() {
  return (
    <section id="contact" className="py-20 md:py-32 px-6 md:px-8 bg-gradient-to-br from-accent via-primary to-accent text-primary-foreground">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Visit Us
          </h2>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            We can't wait to welcome you to Ocho Hair Lab
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="inline-flex p-4 bg-primary-foreground/10 rounded-full mb-4">
              <MapPin size={32} weight="duotone" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Location</h3>
            <p className="text-primary-foreground/80">
              Río Hudson 414<br />
              San Pedro Garza García<br />
              66220, N.L.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex p-4 bg-primary-foreground/10 rounded-full mb-4">
              <Phone size={32} weight="duotone" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Phone</h3>
            <a href="tel:+15551234567" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              (555) 123-4567
            </a>
          </div>

          <div className="text-center">
            <div className="inline-flex p-4 bg-primary-foreground/10 rounded-full mb-4">
              <Envelope size={32} weight="duotone" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Email</h3>
            <a href="mailto:hello@ochohairlab.com" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              hello@ochohairlab.com
            </a>
          </div>

          <div className="text-center">
            <div className="inline-flex p-4 bg-primary-foreground/10 rounded-full mb-4">
              <Clock size={32} weight="duotone" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Hours</h3>
            <p className="text-primary-foreground/80">
              Tue-Fri: 10am-7pm<br />
              Sat: 9am-6pm<br />
              Sun-Mon: Closed
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <a 
            href="https://www.instagram.com/ochohairlab/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors text-lg"
          >
            <InstagramLogo size={24} weight="fill" />
            Follow us @ochohairlab
          </a>
        </div>
      </div>
    </section>
  )
}
