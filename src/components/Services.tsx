import { Scissors, Palette, Sparkle, Heart } from "@phosphor-icons/react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

const services = [
  {
    icon: Scissors,
    name: "Precision Cuts",
    description: "Expert haircuts tailored to your unique style and face shape",
    duration: "45-60 min",
    price: "$65+",
    popular: true
  },
  {
    icon: Palette,
    name: "Color Services",
    description: "From subtle highlights to bold transformations, we bring your vision to life",
    duration: "2-4 hrs",
    price: "$120+",
    popular: true
  },
  {
    icon: Sparkle,
    name: "Balayage & Highlights",
    description: "Hand-painted color techniques for natural, dimensional results",
    duration: "3-4 hrs",
    price: "$180+"
  },
  {
    icon: Heart,
    name: "Deep Conditioning",
    description: "Intensive treatments to restore health, shine, and vitality",
    duration: "30-45 min",
    price: "$45+"
  },
  {
    icon: Sparkle,
    name: "Blowout Styling",
    description: "Professional styling for any occasion, leaving you camera-ready",
    duration: "30-45 min",
    price: "$55+"
  },
  {
    icon: Palette,
    name: "Keratin Treatment",
    description: "Smooth, frizz-free hair that lasts for months",
    duration: "2-3 hrs",
    price: "$250+"
  }
]

export function Services() {
  return (
    <section id="services" className="py-20 md:py-32 px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary" style={{ fontFamily: 'var(--font-display)' }}>
            Our Services
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Discover our comprehensive range of premium hair services designed to enhance your natural beauty
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 md:p-8 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card border-border relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                  
                  <div className="relative">
                    {service.popular && (
                      <Badge className="mb-4 bg-accent text-accent-foreground">Popular</Badge>
                    )}
                    
                    <div className="mb-4 inline-flex p-3 bg-secondary rounded-lg">
                      <Icon size={32} className="text-primary" weight="duotone" />
                    </div>
                    
                    <h3 className="text-2xl font-semibold mb-3 text-foreground">
                      {service.name}
                    </h3>
                    
                    <p className="text-foreground/70 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm pt-4 border-t border-border">
                      <span className="text-muted-foreground font-medium">{service.duration}</span>
                      <span className="text-lg font-semibold text-primary">{service.price}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
