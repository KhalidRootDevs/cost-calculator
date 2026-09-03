import {
  DollarSign,
  Euro,
  PoundSterling,
  IndianRupee,
  JapaneseYen,
  SwissFranc,
  Banknote,
  type LucideIcon,
} from "lucide-react"

export interface CurrencyMeta {
  code: string
  name: string
  symbol: string
  locale: string
  icon: LucideIcon
}

// Supported currencies (17). USD is the base for live-rate conversion.
export const CURRENCIES: CurrencyMeta[] = [
  { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US", icon: DollarSign },
  { code: "EUR", name: "Euro", symbol: "€", locale: "de-DE", icon: Euro },
  { code: "GBP", name: "British Pound", symbol: "£", locale: "en-GB", icon: PoundSterling },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", locale: "en-BD", icon: Banknote },
  { code: "INR", name: "Indian Rupee", symbol: "₹", locale: "en-IN", icon: IndianRupee },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", locale: "ja-JP", icon: JapaneseYen },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", locale: "zh-CN", icon: JapaneseYen },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", locale: "en-CA", icon: DollarSign },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", locale: "en-AU", icon: DollarSign },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", locale: "en-SG", icon: DollarSign },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr", locale: "de-CH", icon: SwissFranc },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", locale: "ar-AE", icon: Banknote },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", locale: "ar-SA", icon: Banknote },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", locale: "en-PK", icon: Banknote },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", locale: "ms-MY", icon: Banknote },
  { code: "ZAR", name: "South African Rand", symbol: "R", locale: "en-ZA", icon: Banknote },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", locale: "en-NG", icon: Banknote },
]

export type CurrencyCode = string

const CURRENCY_MAP: Record<string, CurrencyMeta> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c])
)

const FALLBACK: CurrencyMeta = CURRENCIES[0]

export function getCurrency(code: string): CurrencyMeta {
  return CURRENCY_MAP[code] ?? FALLBACK
}

export function currencySymbol(code: string): string {
  return getCurrency(code).symbol
}

export function currencyIcon(code: string): LucideIcon {
  return getCurrency(code).icon
}

/** Currencies conventionally shown without decimal places. */
const ZERO_DECIMAL = new Set(["JPY"])

export function formatMoney(amount: number, code: string): string {
  const meta = getCurrency(code)
  const fractionDigits = ZERO_DECIMAL.has(code) ? 0 : 2
  const num = (Number.isFinite(amount) ? amount : 0).toLocaleString(meta.locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
  return `${meta.symbol}${num}`
}

/**
 * Convert an amount from one currency to another using USD-based rates
 * (rate = units of currency per 1 USD).
 */
export function convertWithRates(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number {
  if (from === to) return amount
  const fromRate = rates[from]
  const toRate = rates[to]
  if (!fromRate || !toRate) return amount
  const usd = amount / fromRate
  return usd * toRate
}
