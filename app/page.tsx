"use client"

import { useState, useMemo } from "react"
import { ProjectInfoForm, type ProjectInfo } from "@/components/project-info-form"
import { WorkScheduleForm } from "@/components/work-schedule-form"
import { BreaksForm, type Break } from "@/components/breaks-form"
import { DevelopersForm, type Developer } from "@/components/developers-form"
import { CostSummary } from "@/components/cost-summary"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Users, Calculator } from "lucide-react"

interface WorkSchedule {
  daysPerWeek: number
  startTime: string
  endTime: string
  workingDays: string[]
}

export default function CostCalculator() {
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    projectName: "",
    clientName: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    primaryCurrency: "USD"
  })

  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>({
    daysPerWeek: 5,
    startTime: "09:00",
    endTime: "18:00",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  })

  const [breaks, setBreaks] = useState<Break[]>([
    { id: "1", name: "Lunch Break", duration: 60 }
  ])

  const [developers, setDevelopers] = useState<Developer[]>([])

  const [officeCostPercent, setOfficeCostPercent] = useState(15)
  const [profitMarginPercent, setProfitMarginPercent] = useState(20)

  // Calculate effective working hours per day
  const effectiveWorkingHours = useMemo(() => {
    const [startHour, startMin] = workSchedule.startTime.split(":").map(Number)
    const [endHour, endMin] = workSchedule.endTime.split(":").map(Number)
    
    const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin)
    const breakMinutes = breaks.reduce((sum, b) => sum + b.duration, 0)
    
    return Math.max(0, (totalMinutes - breakMinutes) / 60)
  }, [workSchedule.startTime, workSchedule.endTime, breaks])

  // Calculate base development cost
  const { baseCost, totalHours } = useMemo(() => {
    let totalCost = 0
    let hours = 0

    const weeklyHours = effectiveWorkingHours * 5
    const monthlyHours = weeklyHours * 4.33

    developers.forEach((dev) => {
      const hourlyRate = dev.monthlySalary / monthlyHours
      const hoursWorked = dev.workType === "days" 
        ? dev.workAmount * effectiveWorkingHours 
        : dev.workAmount
      
      hours += hoursWorked
      totalCost += hoursWorked * hourlyRate
    })

    return { baseCost: totalCost, totalHours: hours }
  }, [developers, effectiveWorkingHours])

  const currencySymbol = projectInfo.primaryCurrency === "USD" ? "$" : "৳"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
              <Calculator className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Cost Calculator</h1>
              <p className="text-xs text-muted-foreground">Software Development Farm</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-accent/50 text-accent">
              {currencySymbol} {projectInfo.primaryCurrency}
            </Badge>
            <Badge variant="outline" className="border-border text-muted-foreground">
              v1.0
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <Clock className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Working Hours/Day</p>
                <p className="text-2xl font-bold text-foreground">
                  {effectiveWorkingHours.toFixed(1)}h
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <Users className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold text-foreground">{developers.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                <Calculator className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Project Hours</p>
                <p className="text-2xl font-bold text-foreground">{totalHours.toFixed(1)}h</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <ProjectInfoForm
              projectInfo={projectInfo}
              onChange={setProjectInfo}
            />

            <WorkScheduleForm
              schedule={workSchedule}
              onChange={setWorkSchedule}
            />
            
            <BreaksForm
              breaks={breaks}
              onChange={setBreaks}
            />
            
            <DevelopersForm
              developers={developers}
              onChange={setDevelopers}
              hourlyWorkingHours={effectiveWorkingHours}
            />
          </div>

          {/* Right Column - Cost Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <CostSummary
              baseCost={baseCost}
              officeCostPercent={officeCostPercent}
              profitMarginPercent={profitMarginPercent}
              onOfficeCostChange={setOfficeCostPercent}
              onProfitMarginChange={setProfitMarginPercent}
              totalHours={totalHours}
              developerCount={developers.length}
              projectInfo={projectInfo}
              developers={developers}
              effectiveWorkingHours={effectiveWorkingHours}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            Software Farm Cost Calculator &middot; Calculate accurate project costs for your development team
          </p>
        </div>
      </footer>
    </div>
  )
}
