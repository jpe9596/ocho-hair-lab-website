import { motion } from "framer-motion"
import { Leaf, Drop, Recycle } from "@phosphor-icons/react"
import productsImg from "@/assets/images/products.png"

export function Products() {
  const features = [
    {
      icon: Recycle,
      title: "♻️ Productos de origen vegetal",
    },
    {
      icon: Drop,
      title: "No Tóxico",
    },
    {
      icon: Leaf,
      title: "productos ecologicos",
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
              className="text-4xl md:text-5xl font-bold text-center mb-12 text-primary tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              THE PRODUCTS<br />WE USE
            </h2>
            
            <div className="space-y-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center gap-4 text-center"
                >
                  <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center bg-secondary/50">
                    <feature.icon size={32} weight="regular" className="text-primary" />
                  </div>
                  <p className="text-xl font-medium text-foreground tracking-wide uppercase">
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
