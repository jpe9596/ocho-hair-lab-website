import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, InstagramLogo } from "@phosphor-icons/react"
import { Card } from "@/components/ui/card"

const galleryImages = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=600&fit=crop&auto=format",
    alt: "Balayage hair color transformation",
    category: "Color"
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&h=600&fit=crop&auto=format",
    alt: "Precision haircut and styling",
    category: "Cut & Style"
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop&auto=format",
    alt: "Blonde highlights specialist work",
    category: "Color"
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=600&h=600&fit=crop&auto=format",
    alt: "Beautiful updo for special event",
    category: "Special Events"
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=600&fit=crop&auto=format",
    alt: "Vibrant color transformation",
    category: "Color"
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&h=600&fit=crop&auto=format",
    alt: "Modern layered haircut",
    category: "Cut & Style"
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=600&fit=crop&auto=format",
    alt: "Elegant bridal hairstyle",
    category: "Special Events"
  },
  {
    id: 8,
    url: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&h=600&fit=crop&auto=format",
    alt: "Curly hair styling expertise",
    category: "Cut & Style"
  },
  {
    id: 9,
    url: "https://images.unsplash.com/photo-1581619115184-c9683c873c97?w=600&h=600&fit=crop&auto=format",
    alt: "Dimensional balayage color",
    category: "Color"
  }
]

export function Gallery() {
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null)

  return (
    <section id="gallery" className="py-20 md:py-32 px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary" style={{ fontFamily: 'var(--font-display)' }}>
            Our Work
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto mb-6">
            Explore our portfolio of transformations and creative styling
          </p>
          <a
            href="https://www.instagram.com/ochohairlab/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors duration-200"
          >
            <InstagramLogo size={24} weight="fill" />
            <span className="font-medium">Follow us @ochohairlab</span>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <Card className="overflow-hidden h-80 relative">
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <div className="text-white">
                    <p className="font-semibold text-lg">{image.category}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 p-2 bg-background/10 hover:bg-background/20 rounded-full transition-colors duration-200"
              aria-label="Close"
            >
              <X size={32} className="text-white" weight="bold" />
            </button>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.alt}
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
              <div className="text-center mt-6 text-white">
                <p className="text-xl font-semibold">{selectedImage.category}</p>
                <p className="text-white/70 mt-2">{selectedImage.alt}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
