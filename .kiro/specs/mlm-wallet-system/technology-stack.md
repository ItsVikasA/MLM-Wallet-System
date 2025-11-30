# Technology Stack

## MLM Wallet System - Technology Specifications

This document outlines all technologies, frameworks, libraries, and tools used in the MLM Wallet System project.

---

## Core Technologies

### Frontend & Backend Framework
- **Next.js 14+** (App Router)
  - Full-stack React framework
  - Server-side rendering (SSR)
  - API routes for backend logic
  - File-based routing
  - Built-in optimization

### Programming Language
- **TypeScript**
  - Type safety across frontend and backend
  - Better IDE support and autocomplete
  - Reduced runtime errors

---

## Database & Data Management

### Database
- **MongoDB**
  - NoSQL document database
  - Flexible schema design
  - Scalable for growing member networks
  - Good performance for hierarchical data (genealogy tree)

### ODM (Object Document Mapper)
- **Mongoose**
  - Schema definition and validation
  - Middleware support for hooks
  - Query building and population
  - Transaction support for atomic operations

---

## UI/UX Technologies

### Styling Framework
- **Tailwind CSS**
  - Utility-first CSS framework
  - Responsive design out of the box
  - Customizable design system
  - Small bundle size

### Component Library
- **shadcn/ui**
  - Modern, accessible components
  - Built on Radix UI primitives
  - Fully customizable
  - Copy-paste component approach

### Icons
- **Lucide React**
  - Modern, consistent icon set
  - Tree-shakeable
  - Customizable size and color

### Animations
- **Framer Motion**
  - Smooth page transitions
  - Component animations
  - Gesture support
  - Performance optimized

### Data Visualization
- **Recharts**
  - Commission charts
  - Sales volume graphs
  - Leg performance comparison
  - Responsive charts

### Tree Visualization
- **React Flow** or **D3.js**
  - Interactive genealogy tree
  - Zoom and pan support
  - Node customization
  - Performance for large trees

### Tables
- **TanStack Table (React Table v8)**
  - Transaction history tables
  - Sorting and filtering
  - Pagination
  - Column customization

---

## Forms & Validation

### Form Management
- **React Hook Form**
  - Performance optimized
  - Minimal re-renders
  - Easy validation integration
  - TypeScript support

### Schema Validation
- **Zod**
  - TypeScript-first validation
  - Runtime type checking
  - Reusable schemas
  - Error handling

---

## Authentication & Security

### Authentication
- **NextAuth.js v5**
  - JWT-based authentication
  - Session management
  - Credential provider
  - Secure cookie handling

### Password Security
- **bcrypt**
  - Password hashing
  - Salt generation
  - Secure comparison

### Environment Variables
- **dotenv** (built into Next.js)
  - Secure configuration management
  - Separate dev/prod environments

---

## Testing

### Unit Testing
- **Jest**
  - JavaScript testing framework
  - Snapshot testing
  - Mocking support
  - Code coverage reports

### Property-Based Testing
- **fast-check**
  - Generate random test inputs
  - 100+ iterations per property
  - Edge case discovery
  - Shrinking failed cases

### React Testing
- **React Testing Library**
  - Component testing
  - User interaction testing
  - Accessibility testing

### API Testing
- **Supertest**
  - HTTP assertion library
  - API endpoint testing
  - Integration testing

---

## Development Tools

### Package Manager
- **npm** or **pnpm**
  - Dependency management
  - Script execution

### Code Quality

#### Linting
- **ESLint**
  - Code quality checks
  - Next.js recommended config
  - TypeScript rules

#### Formatting
- **Prettier**
  - Consistent code formatting
  - Auto-formatting on save

#### Type Checking
- **TypeScript Compiler (tsc)**
  - Static type checking
  - Build-time error detection

---

## Additional Libraries

### Date Handling
- **date-fns**
  - Date formatting
  - Date calculations
  - Lightweight alternative to moment.js

