"use client"

import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code,
  Copy,
  CreditCard,
  Edit,
  ExternalLink,
  FileText,
  HelpCircle,
  Home,
  Info,
  Layers,
  LifeBuoy,
  MapPin,
  Menu,
  Play,
  Plus,
  Search,
  Settings,
  Shield,
  Smartphone,
  UserCog,
  Users,
  Zap,
} from "lucide-react"

// --- Types ---
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

// --- Data (same as original, but kept for completeness) ---
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

// --- Main Component ---
export default function DocumentationPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [selectedSubmodule, setSelectedSubmodule] = useState<{ moduleId: string; subName: string } | null>(null)
  const [activeTab, setActiveTab] = useState<"modules" | "permissions" | "architecture" | "getting-started">("modules")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  const handleSubmoduleSelect = (moduleId: string, subName: string) => {
    setSelectedModuleId(moduleId)
    setSelectedSubmodule({ moduleId, subName })
    setActiveTab("modules")
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Image src="/kadco.svg" alt="blumenOs Logo" width={120} height={40} className="h-8 w-auto" />
            <span className="text-xl font-bold text-[#004B23]">blumenOs</span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <button
              onClick={() => setActiveTab("modules")}
              className={`text-sm font-medium transition-colors ${
                activeTab === "modules" ? "text-[#004B23]" : "text-gray-600 hover:text-[#004B23]"
              }`}
            >
              Modules
            </button>
            <button
              onClick={() => setActiveTab("permissions")}
              className={`text-sm font-medium transition-colors ${
                activeTab === "permissions" ? "text-[#004B23]" : "text-gray-600 hover:text-[#004B23]"
              }`}
            >
              Permissions
            </button>
            <button
              onClick={() => setActiveTab("architecture")}
              className={`text-sm font-medium transition-colors ${
                activeTab === "architecture" ? "text-[#004B23]" : "text-gray-600 hover:text-[#004B23]"
              }`}
            >
              Architecture
            </button>
            <button
              onClick={() => setActiveTab("getting-started")}
              className={`text-sm font-medium transition-colors ${
                activeTab === "getting-started" ? "text-[#004B23]" : "text-gray-600 hover:text-[#004B23]"
              }`}
            >
              Getting Started
            </button>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#"
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:border-[#004B23]/30 hover:text-[#004B23]"
            >
              <LifeBuoy className="h-4 w-4" />
              Support
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 rounded-2xl bg-gradient-to-r from-[#004B23] to-[#006838] p-8 text-white shadow-xl"
        >
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Documentation</h1>
              <p className="mt-2 text-lg text-green-100">
                Complete guide to the blumenOs electricity distribution platform
              </p>
              <div className="mt-4 flex gap-2">
                <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm">Version 2.0</span>
                <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm">
                  Last updated: March 2026
                </span>
              </div>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border-0 bg-white/10 py-3 pl-10 pr-4 text-white placeholder:text-white/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Sidebar - Module Navigation (only shown on modules tab) */}
          {activeTab === "modules" && (
            <div className="lg:col-span-3">
              <div className="sticky top-24 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Menu className="h-5 w-5 text-[#004B23]" />
                    Platform Modules
                    <span className="ml-2 text-sm font-normal text-gray-400">({filteredModules.length})</span>
                  </h2>
                </div>

                <div className="space-y-2">
                  {filteredModules.map((module, index) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.01 }}
                      className={`rounded-xl border transition-all ${
                        selectedModuleId === module.id
                          ? "border-[#004B23] bg-[#004B23]/5 shadow-md"
                          : "border-gray-200 bg-white shadow-sm hover:shadow-md"
                      }`}
                    >
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-lg p-2 ${
                              selectedModuleId === module.id
                                ? "bg-[#004B23] text-white"
                                : "bg-[#004B23]/10 text-[#004B23]"
                            }`}
                          >
                            {module.icon}
                          </div>
                          <span className="font-medium text-gray-900">{module.title}</span>
                        </div>
                        {expandedModules.includes(module.id) ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
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
                            <div className="border-t border-gray-100 px-3 pb-3">
                              {module.submodules.map((sub) => (
                                <button
                                  key={sub.path}
                                  onClick={() => handleSubmoduleSelect(module.id, sub.name)}
                                  className={`mt-2 block w-full rounded-md px-3 py-2 text-left text-sm transition-all ${
                                    selectedSubmodule?.moduleId === module.id && selectedSubmodule?.subName === sub.name
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
          )}

          {/* Main Content Area */}
          <div className={`${activeTab === "modules" ? "lg:col-span-9" : "lg:col-span-12"}`}>
            <AnimatePresence mode="wait">
              {activeTab === "modules" && (
                <motion.div
                  key="modules"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {selectedSubmodule ? (
                    <SubmoduleDetails
                      modules={platformModules}
                      selectedId={`${selectedSubmodule.moduleId}|${selectedSubmodule.subName}`}
                      onBack={() => {
                        setSelectedSubmodule(null)
                        setSelectedModuleId(null)
                      }}
                      copyToClipboard={copyToClipboard}
                      copiedCode={copiedCode}
                    />
                  ) : (
                    <ModulesOverview
                      modules={platformModules}
                      onSelectModule={(moduleId) => {
                        setSelectedModuleId(moduleId)
                        toggleModule(moduleId)
                      }}
                    />
                  )}
                </motion.div>
              )}

              {activeTab === "permissions" && (
                <motion.div
                  key="permissions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <PermissionsReference copyToClipboard={copyToClipboard} copiedCode={copiedCode} />
                </motion.div>
              )}

              {activeTab === "architecture" && (
                <motion.div
                  key="architecture"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArchitectureOverview copyToClipboard={copyToClipboard} copiedCode={copiedCode} />
                </motion.div>
              )}

              {activeTab === "getting-started" && (
                <motion.div
                  key="getting-started"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <GettingStarted />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          <p>blumenOs Platform Documentation v2.0</p>
          <p className="mt-1">Powered by BlumenTech · Last updated: March 2026</p>
          <div className="mt-4 flex justify-center gap-4">
            <a href="#" className="hover:text-[#004B23]">
              Terms
            </a>
            <a href="#" className="hover:text-[#004B23]">
              Privacy
            </a>
            <a href="#" className="hover:text-[#004B23]">
              Contact
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}

// --- Submodule Details Component ---
function SubmoduleDetails({
  modules,
  selectedId,
  onBack,
  copyToClipboard,
  copiedCode,
}: {
  modules: ModuleSection[]
  selectedId: string
  onBack: () => void
  copyToClipboard: (text: string, id: string) => void
  copiedCode: string | null
}) {
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
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-[#004B23]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to modules
        </button>

        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <span className="hover:text-[#004B23]">{module.title}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-gray-900">{submodule.name}</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900">{submodule.name}</h2>
        <p className="mt-2 leading-relaxed text-gray-600">{submodule.description}</p>

        {/* Path with copy */}
        <div className="mt-5 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div>
            <span className="text-sm font-medium text-gray-700">Route: </span>
            <code className="rounded bg-white px-2 py-1 font-mono text-sm text-[#004B23]">{submodule.path}</code>
          </div>
          <button
            onClick={() => copyToClipboard(submodule.path, "path")}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
          >
            {copiedCode === "path" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        {/* Permissions */}
        <div className="mt-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Shield className="h-5 w-5 text-[#004B23]" />
            Required Permissions
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {submodule.permissions.map((perm, idx) => (
              <div
                key={idx}
                className="group relative flex items-center gap-1 rounded-full bg-[#004B23]/10 px-3 py-1 font-mono text-sm text-[#004B23]"
              >
                {perm}
                <button
                  onClick={() => copyToClipboard(perm, `perm-${idx}`)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  {copiedCode === `perm-${idx}` ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3 text-gray-500" />
                  )}
                </button>
              </div>
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

// --- Modules Overview Component ---
function ModulesOverview({
  modules,
  onSelectModule,
}: {
  modules: ModuleSection[]
  onSelectModule: (moduleId: string) => void
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="rounded-full bg-[#004B23]/10 p-3">
          <BookOpen className="h-6 w-6 text-[#004B23]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Module Documentation</h2>
          <p className="text-sm text-gray-500">Select a module from the sidebar to view detailed documentation</p>
        </div>
      </div>

      <p className="text-gray-600">
        The blumenOs platform is organized into functional modules, each containing related features and workflows.
        Select any module from the sidebar to explore its submodules, permissions, and implementation details.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {modules.slice(0, 12).map((module) => (
          <div
            key={module.id}
            onClick={() => onSelectModule(module.id)}
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
                Expand →
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
              <li>• Check the Permissions tab for complete access control documentation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Permissions Reference Component ---
function PermissionsReference({
  copyToClipboard,
  copiedCode,
}: {
  copyToClipboard: (text: string, id: string) => void
  copiedCode: string | null
}) {
  const permissionGroups = [
    {
      title: "User Management",
      permissions: [
        { name: "users:read", description: "View user profiles" },
        { name: "users:create", description: "Create new users" },
        { name: "users:update", description: "Edit user details" },
        { name: "users:delete", description: "Deactivate users" },
      ],
    },
    {
      title: "Customer Operations",
      permissions: [
        { name: "customers:read", description: "View customer data" },
        { name: "customers:create", description: "Register customers" },
        { name: "customers:update", description: "Modify customer info" },
        { name: "customers:approve", description: "Approve changes" },
      ],
    },
    {
      title: "Billing Operations",
      permissions: [
        { name: "bills:read", description: "View bills" },
        { name: "bills:create", description: "Generate bills" },
        { name: "bills:update", description: "Adjust bills" },
        { name: "bills:approve", description: "Approve adjustments" },
      ],
    },
    {
      title: "Payment Processing",
      permissions: [
        { name: "payments:read", description: "View transactions" },
        { name: "payments:create", description: "Record payments" },
        { name: "payments:update", description: "Edit payments" },
        { name: "payments:cancel", description: "Reverse payments" },
      ],
    },
    {
      title: "Agent Management",
      permissions: [
        { name: "agents:read", description: "View agents" },
        { name: "agents:create", description: "Add new agents" },
        { name: "agents:update", description: "Modify agent details" },
        { name: "agents:clear", description: "Process cash clearance" },
      ],
    },
    {
      title: "Vendor Operations",
      permissions: [
        { name: "vendors:read", description: "View vendor data" },
        { name: "vendors:create", description: "Add new vendors" },
        { name: "vendors:update", description: "Modify vendor details" },
        { name: "wallet:topup", description: "Top-up vendor wallets" },
      ],
    },
    {
      title: "Asset Management",
      permissions: [
        { name: "assets:read", description: "View assets" },
        { name: "assets:create", description: "Add new assets" },
        { name: "assets:update", description: "Modify asset details" },
        { name: "assets:approve", description: "Approve changes" },
      ],
    },
    {
      title: "Debt Management",
      permissions: [
        { name: "debts:read", description: "View debt entries" },
        { name: "debts:create", description: "Create debt records" },
        { name: "debts:manage", description: "Manage debt recovery" },
        { name: "campaigns:configure", description: "Configure campaigns" },
      ],
    },
    {
      title: "Prepaid Tokens",
      permissions: [
        { name: "tokens:read", description: "View token transactions" },
        { name: "tokens:create", description: "Generate tokens" },
        { name: "prepaid:process", description: "Process token vending" },
        { name: "tamper:clear", description: "Clear meter tamper" },
      ],
    },
  ]

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="rounded-full bg-[#004B23]/10 p-3">
          <Shield className="h-6 w-6 text-[#004B23]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Permission Reference</h2>
          <p className="text-sm text-gray-500">Complete list of system permissions organized by module</p>
        </div>
      </div>

      <p className="text-gray-600">
        Permissions follow the pattern:{" "}
        <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">resource:action</code>
      </p>

      <div className="mb-8 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900">
          <Info className="h-5 w-5" />
          Understanding Permission Types
        </h3>
        <p className="mb-4 text-blue-800">
          The platform uses a Role-Based Access Control (RBAC) system where permissions follow the pattern:
        </p>
        <div className="mb-4 rounded-lg bg-white p-3 text-center font-mono text-sm text-blue-700">resource:action</div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h4 className="flex items-center gap-2 font-semibold text-green-700">
              <Check className="h-4 w-4" />
              read
            </h4>
            <p className="mt-2 text-sm text-gray-600">
              Allows viewing and accessing information. Users with read permissions can browse data, view reports, and
              access dashboards without making any changes.
            </p>
            <div className="mt-3">
              <span className="rounded bg-green-100 px-2 py-1 font-mono text-xs text-green-700">customers:read</span>
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h4 className="flex items-center gap-2 font-semibold text-blue-700">
              <Plus className="h-4 w-4" />
              create
            </h4>
            <p className="mt-2 text-sm text-gray-600">
              Allows adding new records or entities. Users with create permissions can add new customers, generate
              bills, create agents, or initiate new transactions.
            </p>
            <div className="mt-3">
              <span className="rounded bg-blue-100 px-2 py-1 font-mono text-xs text-blue-700">bills:create</span>
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h4 className="flex items-center gap-2 font-semibold text-orange-700">
              <Edit className="h-4 w-4" />
              update
            </h4>
            <p className="mt-2 text-sm text-gray-600">
              Allows modifying existing records. Users with update permissions can edit customer details, adjust bills,
              modify agent information, or change asset configurations.
            </p>
            <div className="mt-3">
              <span className="rounded bg-orange-100 px-2 py-1 font-mono text-xs text-orange-700">agents:update</span>
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h4 className="flex items-center gap-2 font-semibold text-purple-700">
              <Play className="h-4 w-4" />
              execute
            </h4>
            <p className="mt-2 text-sm text-gray-600">
              Allows performing operational actions and workflows. Users with execute permissions can process payments,
              clear cash, generate tokens, or run system operations.
            </p>
            <div className="mt-3">
              <span className="rounded bg-purple-100 px-2 py-1 font-mono text-xs text-purple-700">
                payments:process
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-blue-100 p-3">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Some special actions like <code className="rounded bg-blue-200 px-1">delete</code>,
            <code className="rounded bg-blue-200 px-1">approve</code>,{" "}
            <code className="rounded bg-blue-200 px-1">manage</code>, and{" "}
            <code className="rounded bg-blue-200 px-1">admin</code> provide additional specific capabilities beyond the
            standard CRUD operations.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {permissionGroups.map((group, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-gray-200 p-4 transition-all hover:border-[#004B23]/30 hover:shadow-md"
          >
            <h3 className="font-semibold text-gray-900">{group.title}</h3>
            <ul className="mt-3 space-y-2">
              {group.permissions.map((perm, permIdx) => (
                <li key={permIdx} className="group/permission flex items-center justify-between">
                  <div>
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-[#004B23]">
                      {perm.name}
                    </code>
                    <p className="mt-0.5 text-xs text-gray-500">{perm.description}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(perm.name, `perm-${idx}-${permIdx}`)}
                    className="opacity-0 transition-opacity group-hover/permission:opacity-100"
                  >
                    {copiedCode === `perm-${idx}-${permIdx}` ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Architecture Overview Component ---
function ArchitectureOverview({
  copyToClipboard,
  copiedCode,
}: {
  copyToClipboard: (text: string, id: string) => void
  copiedCode: string | null
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="rounded-full bg-[#004B23]/10 p-3">
          <Layers className="h-6 w-6 text-[#004B23]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">System Architecture</h2>
          <p className="text-sm text-gray-500">Technical overview of the blumenOs platform stack</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Code className="h-5 w-5 text-[#004B23]" />
            Frontend Stack
          </h3>
          <ul className="space-y-3">
            {[
              { name: "Next.js 14", desc: "Server-side rendering & App Router" },
              { name: "TypeScript", desc: "Type-safe development" },
              { name: "Tailwind CSS", desc: "Utility-first styling" },
              { name: "Redux Toolkit", desc: "State management" },
              { name: "Radix UI", desc: "Accessible components" },
              { name: "Framer Motion", desc: "Animations" },
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#004B23]" />
                <div>
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <span className="text-sm text-gray-500"> - {item.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Layers className="h-5 w-5 text-[#004B23]" />
            Backend Integration
          </h3>
          <ul className="space-y-3">
            {[
              { name: "RESTful APIs", desc: "Standardized endpoints" },
              { name: "JWT Authentication", desc: "Secure token-based auth" },
              { name: "Axios", desc: "HTTP client with interceptors" },
              { name: "File Processing", desc: "CSV/Excel bulk operations" },
              { name: "Background Jobs", desc: "Async processing" },
              { name: "Audit Logging", desc: "Complete activity tracking" },
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#004B23]" />
                <div>
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <span className="text-sm text-gray-500"> - {item.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Shield className="h-5 w-5 text-[#004B23]" />
          Security Architecture
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h4 className="font-medium text-gray-900">Authentication</h4>
            <p className="mt-1 text-sm text-gray-600">JWT for staff, OTP for customers with fingerprint tracking</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h4 className="font-medium text-gray-900">Authorization</h4>
            <p className="mt-1 text-sm text-gray-600">RBAC with granular permissions (resource:action)</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h4 className="font-medium text-gray-900">Audit</h4>
            <p className="mt-1 text-sm text-gray-600">
              Complete activity logging with IP tracking and user attribution
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Getting Started Component ---
function GettingStarted() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="rounded-full bg-[#004B23]/10 p-3">
          <BookOpen className="h-6 w-6 text-[#004B23]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Getting Started with blumenOs</h2>
          <p className="text-sm text-gray-500">Your guide to navigating the platform</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900">1. Authentication</h3>
          <p className="text-gray-600">
            The platform supports two authentication methods: JWT-based login for staff/agents and OTP-based login for
            customers. All users must have valid credentials to access the system.
          </p>
          <div className="mt-4 rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Staff Login:</strong> Use your email and password to access the admin dashboard.
            </p>
            <p className="mt-2 text-sm text-blue-800">
              <strong>Customer Portal:</strong> Use your account number and registered phone number to receive an OTP.
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900">2. Role-Based Access</h3>
          <p className="text-gray-600">
            Access to features is controlled by roles and permissions. Your role determines what modules and actions you
            can access within the system.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">Administrator</span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">Finance Officer</span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">Field Agent</span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">Customer Support</span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">Sales Representative</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">3. Core Modules</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4">
            <Users className="mb-2 h-5 w-5 text-[#004B23]" />
            <h4 className="font-medium">Customer Management</h4>
            <p className="mt-1 text-sm text-gray-500">Manage customer information, service addresses, and accounts</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <Zap className="mb-2 h-5 w-5 text-[#004B23]" />
            <h4 className="font-medium">Metering</h4>
            <p className="mt-1 text-sm text-gray-500">Track meter installations, readings, and maintenance</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <CreditCard className="mb-2 h-5 w-5 text-[#004B23]" />
            <h4 className="font-medium">Billing & Payments</h4>
            <p className="mt-1 text-sm text-gray-500">Generate bills, process payments, and manage collections</p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-amber-100 p-3">
            <HelpCircle className="h-6 w-6 text-amber-700" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-900">Need Help?</h3>
            <p className="mt-1 text-amber-800">
              Check the module documentation for detailed workflows and permissions. For technical support, contact the
              IT help desk at support@blumenos.com or call extension 1234.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-200"
              >
                <FileText className="h-4 w-4" />
                Documentation
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-1 rounded-lg bg-white px-4 py-2 text-sm font-medium text-amber-800 shadow-sm hover:bg-gray-50"
              >
                <LifeBuoy className="h-4 w-4" />
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
