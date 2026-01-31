export enum VendorEnumerationStatus {
  Captured = 1,
  Processed = 2,
  Failed = 3,
}

export const getVendorEnumerationStatusText = (status: VendorEnumerationStatus): string => {
  switch (status) {
    case VendorEnumerationStatus.Captured:
      return "Captured"
    case VendorEnumerationStatus.Processed:
      return "Processed"
    case VendorEnumerationStatus.Failed:
      return "Failed"
    default:
      return "Unknown"
  }
}