### State Management
- **React Context API** (built-in)
  - Global state for user session
  - Wallet balance state
  - Theme state (dark/light mode)

### HTTP Client
- **Fetch API** (built-in)
  - Native browser API
  - No additional dependencies

### Toast Notifications
- **Sonner** or **React Hot Toast**
  - Success/error messages
  - Transaction confirmations
  - User feedback

---

## Deployment & Infrastructure

### Hosting Platform
- **Vercel** (recommended for Next.js)
  - Automatic deployments
  - Edge functions
  - Analytics
  - Preview deployments

### Database Hosting
- **MongoDB Atlas**
  - Cloud-hosted MongoDB
  - Automatic backups
  - Scalability
  - Free tier available

### Environment
- **Node.js 18+**
  - Runtime environment

---

## Project Structure

```
mlm-wallet-system/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (auth)/            # Auth routes (login, register)
│   │   ├── (dashboard)/       # Dashboard routes
│   │   ├── api/               # API routes
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── genealogy/        # Tree visualization
│   │   └── wallet/           # Wallet components
│   ├── lib/                   # Utility functions
│   │   ├── db/               # Database connection
│   │   ├── auth/             # Auth utilities
│   │   └── utils.ts          # Helper functions
│   ├── models/                # Mongoose models
│   │   ├── Member.ts
│   │   ├── Wallet.ts
│   │   ├── Transaction.ts
│   │   ├── TreeNode.ts
│   │   └── Package.ts
│   ├── services/              # Business logic
│   │   ├── memberService.ts
│   │   ├── walletService.ts
│   │   ├── genealogyService.ts
│   │   ├── commissionService.ts
│   │   └── packageService.ts
│   ├── types/                 # TypeScript types
│   └── __tests__/            # Test files
├── public/                    # Static assets
├── .env.local                # Environment variables
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── jest.config.js            # Jest configuration
└── package.json              # Dependencies
```

---

## Development Workflow

### Setup Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run property-based tests
npm run test:properties

# Lint code
npm run lint

# Format code
npm run format
```

### Git Workflow
- Feature branches for new features
- Pull requests for code review
- Main branch for production-ready code

---

## Performance Optimizations

- **Next.js Image Optimization** - Automatic image optimization
- **Code Splitting** - Automatic route-based splitting
- **Server Components** - Reduce client-side JavaScript
- **MongoDB Indexing** - Fast queries on memberId, sponsorId
- **Caching** - API route caching where appropriate
- **Lazy Loading** - Load components on demand

---

## Security Measures

- **Environment Variables** - Sensitive data protection
- **HTTPS Only** - Secure communication
- **CSRF Protection** - Built into NextAuth.js
- **Rate Limiting** - Prevent abuse (to be implemented)
- **Input Validation** - Zod schemas on all inputs
- **SQL Injection Prevention** - Mongoose parameterized queries
- **XSS Protection** - React's built-in escaping

---

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Minimum System Requirements

### Development
- Node.js 18+
- 4GB RAM
- 10GB disk space

### Production
- Node.js 18+
- 2GB RAM minimum
- MongoDB 5.0+

---

## Version Control

- **Git** - Version control system
- **GitHub** - Repository hosting
- **Conventional Commits** - Commit message format

---

## Documentation

- **README.md** - Project overview and setup
- **API Documentation** - API endpoint documentation
- **Component Storybook** (optional) - Component documentation

---

## Future Considerations

- **Redis** - Caching layer for high traffic
- **WebSockets** - Real-time updates
- **Payment Gateway Integration** - Stripe/Razorpay
- **Email Service** - SendGrid/Resend for notifications
- **SMS Service** - Twilio for OTP
- **Analytics** - Google Analytics or Mixpanel
- **Error Tracking** - Sentry
- **Logging** - Winston or Pino

---

**Last Updated:** December 2024
**Version:** 1.0.0
