import { useState, useEffect } from "react"
import { useKV } from "@github/spark/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CalendarBlank, Clock, X, Plus, User } from "@phosphor-icons/react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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

interface StaffMember {
  username: string
  password: string
  name: string
  role: string
  isAdmin: boolean
  availableServices?: string[]
}

const DEFAULT_STAFF_MEMBERS: StaffMember[] = [
  { username: "maria", password: "supersecret", name: "Maria", role: "Stylist", isAdmin: false, availableServices: [] },
  { username: "paula", password: "supersecret", name: "Paula", role: "Stylist", isAdmin: false, availableServices: [] },
  { username: "owner@ocholab.com", password: "owner123", name: "Admin", role: "Admin", isAdmin: true, availableServices: [] }
]

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
]

const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM"
]

const DEFAULT_SCHEDULE: StaffSchedule["workingHours"] = {
  Monday: { isWorking: true, startTime: "9:00 AM", endTime: "6:00 PM" },
  Tuesday: { isWorking: true, startTime: "9:00 AM", endTime: "6:00 PM" },
  Wednesday: { isWorking: true, startTime: "9:00 AM", endTime: "6:00 PM" },
  Thursday: { isWorking: true, startTime: "9:00 AM", endTime: "6:00 PM" },
  Friday: { isWorking: true, startTime: "9:00 AM", endTime: "6:00 PM" },
  Saturday: { isWorking: true, startTime: "9:00 AM", endTime: "5:00 PM" },
  Sunday: { isWorking: false, startTime: "9:00 AM", endTime: "5:00 PM" }
}

