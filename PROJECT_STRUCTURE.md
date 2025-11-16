# 📁 Project Structure

## Documentation Files

### Essential Documentation (Keep These)
- **README.md** - Main project documentation, features, setup instructions
- **QUICK_START.md** - 5-minute quick start guide
- **DEPLOYMENT.md** - Complete Netlify deployment guide
- **TROUBLESHOOTING.md** - Common issues and solutions
- **USER_MANAGEMENT.md** - Guide for managing users in users.json
- **PROJECT_STRUCTURE.md** - This file, project organization guide

### Configuration Files
- **.env** - Environment variables (not committed to git)
- **.env.example** - Environment variables template
- **.gitignore** - Git ignore rules
- **netlify.toml** - Netlify deployment configuration
- **package.json** - Dependencies and scripts
- **tsconfig.json** - TypeScript configuration
- **tailwind.config.ts** - Tailwind CSS configuration
- **next.config.mjs** - Next.js configuration
- **vitest.config.ts** - Vitest test configuration

## Directory Structure

```
truck-management-system/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Protected dashboard pages
│   │   ├── chatbot/
│   │   ├── dashboard/
│   │   ├── driver-checklist/
│   │   ├── fleet-management/
│   │   ├── profile/
│   │   ├── service/
│   │   └── telemetrics/
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── chatbot/              # Chatbot API
│   │   ├── checklist/            # Checklist CRUD
│   │   ├── fleet/                # Fleet management
│   │   ├── profile/              # User profile
│   │   ├── register/             # User registration
│   │   ├── test-storage/         # Storage testing endpoint
│   │   └── trucks/               # Truck management
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (redirects to login)
│   ├── error.tsx                 # Error page
│   ├── global-error.tsx          # Global error handler
│   ├── not-found.tsx             # 404 page
│   └── loading.tsx               # Loading page
│
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── StorageInfoBanner.tsx
│   ├── chatbot/                  # Chatbot components
│   │   ├── ChatInterface.tsx
│   │   └── ChatMessage.tsx
│   ├── checklist/                # Checklist components
│   │   ├── ChecklistManager.tsx
│   │   └── ChecklistViewer.tsx
│   ├── error/                    # Error handling components
│   │   └── ErrorBoundary.tsx
│   ├── fleet/                    # Fleet management components
│   │   ├── FleetCodeGenerator.tsx
│   │   ├── FleetMemberList.tsx
│   │   ├── JoinFleetForm.tsx
│   │   └── TruckRegistration.tsx
│   ├── navigation/               # Navigation components
│   │   └── Navbar.tsx
│   ├── providers/                # Context providers
│   │   └── Providers.tsx
│   └── ui/                       # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── LoadingOverlay.tsx
│       ├── LoadingSpinner.tsx
│       ├── Modal.tsx
│       └── Skeleton.tsx
│
├── contexts/                     # React contexts
│   └── AuthContext.tsx           # Authentication context
│
├── data/                         # Data storage
│   ├── users.json                # User data (tracked in git)
│   ├── README.md                 # Data directory documentation
│   └── .gitkeep                  # Ensures directory is tracked
│
├── hooks/                        # Custom React hooks
│   └── useAuth.ts                # Authentication hook
│
├── lib/                          # Utility libraries
│   ├── auth/                     # Authentication logic
│   │   └── authOptions.ts        # NextAuth configuration
│   ├── storage/                  # Data storage adapters
│   │   ├── hybridStorage.ts      # File-based user storage
│   │   ├── fleetStorage.ts       # Fleet data storage
│   │   ├── checklistStorage.ts   # Checklist storage
│   │   └── truckStorage.ts       # Truck storage
│   ├── types/                    # TypeScript types
│   │   ├── user.ts
│   │   ├── fleet.ts
│   │   ├── checklist.ts
│   │   └── truck.ts
│   └── utils/                    # Utility functions
│       ├── errorLogger.ts        # Error logging
│       └── validation.ts         # Form validation
│
├── public/                       # Static assets
│   ├── clear-storage.html        # Browser storage clearing tool
│   └── .gitkeep
│
├── scripts/                      # Utility scripts
│   └── manage-users.js           # User management CLI
│
└── types/                        # Global TypeScript types
    └── next-auth.d.ts            # NextAuth type extensions
```

## Key Features by Directory

### Authentication (`app/(auth)`)
- User registration with role selection
- Login with NextAuth
- Password hashing with bcrypt

### Dashboard (`app/(dashboard)`)
- Role-based access control
- Fleet management for owners
- Driver checklists
- AI chatbot
- Telemetrics and service tracking

### API Routes (`app/api`)
- RESTful API endpoints
- Server-side validation
- Session management
- File-based data storage

### Components (`components/`)
- Reusable UI components
- Form components with validation
- Error boundaries
- Loading states
- Responsive design

### Storage (`lib/storage`)
- File-based storage system
- Works with Netlify deployment
- Easy to migrate to database

## Scripts Available

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint

# User Management
npm run users:list   # List all users
npm run users:clear  # Clear all users
npm run users:reset  # Reset to test users
npm run users:hash   # Generate password hash
```

## Environment Variables

Required in `.env`:
- `NEXTAUTH_SECRET` - JWT secret key
- `NEXTAUTH_URL` - Application URL
- `DEEPSEEK_API_KEY` - DeepSeek API key for chatbot
- `NODE_ENV` - Environment (development/production)

## Data Storage

### Current: File-Based
- Location: `data/users.json`
- Tracked in git for easy deployment
- Pre-configured test users included

### Future: Database
- Planned migration to AWS DynamoDB
- AWS IoT for telemetrics
- AWS S3 for documents

## Test Accounts

Pre-configured in `data/users.json`:
- **Truck Owner:** owner@test.com / Password123
- **Driver:** driver@test.com / Password123

## Deployment

Configured for Netlify:
- Automatic builds from GitHub
- Environment variables in Netlify dashboard
- Serverless functions for API routes

## Development Workflow

1. **Start Development:**
   ```bash
   npm run dev
   ```

2. **Make Changes:**
   - Edit files in `app/`, `components/`, or `lib/`
   - Hot reload automatically updates

3. **Manage Users:**
   ```bash
   npm run users:list    # View users
   npm run users:reset   # Reset to test users
   ```

4. **Test:**
   - Use test accounts to verify features
   - Check browser console for errors
   - View API responses in Network tab

5. **Commit:**
   ```bash
   git add .
   git commit -m "Description"
   git push
   ```

6. **Deploy:**
   - Push to GitHub
   - Netlify auto-deploys

## Maintenance

### Adding New Features
1. Create components in `components/`
2. Add pages in `app/`
3. Create API routes in `app/api/`
4. Update types in `lib/types/`

### Managing Users
- Edit `data/users.json` directly
- Or use `npm run users:*` commands
- Commit changes to deploy with users

### Updating Documentation
- Update README.md for major changes
- Update TROUBLESHOOTING.md for new issues
- Keep DEPLOYMENT.md current

## Clean Code Practices

### What's Tracked in Git
✅ Source code
✅ Documentation
✅ Configuration files
✅ Test users (data/users.json)
✅ Package.json

### What's Ignored
❌ node_modules/
❌ .next/
❌ .env (use .env.example)
❌ Build artifacts
❌ IDE settings
❌ Temporary test files

## Support

- **Issues:** Check TROUBLESHOOTING.md
- **Setup:** See QUICK_START.md
- **Deployment:** See DEPLOYMENT.md
- **Users:** See USER_MANAGEMENT.md

---

Last Updated: November 2025
