"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  Search,
  ChevronDown,
  ChevronRight,
  Users,
  Settings,
  FileText,
  BarChart3,
  CreditCard,
  Zap,
  Briefcase,
  UserCog,
  Shield,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  Menu,
  BookOpen,
  Code,
  Layers,
  Smartphone,
} from "lucide-react"

interface ModuleSection {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  submodules: {
    name: string
    path: string
    description: string
    permissions: string[]
    workflow: string
  }[]
}

const platformModules: ModuleSection[] = [
  {
    id: "auth",
    title: "Authentication & Access Control",
    icon: <Shield className="h-6 w-6" />,
    description: "Comprehensive authentication system with dual login mechanisms for staff/agents and customers.",
    submodules: [
      {
        name: "Staff/Agent Login",
        path: "/",
        description:
          "JWT-based authentication system for employees, agents, and administrators. Supports role-based access control with granular privileges.",
        permissions: ["All authenticated users"],
        workflow:
          "User enters email/password → JWT tokens issued → Session persisted in localStorage → Automatic token refresh on expiry",
      },
      {
        name: "Customer Portal Login",
        path: "/customer-portal",
        description:
          "OTP-based authentication for customers using account number and registered phone number with fingerprint tracking for security.",
        permissions: ["Registered customers only"],
        workflow:
          "Customer enters account number + phone → OTP sent via SMS → OTP verification → JWT tokens issued → Access to customer dashboard",
      },
      {
        name: "Password Management",
        path: "/auth/change-password",
        description: "Password change enforcement for new users and password reset functionality for existing users.",
        permissions: ["Authenticated users with password_change privilege"],
        workflow: "Current password verification → New password validation → Password update → Session refresh",
      },
      {
        name: "Session Management",
        path: "#",
        description:
          "Automatic session handling with token refresh, idle timeout detection, and secure logout functionality.",
        permissions: ["All authenticated users"],
        workflow:
          "Token monitoring → Automatic refresh before expiry → Idle timeout after 30min → Secure logout with state cleanup",
      },
    ],
  },
  {
    id: "roles",
    title: "Role & Permission Management",
    icon: <UserCog className="h-6 w-6" />,
    description:
      "Comprehensive RBAC (Role-Based Access Control) system for managing user permissions across the platform.",
    submodules: [
      {
        name: "Roles Overview",
        path: "/roles",
        description:
          "Centralized view of all system roles with filtering, search, and role categorization by department.",
        permissions: ["roles:read", "system:admin"],
        workflow:
          "Fetch roles from API → Display role cards → Filter by category → Search by name → Navigate to details",
      },
      {
        name: "Create Role",
        path: "/roles/create",
        description: "Wizard for creating new roles with name, slug, category, and initial privilege assignment.",
        permissions: ["roles:create", "system:admin"],
        workflow: "Role details form → Category selection → Initial permissions → Review → Create → Assign to users",
      },
      {
        name: "Role Details",
        path: "/roles/details",
        description:
          "Detailed role view showing assigned users, permissions, and usage statistics with editing capabilities.",
        permissions: ["roles:read", "system:admin"],
        workflow: "Role data fetch → Display assigned users → Show permissions list → Edit role → Update permissions",
      },
      {
        name: "Manage Permissions",
        path: "/roles/manage-permission",
        description:
          "Granular permission management interface for assigning specific actions to roles across different modules.",
        permissions: ["roles:update", "system:admin"],
        workflow:
          "Select role → View available privileges → Toggle permissions by category → Bulk actions → Save changes",
      },
    ],
  },
  {
    id: "employees",
    title: "Employee Management",
    icon: <Briefcase className="h-6 w-6" />,
    description:
      "Complete HR management system for employees including onboarding, role assignment, and status tracking.",
    submodules: [
      {
        name: "Employees Overview",
        path: "/employees/overview",
        description:
          "Dashboard displaying employee statistics, recent hires, department distribution, and active/inactive counts.",
        permissions: ["employees:read", "hr:view"],
        workflow:
          "Load employee metrics → Display KPI cards → Show department chart → Recent activity feed → Quick actions",
      },
      {
        name: "View All Employees",
        path: "/employees/view-employees",
        description: "Comprehensive employee directory with advanced filtering, search, and bulk action capabilities.",
        permissions: ["employees:read", "hr:view"],
        workflow:
          "Employee grid/table view → Search by name/email → Filter by department/status → Sort columns → Export data → Edit employee",
      },
      {
        name: "Add New Employee",
        path: "/employees/add-employees",
        description:
          "Employee onboarding wizard capturing personal details, employment information, role assignment, and department allocation.",
        permissions: ["employees:create", "hr:manage"],
        workflow:
          "Personal details form → Employment info → Role selection → Department assignment → Supervisor allocation → Review → Submit → Email notification",
      },
      {
        name: "Employee Profile",
        path: "/employees/[id]",
        description:
          "Detailed employee profile showing personal info, employment history, roles, permissions, and activity logs.",
        permissions: ["employees:read", "hr:view"],
        workflow:
          "Fetch employee data → Display profile tabs → Show employment timeline → Role history → Edit mode → Save changes",
      },
    ],
  },
  {
    id: "agent-management",
    title: "Agent Management",
    icon: <UserCog className="h-6 w-6" />,
    description:
      "Field agent and collection officer management with cash handling, clearance workflows, and performance tracking.",
    submodules: [
      {
        name: "Agent Overview",
        path: "/agent-management/overview",
        description:
          "Agent performance dashboard showing collection statistics, cash clearance status, and agent activity metrics.",
        permissions: ["agents:read", "collections:view"],
        workflow:
          "Load agent summary → Display KPI cards → Collection metrics → Cash clearance status → Performance charts → Recent transactions",
      },
      {
        name: "All Agents",
        path: "/agent-management/all-agents",
        description:
          "Complete agent registry with filtering by type (cashier, collector, supervisor), status, and area office.",
        permissions: ["agents:read", "collections:view"],
        workflow:
          "Agent list fetch → Grid/table view → Type filter → Status filter → Area office filter → Search → Actions menu",
      },
      {
        name: "Add New Agent",
        path: "/agent-management/add-new-agent",
        description:
          "Agent onboarding with agent type selection, cash collection limits, area office assignment, and supervisor allocation.",
        permissions: ["agents:create", "collections:manage"],
        workflow:
          "Personal details → Agent type selection → Cash limit config → Area office → Supervisor assignment → Role setup → Training schedule → Activate",
      },
      {
        name: "Clear Cash",
        path: "/agent-management/clear-cash",
        description:
          "Cash clearance interface for agents to submit collected cash for verification and bank remittance.",
        permissions: ["agents:clear", "collections:process"],
        workflow:
          "Select agent → Enter cash amount → Attach receipts → Submit for clearance → Verification → Approval → Bank remittance → Confirmation",
      },
    ],
  },
  {
    id: "customers",
    title: "Customer Management",
    icon: <Users className="h-6 w-6" />,
    description: "Comprehensive customer lifecycle management from onboarding through service delivery and billing.",
    submodules: [
      {
        name: "Customer Overview",
        path: "/customers/overview",
        description:
          "Customer dashboard showing total customers, new registrations, active/inactive counts, and geographic distribution.",
        permissions: ["customers:read", "crm:view"],
        workflow:
          "Load customer metrics → Display KPI cards → Category breakdown → Geographic chart → Recent registrations → Quick actions",
      },
      {
        name: "View All Customers",
        path: "/customers/view-customers",
        description: "Complete customer directory with advanced filtering, status tracking, and service information.",
        permissions: ["customers:read", "crm:view"],
        workflow:
          "Customer grid view → Search by name/account → Filter by status/type → Sort columns → Bulk actions → Export → View details",
      },
      {
        name: "Add New Customer",
        path: "/customers/add-customers",
        description:
          "Customer onboarding wizard capturing personal details, service address, tariff selection, and meter assignment.",
        permissions: ["customers:create", "crm:manage"],
        workflow:
          "Personal details → Contact info → Address → GPS coordinates → Tariff selection → Meter assignment → Sales rep allocation → Submit",
      },
      {
        name: "Bulk Upload",
        path: "/customers/bulk-upload",
        description:
          "Mass customer registration via CSV/Excel upload with data validation, error reporting, and progress tracking.",
        permissions: ["customers:create", "crm:manage"],
        workflow:
          "Download template → Fill data → Upload file → Validate format → Data validation → Preview results → Process upload → Report errors",
      },
    ],
  },
  {
    id: "metering",
    title: "Metering System",
    icon: <Zap className="h-6 w-6" />,
    description:
      "Complete meter lifecycle management from installation through reading, replacement, and decommissioning.",
    submodules: [
      {
        name: "Metering Overview",
        path: "/metering/overview",
        description:
          "Meter dashboard showing total meters, installation stats, reading completion rates, and health metrics.",
        permissions: ["meters:read", "metering:view"],
        workflow:
          "Load meter metrics → KPI cards → Installation trends → Reading status → Health indicators → Exception alerts → Quick actions",
      },
      {
        name: "All Meters",
        path: "/metering/all-meters",
        description:
          "Comprehensive meter inventory with filtering by status, type, customer, and location with bulk operations.",
        permissions: ["meters:read", "metering:view"],
        workflow:
          "Meter list fetch → Grid/table view → Status filter → Type filter → Customer search → Bulk actions → Export → Details view",
      },
      {
        name: "Install New Meter",
        path: "/metering/install-new-meter",
        description:
          "Meter installation workflow with meter selection, customer assignment, tariff configuration, and initial reading.",
        permissions: ["meters:create", "metering:manage"],
        workflow:
          "Select meter → Customer assignment → Tariff config → GPS location → Installation date → Initial reading → Commission → Activate",
      },
      {
        name: "Meter Capture",
        path: "/metering/meter-capture",
        description:
          "Mobile-optimized meter reading interface for field agents with photo capture and GPS verification.",
        permissions: ["meters:read", "field_ops:execute"],
        workflow:
          "Reading assignment → Navigate to meter → Photo capture → Meter reading entry → GPS verification → Submit → Validation → Approval",
      },
    ],
  },
  {
    id: "billing",
    title: "Billing System",
    icon: <FileText className="h-6 w-6" />,
    description: "Complete billing lifecycle from generation through distribution, payment, and reconciliation.",
    submodules: [
      {
        name: "Billing Overview",
        path: "/billing/overview",
        description:
          "Revenue dashboard showing billing statistics, collection rates, outstanding balances, and revenue trends.",
        permissions: ["bills:read", "billing:view"],
        workflow:
          "Load billing metrics → Revenue KPIs → Collection rates → Outstanding analysis → Billing trends → Collection forecast → Quick actions",
      },
      {
        name: "Bills",
        path: "/billing/bills",
        description: "Bill management interface with generation, viewing, adjustments, and distribution tracking.",
        permissions: ["bills:read", "billing:view"],
        workflow:
          "Bill list fetch → Month filter → Status filter → Customer search → View details → Download PDF → Email bill → Print receipt",
      },
      {
        name: "Generate Bills",
        path: "/billing/generate",
        description:
          "Automated bill generation with consumption calculation, tariff application, discounts, and prorating.",
        permissions: ["bills:create", "billing:manage"],
        workflow:
          "Select billing period → Consumption fetch → Tariff calculation → Discounts apply → Preview bills → Generate → Distribute → Notify customers",
      },
      {
        name: "Bill Adjustments",
        path: "/billing/adjustments",
        description: "Bill correction interface for handling disputes, errors, refunds, and credit applications.",
        permissions: ["bills:update", "billing:manage"],
        workflow:
          "Select bill → Review details → Adjustment type → Calculate new amount → Reason entry → Approval workflow → Apply adjustment → Update balance",
      },
    ],
  },
  {
    id: "payment",
    title: "Payment System",
    icon: <CreditCard className="h-6 w-6" />,
    description:
      "Multi-channel payment processing with agent collections, online payments, reconciliation, and dispute handling.",
    submodules: [
      {
        name: "Payment Overview",
        path: "/payment/overview",
        description:
          "Payment dashboard showing transaction volumes, payment methods breakdown, reconciliation status, and pending items.",
        permissions: ["payments:read", "payments:view"],
        workflow:
          "Load payment metrics → Transaction volume → Method breakdown → Reconciliation status → Pending items → Exception alerts → Quick actions",
      },
      {
        name: "All Payments",
        path: "/payment/all-payment",
        description: "Complete payment transaction log with filtering by date, method, status, customer, and agent.",
        permissions: ["payments:read", "payments:view"],
        workflow:
          "Payment list fetch → Date filter → Method filter → Status filter → Customer search → View receipt → Export data → Reconcile",
      },
      {
        name: "Record Payment",
        path: "/payment/record-payment",
        description:
          "Manual payment entry interface for cash, check, and bank transfer payments with receipt generation.",
        permissions: ["payments:create", "payments:process"],
        workflow:
          "Select customer → Payment method → Amount entry → Reference number → Date selection → Receipt generation → Print/email → Post to account",
      },
      {
        name: "Cash Management",
        path: "/payment/cash-management",
        description:
          "Cash handling oversight with agent collections, clearance tracking, and bank deposit reconciliation.",
        permissions: ["payments:read", "cash:view"],
        workflow:
          "Cash dashboard → Agent collections → Clearance queue → Bank deposits → Reconciliation → Exception handling → Reports",
      },
    ],
  },
  {
    id: "sales-rep",
    title: "Sales Representative",
    icon: <UserCog className="h-6 w-6" />,
    description:
      "Complete sales ecosystem including sales representatives, cashiers, and clearing cashiers with role-based workflows and interdepartmental collaboration.",
    submodules: [
      {
        name: "Sales Representatives",
        path: "/sales-rep/representatives",
        description: "Field sales team responsible for customer acquisition, lead generation, and service connections.",
        permissions: ["sales:read", "sales:create", "customers:create", "leads:read", "leads:update"],
        workflow:
          "Lead identification → Site assessment → Quote preparation → Customer negotiation → Contract signing → Service application → Handover to operations",
      },
      {
        name: "Sales Cashiers",
        path: "/sales-rep/cashiers",
        description:
          "Front-office payment processing staff who handle customer payments for new connections, service fees, and deposits.",
        permissions: ["payments:create", "payments:read", "cash:handle", "receipts:generate"],
        workflow:
          "Customer payment → Payment method selection → Amount verification → Transaction processing → Receipt generation → Cash recording → Daily reconciliation",
      },
      {
        name: "Clearing Cashiers",
        path: "/sales-rep/clearing-cashiers",
        description:
          "Back-office finance staff responsible for daily cash reconciliation, bank deposits, and financial clearing.",
        permissions: ["cash:clear", "reconciliation:process", "bank:deposit", "audit:review"],
        workflow:
          "Daily cash collection → Transaction verification → Reconciliation process → Difference investigation → Bank deposit preparation → Clearance approval → Financial reporting",
      },
      {
        name: "Sales Dashboard",
        path: "/sales-rep/dashboard",
        description:
          "Comprehensive sales performance dashboard showing metrics for all sales roles: representatives, cashiers, clearing efficiency.",
        permissions: ["sales:read", "reports:view", "analytics:read"],
        workflow:
          "Load sales data → Display role-specific KPIs → Performance comparisons → Trend analysis → Commission tracking → Department efficiency metrics",
      },
    ],
  },
  {
    id: "vendor-management",
    title: "Vendor Management",
    icon: <Briefcase className="h-6 w-6" />,
    description: "Third-party vendor onboarding, commission management, wallet operations, and performance monitoring.",
    submodules: [
      {
        name: "Vendor Overview",
        path: "/vendor-management/overview",
        description:
          "Vendor dashboard showing total vendors, active/suspended counts, geographic distribution, and performance metrics.",
        permissions: ["vendors:read", "vendor-management:view"],
        workflow:
          "Load vendor analytics → Display KPI cards → State distribution → Performance metrics → Quick actions → Add new vendor",
      },
      {
        name: "Add New Vendor",
        path: "/vendor-management/add-new-vendor",
        description:
          "Vendor onboarding wizard with business details, commission setup, wallet creation, and API key generation.",
        permissions: ["vendors:create", "vendor-management:manage"],
        workflow:
          "Business details → Contact information → Service capabilities → Commission rates → Wallet setup → API key generation → Documentation upload → Activate",
      },
      {
        name: "Vendor Wallet Top-up",
        path: "/vendor-management/vendors-topup-history",
        description: "Wallet management interface for vendor fund transfers, top-up history, and balance monitoring.",
        permissions: ["vendors:update", "vendor-management:manage", "wallet:topup"],
        workflow:
          "Select vendor → Enter top-up amount → Specify reason → Process payment → Update wallet balance → Generate receipt → Notify vendor",
      },
      {
        name: "Commission Management",
        path: "#",
        description:
          "Configure and manage vendor commission structures for urban and rural service areas with tiered rates.",
        permissions: ["vendors:update", "vendor-management:manage", "commissions:configure"],
        workflow:
          "Select vendor → View current commissions → Update urban/rural rates → Set effective date → Apply changes → Update agreements",
      },
    ],
  },
  {
    id: "assets",
    title: "Asset Management",
    icon: <MapPin className="h-6 w-6" />,
    description:
      "Comprehensive electrical infrastructure management including area offices, substations, feeders, poles, and distribution networks.",
    submodules: [
      {
        name: "Assets Overview",
        path: "/assets-management/overview",
        description:
          "Asset dashboard showing infrastructure inventory, geographic distribution, maintenance status, and operational metrics.",
        permissions: ["assets:read", "asset-management:view"],
        workflow:
          "Load asset analytics → Display KPI cards → Geographic distribution → Maintenance alerts → Quick actions → Navigate to asset types",
      },
      {
        name: "Distribution Stations",
        path: "/assets-management/distribution-stations",
        description:
          "Distribution station management with capacity tracking, load monitoring, and maintenance scheduling.",
        permissions: ["assets:read", "stations:view", "asset-management:view"],
        workflow:
          "Station list fetch → Capacity monitoring → Load analysis → Maintenance schedule → Performance metrics → Add/Edit stations",
      },
      {
        name: "Feeders",
        path: "/assets-management/feeders",
        description: "Electrical feeder network management with route mapping, load distribution, and outage tracking.",
        permissions: ["assets:read", "feeders:view", "asset-management:view"],
        workflow:
          "Feeder list fetch → Route mapping → Load distribution → Connected customers → Outage history → Maintenance schedule → Add/Edit feeders",
      },
      {
        name: "Bulk Upload",
        path: "/assets-management/bulk-upload",
        description:
          "Mass asset registration and updates via CSV/Excel with GPS coordinates and technical specifications.",
        permissions: ["assets:create", "asset-management:manage"],
        workflow:
          "Select asset type → Download template → Fill data with GPS → Upload file → Validation → Preview results → Process upload → Error report",
      },
    ],
  },
  {
    id: "debt",
    title: "Debt Management",
    icon: <CreditCard className="h-6 w-6" />,
    description:
      "Comprehensive debt recovery system including aging analysis, recovery campaigns, and payment plan management.",
    submodules: [
      {
        name: "Debt Overview",
        path: "/dm/overview",
        description:
          "Debt dashboard showing total receivables, aging buckets, recovery rates, and collection performance metrics.",
        permissions: ["debts:read", "debt-management:view"],
        workflow:
          "Load debt analytics → Display KPI cards → Aging analysis → Recovery metrics → Campaign performance → Quick actions",
      },
      {
        name: "All Debts",
        path: "/dm/all-debts",
        description: "Complete debt registry with filtering by customer, amount, age, status, and assigned collector.",
        permissions: ["debts:read", "debt-management:view"],
        workflow:
          "Debt list fetch → Customer filter → Amount range → Aging bucket → Status filter → Collector assignment → Actions menu",
      },
      {
        name: "Recovery Campaigns",
        path: "/dm/ade",
        description: "Automated Debt Entry (ADE) campaign management with rule configuration and execution tracking.",
        permissions: ["debts:manage", "campaigns:configure", "debt-management:manage"],
        workflow:
          "Campaign setup → Rule configuration → Customer segmentation → Communication templates → Launch campaign → Monitor progress → Adjust rules",
      },
      {
        name: "Promotions",
        path: "/dm/promo",
        description:
          "Debt forgiveness and discount promotion management with eligibility rules and approval workflows.",
        permissions: ["debts:manage", "promotions:configure", "debt-management:manage"],
        workflow:
          "Promotion setup → Eligibility rules → Discount tiers → Approval workflow → Customer notification → Redemption tracking → Impact analysis",
      },
    ],
  },
  {
    id: "tokens",
    title: "Prepaid Token Management",
    icon: <Zap className="h-6 w-6" />,
    description:
      "Prepaid electricity token vending system for meter recharge, token verification, and tamper recovery.",
    submodules: [
      {
        name: "Token Overview",
        path: "/tokens/overview",
        description: "Token dashboard showing vend statistics, revenue, failed transactions, and meter status.",
        permissions: ["tokens:read", "prepaid:view"],
        workflow:
          "Load token analytics → Display KPI cards → Vend statistics → Revenue metrics → Failed transaction alerts → Quick actions",
      },
      {
        name: "Vend Token",
        path: "/tokens/vend",
        description: "Token purchase interface for meter recharge with amount selection and instant token generation.",
        permissions: ["tokens:create", "prepaid:process"],
        workflow:
          "Enter meter number → Amount selection → Payment processing → Token generation → SMS delivery → Receipt printing → Update balance",
      },
      {
        name: "Clear Tamper",
        path: "/tokens/clear-tamper",
        description: "Tamper recovery interface to clear meter lockout states and restore service access.",
        permissions: ["tokens:manage", "tamper:clear", "prepaid:admin"],
        workflow:
          "Meter identification → Tamper verification → Clearance code generation → Service restoration → Documentation → Customer notification",
      },
    ],
  },
  {
    id: "outage",
    title: "Outage Management",
    icon: <AlertCircle className="h-6 w-6" />,
    description:
      "Power outage tracking, reporting, and maintenance scheduling with geographic visualization and customer communication.",
    submodules: [
      {
        name: "Outage Overview",
        path: "/outage-management/overview",
        description:
          "Outage dashboard showing active outages, affected customers, restoration progress, and maintenance schedules.",
        permissions: ["outages:read", "operations:view"],
        workflow:
          "Load outage data → Display active outages → Affected customers → Restoration timeline → Maintenance calendar → Quick actions",
      },
      {
        name: "Report Outage",
        path: "/outage-management/report-outage",
        description:
          "Outage reporting interface for field teams to log incidents with location, cause, and affected areas.",
        permissions: ["outages:create", "operations:manage"],
        workflow:
          "Outage detection → Location marking → Cause selection → Affected infrastructure → Customer impact → Status updates → Team dispatch",
      },
      {
        name: "Schedule Maintenance",
        path: "/outage-management/schedule-maintenance",
        description:
          "Maintenance planning interface for scheduling planned outages with customer notification workflows.",
        permissions: ["outages:create", "maintenance:schedule", "operations:manage"],
        workflow:
          "Maintenance request → Impact assessment → Schedule selection → Customer notification → Work order creation → Execution tracking",
      },
    ],
  },
  {
    id: "tickets",
    title: "Tickets & Events",
    icon: <FileText className="h-6 w-6" />,
    description:
      "Customer support ticket management and event tracking with escalation workflows and resolution tracking.",
    submodules: [
      {
        name: "Tickets Dashboard",
        path: "/tickets-and-events",
        description:
          "Ticket management dashboard showing open tickets, resolution times, agent workload, and priority breakdown.",
        permissions: ["tickets:read", "support:view"],
        workflow:
          "Load ticket data → Display metrics → Queue overview → Agent assignments → Priority analysis → SLA tracking → Quick actions",
      },
      {
        name: "Create Ticket",
        path: "/tickets-and-events/add",
        description:
          "Ticket creation interface for customer issues, complaints, and service requests with categorization.",
        permissions: ["tickets:create", "support:manage"],
        workflow:
          "Customer identification → Issue categorization → Priority assignment → Agent routing → Description entry → Attachment upload → Submit",
      },
      {
        name: "Ticket Detail",
        path: "/tickets-and-events/detail/[id]",
        description:
          "Detailed ticket view with conversation history, status updates, attachments, and resolution tracking.",
        permissions: ["tickets:read", "support:view"],
        workflow:
          "Fetch ticket data → Conversation thread → Status history → Attachments → Agent notes → Customer communication → Resolution",
      },
    ],
  },
  {
    id: "compliance",
    title: "Compliance & Audit",
    icon: <Shield className="h-6 w-6" />,
    description:
      "Regulatory compliance tracking, audit trails, and regulatory reporting for industry standards adherence.",
    submodules: [
      {
        name: "Compliance Dashboard",
        path: "/compliance/complaince",
        description:
          "Compliance overview showing audit status, regulatory adherence, risk assessments, and action items.",
        permissions: ["compliance:read", "audit:view"],
        workflow:
          "Load compliance data → Display metrics → Audit status → Risk indicators → Action items → Regulatory deadlines → Quick actions",
      },
      {
        name: "Audit Trail",
        path: "/compliance/complaince",
        description:
          "Complete audit logging of system activities, data changes, and user actions with timestamp and IP tracking.",
        permissions: ["compliance:read", "audit:view", "system:admin"],
        workflow:
          "Audit log query → Date range filter → User actions → Data changes → IP tracking → Export logs → Compliance reporting",
      },
      {
        name: "Regulatory Reports",
        path: "/compliance/complaince",
        description: "Automated regulatory report generation for industry compliance and government submissions.",
        permissions: ["compliance:read", "reports:generate", "audit:view"],
        workflow:
          "Report template selection → Parameter configuration → Data aggregation → Report generation → Review → Submission → Archive",
      },
    ],
  },
  {
    id: "disputes",
    title: "Dispute Management",
    icon: <AlertCircle className="h-6 w-6" />,
    description:
      "Customer dispute resolution system for billing, payment, and service-related complaints with escalation workflows.",
    submodules: [
      {
        name: "Disputes Dashboard",
        path: "/disputes/overview",
        description:
          "Dispute management overview showing open cases, resolution times, escalation status, and outcome metrics.",
        permissions: ["disputes:read", "dispute-management:view"],
        workflow:
          "Load dispute data → Display KPIs → Case queue → Escalation status → Resolution metrics → Category breakdown → Quick actions",
      },
      {
        name: "All Disputes",
        path: "/disputes/all",
        description:
          "Complete dispute registry with filtering by customer, type, status, amount, and assigned resolver.",
        permissions: ["disputes:read", "dispute-management:view"],
        workflow:
          "Dispute list fetch → Type filter → Status filter → Customer search → Amount range → Resolver assignment → Actions menu",
      },
      {
        name: "File Dispute",
        path: "/disputes/file",
        description:
          "Dispute filing interface for customers to submit billing, payment, or service complaints with documentation.",
        permissions: ["disputes:create", "dispute-management:manage"],
        workflow:
          "Customer identification → Dispute type → Description → Amount in question → Evidence upload → Category assignment → Submit case",
      },
      {
        name: "Resolve Dispute",
        path: "/disputes/resolve",
        description:
          "Dispute resolution interface for investigation, customer communication, and outcome determination.",
        permissions: ["disputes:resolve", "dispute-management:manage"],
        workflow:
          "Case review → Investigation → Customer communication → Evidence analysis → Resolution options → Decision → Implementation → Close case",
      },
    ],
  },
  {
    id: "virtual-accounts",
    title: "Virtual Accounts",
    icon: <CreditCard className="h-6 w-6" />,
    description:
      "Virtual account management for payment collection, reconciliation, and multi-channel payment processing.",
    submodules: [
      {
        name: "Virtual Accounts Overview",
        path: "/virtual-accounts/overview",
        description:
          "Virtual account dashboard showing account inventory, transaction volumes, balances, and reconciliation status.",
        permissions: ["virtual-accounts:read", "payments:view"],
        workflow:
          "Load account data → Display metrics → Transaction volumes → Balance summary → Reconciliation status → Quick actions",
      },
      {
        name: "Manage Accounts",
        path: "/virtual-accounts/manage",
        description: "Virtual account creation, configuration, and lifecycle management with bank integration.",
        permissions: ["virtual-accounts:manage", "payments:manage"],
        workflow:
          "Account creation → Bank configuration → Customer mapping → Limit settings → Activation → Monitoring → Deactivation",
      },
    ],
  },
  {
    id: "customer-categories",
    title: "Customer Categories",
    icon: <Users className="h-6 w-6" />,
    description: "Customer classification management for tariff grouping, service tiers, and billing categorization.",
    submodules: [
      {
        name: "Categories List",
        path: "/customer-categories",
        description:
          "View and manage customer categories with tariff mappings, service classifications, and customer counts.",
        permissions: ["customer-categories:read", "billing:view"],
        workflow:
          "Category list fetch → Display categories → Tariff mappings → Customer counts → Service classifications → Add/Edit/Delete",
      },
      {
        name: "Add Category",
        path: "/customer-categories/add",
        description: "Create new customer categories with tariff rates, service levels, and classification rules.",
        permissions: ["customer-categories:create", "billing:manage"],
        workflow:
          "Category details → Tariff configuration → Service levels → Classification rules → Customer assignment rules → Save → Apply",
      },
      {
        name: "Edit Category",
        path: "/customer-categories/edit",
        description: "Modify existing customer category details, tariffs, and service classifications.",
        permissions: ["customer-categories:update", "billing:manage"],
        workflow:
          "Select category → Edit details → Update tariffs → Modify rules → Customer impact review → Save changes → Notify affected",
      },
      {
        name: "Category Detail",
        path: "/customer-categories/[id]",
        description: "Detailed category view with associated customers, billing history, and tariff details.",
        permissions: ["customer-categories:read", "billing:view"],
        workflow: "Fetch category data → Customer list → Billing history → Tariff details → Usage patterns → Edit mode",
      },
    ],
  },
  {
    id: "payment-types",
    title: "Payment Types",
    icon: <CreditCard className="h-6 w-6" />,
    description: "Payment method configuration and management for cash, card, transfer, and mobile money channels.",
    submodules: [
      {
        name: "Payment Types List",
        path: "/payment-types",
        description: "View all configured payment methods with status, fees, and processing settings.",
        permissions: ["payment-types:read", "payments:view"],
        workflow:
          "Payment types fetch → Display methods → Status overview → Fee structure → Processing settings → Enable/Disable",
      },
      {
        name: "Create Payment Type",
        path: "/payment-types/create",
        description: "Add new payment methods with configuration for fees, limits, and processing rules.",
        permissions: ["payment-types:create", "payments:manage"],
        workflow:
          "Payment method details → Fee configuration → Limit settings → Processing rules → Integration setup → Testing → Activate",
      },
      {
        name: "Edit Payment Type",
        path: "/payment-types/edit",
        description: "Modify existing payment method configurations, fees, and processing parameters.",
        permissions: ["payment-types:update", "payments:manage"],
        workflow:
          "Select payment type → Edit configuration → Update fees → Modify limits → Change rules → Save → Test → Deploy",
      },
    ],
  },
  {
    id: "field-enumeration",
    title: "Field Enumeration",
    icon: <MapPin className="h-6 w-6" />,
    description:
      "Field data collection for customer verification, meter readings, asset inspection, and geographic mapping.",
    submodules: [
      {
        name: "Enumeration Dashboard",
        path: "/field-enumeration",
        description: "Field operations dashboard showing enumeration tasks, agent assignments, and completion status.",
        permissions: ["field-ops:view", "enumeration:read"],
        workflow:
          "Load enumeration data → Task assignments → Progress tracking → GPS verification → Photo uploads → Completion status",
      },
      {
        name: "Customer Verification",
        path: "/field-enumeration",
        description: "Field verification of customer details, meter installations, and service addresses.",
        permissions: ["field-ops:execute", "customers:update"],
        workflow:
          "Assignment list → Navigate to location → Customer verification → Meter inspection → GPS capture → Photo documentation → Submit",
      },
      {
        name: "Meter Reading Capture",
        path: "/field-enumeration",
        description: "Mobile meter reading with photo capture, GPS verification, and consumption validation.",
        permissions: ["field-ops:execute", "meters:read"],
        workflow:
          "Reading assignment → Navigate to meter → Photo capture → Reading entry → GPS verification → Consumption check → Submit",
      },
    ],
  },
  {
    id: "file-management",
    title: "File Management",
    icon: <FileText className="h-6 w-6" />,
    description: "Document storage, file uploads, and asset management for customer documents and system files.",
    submodules: [
      {
        name: "Files Dashboard",
        path: "/file-management",
        description: "Centralized file management with document storage, version control, and access controls.",
        permissions: ["files:read", "documents:view"],
        workflow:
          "File browser → Folder navigation → Upload files → Version history → Access permissions → Download/Share",
      },
      {
        name: "Document Upload",
        path: "/file-management",
        description: "Secure file upload interface with validation, virus scanning, and metadata tagging.",
        permissions: ["files:create", "documents:upload"],
        workflow:
          "Select files → Validation check → Virus scan → Metadata entry → Categorization → Upload → Verify → Notify",
      },
      {
        name: "Customer Documents",
        path: "/file-management",
        description: "Customer document management with ID verification, contracts, and supporting documentation.",
        permissions: ["files:read", "customers:read"],
        workflow:
          "Customer search → Document list → ID verification → Contract review → Supporting docs → Download → Audit trail",
      },
    ],
  },
  {
    id: "background-jobs",
    title: "Background Jobs",
    icon: <Clock className="h-6 w-6" />,
    description: "System background job monitoring, batch processing, and scheduled task management.",
    submodules: [
      {
        name: "Jobs Dashboard",
        path: "/background-jobs",
        description: "Monitor background job execution, queue status, and processing statistics.",
        permissions: ["jobs:read", "system:admin"],
        workflow:
          "Job queue overview → Running jobs → Failed jobs → Queue statistics → Execution history → Retry failed → Schedule jobs",
      },
      {
        name: "Job Details",
        path: "/background-jobs",
        description: "Detailed job view with execution logs, progress tracking, and error diagnostics.",
        permissions: ["jobs:read", "system:admin"],
        workflow:
          "Select job → Execution details → Progress tracking → Log analysis → Error diagnostics → Retry/Cancel → History",
      },
      {
        name: "Schedule Management",
        path: "/background-jobs",
        description: "Configure scheduled jobs with cron expressions, triggers, and notification settings.",
        permissions: ["jobs:manage", "system:admin"],
        workflow:
          "Job configuration → Schedule setup → Trigger conditions → Notification settings → Enable/Disable → Monitor execution",
      },
    ],
  },
  {
    id: "dashboard",
    title: "Main Dashboard",
    icon: <BarChart3 className="h-6 w-6" />,
    description: "Executive dashboard with real-time KPIs, revenue metrics, and operational overview.",
    submodules: [
      {
        name: "Executive Dashboard",
        path: "/dashboard",
        description: "High-level business metrics including revenue, collections, customer growth, and system health.",
        permissions: ["dashboard:read", "analytics:view"],
        workflow:
          "Load dashboard data → KPI widgets → Revenue charts → Collection metrics → Customer trends → System status → Quick actions",
      },
      {
        name: "Revenue Overview",
        path: "/dashboard",
        description: "Real-time revenue tracking with billing, collections, and outstanding balance metrics.",
        permissions: ["dashboard:read", "revenue:view"],
        workflow:
          "Revenue data fetch → Billing totals → Collection rates → Outstanding balances → Trend analysis → Forecasting → Reports",
      },
      {
        name: "Operational Metrics",
        path: "/dashboard",
        description: "Operational performance indicators for meter readings, outages, and service delivery.",
        permissions: ["dashboard:read", "operations:view"],
        workflow:
          "Operations data → Meter reading stats → Outage metrics → Service delivery → Performance indicators → Alerts → Actions",
      },
    ],
  },
]

