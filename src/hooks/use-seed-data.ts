import { useEffect, useState } from "react"

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

interface StaffSchedule {
  stylistName: string
  workingHours: {
    [key: string]: {
      isWorking: boolean
      startTime: string
      endTime: string
    }
  }
  blockedDates: string[]
  breakTimes: {
    startTime: string
    endTime: string
  }[]
}

const DEFAULT_WORKING_HOURS = {
  Monday: { isWorking: true, startTime: "9:00 AM", endTime: "6:00 PM" },
  Tuesday: { isWorking: true, startTime: "9:00 AM", endTime: "6:00 PM" },
  Wednesday: { isWorking: true, startTime: "9:00 AM", endTime: "6:00 PM" },
  Thursday: { isWorking: true, startTime: "9:00 AM", endTime: "6:00 PM" },
  Friday: { isWorking: true, startTime: "9:00 AM", endTime: "6:00 PM" },
  Saturday: { isWorking: true, startTime: "9:00 AM", endTime: "5:00 PM" },
  Sunday: { isWorking: false, startTime: "9:00 AM", endTime: "5:00 PM" }
}

// Staff usernames for migration detection
const OLD_STAFF_USERNAMES = ["maria", "paula"]
const NEW_STAFF_USERNAMES = ["test1", "test2", "test3"]

