import { motion } from "framer-motion"

const services = [
  {
    category: "HAIRCARE",
    title: "Haircut and Styling",
    price: "$45-$70",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop"
  },
  {
    category: "HAIRCARE",
    title: "Color and Highlights",
    price: "Starts at $70",
    image: "https://images.unsplash.com/photo-1522337094846-8a818192de1f?w=400&h=400&fit=crop"
  },
  {
    category: "HAIRCARE",
    title: "Perm and Straightening",
    price: "Starts at $80",
    image: "https://images.unsplash.com/photo-1573799854789-f9de46df7c85?w=400&h=400&fit=crop"
  },
  {
    category: "TREATMENTS",
    title: "Deep Conditioning",
    price: "$45-$70",
    image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop"
  },
  {
    category: "TREATMENTS",
    title: "Keratin Treatment",
    price: "Starts at $70",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=400&fit=crop"
  },
  {
    category: "TREATMENTS",
    title: "Hair Spa",
    price: "Starts at $90",
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {services.map((service, index) => (
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
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
                
                <div className="p-8 text-center">
                  <p 
                    className="text-xs tracking-widest text-foreground/60 mb-4"
                    style={{ fontFamily: 'sans-serif', letterSpacing: '0.15em' }}
                  >
                    {service.category}
                  </p>
                  
                  <h3 
                    className="text-2xl md:text-3xl mb-6 text-foreground font-light"
                    style={{ fontFamily: 'serif', fontWeight: 300, lineHeight: 1.3 }}
                  >
                    {service.title}
                  </h3>
                  
                  <p 
                    className="text-sm tracking-wider text-foreground/70"
                    style={{ fontFamily: 'sans-serif', letterSpacing: '0.1em' }}
                  >
                    {service.price}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
