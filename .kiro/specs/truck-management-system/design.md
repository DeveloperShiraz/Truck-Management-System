# Design Document - Truck Management System

## Overview

The Truck Management System (TMS) is a Next.js web application that provides fleet management capabilities for transportation companies. The system implements role-based access control with two primary user types: Truck Owners and Drivers. The architecture follows a modern JAMstack approach suitable for Netlify deployment, with a focus on serverless functions, client-side rendering, and future AWS service integration.

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with JWT strategy
- **Database**: Initially localStorage/IndexedDB for MVP, designed for future migration to AWS DynamoDB
- **AI Integration**: DeepSeek API for chatbot functionality
- **Deployment**: Netlify with serverless functions
- **State Management**: React Context API + hooks

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (Next.js App Router + React Components + Tailwind CSS)     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│         (Context Providers + Custom Hooks + Utils)          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│        (Next.js API Routes / Serverless Functions)          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│     (Browser Storage → Future: AWS DynamoDB/RDS)            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  External Services                           │
│              (DeepSeek API, Future: AWS IoT)                │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
truck-management-system/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard layout with nav
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── fleet-management/
│   │   │   └── page.tsx
│   │   ├── telemetrics/
│   │   │   └── page.tsx
│   │   ├── service/
│   │   │   └── page.tsx
│   │   ├── chatbot/
│   │   │   └── page.tsx
│   │   └── driver-checklist/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── fleet/
│   │   │   ├── generate-code/
│   │   │   │   └── route.ts
│   │   │   ├── join/
│   │   │   │   └── route.ts
│   │   │   └── members/
│   │   │       └── route.ts
│   │   ├── checklist/
│   │   │   └── route.ts
│   │   └── chatbot/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx                    # Landing/redirect page
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── navigation/
│   │   └── Navbar.tsx
│   ├── fleet/
│   │   ├── FleetCodeGenerator.tsx
│   │   ├── FleetMemberList.tsx
│   │   └── JoinFleetForm.tsx
│   ├── checklist/
│   │   ├── ChecklistManager.tsx    # For Truck Owners
│   │   └── ChecklistViewer.tsx     # For Drivers
│   ├── chatbot/
│   │   ├── ChatInterface.tsx
│   │   └── ChatMessage.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       └── Modal.tsx
├── lib/
│   ├── auth/
│   │   ├── authOptions.ts
│   │   └── session.ts
│   ├── storage/
│   │   ├── userStorage.ts
│   │   ├── fleetStorage.ts
│   │   └── checklistStorage.ts
│   ├── utils/
│   │   ├── codeGenerator.ts
│   │   └── dateUtils.ts
│   └── types/
│       ├── user.ts
│       ├── fleet.ts
│       └── checklist.ts
├── contexts/
│   ├── AuthContext.tsx
│   └── FleetContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useFleet.ts
│   └── useChecklist.ts
└── public/
    └── assets/
