import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface WeekCalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
  disabled?: (date: Date) => boolean
  className?: string
}

export function WeekCalendar({ selected, onSelect, disabled, className }: WeekCalendarProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const selectedOrToday = selected || today
  const currentWeekStart = getWeekStart(selectedOrToday)

  function getWeekStart(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const weekStart = new Date(d.setDate(diff))
    weekStart.setHours(0, 0, 0, 0)
    return weekStart
  }

  function getWeekDays(weekStart: Date): Date[] {
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      days.push(day)
    }
    return days
  }

  function goToPreviousWeek() {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(currentWeekStart.getDate() - 7)
    const firstDayOfWeek = getWeekDays(newWeekStart)[0]
    if (onSelect && !isDateDisabled(firstDayOfWeek)) {
      onSelect(firstDayOfWeek)
    } else {
      const firstAvailable = getWeekDays(newWeekStart).find(d => !isDateDisabled(d))
      if (firstAvailable && onSelect) {
        onSelect(firstAvailable)
      }
    }
  }

  function goToNextWeek() {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(currentWeekStart.getDate() + 7)
    const firstDayOfWeek = getWeekDays(newWeekStart)[0]
    if (onSelect && !isDateDisabled(firstDayOfWeek)) {
      onSelect(firstDayOfWeek)
    } else {
      const firstAvailable = getWeekDays(newWeekStart).find(d => !isDateDisabled(d))
      if (firstAvailable && onSelect) {
        onSelect(firstAvailable)
      }
    }
  }

  function isDateDisabled(date: Date): boolean {
    if (disabled) {
      return disabled(date)
    }
    return date < today
  }

  function isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  const weekDays = getWeekDays(currentWeekStart)
  const monthYear = currentWeekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const canGoPrevious = () => {
    const prevWeekStart = new Date(currentWeekStart)
    prevWeekStart.setDate(currentWeekStart.getDate() - 7)
    return getWeekDays(prevWeekStart).some(d => !isDateDisabled(d))
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={goToPreviousWeek}
          disabled={!canGoPrevious()}
          className="h-9 w-9"
        >
          <CaretLeft size={18} weight="bold" />
        </Button>
        
        <div className="text-sm font-semibold">
          {monthYear}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={goToNextWeek}
          className="h-9 w-9"
        >
          <CaretRight size={18} weight="bold" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const isDisabled = isDateDisabled(day)
          const isSelected = selected && isSameDay(day, selected)
          const isToday = isSameDay(day, today)
          const dayName = day.toLocaleDateString('en-US', { weekday: 'short' })
          const dayNumber = day.getDate()

          return (
            <button
              key={index}
              type="button"
              onClick={() => !isDisabled && onSelect?.(day)}
              disabled={isDisabled}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg p-3 text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:pointer-events-none disabled:opacity-40",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                !isSelected && !isDisabled && "bg-secondary/50",
                isToday && !isSelected && "ring-2 ring-primary ring-offset-2"
              )}
            >
              <span className="text-xs font-medium mb-1">{dayName}</span>
              <span className="text-lg font-semibold">{dayNumber}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
