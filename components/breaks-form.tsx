"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Coffee, Plus, Trash2 } from "lucide-react"

export interface Break {
  id: string
  name: string
  duration: number // in minutes
}

interface BreaksFormProps {
  breaks: Break[]
  onChange: (breaks: Break[]) => void
}

export function BreaksForm({ breaks, onChange }: BreaksFormProps) {
  const addBreak = () => {
    const newBreak: Break = {
      id: crypto.randomUUID(),
      name: "Break",
      duration: 30
    }
    onChange([...breaks, newBreak])
  }

  const updateBreak = (id: string, field: keyof Break, value: string | number) => {
    onChange(
      breaks.map((b) =>
        b.id === id ? { ...b, [field]: field === "duration" ? Number(value) : value } : b
      )
    )
  }

  const removeBreak = (id: string) => {
    onChange(breaks.filter((b) => b.id !== id))
  }

  const totalBreakMinutes = breaks.reduce((sum, b) => sum + b.duration, 0)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Coffee className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">Daily Breaks</CardTitle>
              <CardDescription className="text-muted-foreground">
                Add lunch and other breaks
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={addBreak}
            variant="outline"
            size="sm"
            className="gap-2 border-border bg-secondary text-foreground hover:bg-secondary/80"
          >
            <Plus className="h-4 w-4" />
            Add Break
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {breaks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-secondary/30 py-8 text-center">
            <Coffee className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No breaks added</p>
            <p className="text-xs text-muted-foreground">
              Click &quot;Add Break&quot; to add a lunch or other break
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {breaks.map((breakItem) => (
              <div
                key={breakItem.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-secondary/50 p-4"
              >
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`break-name-${breakItem.id}`} className="text-xs text-muted-foreground">
                    Break Name
                  </Label>
                  <Input
                    id={`break-name-${breakItem.id}`}
                    value={breakItem.name}
                    onChange={(e) => updateBreak(breakItem.id, "name", e.target.value)}
                    placeholder="e.g., Lunch Break"
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label htmlFor={`break-duration-${breakItem.id}`} className="text-xs text-muted-foreground">
                    Duration (min)
                  </Label>
                  <Input
                    id={`break-duration-${breakItem.id}`}
                    type="number"
                    min="0"
                    value={breakItem.duration}
                    onChange={(e) => updateBreak(breakItem.id, "duration", e.target.value)}
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeBreak(breakItem.id)}
                  className="mt-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {breaks.length > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
            <span className="text-sm text-muted-foreground">Total break time per day</span>
            <span className="font-mono text-sm font-medium text-foreground">
              {Math.floor(totalBreakMinutes / 60)}h {totalBreakMinutes % 60}m
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
