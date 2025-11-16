# Requirements Document

## Introduction

The Truck Management System is a web-based platform that enables transportation company owners to manage their fleet operations, including truck registration, driver management, maintenance tracking, and telemetrics monitoring. The system supports two user roles: Truck Owners who manage fleets and operations, and Drivers who access assigned resources and complete checklists. The platform will be built using Next.js and deployed on Netlify, with future integration to AWS services for advanced features.

## Glossary

- **TMS**: Truck Management System - the web application being developed
- **Truck Owner**: A user who owns trucks and manages fleet operations
- **Driver**: A user who operates trucks and reports to a Truck Owner
- **Fleet Member**: A Driver who has been added to a Truck Owner's fleet
- **Fleet Code**: A time-limited alphanumeric code used to add Drivers to a fleet
- **Telemetrics**: Real-time and historical data about truck performance (odometer, oil levels, etc.)
- **Driver Checklist**: A customizable list of tasks that Drivers must complete
- **Authentication System**: The login and registration functionality of the TMS
- **Navigation Bar**: The primary navigation interface displaying available features
- **Profile**: User account settings and role management interface
- **Chatbot**: An AI-powered assistant using DeepSeek API for user support

## Requirements

### Requirement 1

**User Story:** As a new user, I want to register for an account and specify my role (Truck Owner or Driver), so that I can access role-appropriate features.

#### Acceptance Criteria

1. WHEN a user navigates to the registration page, THE Authentication System SHALL display input fields for email, password, and role selection (Truck Owner or Driver)
2. WHEN a user submits valid registration information, THE Authentication System SHALL create a new user account with the specified role
3. IF a user submits invalid registration information, THEN THE Authentication System SHALL display specific error messages indicating which fields are invalid
4. WHEN a user completes registration, THE Authentication System SHALL redirect the user to the login page
5. THE Authentication System SHALL store user credentials securely using industry-standard encryption

### Requirement 2

**User Story:** As a registered user, I want to log in to my account, so that I can access the truck management features.

#### Acceptance Criteria

1. WHEN a user navigates to the login page, THE Authentication System SHALL display input fields for email and password
2. WHEN a user submits valid login credentials, THE Authentication System SHALL authenticate the user and redirect to the dashboard
3. IF a user submits invalid login credentials, THEN THE Authentication System SHALL display an error message without revealing which credential is incorrect
4. WHEN a user successfully logs in, THE Authentication System SHALL create a session that persists across page refreshes
5. THE Authentication System SHALL provide a logout option that terminates the user session

### Requirement 3

**User Story:** As a logged-in user, I want to view and update my profile settings including my role, so that I can manage my account information.

#### Acceptance Criteria

1. WHEN a user clicks the Profile tab in the Navigation Bar, THE TMS SHALL display the user's current profile information including email and role
2. THE Profile SHALL allow users to change their role between Truck Owner and Driver
3. WHEN a user updates their role, THE TMS SHALL immediately apply the role change and update available features
4. THE Profile SHALL display additional user information fields (name, contact information)
5. WHEN a user saves profile changes, THE TMS SHALL validate and persist the updated information

### Requirement 4

**User Story:** As a Truck Owner, I want to generate a time-limited Fleet Code, so that I can securely add Drivers to my fleet.

#### Acceptance Criteria

1. WHERE the user role is Truck Owner, WHEN the user clicks "Generate Code To Add Fleet Member" in the Fleet Management tab, THE TMS SHALL create a unique alphanumeric Fleet Code
2. THE TMS SHALL set the Fleet Code expiration to exactly 7 days from generation time
3. THE TMS SHALL display the generated Fleet Code prominently with the expiration date and time
4. WHEN a Fleet Code expires after 7 days, THE TMS SHALL automatically invalidate the code and remove it from display
5. THE TMS SHALL allow only one active Fleet Code per Truck Owner at any given time

### Requirement 5

