export enum BillingAdjustmentStatus {
  None = 0,
  Pending = 1,
  Completed = 2,
}

export const getBillingAdjustmentStatusText = (status: BillingAdjustmentStatus): string => {
  switch (status) {
    case BillingAdjustmentStatus.None:
      return "None"
    case BillingAdjustmentStatus.Pending:
      return "Pending"
    case BillingAdjustmentStatus.Completed:
      return "Completed"
    default:
      return "Unknown"
  }
}
