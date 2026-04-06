"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Calendar, Building2 } from "lucide-react"
import flatpickr from "flatpickr"
import "flatpickr/dist/flatpickr.min.css"
import "flatpickr/dist/themes/dark.css"

export interface ProjectInfo {
  projectName: string
  clientName: string
  invoiceDate: string
  primaryCurrency: "USD" | "BDT"
}

interface ProjectInfoFormProps {
  projectInfo: ProjectInfo
  onChange: (info: ProjectInfo) => void
}

export function ProjectInfoForm({ projectInfo, onChange }: ProjectInfoFormProps) {
  const dateInputRef = useRef<HTMLInputElement>(null)
  const flatpickrInstance = useRef<flatpickr.Instance | null>(null)

  const updateField = (field: keyof ProjectInfo, value: string) => {
    onChange({ ...projectInfo, [field]: value })
  }

  useEffect(() => {
    if (dateInputRef.current && !flatpickrInstance.current) {
      flatpickrInstance.current = flatpickr(dateInputRef.current, {
        dateFormat: "Y-m-d",
        defaultDate: projectInfo.invoiceDate,
        allowInput: true,
        theme: "dark",
        onChange: (selectedDates) => {
          if (selectedDates[0]) {
            const dateStr = selectedDates[0].toISOString().split("T")[0]
            updateField("invoiceDate", dateStr)
          }
        }
      })
    }

    return () => {
      if (flatpickrInstance.current) {
        flatpickrInstance.current.destroy()
        flatpickrInstance.current = null
      }
    }
  }, [projectInfo, onChange])

  // Update flatpickr when date changes externally
  useEffect(() => {
    if (flatpickrInstance.current && projectInfo.invoiceDate) {
      flatpickrInstance.current.setDate(projectInfo.invoiceDate, false)
    }
  }, [projectInfo.invoiceDate])

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <FileText className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg text-foreground">Project Information</CardTitle>
            <CardDescription className="text-muted-foreground">
              Basic details for the invoice
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-sm text-muted-foreground">
              Project Name
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="project-name"
                value={projectInfo.projectName}
                onChange={(e) => updateField("projectName", e.target.value)}
                placeholder="Enter project name"
                className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-name" className="text-sm text-muted-foreground">
              Client Name
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="client-name"
                value={projectInfo.clientName}
                onChange={(e) => updateField("clientName", e.target.value)}
                placeholder="Enter client name"
                className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice-date" className="text-sm text-muted-foreground">
              Invoice Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
              <Input
                ref={dateInputRef}
                id="invoice-date"
                placeholder="Select date"
                className="pl-10 bg-input border-border text-foreground cursor-pointer"
                readOnly
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency" className="text-sm text-muted-foreground">
              Primary Currency
            </Label>
            <Select
              value={projectInfo.primaryCurrency}
              onValueChange={(value) => updateField("primaryCurrency", value)}
            >
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="USD" className="text-foreground">
                  USD ($) - US Dollar
                </SelectItem>
                <SelectItem value="BDT" className="text-foreground">
                  BDT (৳) - Bangladeshi Taka
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
