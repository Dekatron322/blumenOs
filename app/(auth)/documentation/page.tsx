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
  Database,
  Edit,
  ExternalLink,
  FileText,
  GitBranch,
  Hash,
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
  Terminal,
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

// --- Complete Data (all modules from original) ---
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
  const [selectedSubmodule, setSelectedSubmodule] = useState<{
    moduleId: string
    subName: string
  } | null>(null)
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
    <div className="min-h-screen bg-gray-50">
      {/* Documentation Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16  items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Image src="/kadco.svg" alt="blumenOs Logo" width={120} height={40} className="h-8 w-auto" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">blumenOs Documentation</h1>
              <p className="text-xs text-gray-500">Platform Reference Guide</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            {[
              { id: "modules", label: "Modules", icon: <Layers className="h-4 w-4" /> },
              { id: "permissions", label: "Permissions", icon: <Shield className="h-4 w-4" /> },
              { id: "architecture", label: "Architecture", icon: <Code className="h-4 w-4" /> },
              { id: "getting-started", label: "Getting Started", icon: <BookOpen className="h-4 w-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border border-blue-200 bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search docs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <LifeBuoy className="h-4 w-4" />
              Support
            </button>
          </div>
        </div>
      </header>

      <div className="flex w-full">
        {/* Sidebar Navigation */}
        {activeTab === "modules" && (
          <aside className="hidden min-h-[calc(100vh-4rem)] max-w-80 border-r border-gray-200 bg-white lg:block">
            <div className="p-4">
              <div className="mb-6">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-900">
                  <Menu className="h-4 w-4" />
                  Platform Modules
                  <span className="ml-auto text-xs font-normal text-gray-500">({filteredModules.length})</span>
                </h2>
              </div>

              <nav className="space-y-1">
                {filteredModules.map((module, index) => (
                  <div key={module.id} className="mb-2">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        selectedModuleId === module.id
                          ? "border border-blue-200 bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`rounded p-1 ${selectedModuleId === module.id ? "bg-blue-100" : "bg-gray-100"}`}
                        >
                          {React.cloneElement(module.icon as React.ReactElement, { className: "h-4 w-4" })}
                        </div>
                        <span className="truncate">{module.title}</span>
                      </div>
                      {expandedModules.includes(module.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedModules.includes(module.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-4 mt-1 overflow-hidden"
                        >
                          <div className="space-y-1">
                            {module.submodules.map((sub) => (
                              <button
                                key={sub.path}
                                onClick={() => handleSubmoduleSelect(module.id, sub.name)}
                                className={`block w-full rounded-md px-3 py-1.5 text-left text-xs transition-colors ${
                                  selectedSubmodule?.moduleId === module.id && selectedSubmodule?.subName === sub.name
                                    ? "bg-blue-100 font-medium text-blue-800"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                              >
                                {sub.name}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="w-full min-w-0 flex-1">
          <div className="p-6">
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
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="mx-auto  px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-gray-500">
              <p>blumenOs Platform Documentation v2.0</p>
              <p className="mt-1">Powered by BlumenTech · Last updated: March 2026</p>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="transition-colors hover:text-gray-700">
                Terms
              </a>
              <a href="#" className="transition-colors hover:text-gray-700">
                Privacy
              </a>
              <a href="#" className="transition-colors hover:text-gray-700">
                Contact
              </a>
              <a href="#" className="transition-colors hover:text-gray-700">
                API Reference
              </a>
            </div>
          </div>
        </div>
      </footer>
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
  const selectedModule = modules.find((m) => m.id === moduleId)
  const submodule = selectedModule?.submodules.find((s) => s.name === subName)

  if (!selectedModule || !submodule) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <button onClick={onBack} className="flex items-center gap-1 transition-colors hover:text-gray-700">
          <ChevronLeft className="h-4 w-4" />
          Back to modules
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="cursor-pointer transition-colors hover:text-gray-700">{selectedModule.title}</span>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">{submodule.name}</span>
      </nav>

      {/* Module Header */}
      <div className="mb-8 border-b border-gray-200 pb-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            {React.cloneElement(selectedModule.icon as React.ReactElement, { className: "h-6 w-6" })}
          </div>
          <div className="flex-1">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">{submodule.name}</h1>
            <p className="text-lg leading-relaxed text-gray-600">{submodule.description}</p>
          </div>
        </div>
      </div>

      {/* Route Information */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
          <Hash className="h-5 w-5 text-gray-400" />
          Route Information
        </h2>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Endpoint: </span>
              <code className="ml-2 rounded border border-gray-200 bg-white px-3 py-1 font-mono text-sm text-gray-900">
                {submodule.path}
              </code>
            </div>
            <button
              onClick={() => copyToClipboard(submodule.path, "path")}
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {copiedCode === "path" ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Required Permissions */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
          <Shield className="h-5 w-5 text-gray-400" />
          Required Permissions
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex flex-wrap gap-2">
            {submodule.permissions.map((perm, idx) => (
              <div
                key={idx}
                className="group relative flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <code className="font-mono text-sm text-gray-900">{perm}</code>
                <button
                  onClick={() => copyToClipboard(perm, `perm-${idx}`)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  {copiedCode === `perm-${idx}` ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3 text-gray-400" />
                  )}
                </button>
              </div>
            ))}
          </div>
          {submodule.permissions.length === 0 && (
            <p className="text-sm italic text-gray-500">No special permissions required</p>
          )}
        </div>
      </section>

      {/* Workflow Process */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
          <GitBranch className="h-5 w-5 text-gray-400" />
          Workflow Process
        </h2>
        <div className="rounded-lg border border-gray-200 bg-blue-50 p-6">
          <div className="prose prose-sm max-w-none">
            <p className="leading-relaxed text-gray-700">{submodule.workflow}</p>
          </div>
        </div>
      </section>

      {/* Technical Implementation */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
          <Terminal className="h-5 w-5 text-gray-400" />
          Technical Implementation
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="grid divide-y divide-gray-200">
            {[
              { label: "State Management", value: "Redux Toolkit with slice-based architecture" },
              { label: "API Integration", value: "RESTful endpoints with Axios interceptors" },
              { label: "Form Handling", value: "React Hook Form with Yup validation" },
              { label: "UI Components", value: "Radix UI primitives with Tailwind styling" },
              { label: "Data Fetching", value: "Async thunks with loading/error states" },
              { label: "Real-time Updates", value: "WebSocket connections for live data" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <div>
                  <h3 className="font-medium text-gray-900">{item.label}</h3>
                  <p className="mt-1 text-sm text-gray-600">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <ExternalLink className="h-4 w-4" />
            Open in New Tab
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <FileText className="h-4 w-4" />
            View API Docs
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Code className="h-4 w-4" />
            View Source Code
          </button>
        </div>
      </section>
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
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-4">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Module Documentation</h1>
            <p className="mt-1 text-lg text-gray-600">
              Comprehensive guide to blumenOs platform modules and their functionality
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            <strong>Getting Started:</strong> Select a module from the sidebar to explore its submodules, permissions,
            and implementation details. Use the search bar to quickly find specific features or documentation.
          </p>
        </div>
      </div>

      {/* Module Categories */}
      <div className="space-y-12">
        {/* Core Operations */}
        <section>
          <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
            <div className="h-1 w-8 rounded bg-blue-600"></div>
            Core Operations
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.slice(0, 6).map((module) => (
              <div
                key={module.id}
                onClick={() => onSelectModule(module.id)}
                className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-gray-50 p-3 text-gray-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                    {React.cloneElement(module.icon as React.ReactElement, { className: "h-6 w-6" })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                      {module.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">{module.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {module.submodules.length} submodule{module.submodules.length !== 1 ? "s" : ""}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Business Operations */}
        <section>
          <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
            <div className="h-1 w-8 rounded bg-green-600"></div>
            Business Operations
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.slice(6, 12).map((module) => (
              <div
                key={module.id}
                onClick={() => onSelectModule(module.id)}
                className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-green-300 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-gray-50 p-3 text-gray-600 transition-colors group-hover:bg-green-50 group-hover:text-green-600">
                    {React.cloneElement(module.icon as React.ReactElement, { className: "h-6 w-6" })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-green-600">
                      {module.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">{module.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {module.submodules.length} submodule{module.submodules.length !== 1 ? "s" : ""}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* System Management */}
        <section>
          <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
            <div className="h-1 w-8 rounded bg-purple-600"></div>
            System Management
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.slice(12).map((module) => (
              <div
                key={module.id}
                onClick={() => onSelectModule(module.id)}
                className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-purple-300 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-gray-50 p-3 text-gray-600 transition-colors group-hover:bg-purple-50 group-hover:text-purple-600">
                    {React.cloneElement(module.icon as React.ReactElement, { className: "h-6 w-6" })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-purple-600">
                      {module.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">{module.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {module.submodules.length} submodule{module.submodules.length !== 1 ? "s" : ""}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Quick Tips */}
      <div className="mt-12 rounded-xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
          <div>
            <h3 className="mb-2 font-semibold text-amber-900">Documentation Tips</h3>
            <ul className="space-y-1 text-sm text-amber-800">
              <li>• Use the sidebar navigation to browse modules by category</li>
              <li>• Click on any module card to expand and view its submodules</li>
              <li>• Each submodule includes detailed permissions and workflow information</li>
              <li>• Check the Permissions tab for complete access control documentation</li>
              <li>• Use the search function to quickly find specific features</li>
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
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Permission Reference</h1>
            <p className="mt-1 text-lg text-gray-600">
              Complete guide to blumenOs platform permissions and access control
            </p>
          </div>
        </div>

        {/* Permission Pattern */}
        <div className="mb-8 rounded-lg border border-purple-200 bg-purple-50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-purple-900">Permission Format</h2>
          <div className="mb-4 flex items-center gap-4">
            <code className="rounded-lg border border-purple-200 bg-white px-4 py-2 font-mono text-lg text-purple-700">
              resource:action
            </code>
            <div className="text-sm text-purple-700">
              <p className="font-medium">Resource + Action</p>
              <p className="text-purple-600">Describes what can be accessed and how</p>
            </div>
          </div>
        </div>

        {/* Action Types */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg bg-green-100 p-2">
                <Check className="h-4 w-4 text-green-700" />
              </div>
              <h3 className="font-semibold text-green-700">read</h3>
            </div>
            <p className="text-sm text-gray-600">
              View and access information. Users can browse data, view reports, and access dashboards without making
              changes.
            </p>
            <div className="mt-3">
              <code className="rounded bg-green-50 px-2 py-1 font-mono text-xs text-green-700">customers:read</code>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg bg-blue-100 p-2">
                <Plus className="h-4 w-4 text-blue-700" />
              </div>
              <h3 className="font-semibold text-blue-700">create</h3>
            </div>
            <p className="text-sm text-gray-600">
              Add new records or entities. Users can create customers, generate bills, add agents, or initiate
              transactions.
            </p>
            <div className="mt-3">
              <code className="rounded bg-blue-50 px-2 py-1 font-mono text-xs text-blue-700">bills:create</code>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg bg-orange-100 p-2">
                <Edit className="h-4 w-4 text-orange-700" />
              </div>
              <h3 className="font-semibold text-orange-700">update</h3>
            </div>
            <p className="text-sm text-gray-600">
              Modify existing records. Users can edit customer details, adjust bills, modify agent information.
            </p>
            <div className="mt-3">
              <code className="rounded bg-orange-50 px-2 py-1 font-mono text-xs text-orange-700">agents:update</code>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg bg-purple-100 p-2">
                <Play className="h-4 w-4 text-purple-700" />
              </div>
              <h3 className="font-semibold text-purple-700">execute</h3>
            </div>
            <p className="text-sm text-gray-600">
              Perform operational actions and workflows. Users can process payments, clear cash, generate tokens.
            </p>
            <div className="mt-3">
              <code className="rounded bg-purple-50 px-2 py-1 font-mono text-xs text-purple-700">payments:process</code>
            </div>
          </div>
        </div>

        {/* Special Actions */}
        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="mb-2 font-semibold text-amber-900">Special Actions</h3>
          <p className="mb-3 text-sm text-amber-800">Additional actions beyond standard CRUD operations:</p>
          <div className="flex flex-wrap gap-2">
            {["delete", "approve", "manage", "admin", "configure", "clear", "topup"].map((action) => (
              <code
                key={action}
                className="rounded border border-amber-200 bg-amber-100 px-2 py-1 font-mono text-xs text-amber-700"
              >
                {action}
              </code>
            ))}
          </div>
        </div>
      </div>

      {/* Permission Groups */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900">Permission Groups</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {permissionGroups.map((group, idx) => (
            <div key={idx} className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                {group.title}
              </h3>
              <div className="space-y-3">
                {group.permissions.map((perm, permIdx) => (
                  <div key={permIdx} className="group/permission flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <code className="rounded border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs text-gray-900">
                          {perm.name}
                        </code>
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
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">{perm.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
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
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Architecture</h1>
            <p className="mt-1 text-lg text-gray-600">
              Technical overview of the blumenOs platform stack and infrastructure
            </p>
          </div>
        </div>
      </div>

      {/* Architecture Overview */}
      <div className="space-y-12">
        {/* Frontend Stack */}
        <section>
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="h-1 w-8 rounded bg-indigo-600"></div>
            Frontend Stack
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  name: "Next.js 14",
                  desc: "Server-side rendering with App Router for optimal performance and SEO",
                  icon: <Code className="h-5 w-5" />,
                },
                {
                  name: "TypeScript",
                  desc: "Type-safe development with enhanced IDE support and error prevention",
                  icon: <Terminal className="h-5 w-5" />,
                },
                {
                  name: "Tailwind CSS",
                  desc: "Utility-first CSS framework for rapid, consistent styling",
                  icon: <Layers className="h-5 w-5" />,
                },
                {
                  name: "Redux Toolkit",
                  desc: "State management with slice-based architecture and dev tools",
                  icon: <GitBranch className="h-5 w-5" />,
                },
                {
                  name: "Radix UI",
                  desc: "Accessible component primitives following WAI-ARIA standards",
                  icon: <Shield className="h-5 w-5" />,
                },
                {
                  name: "Framer Motion",
                  desc: "Declarative animations and gesture library for smooth UX",
                  icon: <Play className="h-5 w-5" />,
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div className="mt-0.5 rounded-lg bg-indigo-100 p-2 text-indigo-600">{item.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Backend Integration */}
        <section>
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="h-1 w-8 rounded bg-green-600"></div>
            Backend Integration
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  name: "RESTful APIs",
                  desc: "Standardized REST endpoints with consistent response formats",
                  icon: <Hash className="h-5 w-5" />,
                },
                {
                  name: "JWT Authentication",
                  desc: "Secure token-based authentication with refresh tokens",
                  icon: <Shield className="h-5 w-5" />,
                },
                {
                  name: "Axios Client",
                  desc: "HTTP client with interceptors for request/response handling",
                  icon: <Terminal className="h-5 w-5" />,
                },
                {
                  name: "File Processing",
                  desc: "CSV/Excel bulk operations with validation and error handling",
                  icon: <FileText className="h-5 w-5" />,
                },
                {
                  name: "Background Jobs",
                  desc: "Async processing queues for long-running operations",
                  icon: <Clock className="h-5 w-5" />,
                },
                {
                  name: "Audit Logging",
                  desc: "Complete activity tracking with IP and user attribution",
                  icon: <CheckCircle2 className="h-5 w-5" />,
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div className="mt-0.5 rounded-lg bg-green-100 p-2 text-green-600">{item.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Architecture */}
        <section>
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="h-1 w-8 rounded bg-red-600"></div>
            Security Architecture
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                <div className="mb-4 w-fit rounded-lg bg-red-100 p-3 text-red-600">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">Authentication</h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  JWT-based authentication for staff/agents with secure token storage and automatic refresh. OTP-based
                  authentication for customers with fingerprint tracking for enhanced security.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                <div className="mb-4 w-fit rounded-lg bg-orange-100 p-3 text-orange-600">
                  <UserCog className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">Authorization</h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  Role-Based Access Control (RBAC) with granular permissions following the resource:action pattern.
                  Hierarchical role inheritance with department-based access controls.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                <div className="mb-4 w-fit rounded-lg bg-amber-100 p-3 text-amber-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">Audit & Compliance</h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  Complete audit logging with IP tracking, user attribution, and immutable records. Regulatory
                  compliance reporting with data retention policies.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Flow */}
        <section>
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="h-1 w-8 rounded bg-purple-600"></div>
            Data Flow Architecture
          </h2>
          <div className="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-3 rounded-lg border border-purple-200 bg-white p-4">
                  <Users className="mx-auto h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Client Layer</h3>
                <p className="mt-1 text-xs text-gray-600">React components with state management</p>
              </div>

              <div className="text-center">
                <div className="mb-3 rounded-lg border border-purple-200 bg-white p-4">
                  <GitBranch className="mx-auto h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">API Gateway</h3>
                <p className="mt-1 text-xs text-gray-600">Request routing and authentication</p>
              </div>

              <div className="text-center">
                <div className="mb-3 rounded-lg border border-purple-200 bg-white p-4">
                  <Layers className="mx-auto h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Business Logic</h3>
                <p className="mt-1 text-xs text-gray-600">Core processing and validation</p>
              </div>

              <div className="text-center">
                <div className="mb-3 rounded-lg border border-purple-200 bg-white p-4">
                  <Database className="mx-auto h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Data Layer</h3>
                <p className="mt-1 text-xs text-gray-600">Persistent storage and caching</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

// --- Getting Started Component ---
function GettingStarted() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="rounded-lg bg-teal-50 p-3 text-teal-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Getting Started with blumenOs</h1>
            <p className="mt-1 text-lg text-gray-600">
              Your comprehensive guide to navigating and using the blumenOs platform
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start Steps */}
      <div className="space-y-12">
        {/* Authentication */}
        <section>
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="h-1 w-8 rounded bg-teal-600"></div>
            1. Authentication
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="mb-6 leading-relaxed text-gray-600">
              The blumenOs platform supports dual authentication mechanisms tailored for different user types. Staff and
              agents use JWT-based authentication while customers access through OTP verification.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-blue-50 p-6">
                <div className="mb-4 w-fit rounded-lg bg-blue-100 p-3 text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">Staff & Agent Login</h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-600">
                  Use your company email and password to access the administrative dashboard. Sessions are securely
                  managed with JWT tokens and automatic refresh.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Email and password authentication</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Automatic session management</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Role-based dashboard access</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-green-50 p-6">
                <div className="mb-4 w-fit rounded-lg bg-green-100 p-3 text-green-600">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">Customer Portal</h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-600">
                  Access your account using your account number and registered phone number. An OTP will be sent to your
                  phone for verification.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Account number + phone verification</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">SMS OTP authentication</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Self-service account management</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Role-Based Access */}
        <section>
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="h-1 w-8 rounded bg-indigo-600"></div>
            2. Role-Based Access Control
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="mb-6 leading-relaxed text-gray-600">
              Access to platform features is controlled through a comprehensive role-based access control system. Your
              assigned role determines which modules and actions you can perform.
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  role: "Administrator",
                  desc: "Full system access and user management",
                  bgColor: "bg-red-100",
                  textColor: "text-red-600",
                },
                {
                  role: "Finance Officer",
                  desc: "Billing, payments, and financial reports",
                  bgColor: "bg-blue-100",
                  textColor: "text-blue-600",
                },
                {
                  role: "Field Agent",
                  desc: "Customer interactions and meter readings",
                  bgColor: "bg-green-100",
                  textColor: "text-green-600",
                },
                {
                  role: "Customer Support",
                  desc: "Ticket management and customer service",
                  bgColor: "bg-purple-100",
                  textColor: "text-purple-600",
                },
                {
                  role: "Sales Representative",
                  desc: "Customer acquisition and service connections",
                  bgColor: "bg-orange-100",
                  textColor: "text-orange-600",
                },
                {
                  role: "System Auditor",
                  desc: "Compliance monitoring and audit trails",
                  bgColor: "bg-gray-100",
                  textColor: "text-gray-600",
                },
              ].map((item, idx) => (
                <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className={`${item.bgColor} p-2 ${item.textColor} mb-3 w-fit rounded-lg`}>
                    <UserCog className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1 font-semibold text-gray-900">{item.role}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Modules Overview */}
        <section>
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="h-1 w-8 rounded bg-purple-600"></div>
            3. Core Platform Modules
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="mb-6 leading-relaxed text-gray-600">
              The blumenOs platform is organized into functional modules that work together to provide comprehensive
              electricity distribution management capabilities.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-blue-50 p-6">
                <div className="mb-4 w-fit rounded-lg bg-blue-100 p-3 text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">Customer Management</h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-600">
                  Complete customer lifecycle management from registration through service delivery and billing.
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Customer registration and verification</li>
                  <li>• Service address management</li>
                  <li>• Account categorization</li>
                  <li>• Bulk data import/export</li>
                </ul>
              </div>

              <div className="rounded-lg border border-gray-200 bg-green-50 p-6">
                <div className="mb-4 w-fit rounded-lg bg-green-100 p-3 text-green-600">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">Metering System</h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-600">
                  Comprehensive meter management from installation through reading and maintenance.
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Meter installation and configuration</li>
                  <li>• Mobile meter reading with GPS</li>
                  <li>• Consumption tracking</li>
                  <li>• Maintenance scheduling</li>
                </ul>
              </div>

              <div className="rounded-lg border border-gray-200 bg-purple-50 p-6">
                <div className="mb-4 w-fit rounded-lg bg-purple-100 p-3 text-purple-600">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">Billing & Payments</h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-600">
                  End-to-end billing lifecycle from generation through collection and reconciliation.
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Automated bill generation</li>
                  <li>• Multi-channel payment processing</li>
                  <li>• Debt recovery management</li>
                  <li>• Financial reporting</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Help and Support */}
        <section>
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="h-1 w-8 rounded bg-amber-600"></div>
            4. Help and Support
          </h2>
          <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-amber-100 p-3 text-amber-600">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="mb-3 font-semibold text-gray-900">Need Assistance?</h3>
                <p className="mb-6 leading-relaxed text-gray-700">
                  Our comprehensive documentation and support resources are here to help you make the most of the
                  blumenOs platform. Whether you need technical guidance, have questions about features, or require
                  assistance with specific workflows, we've got you covered.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-amber-200 bg-white p-4">
                    <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900">
                      <FileText className="h-4 w-4 text-amber-600" />
                      Documentation Resources
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Detailed module documentation</li>
                      <li>• API reference guides</li>
                      <li>• Best practices and workflows</li>
                      <li>• Troubleshooting guides</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-white p-4">
                    <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900">
                      <LifeBuoy className="h-4 w-4 text-amber-600" />
                      Support Channels
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Email: support@blumenos.com</li>
                      <li>• Phone: Extension 1234</li>
                      <li>• Live chat during business hours</li>
                      <li>• Dedicated account managers</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button className="flex items-center gap-2 rounded-lg bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-200">
                    <BookOpen className="h-4 w-4" />
                    Browse Documentation
                  </button>
                  <button className="flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-50">
                    <LifeBuoy className="h-4 w-4" />
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
