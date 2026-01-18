export const formatNumberWithCommas = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export const formatCurrencyWithAbbreviation = (
  amount: number | string,
  currencySymbol: string
): { formatted: string; full: string } => {
  // Convert to number if it's a string
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount

  // Handle invalid numbers
  if (isNaN(numAmount) || numAmount === null || numAmount === undefined) {
    return {
      formatted: `${currencySymbol}0`,
      full: `${currencySymbol}0`,
    }
  }

  // Use Naira symbol if NGN is provided
  const symbol = currencySymbol === "NGN" ? "₦" : currencySymbol

  if (numAmount >= 1000000000) {
    // Billion format
    const billions = numAmount / 1000000000
    return {
      formatted: `${symbol}${billions.toFixed(1)}B`,
      full: `${symbol}${numAmount.toLocaleString()}`,
    }
  } else if (numAmount >= 1000000) {
    // Million format
    const millions = numAmount / 1000000
    return {
      formatted: `${symbol}${millions.toFixed(1)}M`,
      full: `${symbol}${numAmount.toLocaleString()}`,
    }
  } else {
    // Thousand and below - show full number
    return {
      formatted: `${symbol}${numAmount.toLocaleString()}`,
      full: `${symbol}${numAmount.toLocaleString()}`,
    }
  }
}
