import { motion } from "framer-motion"

const categoryData = [
  {
    category: "Tinte",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=600&fit=crop&q=80",
    services: [
      "Retoque de Raiz",
      "Full Head Tint",
      "0% AMONIACO",
      "Toner/Gloss"
    ]
  },
  {
    category: "Corte & Styling",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop&q=80",
    services: [
      "Corte & Secado",
      "Secado (short)",
      "Secado (mm)",
      "Secado (long)",
      "Waves/peinado"
    ]
  },
  {
    category: "Bespoke Color",
    image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&h=600&fit=crop&q=80",
    services: [
      "Balayage",
      "Baby Lights",
      "Selfie Contour"
    ]
  },
  {
    category: "Treatments",
    image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=600&fit=crop&q=80",
    services: [
      "Posion Nº17",
      "Posion Nº 8"
    ]
  }
]

export function Services() {
  return (
    <section id="services" className="py-20 md:py-32 px-6 md:px-8 bg-[#f5f3f0]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 
            className="text-5xl md:text-6xl font-light tracking-wide text-foreground"
            style={{ fontFamily: 'serif', fontWeight: 300 }}
          >
            Our Services
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {categoryData.map((category, index) => (
            <motion.div
              key={index}
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
                      src={category.image} 
                      alt={category.category}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
                
                <div className="p-6 text-center">
                  <h3 
                    className="text-xl md:text-2xl mb-6 text-foreground font-light"
                    style={{ fontFamily: 'serif', fontWeight: 300, lineHeight: 1.3 }}
                  >
                    {category.category}
                  </h3>
                  
                  <ul className="space-y-2 text-left">
                    {category.services.map((service, serviceIndex) => (
                      <li 
                        key={serviceIndex}
                        className="text-sm text-foreground/70 pl-4 relative before:content-['•'] before:absolute before:left-0"
                        style={{ fontFamily: 'sans-serif', letterSpacing: '0.05em' }}
                      >
                        {service}
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
