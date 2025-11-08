# 🧪 OneFlow API Testing Guide

## 🚀 Quick Start - Get Everything Running

### **Step 1: Install Dependencies**
```bash
# Already running! ✅
npm install
```

### **Step 2: Set Up Environment**
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your configs (or use defaults for testing)
```

### **Step 3: Start Docker Services**
```bash
# Start PostgreSQL, Redis, Prometheus, Grafana
docker-compose up -d

# Check if services are running
docker ps
```

### **Step 4: Run Database Migrations**
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed database
npm run db:seed
```

### **Step 5: Start the Server**
```bash
# Development mode with hot reload
npm run dev

# Server will start on http://localhost:4000
```

---

## 📮 Testing with Postman (RECOMMENDED)

### **Import the Collection**

1. **Open Postman**
2. Click **"Import"** button (top left)
3. Select **`OneFlow_API.postman_collection.json`** from the root folder
4. Collection will load with 40+ endpoints ready to test!

### **Collection Variables (Auto-managed)**
The collection automatically saves these variables:
- `baseUrl` = `http://localhost:4000`
- `accessToken` = Auto-saved after login
- `refreshToken` = Auto-saved after login
- `userId` = Auto-saved after registration
- `projectId` = Auto-saved after creating project
- `taskId` = Auto-saved after creating task

### **🎯 Complete Test Flow**

#### **1. Register a New User**
```
POST /auth/register

Body:
{
  "email": "test@oneflow.com",
  "name": "Test User",
  "password": "Test@123456"
}

✅ Auto-saves: userId
```

#### **2. Verify Email with OTP**
```
POST /auth/verify-otp

Body:
{
  "email": "test@oneflow.com",
  "otp": "CHECK_YOUR_CONSOLE_LOGS_OR_EMAIL"
}

✅ Auto-saves: accessToken, refreshToken
```

**Note**: Since this is dev mode, OTP will be printed in the server console. Check your terminal!

#### **3. Login (Alternative to OTP)**
```
POST /auth/login

Body:
{
  "email": "test@oneflow.com",
  "password": "Test@123456"
}

✅ Auto-saves: accessToken, refreshToken, userId
```

#### **4. Get Current User**
```
GET /auth/me
Authorization: Bearer {{accessToken}}

✅ Returns your user profile
```

#### **5. Create a Project**
```
POST /projects
Authorization: Bearer {{accessToken}}

Body:
{
  "name": "OneFlow Implementation",
  "description": "Build the complete OneFlow platform",
  "type": "INTERNAL",
  "budget": 100000,
  "startDate": "2025-01-01T00:00:00.000Z",
  "deadline": "2025-12-31T23:59:59.999Z",
  "projectManagerId": "{{userId}}",
  "clientName": "Internal",
  "teamMemberIds": []
}

✅ Auto-saves: projectId
```

#### **6. Create a Task**
```
POST /tasks
Authorization: Bearer {{accessToken}}

Body:
{
  "title": "Implement authentication",
  "description": "Build complete auth system with OTP",
  "projectId": "{{projectId}}",
  "assignedToId": "{{userId}}",
  "priority": "HIGH",
  "dueDate": "2025-12-31T23:59:59.999Z",
  "estimatedHours": 40
}

✅ Auto-saves: taskId
```

#### **7. Get Kanban Board**
```
GET /tasks/project/{{projectId}}/kanban
Authorization: Bearer {{accessToken}}

✅ Returns tasks grouped by status (NEW, IN_PROGRESS, BLOCKED, DONE)
```

#### **8. Log Timesheet**
```
POST /timesheets
Authorization: Bearer {{accessToken}}

Body:
{
  "projectId": "{{projectId}}",
  "taskId": "{{taskId}}",
  "date": "2025-11-08T00:00:00.000Z",
  "hours": 8,
  "description": "Worked on authentication module",
  "billable": true
}

✅ Creates timesheet entry
```

#### **9. Get Project Stats**
```
GET /projects/{{projectId}}/stats
Authorization: Bearer {{accessToken}}

✅ Returns:
- Task counts by status
- Total hours logged
- Budget vs spent
- Revenue and profit
```

#### **10. Update Task Status**
```
PATCH /tasks/{{taskId}}
Authorization: Bearer {{accessToken}}

Body:
{
  "status": "IN_PROGRESS",
  "progress": 50
}

✅ Updates task and invalidates cache
```

---

## 🔥 Testing with cURL

### **1. Health Check**
```bash
curl http://localhost:4000/health
```

### **2. Register**
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@oneflow.com",
    "name": "Test User",
    "password": "Test@123456"
  }'
```

### **3. Verify OTP**
```bash
curl -X POST http://localhost:4000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@oneflow.com",
    "otp": "YOUR_OTP_HERE"
  }'
```

### **4. Login**
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@oneflow.com",
    "password": "Test@123456"
  }'
```

### **5. Get Current User (with token)**
```bash
curl http://localhost:4000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🧪 Testing with VS Code REST Client

Create a file `test.http` in the root folder:

```http
### Variables
@baseUrl = http://localhost:4000
@accessToken = YOUR_TOKEN_HERE

