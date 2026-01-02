import { motion } from "framer-motion"
import productsImg from "@/assets/images/natural.png"

const OrganicIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M24 12C24 12 18 16 18 24C18 28 20 32 24 32C28 32 30 28 30 24C30 16 24 12 24 12Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M24 12C24 12 30 16 30 24" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <ellipse cx="24" cy="24" rx="6" ry="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <line x1="20" y1="18" x2="28" y2="18" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="20" y1="30" x2="28" y2="30" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
)

const NonToxicIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M18 28C18 28 20 26 24 26C28 26 30 28 30 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M18 28C18 28 20 30 24 30C28 30 30 28 30 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M24 26V18" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M20 22C20 22 22 20 24 20C26 20 28 22 28 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="24" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
)

const EcoFriendlyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M17 24L21 28L31 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 14V18M24 30V34M14 24H18M30 24H34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

export function Products() {
  const features = [
    {
      icon: OrganicIcon,
      title: "ORGANIC",
    },
    {
      icon: NonToxicIcon,
      title: "NON-TOXIC",
    },
    {
      icon: EcoFriendlyIcon,
      title: "ECO-FRIENDLY",
    }
  ]

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-background to-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-card/60 backdrop-blur-sm p-12 rounded-2xl border-2 border-primary/10 shadow-lg"
          >
            <h2 
              className="text-4xl md:text-5xl text-center mb-16 text-primary"
              style={{ 
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontWeight: '300',
                letterSpacing: '0.05em',
                lineHeight: '1.3'
              }}
            >
              THE<br />
              PRODUCTS<br />
              WE USE
            </h2>
            
            <div className="space-y-12">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <div className="w-12 h-12 flex items-center justify-center text-primary">
                    <feature.icon />
                  </div>
                  <p 
                    className="text-base text-foreground tracking-widest uppercase"
                    style={{ 
                      fontFamily: 'Cormorant Garamond, Georgia, serif',
                      fontWeight: '400',
                      letterSpacing: '0.15em'
                    }}
                  >
                    {feature.title}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
          >
            <img 
              src={productsImg} 
              alt="Hair products" 
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
