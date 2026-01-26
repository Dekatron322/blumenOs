/**
 * Date range helper for common filters.
 * - Uses UTC time for consistent server-side queries.
 * - startDate is inclusive; endDate is inclusive (end of day).
 * - Dates returned as ISO strings.
 */

export type DateFilter =
  | "today"
  | "day"
  | "yesterday"
  | "this_week"
  | "week"
  | "last_week"
  | "lastWeek"
  | "this_month"
  | "month"
  | "last_month"
  | "lastMonth"
  | "this_year"
  | "year"
  | "last_year"
  | "lastYear"
  | "quarter"
  | "all_time"
  | "all"

export interface DateRange {
  startDate: string | null
  endDate: string | null
}

export interface DateRangeUtc {
  startDateUtc: string
  endDateUtc: string
}

export interface DateRangeUtcCapitalized {
  StartDateUtc: string
  EndDateUtc: string
}

export interface DateRangeOptions {
  now?: Date
  weekStartsOn?: 0 | 1 // 0 = Sunday, 1 = Monday
}

function startOfDayUtc(d: Date): Date {
  const x = new Date(d)
  x.setUTCHours(0, 0, 0, 0)
  return x
}

function endOfDayUtc(d: Date): Date {
  const x = new Date(d)
  x.setUTCHours(23, 59, 59, 999)
  return x
}

function addDaysUtc(d: Date, n: number): Date {
  const x = new Date(d)
  x.setUTCDate(x.getUTCDate() + n)
  return x
}

function startOfMonthUtc(d: Date): Date {
  const x = new Date(d)
  x.setUTCDate(1)
  x.setUTCHours(0, 0, 0, 0)
  return x
}

function endOfMonthUtc(d: Date): Date {
  const x = new Date(d)
  x.setUTCMonth(x.getUTCMonth() + 1, 0) // Last day of current month
  x.setUTCHours(23, 59, 59, 999)
  return x
}

function startOfYearUtc(d: Date): Date {
  const x = new Date(d)
  x.setUTCMonth(0, 1) // January 1st
  x.setUTCHours(0, 0, 0, 0)
  return x
}

function endOfYearUtc(d: Date): Date {
  const x = new Date(d)
  x.setUTCMonth(11, 31) // December 31st
  x.setUTCHours(23, 59, 59, 999)
  return x
}

/**
 * Week start: Monday (default) or Sunday. (UTC-based)
 * @param d Date
 * @param weekStartsOn 1=Monday, 0=Sunday
 */
function startOfWeekUtc(d: Date, weekStartsOn: 0 | 1 = 1): Date {
  const x = startOfDayUtc(d)
  const day = x.getUTCDay() // 0=Sun..6=Sat

  const diff =
    weekStartsOn === 1
      ? day === 0
        ? -6
        : 1 - day // Monday-based
      : -day // Sunday-based

  x.setUTCDate(x.getUTCDate() + diff)
  return x
}

function endOfWeekUtc(d: Date, weekStartsOn: 0 | 1 = 1): Date {
  const start = startOfWeekUtc(d, weekStartsOn)
  const end = addDaysUtc(start, 6)
  end.setUTCHours(23, 59, 59, 999)
  return end
}

function toRange(start: Date, end: Date): DateRange {
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  }
}

function toRangeUtc(start: Date, end: Date): DateRangeUtc {
  return {
    startDateUtc: start.toISOString(),
    endDateUtc: end.toISOString(),
  }
}

/**
 * Get date range with capitalized keys (for analytics slices)
 */
export function getDateRangeUtcCapitalized(filter: DateFilter, opts: DateRangeOptions = {}): DateRangeUtcCapitalized {
  const range = getDateRangeUtc(filter, opts)
  return {
    StartDateUtc: range.startDateUtc,
    EndDateUtc: range.endDateUtc,
  }
}

/**
 * Get date range for common filter options (UTC-based)
 * @param filter The date filter type
 * @param opts Optional configuration (now date, week start day)
 * @returns Object with startDateUtc and endDateUtc as ISO strings
 */