### Health Check
GET {{baseUrl}}/health

### Register
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "test@oneflow.com",
  "name": "Test User",
  "password": "Test@123456"
}

### Verify OTP
POST {{baseUrl}}/auth/verify-otp
Content-Type: application/json

{
  "email": "test@oneflow.com",
  "otp": "123456"
}

### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "test@oneflow.com",
  "password": "Test@123456"
}

### Get Me
GET {{baseUrl}}/auth/me
Authorization: Bearer {{accessToken}}

### Create Project
POST {{baseUrl}}/projects
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Test Project",
  "type": "INTERNAL",
  "startDate": "2025-01-01T00:00:00.000Z",
  "projectManagerId": "USER_ID_HERE"
}
```

---

## 📊 Monitoring & Debugging

### **Check Server Logs**
```bash
# Server logs are in the console where you ran npm run dev
# Also check: logs/error.log and logs/combined.log
```

### **Check Prometheus Metrics**
```
GET http://localhost:4000/metrics
```

### **Check Grafana Dashboard**
```
Open: http://localhost:3001
Username: admin
Password: admin
```

### **Check Redis Cache**
```bash
# Connect to Redis CLI
docker exec -it oneflow-redis redis-cli

# Check all keys
KEYS *

# Get a specific key
GET user:YOUR_USER_ID

# Check TTL
TTL otp:email_verification:test@oneflow.com

# Check OTP keys
KEYS otp:*
```

### **Check PostgreSQL Database**
```bash
# Connect to Postgres
docker exec -it oneflow-postgres psql -U oneflow -d oneflow

# List tables
\dt

# Query users
SELECT * FROM "User";

# Query projects
SELECT * FROM "Project";

# Exit
\q
```

---

## 🎯 Key Testing Scenarios

### **Scenario 1: Complete User Journey**
1. Register → Get userId
2. Verify OTP → Get tokens
3. Create Project → Get projectId
4. Create Task → Get taskId
5. Log Timesheet
6. View Kanban Board
7. Update Task Status
8. Check Project Stats

### **Scenario 2: Team Collaboration**
1. Admin creates project
2. Admin adds team members
3. PM assigns tasks to members
4. Members log timesheets
5. PM views project progress

### **Scenario 3: Cache Performance**
1. Get user by ID (DB query)
2. Get same user again (Cache hit - faster!)
3. Update user profile (Cache updated)
4. Get user again (New cached data)

### **Scenario 4: Security Testing**
1. Try accessing protected route without token (401 error)
2. Try accessing admin route as team member (403 error)
3. Try creating project with invalid data (400 error with validation)
4. Try logging in with wrong password (401 error)
5. Try verifying OTP 6 times (Rate limit block)

---

## 🐛 Common Issues & Solutions

### **Issue 1: "Cannot connect to database"**
```bash
# Solution: Make sure Docker services are running
docker-compose up -d
docker ps
```

### **Issue 2: "Redis connection error"**
```bash
# Solution: Check if Redis is running
docker ps | grep redis

# Restart Redis
docker-compose restart redis
```

### **Issue 3: "OTP not received"**
```bash
# Solution: Check server console logs
# OTP is printed in development mode
# Look for: "OTP for test@oneflow.com: 123456"
```

### **Issue 4: "Token expired"**
```bash
# Solution: Use refresh token
POST /auth/refresh
Body: { "refreshToken": "YOUR_REFRESH_TOKEN" }
```

### **Issue 5: "Module not found"**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Expected Response Times

| Endpoint | First Call (DB) | Cached Call |
|----------|----------------|-------------|
| GET /auth/me | 10-50ms | <1ms |
| GET /users/:id | 20-50ms | <1ms |
| GET /projects/:id | 50-150ms | <1ms |
| GET /projects/:id/stats | 100-300ms | <1ms |
| POST /tasks | 30-80ms | N/A |
| POST /timesheets | 20-60ms | N/A |

---

## 🎉 Success Indicators

✅ **Server Running**: Console shows "Server running on port 4000"  
✅ **Database Connected**: "✅ Database connected successfully"  
✅ **Redis Connected**: "✅ Redis connected successfully"  
✅ **OTPs Working**: OTP printed in console after registration  
✅ **Auth Working**: Login returns accessToken and refreshToken  
✅ **Cache Working**: Second request is <1ms  
✅ **All Tests Pass**: Postman collection runs without errors

---

## 🚀 Pro Tips

1. **Use Postman Collection** - It auto-manages all tokens and IDs
2. **Check Console Logs** - OTPs are printed there in dev mode
3. **Use GET /health** - Quick way to check if server is up
4. **Monitor /metrics** - See real-time performance stats
5. **Check Redis Keys** - Understand what's being cached
6. **Read Server Logs** - Files in `/logs` folder
7. **Test Cache** - Compare response times for same request

---

## 🎊 You're Ready!

Now you can:
- ✅ Test all 40+ API endpoints
- ✅ See caching in action
- ✅ Monitor performance with Prometheus
- ✅ Debug issues with logs
- ✅ Build the frontend with confidence

**Happy Testing! 🚀**
