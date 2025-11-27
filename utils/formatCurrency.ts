export const formatCurrency = (value: number | string, currency: string = ""): string => {
  // Normalize null/undefined and non-numeric inputs to 0
  const rawValue = value == null ? 0 : value

  // Convert string input to number if needed
  const numericValue = typeof rawValue === "string" ? parseFloat(rawValue) : rawValue

  // Handle NaN and non-number cases
  if (typeof numericValue !== "number" || isNaN(numericValue)) {
    return `${currency} 0.00`
  }

  // Format the number with commas and 2 decimal places
  const formattedValue = numericValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return `${currency} ${formattedValue}`
}
