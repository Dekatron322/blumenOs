import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./authSlice"
import employeeReducer from "./employeeSlice"
import roleReducer from "./roleSlice"
import areaOfficeReducer from "./areaOfficeSlice"
import departmentReducer from "./departmentSlice"
import { adminApi } from "./adminSlice"
import injectionSubstationReducer from "./injectionSubstationSlice"
import feedersReducer from "./feedersSlice"
import distributionSubstationsReducer from "./distributionSubstationsSlice"
import polesReducer from "./polesSlice"
import serviceStationReducer from "./serviceStationsSlice"
import analyticsReducer from "./analyticsSlice"
import customerReducer from "./customerSlice"
import postpaidBillingReducer from "./postpaidSlice"
import meterReadingReducer from "./meterReadingSlice"
import feederEnergyCapReducer from "./feederEnergyCapSlice"
import paymentReducer from "./paymentSlice"
import vendorReducer from "./vendorSlice"
import agentReducer from "./agentSlice"
import paymentTypeReducer from "./paymentTypeSlice"
import paymentDunningReducer from "./paymentDunningSlice"
import outageReducer from "./outageSlice"
import maintenanceReducer from "./maintenanceSlice"
import createCustomerReducer from "./createCustomerSlice"
import customerCategoriesReducer from "./customersCategoriesSlice"
import countriesReducer from "./countriesSlice"
import companyReducer from "./companySlice"
import backgroundJobsReducer from "./backgroundJobsSlice"
import statusMapReducer from "./statusMapSlice"
import billingDisputeReducer from "./billingDisputeSlice"
import reportingReducer from "./reportingSlice"
import revenueAnalyticsReducer from "./revenueAnalyticsSlice"
import consumptionAnalyticsReducer from "./consumptionAnalyticsSlice"
import billingPeriodsReducer from "./billingPeriodsSlice"
import performanceAnalyticsReducer from "./performanceAnalyticsSlice"
import cashRemittanceReducer from "./cashRemittanceSlice"
import metersReducer from "./metersSlice"
import meterBrandsReducer from "./meterBrandsSlice"
import meterCategoryReducer from "./meterCategorySlice"
import tariffGroupReducer from "./tariffGroupSlice"
import debtManagementReducer from "./debtManagementSlice"
import customerAuthReducer from "./customerAuthSlice"
import customersDashboardReducer from "./customersDashboardSlice"
import auditLogReducer from "./auditLogSlice"
import refundReducer from "./refundSlice"
import fileManagementReducer from "./fileManagementSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeeReducer,
    roles: roleReducer,
    areaOffices: areaOfficeReducer,
    departments: departmentReducer,
    injectionSubstations: injectionSubstationReducer,
    feeders: feedersReducer,
    distributionSubstations: distributionSubstationsReducer,
    poles: polesReducer,
    serviceStations: serviceStationReducer,
    analytics: analyticsReducer,
    customers: customerReducer,
    postpaidBilling: postpaidBillingReducer,
    meterReadings: meterReadingReducer,
    feederEnergyCaps: feederEnergyCapReducer,
    payments: paymentReducer,
    vendors: vendorReducer,
    agents: agentReducer,
    paymentTypes: paymentTypeReducer,
    paymentDunnings: paymentDunningReducer,
    outages: outageReducer,
    maintenances: maintenanceReducer,
    createCustomer: createCustomerReducer,
    customerCategories: customerCategoriesReducer,
    countries: countriesReducer,
    companies: companyReducer,
    backgroundJobs: backgroundJobsReducer,
    statusMap: statusMapReducer,
    billingDispute: billingDisputeReducer,
    reporting: reportingReducer,
    revenueAnalytics: revenueAnalyticsReducer,
    consumptionAnalytics: consumptionAnalyticsReducer,
    performanceAnalytics: performanceAnalyticsReducer,
    billingPeriods: billingPeriodsReducer,
    cashRemittance: cashRemittanceReducer,
    meters: metersReducer,
    meterBrands: meterBrandsReducer,
    meterCategories: meterCategoryReducer,
    tariffGroups: tariffGroupReducer,
    debtManagement: debtManagementReducer,
    customerAuth: customerAuthReducer,
    customersDashboard: customersDashboardReducer,
    auditLogs: auditLogReducer,
    refunds: refundReducer,
    fileManagement: fileManagementReducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(adminApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
