# Helpdesk Ticket Maintenance System

A full-stack web application for managing helpdesk tickets with multi-level support escalation (L1-L3), inspired by Jira. This system allows users to open, track, manage, and escalate support tickets through a structured workflow.

## Tech Stack

- Express.js (Node.js framework)
- TypeScript
- PostgreSQL (Database)
- Prisma (ORM)
- JWT Authentication
- Jest (Testing)

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
  - Update ticket status (all status types)
  - Complete and resolve C3 tickets
  - Escalate tickets to L3 if unresolved (only C1 and C2 tickets)

- **Advanced Support (L3)**
  - Handle only escalated critical tickets (C1 and C2)
  - Add resolution notes and mark tickets as RESOLVED
  - Update ticket status (all status types)

### Ticket Management
- **Ticket Creation**: Title, description, category, priority, expected completion date
- **Ticket Workflow**:
  1. L1 Agent creates ticket (status: NEW)
  2. L1 Agent works on ticket (status: ATTENDING)
  3. If resolved by L1: mark as COMPLETED
  4. If unresolved: escalate to L2 (status: ESCALATED_L2)
  5. L2 Support assigns critical value and works on ticket
  6. For C3 tickets: L2 can resolve and mark as COMPLETED
  7. For C1/C2 tickets: if unresolved, escalate to L3 (status: ESCALATED_L3)
  8. L3 Support provides final resolution for C1/C2 tickets (status: RESOLVED)

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
- **Ticket Filtering**: By status, priority, and escalation level
- **Action Logging**: Track all actions taken on tickets
- **Escalation Workflow**: Structured path from L1 → L2 → L3

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- npm or yarn
- PostgreSQL (v13+)

### Installation

1. Clone the repository
```bash
# Using SSH
git clone git@github.com:fihrisaldama015/helpdesk-ticket-maintenance-system.git

# Using HTTPS
git clone https://github.com/fihrisaldama015/helpdesk-ticket-maintenance-system.git

cd helpdesk-ticket-maintenance-system
```

2. Install dependencies
```bash
# Using npm
npm install

# Using yarn
yarn install
```

3. Environment Variables

Create a `.env` file in the root directory with the following variables:

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

For testing, create a `.env.test` file:

```
DATABASE_URL="postgresql://postgres:@localhost:5432/ticket_maintenance_test"
```

### Database Setup

1. Create PostgreSQL databases for development and testing:
```sql
CREATE DATABASE ticket_maintenance;
CREATE DATABASE ticket_maintenance_test;
```

2. Run database migrations:
```bash
# Using npm
npm run migrate

# Using yarn
yarn migrate
```

3. Seed the database with sample users:
```bash
# Using npm
npm run seed

# Using yarn
yarn seed
```

4. (Optional) Explore the database with Prisma Studio:
```bash
# Using npm
npm run studio

# Using yarn
yarn studio
```

### Running Tests

1. Run database migrations for testing:
```bash
# Using npm
npm run migrate:test

# Using yarn
yarn migrate:test
```

2. (Optional) Seed the test database with sample users:
```bash
# Using npm
npm run seed:test

# Using yarn
yarn seed:test
```

3. Run tests:
```bash
# Using npm
npm test        # Run all tests
npm run test:watch  # Run tests in watch mode

# Using yarn
yarn test       # Run all tests
yarn test:watch # Run tests in watch mode
```

### Running the Application

```bash
# Development mode
# Using npm
npm run dev

# Using yarn
yarn dev
```

The server will start on http://localhost:5000

```bash
# Production mode
# Using npm
npm run build
npm start

# Using yarn
yarn build
yarn start
```

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
ticket_maintenance/
├── src/                     # Backend source code
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middlewares/         # Express middlewares
│   ├── models/              # Data models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── tests/                   # Test files
│   ├── controllers/         # Controller tests
│   ├── middlewares/         # Middleware tests
│   ├── services/            # Service tests
│   └── setup.ts             # Test setup file
├── prisma/                  # Database ORM
│   ├── migrations/          # Database migrations
│   └── schema.prisma        # Database schema
├── dist/                    # Compiled JavaScript
├── node_modules/            # Dependencies
├── .env                     # Environment variables
├── .env.test                # Test environment variables
├── jest.config.ts           # Jest configuration
├── package.json             # Project metadata
├── tsconfig.json            # TypeScript configuration
└── yarn.lock                # Yarn lockfile
```

## License

[MIT](LICENSE)
