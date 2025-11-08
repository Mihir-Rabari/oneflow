# OneFlow - Plan to Bill in One Place 🚀

**Status:** ✅ Production Ready | 🎉 Fully Integrated | 🚀 November 2025 Hackathon

**Last Updated:** November 9, 2025

A comprehensive project management platform that streamlines the complete project lifecycle from planning → execution → billing with real-time API integration, role-based access control, and advanced task management.

## 📋 Overview

OneFlow is a modular SaaS platform designed for teams to handle projects end-to-end:
- **Plan**: Projects, tasks, people, deadlines with Kanban & Gantt views
- **Execute**: Enhanced task boards, hour logging, status tracking, drag-and-drop management
- **Bill & Track Money**: Sales Orders, Purchase Orders, Invoices, Bills, Expenses with real-time profitability tracking
- **Collaborate**: Team management, collapsible sidebar, role-based dashboards

## ✨ Key Features

### **Core Functionality**
- 🔐 **Secure Authentication** with OTP verification and JWT tokens
- 👥 **Role-Based Access Control** (Admin, Project Manager, Team Member, Sales/Finance)
- 📊 **Project Management** with budget tracking, progress monitoring, and status updates
- 💰 **Financial Management** (Sales Orders, Purchase Orders, Invoices, Bills, Expenses)
- 📈 **Analytics Dashboard** with revenue, cost, and profit tracking for all roles
- 📧 **Email Notifications** with beautiful Handlebars templates

### **Enhanced Task Management** 🎯
- ✅ **Dual View System**: Toggle between Kanban and Gantt views
- 📋 **Kanban Board**: 4-column layout (New → In Progress → Blocked → Done)
- 📊 **Gantt Timeline**: List view with dates, hours, and status tracking
- ✏️ **Task CRUD**: Create, Edit, Delete tasks with full dialog forms
- 🎨 **Priority Management**: Visual badges (Low, Medium, High, Urgent)
- ⏰ **Time Tracking**: Due dates, estimated hours, actual hours
- 🗑️ **Quick Actions**: Hover-based edit/delete buttons on all task cards
- 📝 **Task Progress**: Progress percentage tracking (0-100%)

### **UI/UX Enhancements** 🎨
- 🎯 **Collapsible Sidebar**: Toggle between full-width and icon-only mode
- 🖼️ **Smooth Animations**: Transition effects for all interactions
- 📱 **Fully Responsive**: Mobile-first design for all screen sizes
- 🌓 **Light/Dark Theme** support with CSS variables
- 💫 **Professional Design**: Clean, minimalistic Supabase-inspired aesthetic

### **Advanced Features**
- ⏱️ **Timesheet Tracking** with billable/non-billable hours
- 👥 **Team Management**: View all members with roles and details
- 🔔 **Real-time Updates** via optimistic UI updates
- 🔍 **Search & Filters**: Across projects, tasks, and documents
- 📊 **Comprehensive Settings**: Complete project details with team member display

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

### Projects
- `GET /projects` - Get all projects (filtered by user access)
- `POST /projects` - Create project
- `GET /projects/:id` - Get project details with team members
- `PATCH /projects/:id` - Update project (name, status, budget, etc.)
- `DELETE /projects/:id` - Delete project
- `GET /projects/:id/stats` - Get project statistics

### Tasks
- `GET /tasks` - Get all tasks
- `GET /tasks/project/:projectId` - Get tasks by project (Kanban format)
- `POST /tasks` - Create task
- `GET /tasks/:id` - Get task details
- `PATCH /tasks/:id` - Update task (title, status, priority, progress, etc.)
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/comments` - Add comment to task

### Billing
- **Sales Orders**: `GET, POST, PATCH, DELETE /sales-orders`
- **Purchase Orders**: `GET, POST, PATCH, DELETE /purchase-orders`
- **Invoices**: `GET, POST, PATCH, DELETE /invoices`
- **Vendor Bills**: `GET, POST, PATCH, DELETE /vendor-bills`
- **Expenses**: `GET, POST, PATCH, DELETE /expenses`
- **Products**: `GET, POST, PATCH, DELETE /products`

### Analytics
- `GET /analytics/dashboard` - Dashboard statistics (all roles)
- `GET /analytics/financial-report` - Financial reports (Admin/PM)
- `GET /analytics/team-performance` - Team metrics (Admin/PM)
- `GET /analytics/project-timeline/:projectId` - Project timeline (all roles)

## 📧 Email Templates

OneFlow includes beautiful, responsive Handlebars email templates for:
- ✅ OTP Verification
- 🎉 Welcome Email
- 🔑 New User Credentials
- 🔒 Password Reset
- 📋 Task Assignment
- 📊 Project Invitation

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