```

## Components and Interfaces

### Authentication System

**Components:**
- `LoginForm`: Handles user login with email/password
- `RegisterForm`: Handles user registration with role selection
- `AuthContext`: Provides authentication state across the app

**Key Features:**
- NextAuth.js with Credentials provider
- JWT-based session management
- Password hashing using bcrypt
- Role stored in JWT token for quick access

**Flow:**
1. User submits credentials
2. API route validates against stored user data
3. On success, NextAuth creates JWT with user ID and role
4. Session persists in httpOnly cookie
5. Client accesses session via `useSession()` hook

### Navigation System

**Component:** `Navbar`

**Behavior:**
- Dynamically renders tabs based on user role and fleet status
- Always visible: Profile, Chatbot
- Truck Owner only: Fleet Management
- Fleet member only: Telemetrics, Service, Driver Checklist
- Highlights active tab
- Includes logout button

**Implementation:**
```typescript
interface NavItem {
  label: string;
  href: string;
  roles?: ('owner' | 'driver')[];
  requiresFleet?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Profile', href: '/profile' },
  { label: 'Fleet Management', href: '/fleet-management', roles: ['owner'] },
  { label: 'Telemetrics', href: '/telemetrics', requiresFleet: true },
  { label: 'Service', href: '/service', requiresFleet: true },
  { label: 'Chatbot', href: '/chatbot' },
  { label: 'Driver Checklist', href: '/driver-checklist', requiresFleet: true },
];
```

### Fleet Management System

**Components:**
- `FleetCodeGenerator`: Generates and displays fleet codes (Truck Owner)
- `FleetMemberList`: Lists all drivers in fleet with remove actions (Truck Owner)
- `JoinFleetForm`: Input for drivers to enter fleet code

**Fleet Code Structure:**
```typescript
interface FleetCode {
  code: string;              // 8-character alphanumeric
  ownerId: string;
  createdAt: Date;
  expiresAt: Date;           // createdAt + 7 days
  isActive: boolean;
}
```

**Code Generation:**
- Format: 8 uppercase alphanumeric characters (e.g., "A7K9M2P4")
- Collision checking to ensure uniqueness
- Automatic expiration after 7 days
- One active code per owner at a time

**Fleet Member Management:**
```typescript
interface FleetMember {
  id: string;
  driverId: string;
  ownerId: string;
  driverEmail: string;
  driverName: string;
  joinedAt: Date;
  status: 'active' | 'removed';
}
```

### Profile Management

**Component:** `ProfilePage`

**Features:**
- Display current user information (email, name, role)
- Role switching dropdown (Owner ↔ Driver)
- Profile update form
- Role change triggers immediate UI update via context

**Role Change Logic:**
1. User selects new role
2. Confirmation modal appears
3. On confirm, API updates user record
4. AuthContext refreshes session
5. Navigation bar updates automatically
6. If switching from Owner to Driver, fleet code is invalidated
7. If switching from Driver to Owner, fleet membership is removed

### Driver Checklist System

**Components:**
- `ChecklistManager`: Create, edit, delete checklists (Truck Owner)
- `ChecklistViewer`: View and complete checklist items (Driver)

**Data Structure:**
```typescript
interface Checklist {
  id: string;
  ownerId: string;
  title: string;
  items: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChecklistItem {
  id: string;
  description: string;
  order: number;
}

interface ChecklistCompletion {
  checklistId: string;
  itemId: string;
  driverId: string;
  completed: boolean;
  completedAt?: Date;
}
```

**Behavior:**
- Truck Owners create checklists that apply to all fleet members
- Drivers see all checklists from their owner
- Completion status is per-driver, per-item
- Real-time updates when owner modifies checklist

### Chatbot Integration

**Components:**
- `ChatInterface`: Main chat UI with message history
- `ChatMessage`: Individual message bubble component

**DeepSeek Integration:**
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  userId: string;
  messages: ChatMessage[];
  context: string;  // System prompt with TMS context
}
```

**API Route:** `/api/chatbot`
- Receives user message
- Maintains conversation history in session
- Calls DeepSeek API with context
- Returns assistant response
- Implements retry logic and error handling

**System Context:**
```
You are a helpful assistant for a Truck Management System. 
You can help users with:
- Understanding fleet management features
- Navigating the application
- Troubleshooting common issues
- Explaining telemetrics and maintenance features
Current user role: {role}
Fleet status: {hasFleet ? 'Member of fleet' : 'Not in fleet'}
```

### Telemetrics & Service Pages

**Current Implementation:**
- Placeholder pages with informational content
- UI structure prepared for future data integration
- Mock data displays to show intended layout

**Future AWS Integration Points:**
```typescript
// Prepared interfaces for future use
interface TelemetricData {
  truckId: string;
  timestamp: Date;
  odometer: number;
  oilLevel: number;
  fuelLevel: number;
  engineTemp: number;
  tirePressure: number[];
}

interface ServiceRecord {
  truckId: string;
  serviceType: string;
  date: Date;
  mileage: number;
  description: string;
  cost: number;
  nextServiceDue: Date;
}
```

## Data Models

### User Model

```typescript
interface User {
  id: string;
  email: string;
  password: string;  // Hashed with bcrypt
  name: string;
  role: 'owner' | 'driver';
  createdAt: Date;
  updatedAt: Date;
  // Driver-specific
  fleetOwnerId?: string;
  // Owner-specific
  activeFleetCode?: string;
}
```

### Truck Model

```typescript
interface Truck {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  registeredAt: Date;
  status: 'active' | 'maintenance' | 'inactive';
}
```

### Storage Strategy

**Phase 1 (MVP):** Browser-based storage
- localStorage for user data and session
- IndexedDB for larger datasets (checklists, trucks)
- Data structure designed to mirror future database schema

**Phase 2 (Future):** AWS Integration
- DynamoDB for user data, fleet codes, checklists
- RDS (PostgreSQL) for relational data if needed
- S3 for document storage
- IoT Core for real-time telemetrics

**Migration Path:**
- Abstract storage layer behind interfaces
- Implement storage adapters (LocalStorageAdapter, DynamoDBAdapter)
- Switch adapters via environment configuration
- Data export/import utilities for migration

## Error Handling

### Client-Side Error Handling

**Strategy:**
- Try-catch blocks around async operations
- User-friendly error messages
- Toast notifications for non-critical errors
- Error boundary components for React errors

**Error Types:**
```typescript
enum ErrorType {
  AUTHENTICATION_ERROR = 'Authentication failed',
  VALIDATION_ERROR = 'Invalid input',
  NETWORK_ERROR = 'Network connection issue',
  PERMISSION_ERROR = 'Insufficient permissions',
  NOT_FOUND_ERROR = 'Resource not found',
  EXPIRED_CODE_ERROR = 'Fleet code expired',
}
```

### API Error Responses

**Standard Format:**
```typescript
interface APIError {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}
```

**HTTP Status Codes:**
- 200: Success
- 400: Bad request (validation errors)
- 401: Unauthorized (not logged in)
- 403: Forbidden (insufficient permissions)
- 404: Not found
- 409: Conflict (e.g., code already used)
- 500: Server error

### Chatbot Error Handling

**Scenarios:**
- DeepSeek API timeout (5s): Show retry button
- API rate limit: Queue messages and retry
- Invalid API key: Show admin error message
- Network failure: Offline mode message

## Testing Strategy

### Unit Testing

**Framework:** Jest + React Testing Library

**Coverage:**
- Utility functions (code generation, date calculations)
- Custom hooks (useAuth, useFleet, useChecklist)
- Storage adapters
- Form validation logic

**Example Tests:**
- `codeGenerator.test.ts`: Verify code format, uniqueness
- `useAuth.test.ts`: Test login, logout, role changes
- `dateUtils.test.ts`: Test expiration calculations

### Component Testing

**Focus:**
- User interactions (clicks, form submissions)
- Conditional rendering based on role/fleet status
- Props and state management
- Error state displays

**Example Tests:**
- `LoginForm.test.tsx`: Submit with valid/invalid credentials
- `Navbar.test.tsx`: Correct tabs shown for each role
- `FleetCodeGenerator.test.tsx`: Generate and delete codes

### Integration Testing

**Scenarios:**
- Complete user registration and login flow
- Fleet code generation and driver joining
- Checklist creation and completion
- Role switching and permission updates

### End-to-End Testing

**Framework:** Playwright (future consideration)

**Critical Paths:**
- New user registration → login → profile setup
- Truck owner → generate code → driver joins → remove driver
- Owner creates checklist → driver completes items
- Chatbot conversation flow

### Manual Testing Checklist

- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Verify role-based access control
- [ ] Test fleet code expiration (time-accelerated)
- [ ] Verify data persistence across sessions
- [ ] Test error scenarios (network failures, invalid inputs)
- [ ] Verify chatbot responses and context retention

## Security Considerations

### Authentication Security

- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens stored in httpOnly cookies
- CSRF protection via NextAuth
- Session expiration after 7 days of inactivity
- Secure password requirements (min 8 chars, complexity)

### Authorization

- Role-based access control (RBAC)
- Server-side permission checks on all API routes
- Client-side route guards for UX
- Fleet membership verification before data access

### Data Protection

- Input validation and sanitization
- SQL injection prevention (parameterized queries for future DB)
- XSS protection via React's built-in escaping
- Rate limiting on API routes (especially chatbot)

### API Security

- DeepSeek API key stored in environment variables
- Never exposed to client
- Request validation before external API calls
- Response sanitization

## Performance Optimization

### Client-Side

- Code splitting via Next.js dynamic imports
- Lazy loading for non-critical components
- Image optimization with Next.js Image component
- Memoization of expensive computations
- Debouncing for search/filter inputs

### Server-Side

- API route caching where appropriate
- Efficient data queries (minimize data transfer)
- Serverless function optimization (cold start reduction)

### Future Considerations

- CDN caching for static assets (Netlify handles this)
- Database query optimization
- Real-time data streaming for telemetrics (WebSockets/SSE)

## Deployment Configuration

### Netlify Setup

**Build Settings:**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = ".netlify/functions"
```

**Environment Variables:**
- `NEXTAUTH_SECRET`: Random secret for JWT signing
- `NEXTAUTH_URL`: Production URL
- `DEEPSEEK_API_KEY`: DeepSeek API key
- `NODE_ENV`: production

### Future AWS Integration

**Services to Integrate:**
- **DynamoDB**: User data, fleet codes, checklists
- **IoT Core**: Real-time telemetrics from trucks
- **Lambda**: Background jobs (code expiration cleanup)
- **S3**: Document storage (maintenance records, photos)
- **CloudWatch**: Logging and monitoring
- **API Gateway**: RESTful API for mobile apps (future)

**Migration Strategy:**
1. Set up AWS infrastructure
2. Implement database adapters
3. Deploy dual-write system (local + AWS)
4. Verify data consistency
5. Switch to AWS as primary
6. Remove local storage fallback

## Accessibility

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus management for modals
- Color contrast compliance (WCAG AA)
- Screen reader testing

## Internationalization (Future)

- Prepared for i18n with next-intl
- String externalization
- Date/time localization
- Multi-language support structure
