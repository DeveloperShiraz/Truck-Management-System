# Implementation Plan - Truck Management System

- [x] 1. Initialize Next.js project and configure base dependencies
  - Create Next.js 14 project with TypeScript and App Router
  - Install and configure Tailwind CSS
  - Set up project directory structure as per design
  - Configure environment variables template
  - _Requirements: All requirements depend on proper project setup_

- [x] 2. Create UI component library
  - [x] 2.1 Build reusable UI components (Button, Input, Card, Modal)
    - Implement Button component with variants (primary, secondary, danger)
    - Implement Input component with validation states
    - Implement Card component for content containers
    - Implement Modal component with overlay and close functionality
    - _Requirements: All UI requirements depend on these base components_
  - [x] 2.2 Write unit tests for UI components


    - Test Button click handlers and variants
    - Test Input validation and onChange behavior
    - Test Modal open/close functionality
    - _Requirements: All UI requirements_

- [x] 3. Implement authentication system


  - [x] 3.1 Set up NextAuth.js configuration


    - Install NextAuth.js and configure auth options
    - Create API route at `/api/auth/[...nextauth]/route.ts`
    - Implement Credentials provider with email/password
    - Configure JWT strategy with role inclusion
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x] 3.2 Create user storage layer

    - Implement `userStorage.ts` with localStorage adapter
    - Create functions for user CRUD operations
    - Implement password hashing with bcrypt
    - Add user lookup by email functionality
    - _Requirements: 1.2, 1.5, 2.2_
  - [x] 3.3 Build registration page and form


    - Create `/app/(auth)/register/page.tsx`
    - Implement RegisterForm component with email, password, and role fields
    - Add form validation (email format, password strength)
    - Implement registration API call and error handling
    - Redirect to login page on success
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 3.4 Build login page and form


    - Create `/app/(auth)/login/page.tsx`
    - Implement LoginForm component with email and password fields
    - Integrate with NextAuth signIn function
    - Add error handling for invalid credentials
    - Redirect to dashboard on successful login
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 3.5 Create AuthContext and useAuth hook


    - Implement AuthContext with session state
    - Create useAuth hook for accessing user and role
    - Add logout functionality
    - Implement session persistence check
    - _Requirements: 2.4, 2.5, 3.3_
  - [x] 3.6 Write authentication tests


    - Test user registration flow
    - Test login with valid/invalid credentials
    - Test session persistence
    - Test logout functionality
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4. Build navigation and dashboard layout




  - [x] 4.1 Create dashboard layout with navigation


    - Create `/app/(dashboard)/layout.tsx`
    - Implement Navbar component with role-based tab visibility
    - Add logout button to navigation
    - Implement active tab highlighting
    - Add route protection (redirect to login if not authenticated)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  - [x] 4.2 Create landing page with redirect logic


    - Create `/app/page.tsx` as entry point
    - Redirect authenticated users to dashboard
    - Redirect unauthenticated users to login
    - _Requirements: 2.4_
  - [x] 4.3 Test navigation behavior


    - Test tab visibility for Truck Owner role
    - Test tab visibility for Driver with/without fleet
    - Test active tab highlighting
    - Test logout functionality
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [-] 5. Implement profile management


  - [x] 5.1 Create profile page


    - Create `/app/(dashboard)/profile/page.tsx`
    - Display current user information (email, name, role)
    - Implement role switching dropdown
    - Add profile update form
    - _Requirements: 3.1, 3.2, 3.4_
  - [x] 5.2 Create profile update API route


    - Create `/api/profile/route.ts`
    - Implement PUT handler for profile updates
    - Add validation for profile fields
    - Handle role change logic (invalidate fleet code if switching from Owner, remove fleet membership if switching from Driver)
    - _Requirements: 3.2, 3.3, 3.5_
  - [x] 5.3 Add role change confirmation modal

    - Implement confirmation modal for role changes
    - Show warning about consequences of role change
    - Update AuthContext after role change
    - Trigger navigation bar update
    - _Requirements: 3.2, 3.3_
  - [x] 5.4 Test profile management


    - Test profile information display
    - Test role switching from Owner to Driver
    - Test role switching from Driver to Owner
    - Test profile update validation
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6. Implement fleet code system





  - [x] 6.1 Create code generation utilities


    - Implement `codeGenerator.ts` with 8-character alphanumeric generation
    - Add collision checking for uniqueness
    - Implement expiration date calculation (7 days)
    - _Requirements: 4.1, 4.2, 4.4_
  - [x] 6.2 Create fleet storage layer


    - Implement `fleetStorage.ts` with localStorage adapter
    - Create functions for fleet code CRUD operations
    - Add fleet member management functions
    - Implement code validation and expiration checking
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.2, 6.3, 7.1, 7.2, 8.1, 8.2_
  - [x] 6.3 Create fleet code generation API route


    - Create `/api/fleet/generate-code/route.ts`
    - Implement POST handler for code generation
    - Verify user is Truck Owner
    - Check for existing active code (one at a time)
    - Return generated code with expiration date
    - _Requirements: 4.1, 4.2, 4.3, 4.5_
  - [x] 6.4 Create fleet code deletion API route


    - Add DELETE handler to `/api/fleet/generate-code/route.ts`
    - Verify user is Truck Owner
    - Invalidate the active fleet code
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 6.5 Write fleet code tests


    - Test code generation format and uniqueness
    - Test expiration date calculation
    - Test one-code-per-owner constraint
    - Test code deletion
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4_

