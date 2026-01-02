import { useEffect, useState } from "react"
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
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized) return
    
    const initializeData = async () => {
      console.log('🌱 SEED DATA: Starting initialization...')
      
      await new Promise(resolve => setTimeout(resolve, 300))

      const allServiceNames = DEFAULT_SERVICES.map(s => s.name)
      console.log(`🌱 SEED DATA: ${allServiceNames.length} service names available`)

      try {
        const currentStaff = await window.spark.kv.get<StaffMember[]>("staff-members")
        const currentServices = await window.spark.kv.get<Service[]>("salon-services")
        
        console.log(`🌱 SEED DATA: Current staff in KV: ${currentStaff?.length || 0}`)
        console.log(`🌱 SEED DATA: Current services in KV: ${currentServices?.length || 0}`)

        if (!currentStaff || currentStaff.length === 0) {
          console.log('🌱 SEED DATA: Initializing staff for first time...')
          const staffWithServices: StaffMember[] = DEFAULT_STAFF.map(staff => ({
            ...staff,
            availableServices: staff.isAdmin ? undefined : allServiceNames
          }))
          
          await window.spark.kv.set("staff-members", staffWithServices)
          setStaffMembers(staffWithServices)
          console.log('🌱 SEED DATA: Staff initialized:', staffWithServices.map(s => s.name).join(', '))
        } else {
          const hasOwner = currentStaff.some(s => s.username === "owner@ocholab.com")
          const hasMaria = currentStaff.some(s => s.username === "maria")
          const hasPaula = currentStaff.some(s => s.username === "paula")

          console.log(`🌱 SEED DATA: Checking staff - Owner: ${hasOwner}, Maria: ${hasMaria}, Paula: ${hasPaula}`)

          let needsUpdate = false
          const updatedStaff = [...currentStaff]
          
          if (!hasOwner) {
            console.log('🌱 SEED DATA: Adding owner...')
            updatedStaff.push(DEFAULT_STAFF[0])
            needsUpdate = true
          }
          if (!hasMaria) {
            console.log('🌱 SEED DATA: Adding Maria with all services...')
            updatedStaff.push({
              ...DEFAULT_STAFF[1],
              availableServices: allServiceNames
            })
            needsUpdate = true
          }
          if (!hasPaula) {
            console.log('🌱 SEED DATA: Adding Paula with all services...')
            updatedStaff.push({
              ...DEFAULT_STAFF[2],
              availableServices: allServiceNames
            })
            needsUpdate = true
          }

          for (let i = 0; i < updatedStaff.length; i++) {
            const staff = updatedStaff[i]
            if (!staff.isAdmin && (!staff.availableServices || staff.availableServices.length === 0)) {
              console.log(`🌱 SEED DATA: Fixing services for ${staff.name}...`)
              updatedStaff[i] = { ...staff, availableServices: allServiceNames }
              needsUpdate = true
            }
          }

          if (needsUpdate) {
            console.log('🌱 SEED DATA: Updating staff...')
            await window.spark.kv.set("staff-members", updatedStaff)
            setStaffMembers(updatedStaff)
            updatedStaff.forEach(s => {
              if (!s.isAdmin) {
                console.log(`   ✅ ${s.name}: ${s.availableServices?.length || 0} services`)
              }
            })
          } else {
            console.log('🌱 SEED DATA: Staff already correct')
            setStaffMembers(currentStaff)
          }
        }

        if (!currentServices || currentServices.length === 0) {
          console.log('🌱 SEED DATA: Initializing services...')
          await window.spark.kv.set("salon-services", DEFAULT_SERVICES)
          setServices(DEFAULT_SERVICES)
          console.log(`🌱 SEED DATA: ${DEFAULT_SERVICES.length} services initialized`)
        } else {
          console.log(`🌱 SEED DATA: Services already present (${currentServices.length})`)
          setServices(currentServices)
        }

        await new Promise(resolve => setTimeout(resolve, 500))
        
        const finalStaff = await window.spark.kv.get<StaffMember[]>("staff-members")
        const finalServices = await window.spark.kv.get<Service[]>("salon-services")
        
        console.log('🌱 SEED DATA: ✅ INITIALIZATION COMPLETE')
        console.log(`   📊 Staff members: ${finalStaff?.length || 0}`)
        console.log(`   📊 Services: ${finalServices?.length || 0}`)
        if (finalStaff) {
          finalStaff.forEach(s => {
            if (!s.isAdmin) {
              console.log(`   👤 ${s.name} (${s.username}): ${s.availableServices?.length || 0} services`)
            } else {
              console.log(`   👤 ${s.name} (${s.username}): Admin`)
            }
          })
        }
        
        setInitialized(true)
      } catch (error) {
        console.error('🌱 SEED DATA: ❌ Error during initialization:', error)
      }
    }

    initializeData()
  }, [initialized])
}
