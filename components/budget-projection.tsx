"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarRange, Clock, CalendarDays, CalendarClock, TrendingUp, Wallet, Gauge } from "lucide-react"
import { formatMoney, getCurrency } from "@/lib/currency"
import type { Developer } from "./developers-form"

interface BudgetProjectionProps {
  developers: Developer[]
  effectiveWorkingHours: number
  daysPerWeek: number
  officeCostPercent: number
  profitMarginPercent: number
  primaryCurrency: string
  secondaryCurrency: string
  exchangeRate: number
}

const WEEKS_PER_MONTH = 4.33
const MONTHS_PER_YEAR = 12

type Period = "oneoff" | "daily" | "weekly" | "monthly" | "yearly"

const PERIODS: { value: Period; label: string }[] = [
  { value: "oneoff", label: "One-off (total)" },
  { value: "daily", label: "Per day" },
  { value: "weekly", label: "Per week" },
  { value: "monthly", label: "Per month" },
  { value: "yearly", label: "Per year" },
]

export function BudgetProjection({
  developers,
  effectiveWorkingHours,
  daysPerWeek,
  officeCostPercent,
  profitMarginPercent,
  primaryCurrency,
  secondaryCurrency,
  exchangeRate,
}: BudgetProjectionProps) {
  const [budgetAmount, setBudgetAmount] = useState<number>(10000)
  const [budgetPeriod, setBudgetPeriod] = useState<Period>("monthly")

  const metrics = useMemo(() => {
    const teamSize = developers.length
    const teamMonthlySalary = developers.reduce((s, d) => s + (d.monthlySalary || 0), 0)
    const billMultiplier = (1 + officeCostPercent / 100) * (1 + profitMarginPercent / 100)

    const workingDaysPerMonth = daysPerWeek * WEEKS_PER_MONTH
    const monthlyHoursPerPerson = effectiveWorkingHours * workingDaysPerMonth
    const teamMonthlyHours = monthlyHoursPerPerson * teamSize

    const monthly = teamMonthlySalary * billMultiplier
    const daily = workingDaysPerMonth > 0 ? monthly / workingDaysPerMonth : 0
    const weekly = daily * daysPerWeek
    const yearly = monthly * MONTHS_PER_YEAR
    const hourly = teamMonthlyHours > 0 ? monthly / teamMonthlyHours : 0

    return {
      teamSize,
      teamMonthlySalary,
      billMultiplier,
      workingDaysPerMonth,
      teamMonthlyHours,
      hourly,
      daily,
      weekly,
      monthly,
      yearly,
    }
  }, [developers, effectiveWorkingHours, daysPerWeek, officeCostPercent, profitMarginPercent])

  // Reverse planner: what does the client's budget buy?
  const planner = useMemo(() => {
    const amount = budgetAmount || 0
    // Total pot the budget represents, normalised to a one-off lump sum.
    let totalPot = amount
    let monthlyEquivalent = amount
    switch (budgetPeriod) {
      case "daily":
        totalPot = amount * metrics.workingDaysPerMonth
        monthlyEquivalent = amount * metrics.workingDaysPerMonth
        break
      case "weekly":
        monthlyEquivalent = amount * WEEKS_PER_MONTH
        totalPot = monthlyEquivalent
        break
      case "monthly":
        monthlyEquivalent = amount
        totalPot = amount
        break
      case "yearly":
        monthlyEquivalent = amount / MONTHS_PER_YEAR
        totalPot = amount
        break
      case "oneoff":
      default:
        monthlyEquivalent = amount
        totalPot = amount
        break
    }

    const affordableHours = metrics.hourly > 0 ? totalPot / metrics.hourly : 0
    const affordableDays = effectiveWorkingHours > 0 ? affordableHours / effectiveWorkingHours : 0
    // How many months the current team's burn fits inside a one-off budget.
    const runwayMonths = metrics.monthly > 0 ? totalPot / metrics.monthly : 0
    // Sustainable team size for a recurring monthly-equivalent budget.
    const perDevMonthly = metrics.teamSize > 0 ? metrics.monthly / metrics.teamSize : 0
    const sustainableTeam = perDevMonthly > 0 ? monthlyEquivalent / perDevMonthly : 0
    const withinBudget = budgetPeriod === "oneoff" ? true : monthlyEquivalent >= metrics.monthly

    return { totalPot, monthlyEquivalent, affordableHours, affordableDays, runwayMonths, sustainableTeam, withinBudget }
  }, [budgetAmount, budgetPeriod, metrics, effectiveWorkingHours])

  const dual = (amount: number) => {
    const primary = formatMoney(amount, primaryCurrency)
    const secondary = formatMoney(amount * exchangeRate, secondaryCurrency)
    return { primary, secondary }
  }

  const rows: { label: string; icon: typeof Clock; value: number; hint: string }[] = [
    { label: "Hourly", icon: Clock, value: metrics.hourly, hint: "blended team rate" },
    { label: "Daily", icon: CalendarDays, value: metrics.daily, hint: `${effectiveWorkingHours.toFixed(1)}h/day` },
    { label: "Weekly", icon: CalendarRange, value: metrics.weekly, hint: `${daysPerWeek} days/week` },
    { label: "Monthly", icon: CalendarClock, value: metrics.monthly, hint: `${metrics.workingDaysPerMonth.toFixed(1)} work days` },
    { label: "Yearly", icon: TrendingUp, value: metrics.yearly, hint: "× 12 months" },
  ]

  const secondaryMeta = getCurrency(secondaryCurrency)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
            <Gauge className="h-5 w-5 text-accent" />
          </div>
          <div>
            <CardTitle className="text-lg text-foreground">Budget Projection</CardTitle>
            <CardDescription className="text-muted-foreground">
              Recurring team cost across daily, monthly &amp; yearly bases
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.teamSize === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-secondary/30 py-8 text-center">
            <Wallet className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Add team members to see budget projections</p>
          </div>
        ) : (
          <>
            {/* Breakdown grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {rows.map((row) => {
                const { primary, secondary } = dual(row.value)
                const Icon = row.icon
                return (
                  <div key={row.label} className="rounded-lg border border-border bg-secondary/40 p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                      {row.label}
                    </div>
                    <p className="mt-2 font-mono text-base font-bold text-foreground leading-tight">
                      {primary}
                    </p>
                    <p className="font-mono text-xs text-accent">{secondary}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{row.hint}</p>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-lg bg-secondary/30 px-4 py-3 text-xs text-muted-foreground">
              <span>
                Team: <span className="font-medium text-foreground">{metrics.teamSize}</span>
              </span>
              <span>
                Billable multiplier:{" "}
                <span className="font-mono font-medium text-foreground">
                  {metrics.billMultiplier.toFixed(2)}×
                </span>
              </span>
              <span>
                Capacity:{" "}
                <span className="font-mono font-medium text-foreground">
                  {Math.round(metrics.teamMonthlyHours)}h/mo
                </span>
              </span>
            </div>

            {/* Reverse planner */}
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-accent" />
                <p className="text-sm font-medium text-foreground">Client Budget Planner</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a client budget to see what it buys at your blended rate of{" "}
                <span className="font-mono text-foreground">{formatMoney(metrics.hourly, primaryCurrency)}/hr</span>.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="budget-amount" className="text-xs text-muted-foreground">
                    Budget ({getCurrency(primaryCurrency).symbol})
                  </Label>
                  <Input
                    id="budget-amount"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={budgetAmount === 0 ? "" : budgetAmount}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setBudgetAmount(e.target.value === "" ? 0 : Number(e.target.value))}
                    className="bg-input border-border text-foreground font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Period</Label>
                  <Select value={budgetPeriod} onValueChange={(v) => setBudgetPeriod(v as Period)}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {PERIODS.map((p) => (
                        <SelectItem key={p.value} value={p.value} className="text-foreground">
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-background/60 p-3 text-center">
                  <p className="text-[11px] text-muted-foreground">Hours it buys</p>
                  <p className="font-mono text-lg font-bold text-foreground">
                    {planner.affordableHours.toLocaleString(undefined, { maximumFractionDigits: 0 })}h
                  </p>
                </div>
                <div className="rounded-lg bg-background/60 p-3 text-center">
                  <p className="text-[11px] text-muted-foreground">Working days</p>
                  <p className="font-mono text-lg font-bold text-foreground">
                    {planner.affordableDays.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </p>
                </div>
                <div className="rounded-lg bg-background/60 p-3 text-center">
                  <p className="text-[11px] text-muted-foreground">
                    {budgetPeriod === "oneoff" ? "Team runway" : "Sustainable team"}
                  </p>
                  <p className="font-mono text-lg font-bold text-foreground">
                    {budgetPeriod === "oneoff"
                      ? `${planner.runwayMonths.toLocaleString(undefined, { maximumFractionDigits: 1 })} mo`
                      : `${planner.sustainableTeam.toLocaleString(undefined, { maximumFractionDigits: 1 })} devs`}
                  </p>
                </div>
              </div>

              {budgetPeriod !== "oneoff" && (
                <div
                  className={`rounded-lg px-3 py-2 text-xs font-medium ${
                    planner.withinBudget
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {planner.withinBudget
                    ? `✓ Budget covers the current team (${formatMoney(planner.monthlyEquivalent - metrics.monthly, primaryCurrency)}/mo headroom)`
                    : `✗ Short by ${formatMoney(metrics.monthly - planner.monthlyEquivalent, primaryCurrency)}/mo for the current team`}
                </div>
              )}

              <p className="text-center text-[11px] text-muted-foreground">
                ≈ {formatMoney(planner.totalPot * exchangeRate, secondaryCurrency)} total in {secondaryMeta.name}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
