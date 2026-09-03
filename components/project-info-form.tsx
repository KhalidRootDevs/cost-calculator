"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Calendar, Building2, ArrowRightLeft, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { CURRENCIES, getCurrency, convertWithRates } from "@/lib/currency"
import flatpickr from "flatpickr"
import "flatpickr/dist/flatpickr.min.css"
import "flatpickr/dist/themes/dark.css"

export interface ProjectInfo {
  projectName: string
  clientName: string
  invoiceDate: string
  primaryCurrency: string
  secondaryCurrency: string
  exchangeRate: number // 1 primary = exchangeRate secondary
}

interface ProjectInfoFormProps {
  projectInfo: ProjectInfo
  onChange: (info: ProjectInfo) => void
  rates: Record<string, number>
  ratesLoading: boolean
  ratesError: string | null
  ratesUpdatedAt: string | null
  onRefreshRates: () => void
}

function CurrencyOptions() {
  return (
    <>
      {CURRENCIES.map((c) => {
        const Icon = c.icon
        return (
          <SelectItem key={c.code} value={c.code} className="text-foreground">
            <span className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              {c.code} ({c.symbol}) &middot; {c.name}
            </span>
          </SelectItem>
        )
      })}
    </>
  )
}

export function ProjectInfoForm({
  projectInfo,
  onChange,
  rates,
  ratesLoading,
  ratesError,
  ratesUpdatedAt,
  onRefreshRates,
}: ProjectInfoFormProps) {
  const dateInputRef = useRef<HTMLInputElement>(null)
  const flatpickrInstance = useRef<flatpickr.Instance | null>(null)

  const updateField = <K extends keyof ProjectInfo>(field: K, value: ProjectInfo[K]) => {
    onChange({ ...projectInfo, [field]: value })
  }

  const primary = getCurrency(projectInfo.primaryCurrency)
  const secondary = getCurrency(projectInfo.secondaryCurrency)
  const PrimaryIcon = primary.icon
  const SecondaryIcon = secondary.icon

  const liveRate = convertWithRates(1, primary.code, secondary.code, rates)
  const rateDiffers = Math.abs(liveRate - projectInfo.exchangeRate) / (liveRate || 1) > 0.001

  const applyLiveRate = () => {
    updateField("exchangeRate", Number(liveRate.toFixed(4)))
  }

  useEffect(() => {
    if (dateInputRef.current && !flatpickrInstance.current) {
      flatpickrInstance.current = flatpickr(dateInputRef.current, {
        dateFormat: "Y-m-d",
        defaultDate: projectInfo.invoiceDate,
        allowInput: true,
        onChange: (selectedDates) => {
          if (selectedDates[0]) {
            const d = selectedDates[0]
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
            updateField("invoiceDate", dateStr)
          }
        },
      })
    }
    return () => {
      if (flatpickrInstance.current) {
        flatpickrInstance.current.destroy()
        flatpickrInstance.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      <CardContent className="space-y-4">
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
            <Label htmlFor="primary-currency" className="text-sm text-muted-foreground">
              Primary Currency
            </Label>
            <Select
              value={projectInfo.primaryCurrency}
              onValueChange={(value) => updateField("primaryCurrency", value)}
            >
              <SelectTrigger id="primary-currency" className="bg-input border-border text-foreground">
                <span className="flex items-center gap-2">
                  <PrimaryIcon className="h-4 w-4 text-accent" />
                  <SelectValue placeholder="Select currency" />
                </span>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-72">
                <CurrencyOptions />
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Exchange rate row */}
        <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm text-foreground">
              <ArrowRightLeft className="h-4 w-4 text-accent" />
              Exchange Rate
            </Label>
            <div className="flex items-center gap-2">
              {ratesError ? (
                <span className="flex items-center gap-1 text-xs text-destructive">
                  <WifiOff className="h-3 w-3" /> offline
                </span>
              ) : ratesUpdatedAt ? (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Wifi className="h-3 w-3 text-success" /> live
                </span>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRefreshRates}
                disabled={ratesLoading}
                className="h-7 gap-1.5 border-border bg-background text-xs text-foreground hover:bg-secondary"
              >
                <RefreshCw className={`h-3 w-3 ${ratesLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Convert to</Label>
              <Select
                value={projectInfo.secondaryCurrency}
                onValueChange={(value) => updateField("secondaryCurrency", value)}
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <span className="flex items-center gap-2">
                    <SecondaryIcon className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select currency" />
                  </span>
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-72">
                  <CurrencyOptions />
                </SelectContent>
              </Select>
            </div>

            <div className="hidden pb-2.5 text-center text-xs text-muted-foreground sm:block">
              1 {primary.symbol} =
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exchange-rate" className="text-xs text-muted-foreground">
                Rate (1 {primary.code} → {secondary.code})
              </Label>
              <div className="relative">
                <SecondaryIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="exchange-rate"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={projectInfo.exchangeRate === 0 ? "" : projectInfo.exchangeRate}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => updateField("exchangeRate", e.target.value === "" ? 0 : Number(e.target.value))}
                  className="pl-10 bg-input border-border text-foreground font-mono"
                />
              </div>
            </div>
          </div>

          {rateDiffers && (
            <button
              type="button"
              onClick={applyLiveRate}
              className="text-xs text-accent hover:underline"
            >
              Live rate is {liveRate.toFixed(4)} — click to apply
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