**User Story:** As a Truck Owner, I want to delete a Fleet Code before it expires, so that I can revoke access if I generated it by mistake.

#### Acceptance Criteria

1. WHERE the user role is Truck Owner, WHEN an active Fleet Code exists, THE TMS SHALL display a delete option next to the Fleet Code
2. WHEN a Truck Owner clicks the delete option, THE TMS SHALL immediately invalidate the Fleet Code
3. WHEN a Fleet Code is deleted, THE TMS SHALL remove it from display and prevent its future use
4. THE TMS SHALL allow the Truck Owner to generate a new Fleet Code after deleting the previous one
5. THE TMS SHALL confirm the deletion action before executing it

### Requirement 6

**User Story:** As a Driver, I want to enter a Fleet Code, so that I can join a Truck Owner's fleet and access fleet resources.

#### Acceptance Criteria

1. WHERE the user role is Driver, WHEN the user has not joined a fleet, THE TMS SHALL display an input field for entering a Fleet Code
2. WHEN a Driver submits a valid and non-expired Fleet Code, THE TMS SHALL add the Driver to the corresponding Truck Owner's fleet
3. IF a Driver submits an invalid or expired Fleet Code, THEN THE TMS SHALL display an error message indicating the code is not valid
4. WHEN a Driver successfully joins a fleet, THE TMS SHALL grant access to Telemetrics, Service, and Driver Checklist features
5. THE TMS SHALL allow a Driver to be associated with only one fleet at a time

### Requirement 7

**User Story:** As a Truck Owner, I want to view all Drivers in my fleet, so that I can manage my team.

#### Acceptance Criteria

1. WHERE the user role is Truck Owner, WHEN the user navigates to the Fleet Management tab, THE TMS SHALL display a list of all Fleet Members
2. THE TMS SHALL display each Fleet Member's name, email, and join date
3. THE TMS SHALL provide a remove option for each Fleet Member in the list
4. WHERE the user role is Truck Owner, THE Fleet Management tab SHALL be visible in the Navigation Bar
5. WHERE the user role is Driver, THE Fleet Management tab SHALL NOT be visible in the Navigation Bar

### Requirement 8

**User Story:** As a Truck Owner, I want to remove a Driver from my fleet, so that I can revoke their access to fleet resources.

#### Acceptance Criteria

1. WHERE the user role is Truck Owner, WHEN the user clicks remove on a Fleet Member, THE TMS SHALL immediately remove the Driver from the fleet
2. WHEN a Driver is removed from a fleet, THE TMS SHALL revoke their access to Telemetrics, Service, and Driver Checklist features
3. WHEN a Driver is removed from a fleet, THE TMS SHALL display a message prompting them to register a truck or join another fleet
4. THE TMS SHALL confirm the removal action before executing it
5. WHEN a Driver is removed, THE TMS SHALL maintain historical data but prevent future access

### Requirement 9

**User Story:** As a user, I want to access a navigation bar with relevant features, so that I can easily navigate the application.

#### Acceptance Criteria

1. WHEN a user logs in, THE Navigation Bar SHALL display tabs for Profile, Telemetrics, Service, Chatbot, and Driver Checklist
2. WHERE the user role is Truck Owner, THE Navigation Bar SHALL additionally display the Fleet Management tab
3. WHERE the user role is Driver AND the user has not joined a fleet, THE Navigation Bar SHALL hide Telemetrics, Service, and Driver Checklist tabs
4. WHEN a user clicks a tab in the Navigation Bar, THE TMS SHALL navigate to the corresponding page
5. THE Navigation Bar SHALL remain visible and accessible on all pages within the application

### Requirement 10

**User Story:** As a Truck Owner, I want to create and manage driver checklists, so that I can ensure Drivers complete required tasks.

#### Acceptance Criteria

