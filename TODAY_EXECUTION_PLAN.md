# Today's Execution Plan - Session 1
**Date:** 2025-12-04 22:33 CST  
**Focus:** Foundation Hardening (80%) + Quick Wins (20%)  
**Duration:** 2-3 hours

---

## 🎯 Session Goals

### **Primary (Must Complete)**
1. ✅ Set up automated testing framework
2. ✅ Write first batch of unit tests (20%+ coverage)
3. ✅ Set up database schema (Prisma + SQLite)
4. ✅ Security audit & fix OAuth credential leak

### **Secondary (If Time Permits)**
1. ✅ Begin database migration (error logs)
2. ✅ Add Swagger/OpenAPI setup
3. ✅ Create first agent template

---

## 📋 Execution Steps

### **Step 1: Testing Framework Setup** ⏱️ 20 min
**Priority:** 🔴 CRITICAL

```bash
# Install testing dependencies
cd luxrig-bridge
npm install --save-dev jest supertest @types/jest @types/supertest

# Create Jest config
```

**Files to Create:**
- `luxrig-bridge/jest.config.js` - Jest configuration
- `luxrig-bridge/__tests__/setup.js` - Test setup & mocks
- `luxrig-bridge/package.json` - Add test scripts

**Success Criteria:**
- ✅ `npm test` runs successfully
- ✅ Test runner configured
- ✅ Mock setup working

---

### **Step 2: Unit Tests - Error Service** ⏱️ 30 min
**Priority:** 🔴 CRITICAL

**Files to Create:**
- `luxrig-bridge/__tests__/services/errors.test.js`

**Test Coverage:**
- ✅ Custom error classes (ValidationError, AuthError, etc.)
- ✅ Input validation & sanitization
- ✅ Rate limiting logic
- ✅ Error logging
- ✅ XSS prevention

**Success Criteria:**
- ✅ 80%+ coverage for `errors.js`
- ✅ All error types tested
- ✅ Edge cases covered

---

### **Step 3: Unit Tests - Performance Service** ⏱️ 30 min
**Priority:** 🔴 CRITICAL

**Files to Create:**
- `luxrig-bridge/__tests__/services/performance.test.js`

**Test Coverage:**
- ✅ Performance tracking (latency calculation)
- ✅ Caching (get, set, invalidate)
- ✅ Retry logic with exponential backoff
- ✅ Batch processing

**Success Criteria:**
- ✅ 80%+ coverage for `performance.js`
- ✅ Cache behavior verified
- ✅ Retry logic tested

---

### **Step 4: Database Setup** ⏱️ 30 min
**Priority:** 🔴 CRITICAL

```bash
# Install Prisma
cd luxrig-bridge
npm install --save-dev prisma
npm install @prisma/client

# Initialize Prisma
npx prisma init --datasource-provider sqlite
```

**Files to Create:**
- `luxrig-bridge/prisma/schema.prisma` - Database schema
- `luxrig-bridge/services/database.js` - Database client wrapper

**Schema Design:**
```prisma
model ErrorLog {
  id        String   @id @default(uuid())
  type      String
  message   String
  stack     String?
  timestamp DateTime @default(now())
  metadata  Json?
}

model AgentMemory {
  id        String   @id @default(uuid())
  agentType String
  key       String
  value     Json
  timestamp DateTime @default(now())
  
  @@unique([agentType, key])
}

model PerformanceMetric {
  id        String   @id @default(uuid())
  endpoint  String
  method    String
  duration  Int
  status    Int
  timestamp DateTime @default(now())
}

model UserSession {
  id           String   @id @default(uuid())
  userId       String?
  accessToken  String?  // Encrypted
  refreshToken String?  // Encrypted
  expiresAt    DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

**Success Criteria:**
- ✅ Prisma initialized
- ✅ Schema defined
- ✅ Database created
- ✅ Client wrapper working

---

### **Step 5: Security Audit & OAuth Fix** ⏱️ 30 min
**Priority:** 🔴 CRITICAL

**Tasks:**
1. **Regenerate Google OAuth Credentials**
   - Go to Google Cloud Console
   - Delete old credentials
   - Create new OAuth 2.0 Client ID
   - Update `.env` file

2. **Clean Git History** (Optional, for later)
   - Use BFG Repo-Cleaner or git-filter-repo
   - Remove `.env` from all commits
   - Force push to clean history

3. **Enhance Security**
   - Add PKCE flow to OAuth
   - Implement state parameter validation
   - Encrypt tokens in database
   - Add token rotation

**Files to Modify:**
- `luxrig-bridge/.env` - New credentials
- `luxrig-bridge/services/google.js` - Enhanced OAuth security

**Success Criteria:**
- ✅ New OAuth credentials working
- ✅ `.env` never committed again
- ✅ PKCE flow implemented
- ✅ Tokens encrypted

---

### **Step 6: Database Migration - Error Logs** ⏱️ 20 min
**Priority:** 🟡 HIGH (if time permits)

**Files to Modify:**
- `luxrig-bridge/services/errors.js` - Use DB instead of in-memory array

**Changes:**
```javascript
// Before: In-memory array
const errorLogs = [];

