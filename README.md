# 🚛 Truck Management System (TMS)

A comprehensive fleet management platform for transportation companies, enabling truck owners to manage their fleets and drivers to access essential resources.

## ✨ Features

### For Truck Owners
- **Fleet Management** - Generate fleet codes to add drivers
- **Driver Management** - View and manage fleet members
- **Truck Registration** - Register and track trucks
- **Checklist Creation** - Create pre-trip inspection checklists for drivers
- **Service Tracking** - Monitor maintenance schedules (placeholder for AWS IoT integration)
- **Telemetrics** - View truck telemetry data (placeholder for AWS IoT integration)

### For Drivers
- **Fleet Joining** - Join a fleet using owner-provided code
- **Driver Checklists** - Complete pre-trip inspection checklists
- **Service Access** - View maintenance information
- **Telemetrics Access** - Access truck telemetry data
- **AI Chatbot** - Get instant help with TMS features

### General Features
- **Role-Based Access** - Switch between Truck Owner and Driver roles
- **Secure Authentication** - JWT-based authentication with NextAuth
- **Responsive Design** - Mobile-friendly interface
- **Real-time Validation** - Comprehensive form validation
- **Error Handling** - Graceful error boundaries and user-friendly messages

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- DeepSeek API key (for chatbot feature)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd truck-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory (or copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your values:
   ```env
   # Generate a secure secret (run: openssl rand -base64 32)
   NEXTAUTH_SECRET=your-secret-key-here
   
   # Local development URL
   NEXTAUTH_URL=http://localhost:3000
   
   # Get your API key from https://platform.deepseek.com/api_keys
   DEEPSEEK_API_KEY=your-deepseek-api-key-here
   
   NODE_ENV=development
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Test Accounts (Pre-configured)

For quick testing, use these pre-configured accounts:

**Truck Owner Account:**
- Email: `owner@test.com`
- Password: `Password123`

**Driver Account:**
- Email: `driver@test.com`
- Password: `Password123`

### First Time Setup

1. **Login with test account** (recommended for testing)
   - Go to `/login`
   - Use one of the test accounts above
   - Access the dashboard

2. **Or register a new account**
   - Go to `/register`
   - Choose your role (Truck Owner or Driver)
   - Fill in your details
   - Submit the form

### For Truck Owners

1. **Generate a Fleet Code**
   - Navigate to Fleet Management
   - Click "Generate Code To Add Fleet Member"
   - Share the 8-character code with your drivers
   - Code expires in 7 days

2. **Register Trucks**
   - Go to Fleet Management
   - Click "Register Truck"
   - Fill in truck details (make, model, year, VIN, license plate)
   - Submit the form

3. **Create Checklists**
   - Navigate to Driver Checklist
   - Click "Create Checklist"
   - Add checklist items
   - Save for your drivers to use

### For Drivers

1. **Join a Fleet**
   - Get the fleet code from your truck owner
   - Go to Dashboard
   - Enter the fleet code
   - Submit to join the fleet

2. **Complete Checklists**
   - Navigate to Driver Checklist
   - View checklists from your fleet owner
   - Check off items as you complete them
   - Your progress is saved automatically

3. **Use the Chatbot**
   - Navigate to Chatbot
   - Ask questions about TMS features
   - Get instant AI-powered responses

## 🏗️ Project Structure

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
│   │   ├── auth/
│   │   ├── chatbot/
│   │   ├── checklist/
│   │   ├── fleet/
│   │   ├── profile/
│   │   ├── register/
│   │   └── trucks/
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   ├── chatbot/                  # Chatbot components
│   ├── checklist/                # Checklist components
│   ├── debug/                    # Debug utilities
│   ├── error/                    # Error boundaries
│   ├── fleet/                    # Fleet management components
│   ├── navigation/               # Navigation components
│   ├── providers/                # Context providers
│   └── ui/                       # Reusable UI components
├── contexts/                     # React contexts
├── data/                         # Data storage (users.json)
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
│   ├── auth/                     # Authentication logic
│   ├── storage/                  # Data storage adapters
│   ├── types/                    # TypeScript types
│   └── utils/                    # Utility functions
├── public/                       # Static assets
├── .env                          # Environment variables (not in git)
├── .env.example                  # Environment variables template
├── netlify.toml                  # Netlify configuration
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies
├── tailwind.config.ts            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## 🔧 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** NextAuth.js
- **Password Hashing:** bcryptjs
- **AI Chatbot:** DeepSeek API
- **Deployment:** Netlify
- **Data Storage:** JSON file (local), planned migration to AWS DynamoDB

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint

# User Management
npm run users:list   # List all users in data/users.json
npm run users:clear  # Clear all users
npm run users:reset  # Reset to default test users
npm run users:hash   # Generate password hash (usage: npm run users:hash Password123)
```

## 🌐 Deployment

### Deploy to Netlify

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`

3. **Set Environment Variables**
   
   In Netlify dashboard → Site settings → Environment variables, add:
   ```
   NEXTAUTH_SECRET=<generate-new-secret-for-production>
   NEXTAUTH_URL=https://your-app-name.netlify.app
   DEEPSEEK_API_KEY=<your-deepseek-api-key>
   NODE_ENV=production
   ```

4. **Deploy**
   - Netlify will automatically build and deploy
   - Your app will be live at `https://your-app-name.netlify.app`

### Generate Production Secret

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## 🔐 Security

- Passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens stored in httpOnly cookies
- CSRF protection via NextAuth
- Input validation on all forms
- Server-side permission checks on all API routes
- Environment variables for sensitive data

## 📊 Data Storage

### Current Implementation
- User data stored in `data/users.json`
- File-based storage for simplicity
- Works with Netlify deployment
- Tracked in git for easy testing

### Managing Test Data

**View all users:**
Open `data/users.json` in your editor

**Delete test users:**
Edit `data/users.json` and remove unwanted user objects

**Reset to empty:**
Replace file contents with `[]`

**Add users manually:**
See `data/README.md` for instructions on hashing passwords

### Future Migration (Planned)
- AWS DynamoDB for scalable user storage
- AWS IoT Core for real-time telemetrics
- AWS S3 for document storage
- AWS Cognito for authentication

## 🐛 Troubleshooting

### Common Issues

**Issue:** "Invalid email or password"
- **Solution:** Ensure you're using the correct credentials. Data is stored in `data/users.json`.

**Issue:** Build fails on Netlify
- **Solution:** Check that all environment variables are set correctly in Netlify dashboard.

**Issue:** Chatbot not responding
- **Solution:** Verify your `DEEPSEEK_API_KEY` is valid and has credits.

**Issue:** Session expires immediately
- **Solution:** Ensure `NEXTAUTH_SECRET` is set and `NEXTAUTH_URL` matches your deployment URL.

For more troubleshooting help, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 🗺️ Roadmap

- [ ] Migrate to AWS DynamoDB for data persistence
- [ ] Integrate AWS IoT Core for real-time telemetrics
- [ ] Add email verification for new accounts
- [ ] Implement password reset functionality
- [ ] Add multi-device session management
- [ ] Implement real-time notifications
- [ ] Add data export/import functionality
- [ ] Create mobile app (React Native)
- [ ] Add multi-language support
- [ ] Implement advanced analytics dashboard

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue in the GitHub repository.

---

Built with ❤️ using Next.js and TypeScript
