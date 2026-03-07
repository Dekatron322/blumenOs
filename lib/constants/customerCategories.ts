export const CUSTOMER_CATEGORIES = {
  RESIDENTIAL: 1,
  COMMERCIAL: 2,
  INDUSTRIAL: 3,
} as const

export const CUSTOMER_CATEGORY_LABELS = {
  [CUSTOMER_CATEGORIES.RESIDENTIAL]: "Residential",
  [CUSTOMER_CATEGORIES.COMMERCIAL]: "Commercial",
  [CUSTOMER_CATEGORIES.INDUSTRIAL]: "Industrial",
} as const

export const CUSTOMER_CATEGORY_COLORS = {
  [CUSTOMER_CATEGORIES.RESIDENTIAL]: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  [CUSTOMER_CATEGORIES.COMMERCIAL]: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  [CUSTOMER_CATEGORIES.INDUSTRIAL]: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
} as const

export type CustomerCategory = (typeof CUSTOMER_CATEGORIES)[keyof typeof CUSTOMER_CATEGORIES]
export type CustomerCategoryLabel = (typeof CUSTOMER_CATEGORY_LABELS)[CustomerCategory]

export const getCustomerCategoryLabel = (category: number): string => {
  return CUSTOMER_CATEGORY_LABELS[category as CustomerCategory] || `Category ${category}`
}

export const getCustomerCategoryColors = (category: number) => {
  return (
    CUSTOMER_CATEGORY_COLORS[category as CustomerCategory] || CUSTOMER_CATEGORY_COLORS[CUSTOMER_CATEGORIES.RESIDENTIAL]
  )
}

export const getCustomerCategoryOptions = () => [
  { value: "", label: "All Categories" },
  { value: CUSTOMER_CATEGORIES.RESIDENTIAL, label: CUSTOMER_CATEGORY_LABELS[CUSTOMER_CATEGORIES.RESIDENTIAL] },
  { value: CUSTOMER_CATEGORIES.COMMERCIAL, label: CUSTOMER_CATEGORY_LABELS[CUSTOMER_CATEGORIES.COMMERCIAL] },
  { value: CUSTOMER_CATEGORIES.INDUSTRIAL, label: CUSTOMER_CATEGORY_LABELS[CUSTOMER_CATEGORIES.INDUSTRIAL] },
]
