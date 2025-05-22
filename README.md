# Helpdesk Ticket Maintenance System

This is a full-stack web application for managing helpdesk tickets with multi-level support escalation (L1-L3), inspired by Jira. This system allows users to open, track, manage, and escalate support tickets through a structured workflow.

### Owner:
Muhamad Fihris Aldama (fihrisaldama015@gmail.com)

## Tech Stack

### Frontend
- React 18 (Vite)
- TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API requests
- React Hook Form for form handling
- Zustand for state management
- Jest & Testing Library for testing

### Backend
- Express.js with TypeScript
- PostgreSQL database
- Prisma ORM
- JWT Authentication
- RESTful API design
- Jest & Supertest for testing

## Features

### Role-based Access Control
- **L1 Helpdesk Agent (L1)**
  - Create new tickets with title, description, category, priority, and expected completion date
  - Update ticket status to NEW, ATTENDING, or COMPLETED only
  - Escalate tickets to L2 if unresolved

- **Technical Support (L2)**
  - View and manage escalated tickets
  - Assign critical values (C1, C2, C3)
  - Add actions and update ticket logs
  - Complete a ticket if resolved
  - Escalate tickets to L3 if unresolved (only C1 and C2 tickets)

- **Advanced Support (L3)**
  - Handle only escalated critical tickets (C1 and C2)
  - Add resolution notes and mark tickets as RESOLVED

### Ticket Management
- **Ticket Creation**: Title, description, category, priority, expected completion date
- **Ticket Workflow**:
  1. L1 Agent creates ticket (status: NEW)
  2. L1 Agent works on ticket (status: ATTENDING)
  3. If resolved by L1: mark as COMPLETED
  4. If unresolved: escalate to L2 (status: ESCALATED_L2)
  5. L2 Support assigns critical value and works on ticket (status: ATTENDING)
  6. L2 can solve and mark as COMPLETED
  7. for C1/C2 tickets: If unresolved: escalate to L3 (status: ESCALATED_L3)
  8. L3 Support works on ticket (status: ATTENDING)
  9. L3 Support provides final resolution for C1/C2 tickets (status: RESOLVED)

- **Status Types**:
  - NEW: Initial state when ticket is created
  - ATTENDING: Ticket is being worked on
  - COMPLETED: Ticket has been completed (by L1 Agent or L2 Support)
  - ESCALATED_L2: Ticket has been escalated to L2 Support
  - ESCALATED_L3: Ticket has been escalated to L3 Support
  - RESOLVED: Ticket has been resolved by L3 Support

- **Priority Levels**: LOW, MEDIUM, HIGH
- **Categories**: HARDWARE, SOFTWARE, NETWORK, ACCESS, OTHER

### Critical Value System
- **C1**: High - System down
- **C2**: Medium - Partial feature issue
- **C3**: Low - Minor problem or inquiry

### Additional Features
- **Ticket Filtering**: By status, priority, category, and escalation level
- **Action Logging**: Track all actions taken on tickets (only for L2 and L3)
- **Escalation Workflow**: Structured path from L1 → L2 → L3

## Setup Instructions

### Prerequisites
my specific system configuration is as follows:
- Node.js (v22.14.0)
- npm (v10.9.2) or yarn (1.22.22)
- PostgreSQL (v13+)

### Clone the Repository

1. Clone the repository:
```bash
# Using SSH
git clone git@github.com:fihrisaldama015/helpdesk-ticket-maintenance-system.git

# Using HTTPS
git clone https://github.com/fihrisaldama015/helpdesk-ticket-maintenance-system.git

cd helpdesk-ticket-maintenance-system
```

### Backend Setup

1. Navigate to the backend directory and install dependencies:
```bash
cd backend

# Using npm
npm install

# Using yarn
yarn install
```

2. Set up environment variables:
   - Create a `.env` file in the backend directory with the following content:
   ```
   # Server configuration
   PORT=5000
   NODE_ENV=development

   # Database connection
   DATABASE_URL="postgresql://postgres:@localhost:5432/ticket_maintenance"

   # Authentication
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRATION=24h
   ```
   - For testing, create a `.env.test` file:
   ```
   DATABASE_URL="postgresql://postgres:@localhost:5432/ticket_maintenance_test"
   ```

3. Database Setup:
   - Create PostgreSQL databases:
   ```sql
   CREATE DATABASE ticket_maintenance;
   CREATE DATABASE ticket_maintenance_test;
   ```
   - Run database migrations:
   ```bash
   # Using npm
   npm run migrate
   # Using yarn
   yarn migrate
   ```
   - Seed the database with sample users:
   ```bash
   # Using npm
   npm run seed
   # Using yarn
   yarn seed
   ```

4. Running the Backend:
   - Development mode:
     ```bash
     # Using npm
     npm run dev
     # Using yarn
     yarn dev
     ```
   - Production mode:
     ```bash
     # Build and start
     npm run build
     npm start
     # or with yarn
     yarn build
     yarn start
     ```
   The server will be available at http://localhost:5000

