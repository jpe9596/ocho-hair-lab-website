import { StaffSchedule } from "@/components/StaffSchedule"

export interface Appointment {
  id: string
  name: string
  email: string
  phone: string
  service: string
  stylist: string
  date: Date
  time: string
  notes: string
  createdAt: Date
  confirmationSent?: boolean
  reminderSent?: boolean
}

export function getAvailableTimeSlots(
  date: Date,
  stylistName: string,
  schedules: StaffSchedule[],
  appointments: Appointment[]
): string[] {
  const stylistSchedule = schedules.find(s => s.stylistName === stylistName)
  
  if (!stylistSchedule) {
    return []
  }

  const dateStr = date.toISOString().split('T')[0]
  if (stylistSchedule.blockedDates.includes(dateStr)) {
    return []
  }

  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
  const daySchedule = stylistSchedule.workingHours[dayName]

  if (!daySchedule || !daySchedule.isWorking) {
    return []
  }

  const allTimeSlots = generateTimeSlots(daySchedule.startTime, daySchedule.endTime)
  
  const breakBlockedSlots = new Set<string>()
  stylistSchedule.breakTimes.forEach(breakTime => {
    const breakSlots = generateTimeSlots(breakTime.startTime, breakTime.endTime, true)
    breakSlots.forEach(slot => breakBlockedSlots.add(slot))
  })

  const bookedSlots = new Set(
    appointments
      .filter(apt => {
        const aptDate = new Date(apt.date)
        return apt.stylist === stylistName &&
               aptDate.toISOString().split('T')[0] === dateStr
      })
      .map(apt => apt.time)
  )

  return allTimeSlots.filter(
    slot => !breakBlockedSlots.has(slot) && !bookedSlots.has(slot)
  )
}

export function getAvailableStylistsForTime(
  date: Date,
  time: string,
  schedules: StaffSchedule[],
  appointments: Appointment[]
): string[] {
  const dateStr = date.toISOString().split('T')[0]
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })

  return schedules
    .filter(schedule => {
      if (schedule.blockedDates.includes(dateStr)) {
        return false
      }

      const daySchedule = schedule.workingHours[dayName]
      if (!daySchedule || !daySchedule.isWorking) {
        return false
      }

      const isWithinWorkingHours = isTimeInRange(time, daySchedule.startTime, daySchedule.endTime)
      if (!isWithinWorkingHours) {
        return false
      }

      const isDuringBreak = schedule.breakTimes.some(breakTime =>
        isTimeInRange(time, breakTime.startTime, breakTime.endTime, true)
      )
      if (isDuringBreak) {
        return false
      }

      const isBooked = appointments.some(apt => {
        const aptDate = new Date(apt.date)
        return apt.stylist === schedule.stylistName &&
               aptDate.toISOString().split('T')[0] === dateStr &&
               apt.time === time
      })
      
      return !isBooked
    })
    .map(schedule => schedule.stylistName)
}

function generateTimeSlots(startTime: string, endTime: string, includeEnd: boolean = false): string[] {
  const slots: string[] = []
  const start = parseTime(startTime)
  const end = parseTime(endTime)

  let current = start
  while (current < end) {
    slots.push(formatTime(current))
    current += 30
  }

  if (includeEnd && current === end) {
    slots.push(formatTime(current))
  }

  return slots
}

function parseTime(timeStr: string): number {
  const [time, period] = timeStr.split(' ')
  const parts = time.split(':').map(Number)
  let hours = parts[0]
  const minutes = parts[1] || 0
  
  if (period === 'PM' && hours !== 12) {
    hours += 12
  } else if (period === 'AM' && hours === 12) {
    hours = 0
  }
  
  return hours * 60 + minutes
}

function formatTime(minutes: number): string {
  let hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  const period = hours >= 12 ? 'PM' : 'AM'
  
  if (hours > 12) {
    hours -= 12
  } else if (hours === 0) {
    hours = 12
  }
  
  return `${hours}:${mins.toString().padStart(2, '0')} ${period}`
}

function isTimeInRange(time: string, start: string, end: string, includeEnd: boolean = false): boolean {
  const timeMinutes = parseTime(time)
  const startMinutes = parseTime(start)
  const endMinutes = parseTime(end)
  
  if (includeEnd) {
    return timeMinutes >= startMinutes && timeMinutes <= endMinutes
  }
  
  return timeMinutes >= startMinutes && timeMinutes < endMinutes
}

export function isStylistAvailable(
  date: Date,
  time: string,
  stylistName: string,
  schedules: StaffSchedule[],
  appointments: Appointment[]
): boolean {
  const availableStylists = getAvailableStylistsForTime(date, time, schedules, appointments)
  return availableStylists.includes(stylistName)
}
