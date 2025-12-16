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

  function getNext7Days(): Date[] {
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(today)
      day.setDate(today.getDate() + i)
      days.push(day)
    }
    return days
  }

  function isDateDisabled(date: Date): boolean {
    if (disabled) {
      return disabled(date)
    }
    return false
  }

  function isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  const next7Days = getNext7Days()

  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-sm font-semibold text-center">
        Select a Date
      </div>

      <div className="grid grid-cols-7 gap-2">
        {next7Days.map((day, index) => {
          const isDisabled = isDateDisabled(day)
          const isSelected = selected && isSameDay(day, selected)
          const isToday = index === 0
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
