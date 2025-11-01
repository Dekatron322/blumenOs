import Image from "next/image"
import Link from "next/link"
import PricingIcon from "public/pricing-icon"
import UltraIcon from "public/ultra-icon"
export const LogoIcon = () => (
  <>
    <Link href="/" className="icon-style content-center">
      <div className=" flex items-center justify-center gap-2">
        <UltraIcon />
      </div>
    </Link>
    <Link href="/" className="dark-icon-style content-center">
      <div className=" flex items-center justify-center gap-2">
        <UltraIcon />
      </div>
    </Link>
  </>
)

export const DashboardIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/building.svg" : "/Icons/building.svg"} alt="Dashboard" width={20} height={20} />
)

export const TokenIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/token.svg" : "/Icons/token.svg"} alt="Dashboard" width={20} height={20} />
)

export const PaymentIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/payment.svg" : "/Icons/payment.svg"} alt="Dashboard" width={20} height={20} />
)

export const AgentIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/agent.svg" : "/Icons/agent.svg"} alt="Dashboard" width={20} height={20} />
)

export const AssetsIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/asset.svg" : "/Icons/asset.svg"} alt="Dashboard" width={20} height={20} />
)

export const OutageIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/outage.svg" : "/Icons/outage.svg"} alt="Dashboard" width={20} height={20} />
)

export const AnalyticsIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/Analytics.svg" : "/Icons/Analytics.svg"} alt="Dashboard" width={20} height={20} />
)

export const FieldIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/Field.svg" : "/Icons/Field.svg"} alt="Dashboard" width={20} height={20} />
)

export const AuditIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/Audit.svg" : "/Icons/Audit.svg"} alt="Dashboard" width={20} height={20} />
)

export const Pricing = ({ isActive }: { isActive: boolean }) => <PricingIcon />

export const EstatesIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/Estates.svg" : "/Icons/Estates.svg"} alt="Estates" width={20} height={20} />
)

export const BillingIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/receipt-text.svg" : "/Icons/receipt-text.svg"} alt="Estates" width={20} height={20} />
)

export const SetingIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "<SetingIcon />" : "<SetingIcon />"} alt="Estates" width={20} height={20} />
)

export const HomeIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/Home.svg" : "/Icons/Home.svg"} alt="Home" width={20} height={20} />
)

export const UtilityIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/ShoppingCart.png" : "/Icons/ShoppingCart.png"} alt="Utility" width={20} height={20} />
)

export const BusinessLogo = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/Briefcase.svg" : "/Icons/Briefcase.svg"} alt="Briefcase" width={20} height={20} />
)

export const EmployeeLogo = ({ isActive }: { isActive: boolean }) => (
  <Image
    src={isActive ? "/Icons/employee.svg" : "/Icons/ic_round-people-alt.png"}
    alt="Briefcase"
    width={20}
    height={20}
  />
)

export const NoteIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/Note.png" : "/Icons/Note.png"} alt="Utility" width={20} height={20} />
)

export const ChatIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/MailStar.png" : "/Icons/MailStar.png"} alt="Utility" width={20} height={20} />
)

export const ServiceIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/ic_employee.svg" : "/Icons/ic_employee.svg"} alt="Utility" width={20} height={20} />
)

export const MeteringIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/cpu.svg" : "/Icons/cpu.svg"} alt="Utility" width={20} height={20} />
)

export const SupportIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/Door.png" : "/Icons/Door.png"} alt="Utility" width={20} height={20} />
)

export const AdminIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/Utility.svg" : "/Icons/Admin.svg"} alt="Utility" width={20} height={20} />
)

export const LogoutIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/Utility.svg" : "/Icons/Logout.svg"} alt="Utility" width={20} height={20} />
)

export const PropertyIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/Property.svg" : "/Icons/Property.svg"} alt="Utility" width={20} height={20} />
)

export const VisitorIcon = ({ isActive }: { isActive: boolean }) => (
  <Image src={isActive ? "/Icons/Visitor.svg" : "/Icons/Visitor.svg"} alt="Utility" width={20} height={20} />
)