export default function DocumentationPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedModules, setExpandedModules] = useState<string[]>([]) // All closed by default
  const [selectedSubmodule, setSelectedSubmodule] = useState<string | null>(null)

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  const filteredModules = platformModules.filter(
    (module) =>
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.submodules.some(
        (sub) =>
          sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* Header with Logo - Matching login page style */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-4">
            <Image src="/kadco.svg" alt="blumenOs Logo" width={150} height={150} />

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#004B23]">blumenOs Platform</h1>
              <p className="mt-1 text-sm text-gray-500">Documentation & Reference Guide</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-[#004B23]/10 px-3 py-1 text-xs font-medium text-[#004B23]">
              v2.0 · Stable
            </span>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search modules, features, permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 shadow-sm transition-all focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
            />
          </div>
        </motion.div>

        {/* Documentation Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Module Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Menu className="h-5 w-5 text-[#004B23]" />
                Platform Modules
                <span className="ml-2 text-sm font-normal text-gray-400">({filteredModules.length})</span>
              </h2>

              <div className="space-y-3">
                {filteredModules.map((module, index) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className="rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
                  >
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-[#004B23]/10 p-2 text-[#004B23]">{module.icon}</div>
                        <span className="font-medium text-gray-900">{module.title}</span>
                      </div>
                      {expandedModules.includes(module.id) ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedModules.includes(module.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-gray-100 px-4 pb-4">
                            {module.submodules.map((sub) => (
                              <button
                                key={sub.path}
                                onClick={() => setSelectedSubmodule(`${module.id}|${sub.name}`)}
                                className={`mt-2 block w-full rounded-md px-3 py-2 text-left text-sm transition-all ${
                                  selectedSubmodule === `${module.id}|${sub.name}`
                                    ? "bg-[#004B23] text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-[#004B23]"
                                }`}
                              >
                                {sub.name}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-2">
            {selectedSubmodule ? (
              <SubmoduleDetails modules={platformModules} selectedId={selectedSubmodule} />
            ) : (
              <OverviewContent modules={platformModules} />
            )}
          </div>
        </div>

        {/* Quick Reference - Brand Colors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 rounded-2xl bg-gradient-to-r from-[#004B23] to-[#006838] p-8 text-white shadow-xl"
        >
          <h2 className="text-2xl font-bold">Quick Reference Guide</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20">
              <Shield className="mb-2 h-8 w-8" />
              <h3 className="font-semibold">Authentication</h3>
              <p className="mt-1 text-sm text-blue-100">
                JWT for staff, OTP for customers. RBAC with granular permissions.
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20">
              <Users className="mb-2 h-8 w-8" />
              <h3 className="font-semibold">User Types</h3>
              <p className="mt-1 text-sm text-blue-100">Employees, Agents, Customers. Self-service portal.</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20">
              <Settings className="mb-2 h-8 w-8" />
              <h3 className="font-semibold">Permissions</h3>
              <p className="mt-1 text-sm text-blue-100">
                Resource:action format (e.g., customers:read). Roles bundle permissions.
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20">
              <Clock className="mb-2 h-8 w-8" />
              <h3 className="font-semibold">Workflows</h3>
              <p className="mt-1 text-sm text-blue-100">Approval workflows & audit logs maintained for compliance.</p>
            </div>
          </div>
        </motion.div>

        {/* System Architecture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-12 rounded-2xl bg-white p-8 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-gray-900">System Architecture</h2>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Code className="h-5 w-5 text-[#004B23]" />
                Frontend Stack
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <strong>Next.js 14</strong> - Server-side rendering & App Router
                </li>
                <li>
                  <strong>TypeScript</strong> - Type-safe development
                </li>
                <li>
                  <strong>Tailwind CSS</strong> - Utility-first styling
                </li>
                <li>
                  <strong>Redux Toolkit</strong> - State management
                </li>
                <li>
                  <strong>Radix UI</strong> - Accessible components
                </li>
                <li>
                  <strong>Framer Motion</strong> - Animations
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Layers className="h-5 w-5 text-[#004B23]" />
                Backend Integration
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <strong>RESTful APIs</strong> - Standardized endpoints
                </li>
                <li>
                  <strong>JWT Authentication</strong> - Secure token-based auth
                </li>
                <li>
                  <strong>Axios</strong> - HTTP client with interceptors
                </li>
                <li>
                  <strong>File Processing</strong> - CSV/Excel bulk operations
                </li>
                <li>
                  <strong>Background Jobs</strong> - Async processing
                </li>
                <li>
                  <strong>Audit Logging</strong> - Complete activity tracking
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Permission Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 rounded-2xl bg-white p-8 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-gray-900">Permission Reference</h2>
          <p className="mt-2 text-gray-600">
            Permissions follow the pattern:{" "}
            <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">resource:action</code>
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4 transition-all hover:border-[#004B23]/30 hover:shadow-md">
              <h3 className="font-semibold text-gray-900">User Management</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>
                  <code>users:read</code> - View user profiles
                </li>
                <li>
                  <code>users:create</code> - Create new users
                </li>
                <li>
                  <code>users:update</code> - Edit user details
                </li>
                <li>
                  <code>users:delete</code> - Deactivate users
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 transition-all hover:border-[#004B23]/30 hover:shadow-md">
              <h3 className="font-semibold text-gray-900">Customer Operations</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>
                  <code>customers:read</code> - View customer data
                </li>
                <li>
                  <code>customers:create</code> - Register customers
                </li>
                <li>
                  <code>customers:update</code> - Modify customer info
                </li>
                <li>
                  <code>customers:approve</code> - Approve changes
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 transition-all hover:border-[#004B23]/30 hover:shadow-md">
              <h3 className="font-semibold text-gray-900">Billing Operations</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>
                  <code>bills:read</code> - View bills
                </li>
                <li>
                  <code>bills:create</code> - Generate bills
                </li>
                <li>
                  <code>bills:update</code> - Adjust bills
                </li>
                <li>
                  <code>bills:approve</code> - Approve adjustments
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 transition-all hover:border-[#004B23]/30 hover:shadow-md">
              <h3 className="font-semibold text-gray-900">Payment Processing</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>
                  <code>payments:read</code> - View transactions
                </li>
                <li>
                  <code>payments:create</code> - Record payments
                </li>
                <li>
                  <code>payments:update</code> - Edit payments
                </li>
                <li>
                  <code>payments:cancel</code> - Reverse payments
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 transition-all hover:border-[#004B23]/30 hover:shadow-md">
              <h3 className="font-semibold text-gray-900">Agent Management</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>
                  <code>agents:read</code> - View agents
                </li>
                <li>
                  <code>agents:create</code> - Add new agents
                </li>
                <li>
                  <code>agents:update</code> - Modify agent details
                </li>
                <li>
                  <code>agents:clear</code> - Process cash clearance
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 transition-all hover:border-[#004B23]/30 hover:shadow-md">
              <h3 className="font-semibold text-gray-900">Vendor Operations</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>
                  <code>vendors:read</code> - View vendor data
                </li>
                <li>
                  <code>vendors:create</code> - Add new vendors
                </li>
                <li>
                  <code>vendors:update</code> - Modify vendor details
                </li>
                <li>
                  <code>wallet:topup</code> - Top-up vendor wallets
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 transition-all hover:border-[#004B23]/30 hover:shadow-md">
              <h3 className="font-semibold text-gray-900">Asset Management</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>
                  <code>assets:read</code> - View assets
                </li>
                <li>
                  <code>assets:create</code> - Add new assets
                </li>
                <li>
                  <code>assets:update</code> - Modify asset details
                </li>
                <li>
                  <code>assets:approve</code> - Approve changes
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 transition-all hover:border-[#004B23]/30 hover:shadow-md">
              <h3 className="font-semibold text-gray-900">Debt Management</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>
                  <code>debts:read</code> - View debt entries
                </li>
                <li>
                  <code>debts:create</code> - Create debt records
                </li>
                <li>
                  <code>debts:manage</code> - Manage debt recovery
                </li>
                <li>
                  <code>campaigns:configure</code> - Configure campaigns
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 transition-all hover:border-[#004B23]/30 hover:shadow-md">
              <h3 className="font-semibold text-gray-900">Prepaid Tokens</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>
                  <code>tokens:read</code> - View token transactions
                </li>
                <li>
                  <code>tokens:create</code> - Generate tokens
                </li>
                <li>
                  <code>prepaid:process</code> - Process token vending
                </li>
                <li>
                  <code>tamper:clear</code> - Clear meter tamper
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Getting Started Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-12 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-amber-100 p-3">
              <BookOpen className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-amber-900">Getting Started with blumenOs</h3>
              <p className="mt-2 text-amber-800">
                New to the platform? Start by exploring the <strong>Authentication & Access Control</strong> module to
                understand how users access the system. Then dive into the modules relevant to your role:
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/50 px-3 py-1 text-sm text-amber-800">
                  📊 Administrators → System Settings & Roles
                </span>
                <span className="rounded-full bg-white/50 px-3 py-1 text-sm text-amber-800">
                  👥 HR → Employee Management
                </span>
                <span className="rounded-full bg-white/50 px-3 py-1 text-sm text-amber-800">
                  💰 Finance → Billing & Payments
                </span>
                <span className="rounded-full bg-white/50 px-3 py-1 text-sm text-amber-800">
                  ⚡ Field Ops → Metering & Outage
                </span>
                <span className="rounded-full bg-white/50 px-3 py-1 text-sm text-amber-800">
                  🤝 Sales → Sales Representative
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          <p>blumenOs Platform Documentation v2.0</p>
          <p className="mt-1">Powered by BlumenTech · Last updated: March 2026</p>
          <p className="mt-2 text-xs text-gray-400">© 2026 blumenOs. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}

// Subcomponent for displaying submodule details
function SubmoduleDetails({ modules, selectedId }: { modules: ModuleSection[]; selectedId: string }) {
  const [moduleId, subName] = selectedId.split("|")
  const module = modules.find((m) => m.id === moduleId)
  const submodule = module?.submodules.find((s) => s.name === subName)

  if (!module || !submodule) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-white shadow-sm"
    >
      <div className="p-6 md:p-8">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <span className="hover:text-[#004B23]">{module.title}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-gray-900">{submodule.name}</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900">{submodule.name}</h2>
        <p className="mt-2 leading-relaxed text-gray-600">{submodule.description}</p>

        {/* Path */}
        <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <span className="text-sm font-medium text-gray-700">Route: </span>
          <code className="rounded bg-white px-2 py-1 font-mono text-sm text-[#004B23]">{submodule.path}</code>
        </div>

        {/* Permissions */}
        <div className="mt-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Shield className="h-5 w-5 text-[#004B23]" />
            Required Permissions
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {submodule.permissions.map((perm, idx) => (
              <span key={idx} className="rounded-full bg-[#004B23]/10 px-3 py-1 font-mono text-sm text-[#004B23]">
                {perm}
              </span>
            ))}
          </div>
        </div>

        {/* Workflow */}
        <div className="mt-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Clock className="h-5 w-5 text-green-600" />
            Workflow Process
          </h3>
          <div className="mt-3 rounded-xl border-l-4 border-green-500 bg-green-50 p-4">
            <p className="leading-relaxed text-gray-700">{submodule.workflow}</p>
          </div>
        </div>

        {/* Key Features */}
        <div className="mt-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <CheckCircle2 className="h-5 w-5 text-[#004B23]" />
            Key Features
          </h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600">
            <li>Role-based access control enforcement</li>
            <li>Audit logging for all operations</li>
            <li>Real-time data synchronization</li>
            <li>Responsive design for all devices</li>
            <li>Integrated notification system</li>
            <li>Comprehensive error handling</li>
          </ul>
        </div>

        {/* Technical Details */}
        <div className="mt-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-5">
          <h4 className="flex items-center gap-2 font-medium text-gray-900">
            <Smartphone className="h-4 w-4" />
            Technical Implementation
          </h4>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>
              <strong>State Management:</strong> Redux Toolkit with slice-based architecture
            </li>
            <li>
              <strong>API Integration:</strong> RESTful endpoints with Axios interceptors
            </li>
            <li>
              <strong>Form Handling:</strong> React Hook Form with Yup validation
            </li>
            <li>
              <strong>UI Components:</strong> Radix UI primitives with Tailwind styling
            </li>
            <li>
              <strong>Data Fetching:</strong> Async thunks with loading/error states
            </li>
            <li>
              <strong>Real-time Updates:</strong> WebSocket connections for live data
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  )
}

// Subcomponent for overview content
function OverviewContent({ modules }: { modules: ModuleSection[] }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="rounded-full bg-[#004B23]/10 p-3">
          <BookOpen className="h-6 w-6 text-[#004B23]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Welcome to blumenOs Documentation</h2>
          <p className="text-sm text-gray-500">Your comprehensive guide to the electricity distribution platform</p>
        </div>
      </div>

      <p className="text-gray-600">
        Select any module from the sidebar to view detailed documentation about specific features, permissions, and
        workflows. Each module contains complete information about its functionality, required permissions, and
        step-by-step workflow processes.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {modules.slice(0, 8).map((module) => (
          <div
            key={module.id}
            className="group cursor-pointer rounded-xl border border-gray-200 p-4 transition-all hover:border-[#004B23]/30 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#004B23]/10 p-2 text-[#004B23] transition-colors group-hover:bg-[#004B23] group-hover:text-white">
                {module.icon}
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-[#004B23]">{module.title}</h3>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">{module.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-gray-400">{module.submodules.length} submodules</p>
              <span className="text-xs text-[#004B23] opacity-0 transition-opacity group-hover:opacity-100">
                Click to explore →
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900">Quick Tips</h4>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>• Use the search bar to quickly find modules and features</li>
              <li>• Expand modules to view all available submodules</li>
              <li>• Each submodule includes permission requirements and workflow details</li>
              <li>• Check the Permission Reference section for complete access control documentation</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
