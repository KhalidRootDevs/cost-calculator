"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, Calendar } from "lucide-react"

interface WorkSchedule {
  daysPerWeek: number
  startTime: string
  endTime: string
  workingDays: string[]
}

interface WorkScheduleFormProps {
  schedule: WorkSchedule
  onChange: (schedule: WorkSchedule) => void
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function WorkScheduleForm({ schedule, onChange }: WorkScheduleFormProps) {
  const handleDayToggle = (day: string, checked: boolean) => {
    const newDays = checked
      ? [...schedule.workingDays, day]
      : schedule.workingDays.filter(d => d !== day)
    onChange({ ...schedule, workingDays: newDays, daysPerWeek: newDays.length })
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <Calendar className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg text-foreground">Work Schedule</CardTitle>
            <CardDescription className="text-muted-foreground">
              Define your farm&apos;s working hours
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startTime" className="text-sm text-muted-foreground">
              Start Time
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="startTime"
                type="time"
                value={schedule.startTime}
                onChange={(e) => onChange({ ...schedule, startTime: e.target.value })}
                className="pl-10 bg-input border-border text-foreground"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime" className="text-sm text-muted-foreground">
              End Time
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="endTime"
                type="time"
                value={schedule.endTime}
                onChange={(e) => onChange({ ...schedule, endTime: e.target.value })}
                className="pl-10 bg-input border-border text-foreground"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <Label className="text-sm text-muted-foreground">Working Days</Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {DAYS.map((day) => (
              <div
                key={day}
                className={`flex items-center gap-2 rounded-lg border p-3 transition-colors cursor-pointer ${
                  schedule.workingDays.includes(day)
                    ? "border-accent bg-accent/10"
                    : "border-border bg-secondary/50 hover:bg-secondary"
                }`}
                onClick={() => handleDayToggle(day, !schedule.workingDays.includes(day))}
              >
                <Checkbox
                  checked={schedule.workingDays.includes(day)}
                  onCheckedChange={(checked) => handleDayToggle(day, checked as boolean)}
                  className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                />
                <span className="text-sm text-foreground">{day.slice(0, 3)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {schedule.daysPerWeek} day{schedule.daysPerWeek !== 1 ? 's' : ''} per week selected
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
