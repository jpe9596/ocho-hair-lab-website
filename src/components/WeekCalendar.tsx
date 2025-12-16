import { useState } from "react"
import { cn } from "@/lib/utils"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

interface WeekCalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
  disabled?: (date: Date) => boolean
  className?: string
}

export function WeekCalendar({ selected, onSelect, disabled, className }: WeekCalendarProps) {
  const [weekOffset, setWeekOffset] = useState(0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  function get7DaysFromOffset(offset: number): Date[] {
    const days: Date[] = []
    const startDay = offset * 7
    for (let i = 0; i < 7; i++) {
      const day = new Date(today)
      day.setDate(today.getDate() + startDay + i)
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

  const currentWeek = get7DaysFromOffset(weekOffset)
  const firstDay = currentWeek[0]
  const lastDay = currentWeek[6]
  
  const formatDateRange = () => {
    if (firstDay.getMonth() === lastDay.getMonth()) {
      return `${firstDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${lastDay.getDate()}, ${lastDay.getFullYear()}`
    } else {
      return `${firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${lastDay.getFullYear()}`
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
          disabled={weekOffset === 0}
          className="h-8 w-8 p-0"
        >
          <CaretLeft size={16} weight="bold" />
        </Button>
        
        <div className="text-sm font-semibold text-center">
          {formatDateRange()}
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="h-8 w-8 p-0"
        >
          <CaretRight size={16} weight="bold" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {currentWeek.map((day, index) => {
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
