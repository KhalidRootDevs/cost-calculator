"use client"

import { useCallback, useEffect, useRef, useState } from "react"

// Free, key-less endpoint. Returns rates as units-per-1-USD.
const RATES_URL = "https://open.er-api.com/v6/latest/USD"

export interface ExchangeRateState {
  /** Units of each currency per 1 USD. */
  rates: Record<string, number>
  /** ISO timestamp of the last successful live fetch. */
  updatedAt: string | null
  loading: boolean
  error: string | null
  /** Manually refetch live rates. */
  refresh: () => Promise<void>
}

// Sensible offline defaults so the app always works without a network.
const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, BDT: 121, INR: 83, JPY: 150, CNY: 7.2,
  CAD: 1.36, AUD: 1.52, SGD: 1.34, CHF: 0.88, AED: 3.67, SAR: 3.75,
  PKR: 278, MYR: 4.7, ZAR: 18.5, NGN: 1450,
}

export function useExchangeRate(): ExchangeRateState {
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(RATES_URL, { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data?.result !== "success" || !data?.rates) {
        throw new Error("Unexpected response")
      }
      if (!mounted.current) return
      setRates({ ...FALLBACK_RATES, ...data.rates })
      setUpdatedAt(data.time_last_update_utc ?? new Date().toISOString())
    } catch (e) {
      if (!mounted.current) return
      setError(e instanceof Error ? e.message : "Failed to fetch rates")
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    refresh()
    return () => {
      mounted.current = false
    }
  }, [refresh])

  return { rates, updatedAt, loading, error, refresh }
}
