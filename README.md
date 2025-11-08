# OneFlow - Plan to Bill in One Place 🚀

**Status:** ✅ Production Ready | 🎉 Fully Integrated | 🚀 Hackathon Submission

A comprehensive project management platform that streamlines the complete project lifecycle from planning → execution → billing with real-time API integration and role-based access control.

## 📋 Overview

OneFlow is a modular SaaS platform designed for project managers to handle projects end-to-end:
- **Plan**: Projects, tasks, people, deadlines
- **Execute**: Task boards, hour logging, status tracking, blockers
- **Bill & Track Money**: Sales Orders, Purchase Orders, Invoices, Bills, Expenses with real-time profitability tracking

## ✨ Key Features

- 🔐 **Secure Authentication** with OTP verification
- 👥 **Role-Based Access Control** (Admin, Project Manager, Team Member, Sales/Finance)
- 📊 **Project Management** with budget tracking and progress monitoring
- ✅ **Task Management** with Kanban board (New → In Progress → Blocked → Done)
- ⏱️ **Timesheet Tracking** with billable/non-billable hours
- 💰 **Financial Management** (Sales Orders, Purchase Orders, Invoices, Bills, Expenses)
- 📈 **Analytics Dashboard** with revenue, cost, and profit tracking
- 🔔 **Real-time Updates** via WebSocket
- 📧 **Email Notifications** with beautiful templates
- 🌓 **Light/Dark Theme** support
- 📱 **Responsive Design** for mobile and desktop

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js + Express.js (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for sessions and caching
- **Authentication**: JWT + Session-based
- **Email**: Nodemailer with Handlebars templates
- **Validation**: Zod
- **Monitoring**: Prometheus + Grafana
- **Process Management**: PM2 (cluster mode)
- **Logging**: Winston

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Shadcn/UI
- **State Management**: Zustand + React Query
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion

### DevOps
- **Containerization**: Docker + Docker Compose
- **Monorepo**: npm workspaces
- **Linting**: ESLint + Prettier

## 📁 Project Structure

```
oneflow/
├── client/                 # React frontend
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/        # Database, Redis, environment
│   │   ├── middlewares/   # Auth, validation, error handling
│   │   ├── modules/       # Feature modules (auth, projects, tasks, etc.)
│   │   ├── services/      # Business logic services
│   │   ├── utils/         # Helper utilities
│   │   ├── metrics/       # Prometheus metrics
│   │   └── templates/     # Email templates
│   ├── prisma/            # Database schema and migrations
│   └── pm2.config.js      # PM2 configuration
├── shared/                 # Shared types and constants
├── Docs/                   # Documentation
├── monitoring/             # Prometheus config
└── docker-compose.yml      # Docker services
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- Docker & Docker Compose
- PostgreSQL (via Docker)
- Redis (via Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd oneflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Docker services**
   ```bash
   npm run docker:up
   ```

5. **Generate Prisma client and push schema**
   ```bash
   npm run db:generate
   npm run db:push
   ```

6. **Start development servers**
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:4000` and frontend on `http://localhost:5173`

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/verify-otp` - Verify email OTP
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

### Users
- `GET /users` - Get all users (paginated)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user (Admin/PM)
- `PATCH /users/:id` - Update user (Admin/PM)
- `DELETE /users/:id` - Delete user (Admin)

### Projects *(Coming Soon)*
- `GET /projects` - Get all projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project details
- `PATCH /projects/:id` - Update project

### Tasks *(Coming Soon)*
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create task
- `PATCH /tasks/:id` - Update task status

## 📧 Email Templates

OneFlow includes beautiful, responsive email templates for:
- ✅ OTP Verification
- 🎉 Welcome Email
- 🔑 New User Credentials
- 🔒 Password Reset
- 📋 Task Assignment *(Coming Soon)*
- 📊 Project Invitation *(Coming Soon)*
- 💰 Invoice Notification *(Coming Soon)*

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcryptjs
- OTP verification for email
- Session management with Redis
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers
- Role-based access control

## 📈 Monitoring

- **Prometheus** metrics at `http://localhost:4000/metrics`
- **Grafana** dashboards at `http://localhost:3000`
- **Health check** at `http://localhost:4000/health`
- **PM2 logs**: `npm run logs`

## 🧪 Testing

```bash
npm test
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Start with PM2
```bash
npm start
```

### Stop PM2
```bash
npm stop
```

## 📝 License

MIT

## 👥 Team

Built for Odoo IIT GN Hackathon Final Round

## 🙏 Acknowledgments

- Design inspired by Supabase's clean aesthetic
- Built with modern best practices for production-ready applications