export function StaffSchedule() {
  const [schedules, setSchedules] = useKV<StaffSchedule[]>("staff-schedules", [])
  const [staffMembers] = useKV<StaffMember[]>("staff-members", DEFAULT_STAFF_MEMBERS)
  const [selectedStylist, setSelectedStylist] = useState<string>("")
  const [blockDateDialogOpen, setBlockDateDialogOpen] = useState(false)
  const [selectedBlockDates, setSelectedBlockDates] = useState<Date[]>([])

  const availableStylists = (staffMembers || []).filter(s => !s.isAdmin).map(s => s.name)

  useEffect(() => {
    console.log('StaffSchedule: staffMembers:', staffMembers)
    console.log('StaffSchedule: availableStylists:', availableStylists)
  }, [staffMembers, availableStylists])

  useEffect(() => {
    if (staffMembers && staffMembers.length > 0) {
      const nonAdminStaff = staffMembers.filter(s => !s.isAdmin)
      const existingScheduleNames = new Set((schedules || []).map(s => s.stylistName))
      
      const missingSchedules = nonAdminStaff
        .filter(staff => !existingScheduleNames.has(staff.name))
        .map(staff => ({
          stylistName: staff.name,
          workingHours: DEFAULT_SCHEDULE,
          blockedDates: [],
          breakTimes: [{ startTime: "12:00 PM", endTime: "1:00 PM" }]
        }))

      if (missingSchedules.length > 0) {
        setSchedules((current) => [...(current || []), ...missingSchedules])
      }
    }
  }, [staffMembers])

  const currentSchedule = schedules?.find(s => s.stylistName === selectedStylist)

  const updateWorkingHours = (day: string, field: "isWorking" | "startTime" | "endTime", value: boolean | string) => {
    if (!currentSchedule) return

    setSchedules((current) => 
      (current || []).map(schedule => 
        schedule.stylistName === selectedStylist
          ? {
              ...schedule,
              workingHours: {
                ...schedule.workingHours,
                [day]: {
                  ...schedule.workingHours[day],
                  [field]: value
                }
              }
            }
          : schedule
      )
    )

    toast.success("Schedule updated")
  }

  const addBlockedDates = () => {
    if (!currentSchedule || selectedBlockDates.length === 0) return

    const dateStrings = selectedBlockDates.map(date => date.toISOString().split('T')[0])
    
    setSchedules((current) =>
      (current || []).map(schedule =>
        schedule.stylistName === selectedStylist
          ? {
              ...schedule,
              blockedDates: [...new Set([...schedule.blockedDates, ...dateStrings])]
            }
          : schedule
      )
    )

    toast.success(`Blocked ${selectedBlockDates.length} date(s)`)
    setSelectedBlockDates([])
    setBlockDateDialogOpen(false)
  }

  const removeBlockedDate = (dateStr: string) => {
    setSchedules((current) =>
      (current || []).map(schedule =>
        schedule.stylistName === selectedStylist
          ? {
              ...schedule,
              blockedDates: schedule.blockedDates.filter(d => d !== dateStr)
            }
          : schedule
      )
    )

    toast.success("Date unblocked")
  }

  const addBreakTime = () => {
    if (!currentSchedule) return

    setSchedules((current) =>
      (current || []).map(schedule =>
        schedule.stylistName === selectedStylist
          ? {
              ...schedule,
              breakTimes: [...schedule.breakTimes, { startTime: "12:00 PM", endTime: "1:00 PM" }]
            }
          : schedule
      )
    )
  }

  const updateBreakTime = (index: number, field: "startTime" | "endTime", value: string) => {
    if (!currentSchedule) return

    setSchedules((current) =>
      (current || []).map(schedule =>
        schedule.stylistName === selectedStylist
          ? {
              ...schedule,
              breakTimes: schedule.breakTimes.map((breakTime, i) =>
                i === index ? { ...breakTime, [field]: value } : breakTime
              )
            }
          : schedule
      )
    )
  }

  const removeBreakTime = (index: number) => {
    if (!currentSchedule) return

    setSchedules((current) =>
      (current || []).map(schedule =>
        schedule.stylistName === selectedStylist
          ? {
              ...schedule,
              breakTimes: schedule.breakTimes.filter((_, i) => i !== index)
            }
          : schedule
      )
    )

    toast.success("Break time removed")
  }

  return (
    <div className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Staff Schedule Management
          </h2>
          <p className="text-muted-foreground">
            Manage stylist availability, working hours, and time off
          </p>
        </div>

        <div className="mb-6">
          <Label htmlFor="stylist-select">Select Stylist</Label>
          <Select value={selectedStylist} onValueChange={setSelectedStylist}>
            <SelectTrigger id="stylist-select" className="max-w-md mt-2">
              <SelectValue placeholder="Choose a stylist to manage" />
            </SelectTrigger>
            <SelectContent>
              {availableStylists.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  No staff members found. Please add staff members first.
                </div>
              ) : (
                availableStylists.map((stylist) => (
                  <SelectItem key={stylist} value={stylist}>
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      {stylist}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedStylist && currentSchedule && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={24} />
                  Working Hours
                </CardTitle>
                <CardDescription>
                  Set regular working hours for each day of the week
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {DAYS_OF_WEEK.map((day) => {
                  const daySchedule = currentSchedule.workingHours[day]
                  return (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-3 min-w-[140px]">
                        <Switch
                          checked={daySchedule.isWorking}
                          onCheckedChange={(checked) => updateWorkingHours(day, "isWorking", checked)}
                        />
                        <span className={cn(
                          "font-medium",
                          !daySchedule.isWorking && "text-muted-foreground"
                        )}>
                          {day}
                        </span>
                      </div>

                      {daySchedule.isWorking && (
                        <div className="flex flex-wrap items-center gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm text-muted-foreground">From</Label>
                            <Select
                              value={daySchedule.startTime}
                              onValueChange={(value) => updateWorkingHours(day, "startTime", value)}
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_SLOTS.map((time) => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center gap-2">
                            <Label className="text-sm text-muted-foreground">To</Label>
                            <Select
                              value={daySchedule.endTime}
                              onValueChange={(value) => updateWorkingHours(day, "endTime", value)}
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_SLOTS.map((time) => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={24} />
                  Break Times
                </CardTitle>
                <CardDescription>
                  Set daily break times when the stylist is unavailable
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentSchedule.breakTimes.map((breakTime, index) => (
                  <div key={index} className="flex flex-wrap items-center gap-3 p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground">From</Label>
                      <Select
                        value={breakTime.startTime}
                        onValueChange={(value) => updateBreakTime(index, "startTime", value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground">To</Label>
                      <Select
                        value={breakTime.endTime}
                        onValueChange={(value) => updateBreakTime(index, "endTime", value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBreakTime(index)}
                    >
                      <X size={18} />
                    </Button>
                  </div>
                ))}

                <Button variant="outline" onClick={addBreakTime} className="w-full">
                  <Plus size={18} />
                  Add Break Time
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarBlank size={24} />
                  Blocked Dates
                </CardTitle>
                <CardDescription>
                  Block specific dates when the stylist is unavailable (vacation, time off, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={blockDateDialogOpen} onOpenChange={setBlockDateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus size={18} />
                      Block Dates
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Dates to Block</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <Calendar
                        mode="multiple"
                        selected={selectedBlockDates}
                        onSelect={(dates) => setSelectedBlockDates(dates || [])}
                        disabled={(date) => date < new Date()}
                        className="rounded-md border mx-auto"
                      />
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setBlockDateDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={addBlockedDates}
                          className="flex-1"
                          disabled={selectedBlockDates.length === 0}
                        >
                          Block {selectedBlockDates.length} Date{selectedBlockDates.length !== 1 ? 's' : ''}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {currentSchedule.blockedDates.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentSchedule.blockedDates.sort().map((dateStr) => (
                      <Badge key={dateStr} variant="secondary" className="flex items-center gap-2">
                        {new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        <button
                          onClick={() => removeBlockedDate(dateStr)}
                          className="hover:text-destructive transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {currentSchedule.blockedDates.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No blocked dates. Click "Block Dates" to add time off.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {!selectedStylist && (
          <Card>
            <CardContent className="py-12 text-center">
              <User size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Select a stylist to manage their schedule
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
