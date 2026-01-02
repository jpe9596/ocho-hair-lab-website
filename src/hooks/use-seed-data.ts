import { useEffect } from "react"
import { useKV } from "@github/spark/hooks"

interface StaffMember {
  username: string
  password: string
  name: string
  role: string
  isAdmin: boolean
  availableServices?: string[]
}

interface Service {
  id: string
  name: string
  duration: number
  category: string
  price: string
}

const DEFAULT_STAFF: StaffMember[] = [
  {
    username: "owner@ocholab.com",
    password: "owner123",
    name: "Owner",
    role: "Owner",
    isAdmin: true
  },
  {
    username: "maria",
    password: "supersecret",
    name: "Maria",
    role: "Senior Stylist",
    isAdmin: false,
    availableServices: []
  },
  {
    username: "paula",
    password: "supersecret",
    name: "Paula",
    role: "Senior Stylist",
    isAdmin: false,
    availableServices: []
  }
]

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

export function useSeedData() {
  const [staffMembers, setStaffMembers] = useKV<StaffMember[]>("staff-members", [])
  const [services, setServices] = useKV<Service[]>("salon-services", [])

  useEffect(() => {
    const initializeData = async () => {
      console.log('✅ Initializing seed data...')
      
      await new Promise(resolve => setTimeout(resolve, 100))

      const allServiceNames = DEFAULT_SERVICES.map(s => s.name)
      console.log(`✅ All service names (${allServiceNames.length}):`, allServiceNames)

      if (!staffMembers || staffMembers.length === 0) {
        console.log('✅ Seeding initial staff members with all services...')
        const staffWithServices = DEFAULT_STAFF.map(staff => ({
          ...staff,
          availableServices: staff.isAdmin ? undefined : allServiceNames
        }))
        console.log('✅ Staff with services:', staffWithServices)
        setStaffMembers(staffWithServices)
      } else {
        const hasOwner = staffMembers.some(s => s.username === "owner@ocholab.com")
        const hasMaria = staffMembers.some(s => s.username === "maria")
        const hasPaula = staffMembers.some(s => s.username === "paula")

        let needsStaffUpdate = false
        const updatedStaff = [...staffMembers]
        
        if (!hasOwner) {
          console.log('Restoring owner account...')
          updatedStaff.push(DEFAULT_STAFF[0])
          needsStaffUpdate = true
        }
        if (!hasMaria) {
          console.log('Restoring Maria account...')
          updatedStaff.push({
            ...DEFAULT_STAFF[1],
            availableServices: allServiceNames
          })
          needsStaffUpdate = true
        }
        if (!hasPaula) {
          console.log('Restoring Paula account...')
          updatedStaff.push({
            ...DEFAULT_STAFF[2],
            availableServices: allServiceNames
          })
          needsStaffUpdate = true
        }

        const needsServiceAssignment = updatedStaff.some(staff => {
          if (staff.isAdmin) return false
          const services = staff.availableServices || []
          return services.length === 0
        })

        if (needsServiceAssignment) {
          console.log('✅ Assigning all services to staff members without services...')
          const staffWithAllServices = updatedStaff.map(s =>
            s.isAdmin || (s.availableServices && s.availableServices.length > 0)
              ? s 
              : { ...s, availableServices: allServiceNames }
          )
          console.log('✅ Updated staff with services:', staffWithAllServices)
          setStaffMembers(staffWithAllServices)
        } else if (needsStaffUpdate) {
          console.log('✅ Updating staff members:', updatedStaff)
          setStaffMembers(updatedStaff)
        } else {
          console.log('✅ Staff members already configured correctly:', staffMembers.length, 'members')
          console.log('✅ Maria services:', staffMembers.find(s => s.username === 'maria')?.availableServices?.length || 0)
          console.log('✅ Paula services:', staffMembers.find(s => s.username === 'paula')?.availableServices?.length || 0)
        }
      }

      if (!services || services.length === 0) {
        console.log('✅ Seeding services...')
        setServices(DEFAULT_SERVICES)
      } else {
        console.log('✅ Services already seeded:', services.length, 'services')
      }

      console.log('✅ Data seeding complete')
    }

    initializeData()
  }, [])
}
