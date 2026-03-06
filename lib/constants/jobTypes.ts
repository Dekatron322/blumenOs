export const JOB_TYPE_LABELS = {
  1: "Customer Import",
  2: "Meter Reading Import",
  3: "Feeder Energy Cap Import",
  4: "Payment Import",
  5: "Customer Info Update",
  6: "Customer Feeder Update",
  7: "Customer Tariff Change",
  8: "Customer Status Change",
  9: "Customer Stored Average Update",
  10: "Customer SR/DT Update",
  11: "Customer Setup Import",
  12: "Meter Upload Import",
  13: "Distribution Substation Import",
  14: "Sales Rep Mapping Import",
  15: "Meter Reading Account Import",
  16: "Meter Reading Stored Average Import",
  17: "Bill Generate Missing",
  18: "Bill Generate Past",
  19: "Bill Adjustment",
  20: "Bill Finalize",
  21: "Bill Crucial Ops",
  22: "Bills Energy Override Import",
  23: "Existing Customer Import",
  24: "Postpaid Estimated Consumption Import",
  25: "Bill Print",
  26: "Clear Tamper",
  27: "Test Token",
  28: "Meter Status Change",
  29: "Meter Reassignment",
  30: "Bill Recompute",
  31: "Bill Manual Energy",
  32: "Meter Change-Out",
  33: "Customer Tariff Override",
  34: "Distribution Substation Feeder Realignment",
  35: "Feeder Band Change",
  36: "Bill Debt Recovery No Energy",
  37: "Meter Multiplier Import",
  38: "Vending Payment Migration Import",
  39: "Schedule Customer Tracking Import",
} as const

export type JobType = keyof typeof JOB_TYPE_LABELS
export type JobTypeLabel = (typeof JOB_TYPE_LABELS)[JobType]

const JOB_TYPE_VALUES = Object.entries(JOB_TYPE_LABELS).reduce(
  (acc, [value, label]) => {
    acc[label as JobTypeLabel] = Number(value) as JobType
    return acc
  },
  {} as Record<JobTypeLabel, JobType>
)

export const getJobTypeLabel = (jobType: number) => {
  const label = JOB_TYPE_LABELS[jobType as JobType]
  return label ?? `Type ${jobType}`
}

export const getJobTypeValue = (label: JobTypeLabel): JobType => JOB_TYPE_VALUES[label]