// After: Database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function logError(error) {
  await prisma.errorLog.create({
    data: {
      type: error.constructor.name,
      message: error.message,
      stack: error.stack,
      metadata: error.metadata || {}
    }
  });
}
```

**Success Criteria:**
- ✅ Errors logged to database
- ✅ Error retrieval from DB working
- ✅ No data loss on restart

---

### **Step 7: Swagger/OpenAPI Setup** ⏱️ 20 min
**Priority:** 🟡 HIGH (if time permits)

```bash
cd luxrig-bridge
npm install swagger-jsdoc swagger-ui-express
```

**Files to Create:**
- `luxrig-bridge/config/swagger.js` - Swagger configuration

**Files to Modify:**
- `luxrig-bridge/server.js` - Add Swagger UI endpoint

**Success Criteria:**
- ✅ Swagger UI accessible at `/api-docs`
- ✅ Auto-generated from JSDoc comments
- ✅ Interactive API explorer working

---

### **Step 8: First Agent Template** ⏱️ 15 min
**Priority:** 🟢 MEDIUM (if time permits)

**Files to Create:**
- `luxrig-bridge/templates/build-rest-api.json`

**Template Structure:**
```json
{
  "id": "build-rest-api",
  "name": "Build REST API",
  "description": "Create a production-ready REST API with authentication",
  "steps": [
    {
      "agent": "architect",
      "task": "Design API architecture with endpoints, models, and auth"
    },
    {
      "agent": "code",
      "task": "Generate Express.js server with routes and middleware"
    },
    {
      "agent": "code",
      "task": "Generate Prisma schema and database models"
    },
    {
      "agent": "security",
      "task": "Add authentication, validation, and security headers"
    },
    {
      "agent": "qa",
      "task": "Generate unit and integration tests"
    }
  ]
}
```

**Success Criteria:**
- ✅ Template file created
- ✅ Template loader working
- ✅ Can execute template from UI

---

## 🎯 Success Metrics for Today

### **Must Achieve**
- ✅ Testing framework operational
- ✅ 20%+ test coverage (2 service files tested)
- ✅ Database schema defined
- ✅ OAuth credentials regenerated

### **Nice to Have**
- ✅ Error logs in database
- ✅ Swagger UI live
- ✅ First agent template created

### **Code Quality**
- ✅ All tests passing
- ✅ No new lint errors
- ✅ Code committed to git

---

## 📊 Progress Tracking

### **Completed** ✅
- [ ] Testing framework setup
- [ ] Error service tests (80%+ coverage)
- [ ] Performance service tests (80%+ coverage)
- [ ] Database schema created
- [ ] OAuth credentials regenerated
- [ ] Error logs migrated to DB
- [ ] Swagger UI setup
- [ ] First agent template

### **Blocked** ⚠️
- None yet

### **Deferred** 📅
- Git history cleanup (do later, not urgent)
- Load testing (Week 3-4)
- VS Code extension (Week 5-6)

---

## 🚀 Next Session Preview

### **Session 2 Focus**
1. Complete unit tests for remaining services (agents, google)
2. Integration tests for critical workflows
3. Database migration for agent memory & performance metrics
4. Begin API documentation (Swagger annotations)
5. Security enhancements (PKCE, token encryption)

---

## 💡 Quick Reference

### **Run Tests**
```bash
cd luxrig-bridge
npm test                    # Run all tests
npm test -- --coverage      # With coverage report
npm test -- --watch         # Watch mode
```

### **Database Commands**
```bash
cd luxrig-bridge
npx prisma migrate dev      # Create migration
npx prisma studio           # Open database GUI
npx prisma generate         # Generate client
```

### **Check Services**
```bash
# Health check
curl http://localhost:3456/health

# View errors
curl http://localhost:3456/monitoring/errors

# View metrics
curl http://localhost:3456/monitoring/metrics
```

---

**Let's execute! Starting with Step 1...**
