// Default data for when KV store is unavailable (e.g., in vite preview mode)

export interface StaffMember {
  username: string
  password: string
  name: string
  role: string
  isAdmin: boolean
  availableServices?: string[]
}

export interface Service {
  id: string
  name: string
  duration: number
  category: string
  price: string
}

export interface StaffSchedule {
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

export const DEFAULT_SERVICES: Service[] = [
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

const ALL_SERVICE_NAMES = DEFAULT_SERVICES.map(s => s.name)

export const DEFAULT_STAFF: StaffMember[] = [
  {
    username: "admin",
    password: "admin",
    name: "Administrator",
    role: "Owner",
    isAdmin: true
  },
  {
    username: "maria",
    password: "supersecret",
    name: "Maria",
    role: "Senior Stylist",
    isAdmin: false,
    availableServices: ALL_SERVICE_NAMES
  },
  {
    username: "paula",
    password: "supersecret",
    name: "Paula",
    role: "Senior Stylist",
    isAdmin: false,
    availableServices: ALL_SERVICE_NAMES
  }
]

const DEFAULT_WORKING_HOURS = {
  Monday: { isWorking: true, startTime: "9:00 AM", endTime: "6:00 PM" },
  Tuesday: { isWorking: true, startTime: "9:00 AM", endTime: "6:00 PM" },
  Wednesday: { isWorking: true, startTime: "9:00 AM", endTime: "6:00 PM" },
  Thursday: { isWorking: true, startTime: "9:00 AM", endTime: "6:00 PM" },
  Friday: { isWorking: true, startTime: "9:00 AM", endTime: "6:00 PM" },
  Saturday: { isWorking: true, startTime: "9:00 AM", endTime: "5:00 PM" },
  Sunday: { isWorking: false, startTime: "9:00 AM", endTime: "5:00 PM" }
}

export const DEFAULT_SCHEDULES: StaffSchedule[] = [
  {
    stylistName: "Maria",
    workingHours: DEFAULT_WORKING_HOURS,
    blockedDates: [],
    breakTimes: [{ startTime: "12:00 PM", endTime: "1:00 PM" }]
  },
  {
    stylistName: "Paula",
    workingHours: DEFAULT_WORKING_HOURS,
    blockedDates: [],
    breakTimes: [{ startTime: "12:00 PM", endTime: "1:00 PM" }]
  }
]
