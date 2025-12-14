import { Scissors, Palette, Sparkle, Drop } from "@phosphor-icons/react"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"

const serviceCategories = [
  {
    icon: Palette,
    name: "Tinte",
    description: "Color services tailored to enhance your natural beauty",
    items: [
      { name: "Retoque de Raiz", price: "$1,150" },
      { name: "Full Head Tint", price: "$1,500" },
      { name: "0% AMONIACO", price: "from $1,000" },
      { name: "Toner/Gloss", price: "$450" }
    ]
  },
  {
    icon: Scissors,
    name: "Corte & Styling",
    description: "Expert cuts and styling for every look",
    items: [
      { name: "Corte & Secado", price: "$900" },
      { name: "Secado (short)", price: "$350" },
      { name: "Secado (mm)", price: "$500" },
      { name: "Secado (long)", price: "$700" },
      { name: "Waves/peinado", price: "from $350" }
    ]
  },
  {
    icon: Sparkle,
    name: "Bespoke Color",
    description: "Customized color techniques for unique results",
    items: [
      { name: "Balayage", price: "from $2,500" },
      { name: "Baby Lights", price: "from $3,500" },
      { name: "Selfie Contour", price: "$1,800" }
    ]
  },
  {
    icon: Drop,
    name: "Treatments",
    description: "Restore and revitalize your hair",
    items: [
      { name: "Posion Nº17", price: "$300" },
      { name: "Posion Nº 8", price: "$900" }
    ]
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {serviceCategories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 h-full hover:shadow-xl transition-all duration-300 bg-card border-border relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                  
                  <div className="relative">
                    <div className="mb-6 inline-flex p-3 bg-secondary rounded-lg">
                      <Icon size={32} className="text-primary" weight="duotone" />
                    </div>
                    
                    <h3 className="text-2xl font-semibold mb-2 text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                      {category.name}
                    </h3>
                    
                    <p className="text-foreground/60 mb-6 text-sm">
                      {category.description}
                    </p>
                    
                    <div className="space-y-3 pt-4 border-t border-border">
                      {category.items.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <span className="text-foreground/80">{item.name}</span>
                          <span className="font-semibold text-primary">{item.price}</span>
                        </div>
                      ))}
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
