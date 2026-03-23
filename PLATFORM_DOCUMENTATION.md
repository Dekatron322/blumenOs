# blumenOs Platform Documentation

## Overview

blumenOs is a comprehensive multi-tenant web platform designed for electricity distribution and revenue management. Built on Next.js 14 with TypeScript, it provides customer self-service portals, internal dashboards for staff and sales representatives, billing and payment flows, and rich analytics capabilities.

## Architecture

### Technology Stack

**Frontend Framework:**

- **Next.js 14** with App Router for server-side rendering and optimized performance
- **TypeScript** for strict type safety and better developer experience
- **React 18** with modern hooks and concurrent features

**Styling & UI:**

- **Tailwind CSS** for utility-first styling
- **Radix UI** for accessible, headless components
- **Framer Motion** for smooth animations and transitions
- **Lucide React** and **React Icons** for consistent iconography

**State Management:**

- **Redux Toolkit** for centralized state management
- **React Redux** for connecting React components to Redux store
- **Local Storage** for persisting authentication state

**Data Handling:**

- **Axios** for HTTP client with interceptors
- **React Hook Form** with **Yup** validation for form management
- **XLSX** for Excel file processing
- **Date-fns** for date manipulation

**Charts & Visualization:**

- **Chart.js** with **React Chart.js 2**
- **Recharts** for data visualization
- **Highcharts** for advanced charting needs

**Maps & Geospatial:**

- **Leaflet** with **React Leaflet** for mapping
- **MapLibre GL** and **React Map GL** for advanced geospatial features

**Development Tools:**

- **ESLint** and **Prettier** for code quality
- **Storybook** for component development and testing
- **Jest** and **React Testing Library** for unit testing
- **Playwright** for end-to-end testing
- **OpenTelemetry** for observability

## Project Structure

### Application Routes

The platform uses Next.js App Router with route groups for different functional areas:

#### Core Business Modules

**`(metering)` - Meter Management System**

- **Overview**: Dashboard with meter statistics and health metrics
- **All Meters**: Comprehensive meter inventory with search and filtering
- **Bulk Upload**: Mass meter registration via CSV/Excel files
- **Install New Meter**: Individual meter installation workflow
- **Meter Capture**: Mobile-friendly meter reading interface
- **Meter Readings**: Reading history and validation
- **Replace Meter**: Meter replacement workflow
- **Search**: Advanced meter search capabilities

**`(billing)` - Billing & Revenue Management**

- **Overview**: Revenue dashboard with key metrics
- **Bills**: Bill generation, viewing, and management
- **Generate**: Automated bill generation workflows
- **Adjustments**: Bill adjustments and corrections
- **Change Requests**: Bill modification requests
- **Feeder Energy Caps**: Energy consumption limits
- **Jobs**: Background job management
- **Print Jobs**: Bill printing and document generation
- **Bulk Upload**: Mass billing operations
- **Search**: Advanced bill search

**`(agent-management)` - Agent & Collection System**

- **Overview**: Agent performance dashboard
- **All Agents**: Agent registry and management
- **Add New Agent**: Agent onboarding workflow
- **All Cashiers**: Cashier management
- **All Clearing Cashiers**: Cash clearance operations
- **All Supervisors**: Supervisor management
- **Clear Cash**: Cash collection and clearance
- **Clearance**: Cash clearance workflows
- **Payments**: Payment processing and tracking
- **Change Request**: Agent modification requests

**`(customer-portal)` - Customer Self-Service**

- **Dashboard**: Customer overview and quick actions
- **Profile**: Customer information management
- **Bills**: Bill viewing and payment history
- **Payments**: Payment processing and methods
- **Tokens**: Prepaid token management
- **Complaints**: Issue reporting and tracking
- **Service Requests**: Service order management

**`(analytics)` - Business Intelligence**

- **Overview**: Executive dashboard with KPIs
- **Revenue Analytics**: Revenue trends and forecasting
- **Consumption Analytics**: Energy usage patterns
- **Customer Analytics**: Customer behavior insights
- **Agent Performance**: Collection efficiency metrics
- **Operational Analytics**: Field operations metrics

