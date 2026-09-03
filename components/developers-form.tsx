"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Plus, Trash2 } from "lucide-react"
import { currencySymbol as symbolFor, currencyIcon } from "@/lib/currency"

export interface Developer {
  id: string
  name: string
  monthlySalary: number
  workType: "hours" | "days" | "months"
  workAmount: number
}

interface DevelopersFormProps {
  developers: Developer[]
  onChange: (developers: Developer[]) => void
  hourlyWorkingHours: number
  currency: string
}

export function DevelopersForm({ developers, onChange, hourlyWorkingHours, currency }: DevelopersFormProps) {
  const currencySymbol = symbolFor(currency)
  const CurrencyIcon = currencyIcon(currency)
  const addDeveloper = () => {
    const newDeveloper: Developer = {
      id: crypto.randomUUID(),
      name: `Developer ${developers.length + 1}`,
      monthlySalary: 5000,
      workType: "hours",
      workAmount: 0
    }
    onChange([...developers, newDeveloper])
  }

  const updateDeveloper = (id: string, field: keyof Developer, value: string | number) => {
    onChange(
      developers.map((d) =>
        d.id === id
          ? {
              ...d,
              [field]:
                field === "monthlySalary" || field === "workAmount"
                  ? Number(value)
                  : value
            }
          : d
      )
    )
  }

  const removeDeveloper = (id: string) => {
    onChange(developers.filter((d) => d.id !== id))
  }

  // Assuming 5 working days/week, 4.33 weeks/month average
  const monthlyHours = hourlyWorkingHours * 5 * 4.33

  const calculateHourlyRate = (monthlySalary: number) => {
    return monthlyHours > 0 ? monthlySalary / monthlyHours : 0
  }

  const hoursFor = (dev: Developer) => {
    if (dev.workType === "days") return dev.workAmount * hourlyWorkingHours
    if (dev.workType === "months") return dev.workAmount * monthlyHours
    return dev.workAmount
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Users className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">Team Members</CardTitle>
              <CardDescription className="text-muted-foreground">
                Add developers and their work details
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={addDeveloper}
            variant="outline"
            size="sm"
            className="gap-2 border-border bg-secondary text-foreground hover:bg-secondary/80"
          >
            <Plus className="h-4 w-4" />
            Add Developer
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {developers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-secondary/30 py-8 text-center">
            <Users className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No developers added</p>
            <p className="text-xs text-muted-foreground">
              Click &quot;Add Developer&quot; to start building your team
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {developers.map((dev) => {
              const hourlyRate = calculateHourlyRate(dev.monthlySalary)
              const hoursWorked = hoursFor(dev)
              const devCost = hoursWorked * hourlyRate
              
              return (
                <div
                  key={dev.id}
                  className="rounded-lg border border-border bg-secondary/50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <Label htmlFor={`dev-name-${dev.id}`} className="text-xs text-muted-foreground">
                          Name
                        </Label>
                        <Input
                          id={`dev-name-${dev.id}`}
                          value={dev.name}
                          onChange={(e) => updateDeveloper(dev.id, "name", e.target.value)}
                          placeholder="Developer name"
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`dev-salary-${dev.id}`} className="text-xs text-muted-foreground">
                          Monthly Salary ({currencySymbol})
                        </Label>
                        <div className="relative">
                          <CurrencyIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id={`dev-salary-${dev.id}`}
                            type="number"
                            min="0"
                            placeholder="0"
                            value={dev.monthlySalary === 0 ? "" : dev.monthlySalary}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => updateDeveloper(dev.id, "monthlySalary", e.target.value)}
                            className="pl-10 bg-input border-border text-foreground"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Work Type</Label>
                        <Select
                          value={dev.workType}
                          onValueChange={(value) => updateDeveloper(dev.id, "workType", value)}
                        >
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="hours" className="text-foreground">Hours</SelectItem>
                            <SelectItem value="days" className="text-foreground">Days</SelectItem>
                            <SelectItem value="months" className="text-foreground">Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`dev-amount-${dev.id}`} className="text-xs text-muted-foreground">
                          {dev.workType === "hours" ? "Hours Worked" : dev.workType === "days" ? "Days Worked" : "Months Worked"}
                        </Label>
                        <Input
                          id={`dev-amount-${dev.id}`}
                          type="number"
                          min="0"
                          step={dev.workType === "hours" ? "0.5" : dev.workType === "months" ? "0.5" : "1"}
                          placeholder="0"
                          value={dev.workAmount === 0 ? "" : dev.workAmount}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => updateDeveloper(dev.id, "workAmount", e.target.value)}
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDeveloper(dev.id)}
                      className="mt-6 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg bg-background/50 px-3 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Hourly Rate:</span>
                      <span className="font-mono font-medium text-foreground">
                        {currencySymbol}{hourlyRate.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Total Hours:</span>
                      <span className="font-mono font-medium text-foreground">
                        {hoursWorked.toFixed(1)}h
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="font-mono font-medium text-accent">
                        {currencySymbol}{devCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