export function getDateRangeUtc(filter: DateFilter, opts: DateRangeOptions = {}): DateRangeUtc {
  const now = opts.now ?? new Date()
  const weekStartsOn = opts.weekStartsOn ?? 1 // 1 = Monday

  const todayStart = startOfDayUtc(now)
  const todayEnd = endOfDayUtc(now)

  switch (filter) {
    case "today":
    case "day":
      return toRangeUtc(todayStart, todayEnd)

    case "yesterday": {
      const yStart = addDaysUtc(todayStart, -1)
      const yEnd = new Date(yStart)
      yEnd.setUTCHours(23, 59, 59, 999)
      return toRangeUtc(yStart, yEnd)
    }

    case "this_week":
    case "week": {
      const wStart = startOfWeekUtc(now, weekStartsOn)
      const wEnd = endOfWeekUtc(now, weekStartsOn)
      return toRangeUtc(wStart, wEnd)
    }

    case "last_week":
    case "lastWeek": {
      const thisWStart = startOfWeekUtc(now, weekStartsOn)
      const lastWStart = addDaysUtc(thisWStart, -7)
      const lastWEnd = addDaysUtc(lastWStart, 6)
      lastWEnd.setUTCHours(23, 59, 59, 999)
      return toRangeUtc(lastWStart, lastWEnd)
    }

    case "this_month":
    case "month": {
      const mStart = startOfMonthUtc(now)
      const mEnd = endOfMonthUtc(now)
      return toRangeUtc(mStart, mEnd)
    }

    case "last_month":
    case "lastMonth": {
      const lastMStart = new Date(now)
      lastMStart.setUTCMonth(lastMStart.getUTCMonth() - 1, 1)
      lastMStart.setUTCHours(0, 0, 0, 0)
      const lastMEnd = new Date(lastMStart)
      lastMEnd.setUTCMonth(lastMEnd.getUTCMonth() + 1, 0)
      lastMEnd.setUTCHours(23, 59, 59, 999)
      return toRangeUtc(lastMStart, lastMEnd)
    }

    case "quarter": {
      const qStart = new Date(now)
      qStart.setUTCMonth(qStart.getUTCMonth() - 3)
      return toRangeUtc(qStart, now)
    }

    case "this_year":
    case "year": {
      const yStart = startOfYearUtc(now)
      const yEnd = endOfYearUtc(now)
      return toRangeUtc(yStart, yEnd)
    }

    case "last_year":
    case "lastYear": {
      const lastYStart = new Date(now)
      lastYStart.setUTCFullYear(lastYStart.getUTCFullYear() - 1, 0, 1)
      lastYStart.setUTCHours(0, 0, 0, 0)
      const lastYEnd = new Date(lastYStart)
      lastYEnd.setUTCMonth(11, 31)
      lastYEnd.setUTCHours(23, 59, 59, 999)
      return toRangeUtc(lastYStart, lastYEnd)
    }

    case "all_time":
    case "all": {
      // Return a 10-year range for "all time"
      const allStart = new Date(now)
      allStart.setUTCFullYear(allStart.getUTCFullYear() - 10)
      return toRangeUtc(allStart, now)
    }

    default:
      throw new Error(`Unknown filter: ${filter}`)
  }
}

/**
 * Get date range for common filter options (local time, exclusive end)
 * @param filter The date filter type
 * @param opts Optional configuration (now date, week start day)
 * @returns Object with startDate and endDate as ISO strings
 */
export function getDateRange(filter: DateFilter, opts: DateRangeOptions = {}): DateRange {
  const now = opts.now ?? new Date()
  const weekStartsOn = opts.weekStartsOn ?? 1 // 1 = Monday

  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)

  switch (filter) {
    case "today":
    case "day":
      return toRange(todayStart, tomorrowStart)

    case "yesterday": {
      const yStart = new Date(todayStart)
      yStart.setDate(yStart.getDate() - 1)
      return toRange(yStart, todayStart)
    }

    case "this_week":
    case "week": {
      const wStart = new Date(todayStart)
      const day = wStart.getDay()
      const diff = weekStartsOn === 1 ? (day === 0 ? -6 : 1 - day) : -day
      wStart.setDate(wStart.getDate() + diff)
      const wEnd = new Date(wStart)
      wEnd.setDate(wEnd.getDate() + 7)
      return toRange(wStart, wEnd)
    }

    case "last_week":
    case "lastWeek": {
      const thisWStart = new Date(todayStart)
      const day = thisWStart.getDay()
      const diff = weekStartsOn === 1 ? (day === 0 ? -6 : 1 - day) : -day
      thisWStart.setDate(thisWStart.getDate() + diff)
      const lastWStart = new Date(thisWStart)
      lastWStart.setDate(lastWStart.getDate() - 7)
      return toRange(lastWStart, thisWStart)
    }

    case "this_month":
    case "month": {
      const mStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      const mEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0)
      return toRange(mStart, mEnd)
    }

    case "last_month":
    case "lastMonth": {
      const thisMStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      const lastMStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0)
      return toRange(lastMStart, thisMStart)
    }

    case "quarter": {
      const qStart = new Date(now)
      qStart.setMonth(qStart.getMonth() - 3)
      return toRange(qStart, now)
    }

    case "this_year":
    case "year": {
      const yStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
      const yEnd = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0)
      return toRange(yStart, yEnd)
    }

    case "last_year":
    case "lastYear": {
      const thisYStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
      const lastYStart = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0)
      return toRange(lastYStart, thisYStart)
    }

    case "all_time":
    case "all":
      return { startDate: null, endDate: null }

    default:
      throw new Error(`Unknown filter: ${filter}`)
  }
}

/**
 * Convert a filter string from UI dropdown to DateFilter type
 * Handles common variations like "Today", "This Week", "this-week", etc.
 */
export function normalizeFilterToDateFilter(filter: string): DateFilter {
  const normalized = filter.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_")

  const validFilters: DateFilter[] = [
    "today",
    "yesterday",
    "this_week",
    "last_week",
    "this_month",
    "last_month",
    "this_year",
    "last_year",
    "all_time",
  ]

  if (validFilters.includes(normalized as DateFilter)) {
    return normalized as DateFilter
  }

  // Handle "all" or similar
  if (normalized === "all" || normalized === "all_time") {
    return "all_time"
  }

  return "all_time" // Default fallback
}