#### Supporting Systems

**`(auth)` - Authentication System**

- Login/logout functionality
- Password management
- Role-based access control
- Session management

**`(payment)` - Payment Processing**

- Multiple payment gateways
- Transaction processing
- Payment reconciliation
- Refund management

**`(assets-management)` - Asset Tracking**

- Physical asset management
- Maintenance scheduling
- Asset lifecycle tracking

**`(outage-management)` - Outage Tracking**

- Outage reporting
- Restoration tracking
- Customer notifications

**`(compliance)` - Regulatory Compliance**

- Compliance monitoring
- Report generation
- Audit trails

**`(vendor-management)` - Vendor Relations**

- Vendor registration
- Contract management
- Performance tracking

### Component Architecture

#### UI Components (`components/`)

**Modular Component Structure:**

- **`ui/`**: Reusable UI primitives (buttons, inputs, modals)
- **`Dashboard/`**: Dashboard-specific components
- **`Tables/`**: Data table components with pagination
- **`Forms/`**: Form components with validation
- **`Modals/`**: Modal dialogs and overlays
- **`Charts/`**: Chart and visualization components

**Business-Specific Components:**

- **`AgentManagementInfo/`**: Agent management components
- **`BillingInfo/`**: Billing system components
- **`MeteringInfo/`**: Meter management components
- **`CustomerInfo/`**: Customer-related components
- **`PaymentInfo/`**: Payment processing components

#### State Management (`lib/redux/`)

**Redux Slices:**

- **`authSlice.ts`**: User authentication and session management
- **`customerAuthSlice.ts`**: Customer portal authentication
- **`agentSlice.ts`**: Agent management and operations
- **`fileManagementSlice.ts`**: File upload and processing
- **`billingSlice.ts`**: Billing operations and data
- **`meteringSlice.ts`**: Meter management operations
- **`analyticsSlice.ts`**: Analytics data and calculations

## Authentication & Authorization

### Dual Authentication System

The platform implements two separate authentication systems:

#### 1. Staff/Agent Authentication

- **JWT-based** authentication with refresh tokens
- **Role-based access control (RBAC)**
- **Privilege system** for granular permissions
- **Password change enforcement**
- **Session persistence** in localStorage

**Key Features:**

- Automatic token refresh
- Request/response interceptors
- Protected routes
- Multi-factor authentication support

#### 2. Customer Portal Authentication

- **OTP-based** authentication system
- **Account number** and **phone number** verification
- **Fingerprint tracking** for security
- **Session management** for customer portal

**Authentication Flow:**

1. Customer requests OTP with account number and phone
2. System generates and sends OTP
3. Customer verifies OTP for access
4. JWT tokens issued for session management

### Role-Based Access Control

**User Roles:**

- System Administrators
- Billing Operators
- Meter Readers
- Field Agents
- Cash Collectors
- Supervisors
- Customer Service Representatives

**Privilege Categories:**

- User Management
- Billing Operations
- Meter Management
- Payment Processing
- Analytics Access
- System Configuration

## Core Business Workflows

### Meter Management Workflow

1. **Meter Installation**

   - Physical meter installation by field agents
   - Digital meter registration in system
   - Customer assignment and tariff configuration

2. **Meter Reading**

   - Mobile app for field readings
   - Automated reading validation
   - Exception handling for anomalies
   - Historical data tracking

3. **Bulk Operations**
   - CSV/Excel template downloads
   - Bulk meter uploads
   - Data validation and error reporting
   - Job processing with status tracking

### Billing Workflow

1. **Bill Generation**

   - Automated monthly billing cycles
   - Consumption-based calculations
   - Tariff application and discounts
   - Bill distribution (email, SMS, portal)

2. **Bill Management**

   - Bill adjustments and corrections
   - Payment allocation and reconciliation
   - Debt tracking and aging reports
   - Dispute resolution workflows

3. **Revenue Assurance**
   - Revenue validation and analytics
   - Collection efficiency monitoring
   - Cash reconciliation processes
   - Fraud detection mechanisms

### Payment Processing

