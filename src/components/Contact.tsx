import { InstagramLogo, MapPin } from "@phosphor-icons/react"
import contactImg from "@/assets/images/Screenshot_2026-01-01_at_7.42.16_PM.png"

export function Contact() {
  return (
    <section id="contact" className="py-20 md:py-32 px-6 md:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/5] bg-muted rounded-lg overflow-hidden">
            <img 
              src={contactImg} 
              alt="Professional hair styling" 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center justify-center">
            <div className="border-4 border-foreground p-12 md:p-16 max-w-lg">
              <h2 
                className="text-5xl md:text-6xl font-light text-center mb-12 tracking-wider" 
                style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, letterSpacing: '0.05em' }}
              >
                CONTACT US
              </h2>

              <div className="space-y-8 text-center">
                <div>
                  <h3 className="text-sm font-semibold tracking-widest mb-2">PHONE</h3>
                  <a 
                    href="tel:+528116153747" 
                    className="text-foreground hover:text-foreground/70 transition-colors"
                  >
                    (81) 1615-3747
                  </a>
                </div>

                <div>
                  <h3 className="text-sm font-semibold tracking-widest mb-2">EMAIL</h3>
                  <a 
                    href="mailto:hello@ochohairlab.com" 
                    className="text-foreground hover:text-foreground/70 transition-colors uppercase text-sm"
                  >
                    HELLO@OCHOHAIRLAB.COM
                  </a>
                </div>

                <div>
                  <h3 className="text-sm font-semibold tracking-widest mb-2 flex items-center justify-center gap-2">
                    <MapPin size={16} weight="fill" />
                    LOCATION
                  </h3>
                  <p className="text-foreground text-sm leading-relaxed">
                    Urbox Plaza<br />
                    Río Hudson 414, Del Valle<br />
                    66220 San Pedro Garza García, N.L.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold tracking-widest mb-4">SOCIAL</h3>
                  <div className="flex items-center justify-center gap-4">
                    <a 
                      href="https://www.instagram.com/ochohairlab/?hl=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                      aria-label="Instagram"
                    >
                      <InstagramLogo size={20} weight="fill" />
                    </a>
                  </div>
                </div>

                <div className="pt-6 text-xs leading-relaxed text-foreground/70">
                  OUR SALONS ARE FULLY ACCESSIBLE.<br />
                  PLEASE REACH OUT FOR FURTHER<br />
                  ACCOMMODATIONS.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