// NOTE: These credentials are intentionally simple (username = password) as per user requirements
// for testing purposes on Ubuntu 24.04 VM. In production, these MUST be changed to strong passwords.
const DEFAULT_STAFF: StaffMember[] = [
  {
    username: "admin",
    password: "admin",
    name: "Administrator",
    role: "Owner",
    isAdmin: true
  },
  {
    username: "test1",
    password: "test1",
    name: "test1",
    role: "Stylist",
    isAdmin: false,
    availableServices: []
  },
  {
    username: "test2",
    password: "test2",
    name: "test2",
    role: "Stylist",
    isAdmin: false,
    availableServices: []
  },
  {
    username: "test3",
    password: "test3",
    name: "test3",
    role: "Stylist",
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
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const initializeData = async () => {
      console.log('🌱 SEED DATA: Starting initialization...')
      
      const allServiceNames = DEFAULT_SERVICES.map(s => s.name)
      console.log(`🌱 SEED DATA: ${allServiceNames.length} service names available`)

      try {
        const currentStaff = await window.spark.kv.get<StaffMember[]>("staff-members")
        const currentServices = await window.spark.kv.get<Service[]>("salon-services")
        const currentSchedules = await window.spark.kv.get<StaffSchedule[]>("staff-schedules")
        
        console.log(`🌱 SEED DATA: Current staff in KV: ${currentStaff?.length || 0}`)
        console.log(`🌱 SEED DATA: Current services in KV: ${currentServices?.length || 0}`)
        console.log(`🌱 SEED DATA: Current schedules in KV: ${currentSchedules?.length || 0}`)

        // Check if we need to migrate from old staff to new staff
        const hasMariaPaula = currentStaff?.some(s => OLD_STAFF_USERNAMES.includes(s.username))
        const hasTestStaff = currentStaff?.some(s => NEW_STAFF_USERNAMES.includes(s.username))
        const needsMigration = hasMariaPaula && !hasTestStaff
        
        if (needsMigration) {
          console.log('🌱 SEED DATA: Migration needed - replacing old staff with new staff')
        }

        const needsStaffSeed = !currentStaff || currentStaff.length === 0 || needsMigration
        const needsServiceSeed = !currentServices || currentServices.length === 0
        const needsScheduleSeed = !currentSchedules || currentSchedules.length === 0 || needsMigration

        if (needsStaffSeed || needsServiceSeed || needsScheduleSeed) {
          console.log('🌱 SEED DATA: Missing data detected, seeding...')
          
          const staffWithServices: StaffMember[] = DEFAULT_STAFF.map(staff => ({
            ...staff,
            availableServices: staff.isAdmin ? undefined : allServiceNames
          }))

          if (needsStaffSeed) {
            console.log('🌱 SEED DATA: Seeding staff members...')
            if (needsMigration) {
              console.log('🌱 SEED DATA: ⚠️  MIGRATION: Replacing old staff with new staff')
            }
            await window.spark.kv.set("staff-members", staffWithServices)
            console.log('🌱 SEED DATA: Staff set:', staffWithServices.map(s => `${s.name} (${s.username})`).join(', '))
            
            staffWithServices.forEach(s => {
              if (!s.isAdmin) {
                console.log(`   ✅ ${s.name} - username: ${s.username} - password: ${s.password} - ${s.availableServices?.length || 0} services`)
              } else {
                console.log(`   ✅ ${s.name} - username: ${s.username} - password: ${s.password} - Admin`)
              }
            })
          } else {
            console.log('🌱 SEED DATA: Staff already exists, skipping staff seed')
          }

          if (needsServiceSeed) {
            console.log('🌱 SEED DATA: Seeding services...')
            await window.spark.kv.set("salon-services", DEFAULT_SERVICES)
            console.log(`🌱 SEED DATA: ${DEFAULT_SERVICES.length} services set`)
          } else {
            console.log('🌱 SEED DATA: Services already exist, skipping service seed')
          }

          if (needsScheduleSeed) {
            console.log('🌱 SEED DATA: Seeding staff schedules...')
            const defaultSchedules: StaffSchedule[] = [
              {
                stylistName: "test1",
                workingHours: DEFAULT_WORKING_HOURS,
                blockedDates: [],
                breakTimes: [{ startTime: "12:00 PM", endTime: "1:00 PM" }]
              },
              {
                stylistName: "test2",
                workingHours: DEFAULT_WORKING_HOURS,
                blockedDates: [],
                breakTimes: [{ startTime: "12:00 PM", endTime: "1:00 PM" }]
              },
              {
                stylistName: "test3",
                workingHours: DEFAULT_WORKING_HOURS,
                blockedDates: [],
                breakTimes: [{ startTime: "12:00 PM", endTime: "1:00 PM" }]
              }
            ]
            await window.spark.kv.set("staff-schedules", defaultSchedules)
            console.log(`🌱 SEED DATA: ${defaultSchedules.length} schedules set`)
          } else {
            console.log('🌱 SEED DATA: Schedules already exist, skipping schedule seed')
          }

          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const finalStaff = await window.spark.kv.get<StaffMember[]>("staff-members")
          const finalServices = await window.spark.kv.get<Service[]>("salon-services")
          const finalSchedules = await window.spark.kv.get<StaffSchedule[]>("staff-schedules")
          
          console.log('🌱 SEED DATA: ✅ INITIALIZATION COMPLETE')
          console.log(`   📊 Staff members verified: ${finalStaff?.length || 0}`)
          console.log(`   📊 Services verified: ${finalServices?.length || 0}`)
          console.log(`   📊 Schedules verified: ${finalSchedules?.length || 0}`)
          console.log('   🔑 LOGIN CREDENTIALS:')
          console.log('      Admin: username="admin" password="admin"')
          console.log('      test1: username="test1" password="test1"')
          console.log('      test2: username="test2" password="test2"')
          console.log('      test3: username="test3" password="test3"')
          
          if (finalStaff && finalStaff.length > 0) {
            finalStaff.forEach(s => {
              console.log(`   👤 ${s.name} (username: ${s.username}, password: ${s.password}, isAdmin: ${s.isAdmin}, services: ${s.availableServices?.length || 'N/A'})`)
            })
          } else {
            console.error('   ❌ WARNING: No staff members found after seed!')
          }
          
          if (finalSchedules && finalSchedules.length > 0) {
            finalSchedules.forEach(s => {
              console.log(`   📅 ${s.stylistName} schedule created`)
            })
          } else {
            console.error('   ❌ WARNING: No schedules found after seed!')
          }
        } else {
          console.log('🌱 SEED DATA: ✅ Data already exists')
          console.log(`   📊 Staff members: ${currentStaff.length}`)
          console.log(`   📊 Services: ${currentServices.length}`)
          console.log(`   📊 Schedules: ${currentSchedules.length}`)
          currentStaff.forEach(s => {
            if (!s.isAdmin) {
              console.log(`   👤 ${s.name} (username: ${s.username}, services: ${s.availableServices?.length || 0})`)
            } else {
              console.log(`   👤 ${s.name} (username: ${s.username}, admin: true)`)
            }
          })
        }
        
        setInitialized(true)
      } catch (error) {
        console.error('🌱 SEED DATA: ❌ Error during initialization:', error)
        setInitialized(true)
      }
    }

    if (!initialized) {
      initializeData()
    }
  }, [initialized])
}