1. **Payment Collection**

   - Multiple payment channels (online, mobile, agent)
   - Real-time payment processing
   - Receipt generation and distribution
   - Payment confirmation workflows

2. **Agent Collections**

   - Agent cash collection limits
   - Cash clearance processes
   - Remittance tracking
   - Commission calculations

3. **Reconciliation**
   - Daily payment reconciliation
   - Bank statement matching
   - Exception handling
   - Audit trail maintenance

## Data Management

### File Processing System

**Supported File Types:**

- CSV files for bulk operations
- Excel files with complex formatting
- PDF documents for bills and reports
- Image files for proofs and documentation

**Processing Features:**

- Template validation
- Data type checking
- Error reporting with row-level details
- Background job processing
- Progress tracking

### API Integration

**Internal APIs:**

- RESTful API design
- Standardized response formats
- Error handling and logging
- Rate limiting and caching

**External Integrations:**

- Payment gateway APIs
- SMS notification services
- Email service providers
- Banking system APIs

## Security Features

### Data Protection

- **Encryption** for sensitive data
- **Secure authentication** with JWT
- **Role-based access control**
- **Audit logging** for all operations
- **Data masking** for PII

### Application Security

- **Input validation** and sanitization
- **SQL injection prevention**
- **XSS protection**
- **CSRF protection**
- **Secure headers** implementation

## Performance Optimization

### Frontend Optimization

- **Code splitting** with Next.js
- **Image optimization** with Next.js Image
- **Lazy loading** for components
- **Caching strategies** for API calls
- **Bundle size optimization**

### Backend Optimization

- **Database query optimization**
- **API response caching**
- **Background job processing**
- **Connection pooling**
- **Load balancing** readiness

## Monitoring & Observability

### Application Monitoring

- **OpenTelemetry** integration
- **Performance metrics** tracking
- **Error tracking** and reporting
- **User behavior** analytics
- **System health** monitoring

### Business Intelligence

- **Real-time dashboards**
- **Automated reporting**
- **KPI tracking**
- **Trend analysis**
- **Predictive analytics**

## Deployment & Infrastructure

### Development Environment

- **Local development** with Docker support
- **Hot reload** for rapid development
- **Database migrations**
- **Seed data** for testing

### Production Deployment

- **Vercel** hosting for Next.js
- **Environment-specific** configurations
- **CI/CD pipelines** with GitHub Actions
- **Automated testing** in deployment
- **Rollback capabilities**

## Configuration Management

### Environment Variables

- **T3 Env** for type-safe environment variables
- **Server and client** variable separation
- **Build-time validation**
- **Development and production** configurations

### Feature Flags

- **Dynamic feature toggling**
- **A/B testing** support
- **Gradual rollout** capabilities
- **Emergency disable** options

## Testing Strategy

### Unit Testing

- **Jest** for test framework
- **React Testing Library** for component testing
- **Mock implementations** for external dependencies
- **Coverage reporting**

### Integration Testing

- **API endpoint testing**
- **Database integration testing**
- **Third-party service mocking**
- **End-to-end workflow testing**

### E2E Testing

- **Playwright** for browser automation
- **Cross-browser testing**
- **Mobile responsive testing**
- **Performance testing**

## Future Enhancements

### Planned Features

- **Mobile applications** for field operations
- **Advanced analytics** with machine learning
- **IoT integration** for smart meters
- **Blockchain** for transaction transparency
- **AI-powered** customer service

### Scalability Improvements

- **Microservices architecture**
- **Event-driven architecture**
- **CQRS pattern** implementation
- **Database sharding**
- **CDN integration**

## Support & Maintenance

### Documentation

- **API documentation** with OpenAPI/Swagger
- **Component documentation** with Storybook
- **Deployment guides**
- **Troubleshooting guides**

### Monitoring & Alerting

- **System health monitoring**
- **Performance alerts**
- **Error notifications**
- **Business metric tracking**

---

This documentation provides a comprehensive overview of the blumenOs platform architecture, features, and operations. For specific implementation details, refer to the inline code documentation and API documentation.

- documentation should be a page on it own - and this explains the entire app and feature - e.g explaining how the permission work, how agents are added and each agents permission
