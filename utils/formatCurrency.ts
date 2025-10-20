export const formatCurrency = (value: number | string, currency: string = ""): string => {
  // Convert string input to number if needed
  const numericValue = typeof value === "string" ? parseFloat(value) : value

  // Handle NaN cases
  if (isNaN(numericValue)) {
    return `${currency} 0.00`
  }

  // Format the number with commas and 2 decimal places
  const formattedValue = numericValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return `${currency} ${formattedValue}`
}