- [x] 7. Build fleet management interface for Truck Owners




  - [x] 7.1 Create FleetCodeGenerator component


    - Display "Generate Code To Add Fleet Member" button
    - Show active fleet code with expiration date
    - Add delete button for active code
    - Implement confirmation modal for deletion
    - Handle API calls for generation and deletion
    - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5_
  - [x] 7.2 Create FleetMemberList component


    - Display list of all fleet members
    - Show member name, email, and join date
    - Add remove button for each member
    - Implement confirmation modal for removal
    - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.4_
  - [x] 7.3 Create fleet management page


    - Create `/app/(dashboard)/fleet-management/page.tsx`
    - Integrate FleetCodeGenerator component
    - Integrate FleetMemberList component
    - Add route guard (Truck Owner only)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  - [x] 7.4 Create fleet members API route


    - Create `/api/fleet/members/route.ts`
    - Implement GET handler to fetch fleet members
    - Implement DELETE handler to remove members
    - Verify user is Truck Owner
    - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 8.4, 8.5_
  - [x] 7.5 Test fleet management interface


    - Test code generation and display
    - Test code deletion
    - Test fleet member list display
    - Test member removal
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 8. Implement driver fleet joining




  - [x] 8.1 Create JoinFleetForm component


    - Display input field for fleet code
    - Add submit button
    - Show error messages for invalid/expired codes
    - Show success message on joining
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 8.2 Create fleet join API route


    - Create `/api/fleet/join/route.ts`
    - Implement POST handler for joining fleet
    - Validate fleet code (exists, not expired, active)
    - Add driver to owner's fleet
    - Update driver's fleetOwnerId
    - _Requirements: 6.2, 6.3, 6.4, 6.5_
  - [x] 8.3 Add fleet join prompt for drivers


    - Show JoinFleetForm when driver has no fleet
    - Display on dashboard or dedicated page
    - Update navigation after successful join
    - _Requirements: 6.1, 6.4, 8.3, 13.5_
  - [x] 8.4 Test driver fleet joining
    - Test joining with valid code
    - Test joining with invalid code
    - Test joining with expired code
    - Test navigation update after joining
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 9. Implement driver checklist system
  - [x] 9.1 Create checklist storage layer
    - Implement `checklistStorage.ts` with localStorage adapter
    - Create functions for checklist CRUD operations
    - Add checklist completion tracking functions
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3, 11.4_
  - [x] 9.2 Create checklist API route
    - Create `/api/checklist/route.ts`
    - Implement GET handler to fetch checklists (role-based)
    - Implement POST handler to create checklists (Truck Owner only)
    - Implement PUT handler to update checklists (Truck Owner only)
    - Implement DELETE handler to delete checklists (Truck Owner only)
    - Implement PATCH handler to update completion status (Driver only)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 11.2, 11.3_
  - [x] 9.3 Create ChecklistManager component for Truck Owners
    - Display list of existing checklists
    - Add "Create Checklist" button and form
    - Implement checklist item management (add, edit, delete items)
    - Add save and cancel buttons
    - Show confirmation modal for deletion
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  - [x] 9.4 Create ChecklistViewer component for Drivers
    - Display all checklists from fleet owner
    - Show checklist items with checkboxes
    - Implement checkbox toggle for completion
    - Display completion status
    - Update completion status in real-time
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  - [x] 9.5 Create driver checklist page
    - Create `/app/(dashboard)/driver-checklist/page.tsx`
    - Conditionally render ChecklistManager for Truck Owners
    - Conditionally render ChecklistViewer for Drivers
    - Add route guard (require fleet membership for Drivers)
    - _Requirements: 10.1, 11.1, 11.5_
  - [x] 9.6 Test checklist system
    - Test checklist creation by Truck Owner
    - Test checklist editing and deletion
    - Test checklist viewing by Driver
    - Test completion status updates
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 10. Implement chatbot with DeepSeek integration
  - [x] 10.1 Create chatbot API route
    - Create `/api/chatbot/route.ts`
    - Implement POST handler for chat messages
    - Integrate with DeepSeek API
    - Build system context with user role and fleet status
    - Maintain conversation history in session
    - Add error handling and retry logic
    - Implement 5-second timeout
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  - [x] 10.2 Create ChatMessage component
    - Display message bubble with role-based styling
    - Show timestamp
    - Support user and assistant messages
    - _Requirements: 12.1, 12.3_
  - [x] 10.3 Create ChatInterface component
    - Display message history
    - Add message input field and send button
    - Implement auto-scroll to latest message
    - Show loading indicator while waiting for response
    - Display error messages with retry button
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  - [x] 10.4 Create chatbot page
    - Create `/app/(dashboard)/chatbot/page.tsx`
    - Integrate ChatInterface component
    - Initialize empty conversation
    - _Requirements: 12.1_
  - [x] 10.5 Test chatbot functionality
    - Test message sending and receiving
    - Test conversation context maintenance
    - Test error handling (timeout, API failure)
    - Test retry functionality
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 11. Create truck registration functionality
  - [x] 11.1 Create truck storage layer
    - Implement truck storage functions in `fleetStorage.ts`
    - Add functions for truck CRUD operations
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  - [x] 11.2 Create truck registration API route
    - Create `/api/trucks/route.ts`
    - Implement POST handler for truck registration
    - Validate required fields (make, model, year, VIN, license plate)
    - Verify user is Truck Owner
    - Assign unique truck ID
    - _Requirements: 13.1, 13.2, 13.3_
  - [x] 11.3 Add truck registration to fleet management page
    - Add "Register Truck" button and form to fleet management page
    - Implement form with truck details fields
    - Display list of registered trucks
    - _Requirements: 13.1, 13.2, 13.4_
  - [x] 11.4 Add truck registration prompt for drivers without fleet
    - Show message prompting driver to register truck or join fleet
    - Display on dashboard when driver has no fleet
    - _Requirements: 13.5_
  - [x] 11.5 Test truck registration
    - Test truck registration with valid data
    - Test validation for required fields
    - Test truck list display
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 12. Create telemetrics placeholder page


  - [x] 12.1 Create telemetrics page with placeholder UI

    - Create `/app/(dashboard)/telemetrics/page.tsx`
    - Display informational message about future AWS integration
    - Create UI structure for odometer, oil levels, and other metrics
    - Add mock data displays to show intended layout
    - Add route guard (require fleet membership)
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  - [x] 12.2 Test telemetrics page access control

    - Test access for users with fleet membership
    - Test blocked access for drivers without fleet

    - _Requirements: 14.4_

