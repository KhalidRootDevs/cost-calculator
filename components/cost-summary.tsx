"use client"

import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Calculator, Building, TrendingUp, Percent, FileText, Building2, Calendar } from "lucide-react"
import { formatMoney, getCurrency } from "@/lib/currency"

// Dynamically import DownloadButton with SSR disabled to avoid jsPDF/docx SSR issues
const DownloadButton = dynamic(() => import("./download-button").then(mod => ({ default: mod.DownloadButton })), {
  ssr: false,
  loading: () => <div className="h-9 w-24 bg-secondary rounded-md animate-pulse" />
})

interface Developer {
  id: string
  name: string
  monthlySalary: number
  workType: "hours" | "days" | "months"
  workAmount: number
}

interface ProjectInfo {
  projectName: string
  clientName: string
  invoiceDate: string
  primaryCurrency: string
  secondaryCurrency: string
  exchangeRate: number
}

interface CostSummaryProps {
  baseCost: number
  officeCostPercent: number
  profitMarginPercent: number
  onOfficeCostChange: (value: number) => void
  onProfitMarginChange: (value: number) => void
  totalHours: number
  developerCount: number
  projectInfo: ProjectInfo
  developers: Developer[]
  effectiveWorkingHours: number
}

export function CostSummary({
  baseCost,
  officeCostPercent,
  profitMarginPercent,
  onOfficeCostChange,
  onProfitMarginChange,
  totalHours,
  developerCount,
  projectInfo,
  developers,
  effectiveWorkingHours
}: CostSummaryProps) {
  const officeCost = baseCost * (officeCostPercent / 100)
  const subtotalWithOffice = baseCost + officeCost
  const profitAmount = subtotalWithOffice * (profitMarginPercent / 100)
  const totalCost = subtotalWithOffice + profitAmount

  const { exchangeRate } = projectInfo
  const primaryMeta = getCurrency(projectInfo.primaryCurrency)
  const secondaryMeta = getCurrency(projectInfo.secondaryCurrency)
  const PrimaryIcon = primaryMeta.icon
  const SecondaryIcon = secondaryMeta.icon

  // Convert total to the secondary currency for dual display.
  const totalPrimary = totalCost
  const totalSecondary = totalCost * exchangeRate

  const formatPrimaryCurrency = (amount: number) => formatMoney(amount, projectInfo.primaryCurrency)

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    })
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
              <Calculator className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">Cost Summary</CardTitle>
              <CardDescription className="text-muted-foreground">
                Final project cost calculation
              </CardDescription>
            </div>
          </div>
          <DownloadButton
            projectInfo={projectInfo}
            developers={developers}
            effectiveWorkingHours={effectiveWorkingHours}
            baseCost={baseCost}
            officeCostPercent={officeCostPercent}
            profitMarginPercent={profitMarginPercent}
            officeCost={officeCost}
            profitAmount={profitAmount}
            totalCost={totalCost}
            totalSecondary={totalSecondary}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Info Summary */}
        {(projectInfo.projectName || projectInfo.clientName || projectInfo.invoiceDate) && (
          <>
            <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
              {projectInfo.projectName && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">Project:</span>
                  <span className="text-sm font-medium text-foreground truncate">
                    {projectInfo.projectName}
                  </span>
                </div>
              )}
              {projectInfo.clientName && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">Client:</span>
                  <span className="text-sm font-medium text-foreground truncate">
                    {projectInfo.clientName}
                  </span>
                </div>
              )}
              {projectInfo.invoiceDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatDate(projectInfo.invoiceDate)}
                  </span>
                </div>
              )}
            </div>
            <Separator className="bg-border" />
          </>
        )}

        {/* Base Development Cost */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PrimaryIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Base Development Cost</span>
            </div>
            <span className="font-mono text-lg font-semibold text-foreground">
              {formatPrimaryCurrency(baseCost)}
            </span>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>{developerCount} developer{developerCount !== 1 ? 's' : ''}</span>
            <span>{totalHours.toFixed(1)} total hours</span>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Office Cost */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Office Overhead</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-20">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={officeCostPercent === 0 ? "" : officeCostPercent}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => onOfficeCostChange(e.target.value === "" ? 0 : Number(e.target.value))}
                  className="pr-6 bg-input border-border text-foreground text-right h-8 text-sm"
                />
                <Percent className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>
          <Slider
            value={[officeCostPercent]}
            onValueChange={([value]) => onOfficeCostChange(value)}
            max={50}
            step={1}
            className="[&_[role=slider]]:bg-accent"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Office cost amount</span>
            <span className="font-mono text-foreground">
              +{formatPrimaryCurrency(officeCost)}
            </span>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Profit Margin */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Profit Margin</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-20">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={profitMarginPercent === 0 ? "" : profitMarginPercent}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => onProfitMarginChange(e.target.value === "" ? 0 : Number(e.target.value))}
                  className="pr-6 bg-input border-border text-foreground text-right h-8 text-sm"
                />
                <Percent className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>
          <Slider
            value={[profitMarginPercent]}
            onValueChange={([value]) => onProfitMarginChange(value)}
            max={100}
            step={1}
            className="[&_[role=slider]]:bg-success"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Profit amount</span>
            <span className="font-mono text-success">
              +{formatPrimaryCurrency(profitAmount)}
            </span>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Total Cost - Primary Currency */}
        <div className="rounded-lg bg-accent/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Total Project Cost</p>
              <p className="text-xs text-muted-foreground">Including overhead and profit</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-2xl font-bold text-accent">
                {formatPrimaryCurrency(totalCost)}
              </p>
            </div>
          </div>
        </div>

        {/* Dual Currency Display */}
        <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
          <p className="text-xs text-muted-foreground mb-3">Amount in both currencies</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg p-3 bg-accent/20 border border-accent/30">
              <p className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <PrimaryIcon className="h-3.5 w-3.5" /> {primaryMeta.name}
              </p>
              <p className="font-mono text-lg font-bold text-accent">
                {formatMoney(totalPrimary, primaryMeta.code)}
              </p>
            </div>
            <div className="rounded-lg p-3 bg-secondary/50">
              <p className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <SecondaryIcon className="h-3.5 w-3.5" /> {secondaryMeta.name}
              </p>
              <p className="font-mono text-lg font-bold text-foreground">
                {formatMoney(totalSecondary, secondaryMeta.code)}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Exchange rate: 1 {primaryMeta.symbol} = {exchangeRate} {secondaryMeta.symbol}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