1. WHERE the user role is Truck Owner, WHEN the user navigates to the Driver Checklist tab, THE TMS SHALL display options to create, edit, and delete checklists
2. WHEN a Truck Owner creates a checklist, THE TMS SHALL allow adding multiple checklist items with descriptions
3. WHEN a Truck Owner saves a checklist, THE TMS SHALL make it available to all Fleet Members
4. THE TMS SHALL allow Truck Owners to edit existing checklist items and update them in real-time
5. WHEN a Truck Owner deletes a checklist, THE TMS SHALL remove it from all Fleet Members' views

### Requirement 11

**User Story:** As a Driver, I want to view and complete assigned checklists, so that I can fulfill my responsibilities.

#### Acceptance Criteria

1. WHERE the user role is Driver AND the user has joined a fleet, WHEN the user navigates to the Driver Checklist tab, THE TMS SHALL display all checklists created by their Truck Owner
2. THE TMS SHALL allow Drivers to mark checklist items as complete or incomplete
3. WHEN a Driver updates a checklist item status, THE TMS SHALL persist the change and reflect it immediately
4. THE TMS SHALL display the completion status of each checklist item to the Driver
5. WHERE the user role is Driver AND the user has not joined a fleet, THE Driver Checklist tab SHALL NOT be accessible

### Requirement 12

**User Story:** As a user, I want to interact with an AI chatbot, so that I can get help and answers to my questions about the system.

#### Acceptance Criteria

1. WHEN a user clicks the Chatbot tab in the Navigation Bar, THE TMS SHALL display a chat interface
2. WHEN a user submits a message in the chat interface, THE TMS SHALL send the message to the DeepSeek API
3. WHEN the DeepSeek API returns a response, THE TMS SHALL display the response in the chat interface within 5 seconds
4. THE Chatbot SHALL maintain conversation context for the duration of the user session
5. IF the DeepSeek API fails to respond, THEN THE TMS SHALL display an error message and allow the user to retry

### Requirement 13

**User Story:** As a Truck Owner, I want to register trucks in the system, so that I can track and manage my fleet assets.

#### Acceptance Criteria

1. WHERE the user role is Truck Owner, THE TMS SHALL provide an interface to register new trucks with details (make, model, year, VIN, license plate)
2. WHEN a Truck Owner submits truck registration information, THE TMS SHALL validate required fields and create a truck record
3. THE TMS SHALL assign a unique identifier to each registered truck
4. THE TMS SHALL display all registered trucks in the Fleet Management interface
5. WHERE the user role is Driver AND the user has not joined a fleet, THE TMS SHALL display a message prompting them to register a truck or join a fleet

### Requirement 14

**User Story:** As a user with fleet access, I want to view telemetrics data, so that I can monitor truck performance and health.

#### Acceptance Criteria

1. WHERE the user has fleet access, WHEN the user navigates to the Telemetrics tab, THE TMS SHALL display a placeholder interface for telemetrics data
2. THE Telemetrics interface SHALL include sections for odometer readings, oil levels, and other performance metrics
3. THE TMS SHALL prepare the interface for future integration with AWS services for real-time data
4. WHERE the user role is Driver AND the user has not joined a fleet, THE Telemetrics tab SHALL NOT be accessible
5. THE TMS SHALL display a message indicating that telemetrics data will be available in future updates

### Requirement 15

**User Story:** As a user with fleet access, I want to access truck maintenance and service features, so that I can track maintenance schedules and history.

#### Acceptance Criteria

1. WHERE the user has fleet access, WHEN the user navigates to the Service tab, THE TMS SHALL display a placeholder interface for maintenance tracking
2. THE Service interface SHALL include sections for scheduled maintenance, service history, and maintenance alerts
3. THE TMS SHALL prepare the interface for future integration with AWS services for maintenance management
4. WHERE the user role is Driver AND the user has not joined a fleet, THE Service tab SHALL NOT be accessible
5. THE TMS SHALL display a message indicating that service features will be available in future updates
