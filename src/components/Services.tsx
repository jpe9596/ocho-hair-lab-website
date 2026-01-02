import { motion } from "framer-motion"
import { useKV } from "@github/spark/hooks"
import tinteImg from "@/assets/images/Screenshot_2026-01-01_at_7.40.24_PM.png"
import corteImg from "@/assets/images/Screenshot_2026-01-01_at_7.45.41_PM.png"
import bespokeImg from "@/assets/images/Screenshot_2026-01-01_at_7.43.29_PM.png"
import treatmentsImg from "@/assets/images/Screenshot_2026-01-01_at_7.45.20_PM.png"

interface Service {
  id: string
  name: string
  duration: number
  category: string
  price: string
}

const categoryImages: Record<string, string> = {
  "Tinte": tinteImg,
  "Corte & Styling": corteImg,
  "Bespoke Color": bespokeImg,
  "Treatments": treatmentsImg
}

const DEFAULT_SERVICES: Service[] = [
  { id: "1", name: "Retoque de Raiz", duration: 90, category: "Tinte", price: "$1,150" },
  { id: "2", name: "Full Head Tint", duration: 120, category: "Tinte", price: "$1,500" },
  { id: "3", name: "0% AMONIACO", duration: 90, category: "Tinte", price: "from $1,000" },
  { id: "4", name: "Toner/Gloss", duration: 60, category: "Tinte", price: "$450" },
  { id: "5", name: "Corte & Secado", duration: 60, category: "Corte & Styling", price: "$900" },
  { id: "6", name: "Secado (short)", duration: 30, category: "Corte & Styling", price: "$350" },
  { id: "7", name: "Secado (mm)", duration: 45, category: "Corte & Styling", price: "$500" },
  { id: "8", name: "Secado (long)", duration: 60, category: "Corte & Styling", price: "$700" },
  { id: "9", name: "Waves/peinado", duration: 45, category: "Corte & Styling", price: "from $350" },
  { id: "10", name: "Balayage", duration: 180, category: "Bespoke Color", price: "from $2,500" },
  { id: "11", name: "Baby Lights", duration: 150, category: "Bespoke Color", price: "from $3,500" },
  { id: "12", name: "Selfie Contour", duration: 120, category: "Bespoke Color", price: "$1,800" },
  { id: "13", name: "Posion Nº17", duration: 90, category: "Treatments", price: "$300" },
  { id: "14", name: "Posion Nº 8", duration: 60, category: "Treatments", price: "$900" }
]

export function Services() {
  const [services] = useKV<Service[]>("salon-services", DEFAULT_SERVICES)
  
  const groupedServices = services?.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = []
    }
    acc[service.category].push(service)
    return acc
  }, {} as Record<string, Service[]>) || {}

  const categoryOrder = ["Tinte", "Corte & Styling", "Bespoke Color", "Treatments"]
  const orderedCategories = categoryOrder.filter(cat => groupedServices[cat])

  return (
    <section id="services" className="py-20 md:py-32 px-6 md:px-8 bg-[#f5f3f0]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 
            className="text-5xl md:text-6xl font-light tracking-wide text-foreground"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300 }}
          >
            Our Services
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {orderedCategories.map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="border-2 border-foreground/20 bg-white overflow-hidden">
                <div className="p-4 border-b-2 border-foreground/20">
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={categoryImages[category]} 
                      alt={category}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
                
                <div className="p-6 text-center">
                  <h3 
                    className="text-xl md:text-2xl mb-6 text-foreground font-light"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, lineHeight: 1.3 }}
                  >
                    {category}
                  </h3>
                  
                  <ul className="space-y-3 text-left">
                    {groupedServices[category].map((service) => (
                      <li 
                        key={service.id}
                        className="pl-4 relative"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span 
                            className="text-sm text-foreground/70 before:content-['•'] before:absolute before:left-0"
                            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', letterSpacing: '0.05em' }}
                          >
                            {service.name}
                          </span>
                          <span 
                            className="text-xs text-foreground/50 font-medium"
                            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                          >
                            {service.price}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
