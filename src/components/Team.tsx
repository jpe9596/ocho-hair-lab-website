import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

const team = [
  {
    name: "Maria Rodriguez",
    role: "Owner & Master Stylist",
    specialties: ["Color Specialist", "Balayage Expert", "Bridal"],
    bio: "With over 15 years of experience, Maria founded Ocho Hair Lab to create a space where artistry and innovation meet. Her passion for color techniques and dedication to continuing education keeps her at the forefront of industry trends.",
    image: "MR"
  },
  {
    name: "Jessica Chen",
    role: "Senior Stylist",
    specialties: ["Precision Cuts", "Keratin Treatments", "Curly Hair"],
    bio: "Jessica specializes in precision cutting and working with all hair textures. Her keen eye for detail and understanding of face shapes ensures every client leaves with a cut that complements their features perfectly.",
    image: "JC"
  },
  {
    name: "Alex Thompson",
    role: "Color Specialist",
    specialties: ["Vivid Colors", "Blonde Specialist", "Color Correction"],
    bio: "Alex is known for creating stunning dimensional color and fearless transformations. Whether you're looking for a subtle change or a bold new look, Alex brings creativity and technical expertise to every service.",
    image: "AT"
  },
  {
    name: "Sophia Martinez",
    role: "Stylist",
    specialties: ["Extensions", "Updos", "Special Events"],
    bio: "Sophia's talent for creating beautiful upstyles and working with extensions makes her a favorite for special occasions. Her warm personality and attention to detail ensure a luxurious experience from consultation to final style.",
    image: "SM"
  }
]

export function Team() {
  return (
    <section id="team" className="py-20 md:py-32 px-6 md:px-8 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary" style={{ fontFamily: 'var(--font-display)' }}>
            Meet Our Team
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Talented stylists dedicated to bringing your hair goals to life with expertise and care
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 md:p-8 h-full bg-background hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-3xl font-bold text-primary">
                      {member.image}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-1 text-foreground">
                      {member.name}
                    </h3>
                    <p className="text-accent font-medium mb-4">{member.role}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {member.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    
                    <p className="text-foreground/70 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