- [x] 13. Create service placeholder page




  - [x] 13.1 Create service page with placeholder UI


    - Create `/app/(dashboard)/service/page.tsx`
    - Display informational message about future AWS integration
    - Create UI structure for maintenance schedules and service history
    - Add mock data displays to show intended layout
    - Add route guard (require fleet membership)
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_
  - [x] 13.2 Test service page access control

    - Test access for users with fleet membership
    - Test blocked access for drivers without fleet
    - _Requirements: 15.4_

- [x] 14. Configure deployment for Netlify




  - [x] 14.1 Create Netlify configuration


    - Create `netlify.toml` with build settings
    - Configure redirects for client-side routing
    - Set up serverless functions directory
    - _Requirements: All requirements depend on successful deployment_
  - [x] 14.2 Set up environment variables


    - Document required environment variables
    - Create `.env.example` file
    - Add instructions for NEXTAUTH_SECRET generation
    - Add instructions for DEEPSEEK_API_KEY setup
    - _Requirements: 3.1, 12.2_
  - [x] 14.3 Test production build


    - Run `npm run build` to verify build succeeds
    - Test production build locally
    - Verify all routes work correctly
    - _Requirements: All requirements_

- [x] 15. Add final polish and error handling




  - [x] 15.1 Implement comprehensive error boundaries


    - Add error boundary components for main sections
    - Create user-friendly error pages
    - Add error logging
    - _Requirements: All requirements benefit from error handling_


  - [x] 15.2 Add loading states

    - Implement loading spinners for async operations
    - Add skeleton screens for data fetching


    - Improve perceived performance
    - _Requirements: All requirements with async operations_
  - [x] 15.3 Implement form validation

    - Add client-side validation for all forms

    - Display inline error messages
    - Prevent invalid form submissions

    - _Requirements: 1.3, 3.5, 6.3, 10.2, 11.2, 13.2_

  - [ ] 15.4 Add responsive design
    - Test and fix mobile layouts
    - Ensure navigation works on small screens
    - Optimize forms for mobile input
    - _Requirements: All UI requirements_
  - [x] 15.5 Perform end-to-end testing

    - Test complete user flows (registration → login → feature usage)
    - Test role switching scenarios
    - Test fleet code lifecycle
    - Test cross-browser compatibility
    - _Requirements: All requirements_