5. Running Tests:
   ```bash
   # Run database migrations for testing
   npm run migrate:test
   # or
   yarn migrate:test

   # Run tests
   npm test
   # or
   yarn test

   # Run tests in watch mode
   npm run test:watch
   # or
   yarn test:watch

   # Generate test coverage report
   npm run test:coverage
   # or
   yarn test:coverage
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   - If you're currently in the `backend` directory, go up one level and then into frontend:
     ```bash
     cd ../frontend
     ```
   - If you're in the project root directory, simply run:
     ```bash
     cd frontend
     ```
   - To verify you're in the right place, you should see files like `package.json` and the `src` directory

2. Install dependencies:
```bash
# Using npm
npm install

# or using yarn
yarn install
```

3. Create a `.env` file in the frontend directory:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
# Using npm
npm run dev
# or
# Using yarn
yarn dev
```
The frontend will be available at http://localhost:5173

5. Running Tests:
```bash
# Run all tests
npm test
# or
yarn test

# Run tests in watch mode
npm run test:watch
# or
yarn test:watch

# Generate test coverage report
npm run test:coverage
# or
yarn test:coverage
```

6. Building for Production:
```bash
# Create a production build
npm run build
# or
yarn build

# Preview the production build locally
npm run preview
# or
yarn preview
```

The production build will be available in the `dist` directory.

## Sample Credentials

The following accounts are automatically created when you run the database seed script (`npm run seed` or `yarn seed`):

### L1 Helpdesk Agent
- Email: agent@helpdesk.com
- Password: agent123
- Role: L1_AGENT

### L2 Technical Support
- Email: tech@helpdesk.com
- Password: tech123
- Role: L2_SUPPORT

### L3 Advanced Support
- Email: admin@helpdesk.com
- Password: admin123
- Role: L3_SUPPORT

## API Documentation

The API follows RESTful conventions with the following main endpoints:

### Authentication Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user information (requires authentication)

### Ticket Routes
All ticket routes require authentication.

#### All Roles
- `GET /api/tickets` - Get all tickets (with optional filters for status, priority, and escalation)
- `GET /api/tickets/:id` - Get ticket details by ID
- `GET /api/tickets/my-tickets` - Get tickets assigned to the current user

#### L1 Agent (Helpdesk Agent)
- `POST /api/tickets/create` - Create a new ticket with title, description, category, priority, and expected completion date
- `PUT /api/tickets/:id/update-status` - Update ticket status (limited to NEW, ATTENDING, or COMPLETED)
- `PUT /api/tickets/:id/escalate-l2` - Escalate a ticket to L2 support with required escalation notes

#### L2 Support (Technical Support)
- `PUT /api/tickets/:id/set-critical-value` - Assign critical value (C1, C2, C3) to a ticket
- `PUT /api/tickets/:id/escalate-l3` - Escalate a ticket to L3 support (only C1 or C2 tickets)
- `GET /api/tickets/escalated-tickets` - Get tickets escalated to L2 level
- `POST /api/tickets/add-ticket-action/:id` - Add an action with notes and optional status update

#### L3 Support (Advanced Support)
- `PUT /api/tickets/:id/resolve` - Resolve a ticket with required resolution notes
- `GET /api/tickets/escalated-tickets` - Get tickets escalated to L3 level (C1 and C2 only)
- `POST /api/tickets/add-ticket-action/:id` - Add an action with notes and optional status update

## Project Structure

```
helpdesk-ticket_maintenance-system/
├── frontend/               # Frontend React application
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── __tests__/      # Frontend test files
│   │   ├── assets/         # Images, fonts, etc.
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx         # Main App component
│   │   ├── main.tsx        # Application entry point
│   │   └── setupTests.ts   # Test setup configuration
│   ├── .env                # Frontend environment variables
│   ├── index.html          # HTML template
│   ├── package.json        # Frontend dependencies
│   ├── postcss.config.js   # PostCSS configuration
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── tsconfig.json       # TypeScript configuration
├── backend/                # Backend source code
│   ├── src/                # Source code
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middlewares/    # Express middlewares
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── tests/              # Test files
│   │   ├── controllers/    # Controller tests
│   │   ├── middlewares/    # Middleware tests
│   │   ├── services/       # Service tests
│   │   └── setup.ts        # Test setup file
│   ├── prisma/             # Database ORM
│   │   ├── migrations/     # Database migrations
│   │   └── schema.prisma   # Database schema
│   ├── .env                # Environment variables
│   ├── .env.test           # Test environment variables
│   ├── jest.config.ts      # Jest configuration
│   ├── package.json        # Backend dependencies
│   ├── tsconfig.json       # TypeScript configuration
│   └── yarn.lock           # Yarn lockfile
```

## License

[MIT](LICENSE)
