# Testing Guide for Queries Developer

This guide shows how the Queries Developer can test their service methods independently.

---

## 🎯 Testing Methods

### Method 1: Simple Test File (Recommended)

Create a test file in `src/services/tests/[service].test.js`

**Example:** `src/services/tests/user.service.test.js`

```javascript
require('dotenv').config();
const userService = require('../user.service');

async function test() {
  console.log('Testing User Service...');
  
  // Test create
  const user = await userService.create({
    name: 'Test User',
    email: 'test@example.com'
  });
  console.log('✅ Created:', user);
  
  // Test getById
  const found = await userService.getById(user.id);
  console.log('✅ Found:', found);
  
  // Clean up
  await userService.delete(user.id);
  console.log('✅ Deleted');
}

test();
```

**Run:**
```bash
node src/services/tests/user.service.test.js
```

---

### Method 2: Using Prisma Studio

Visual way to see database changes:

```bash
npx prisma studio
```

Opens browser at `http://localhost:5555` where you can:
- View all data
- Add records manually
- Edit records
- Delete records

Then test your service methods to confirm they work with this data.

---

### Method 3: Shared Git Repository

**Best for team collaboration:**

1. All team members clone the same repository:
   ```bash
   git clone <repository-url>
   cd medical-clinic-management-system
   ```

2. Each developer has their own `.env` file:
   ```env
   DATABASE_URL="postgresql://user:pass@localhost:5432/dev_database"
   ```

3. Queries Developer:
   - Creates service file
   - Tests it locally
   - Commits and pushes:
     ```bash
     git add src/services/user.service.js
     git commit -m "Add user service"
     git push
     ```

4. Business Logic Developer (you):
   - Pulls changes:
     ```bash
     git pull
     ```
   - Uses service in controllers

---

### Method 4: Interactive Node REPL

Quick testing in terminal:

```bash
node
```

Then:
```javascript
require('dotenv').config();
const userService = require('./src/services/user.service');

// Test methods interactively
await userService.getAll();
await userService.create({ name: 'Test', email: 'test@test.com' });
```

---

### Method 5: Automated Tests (Advanced)

Using Jest or Mocha:

**Install Jest:**
```bash
npm install --save-dev jest @types/jest
```

**Create test:** `src/services/__tests__/user.service.test.js`

```javascript
const userService = require('../user.service');

describe('UserService', () => {
  test('should get all users', async () => {
    const users = await userService.getAll();
    expect(Array.isArray(users)).toBe(true);
  });

  test('should create user', async () => {
    const user = await userService.create({
      name: 'Test',
      email: 'test@example.com'
    });
    expect(user).toHaveProperty('id');
    expect(user.name).toBe('Test');
  });
});
```

**Run tests:**
```bash
npm test
```

---

## 📋 Recommended Workflow

### For Queries Developer:

1. **Setup** (one time):
   ```bash
   git clone <repo>
   npm install
   cp .env.example .env
   # Edit .env with database URL
   npx prisma generate
   npx prisma migrate dev
   ```

2. **Create service** (`src/services/user.service.js`)

3. **Create test file** (`src/services/tests/user.service.test.js`)

4. **Test locally**:
   ```bash
   node src/services/tests/user.service.test.js
   ```

5. **Verify with Prisma Studio**:
   ```bash
   npx prisma studio
   ```

6. **Commit and push**:
   ```bash
   git add src/services/user.service.js
   git commit -m "Add user service with CRUD operations"
   git push
   ```

7. **Notify team**: "User service ready in `src/services/user.service.js`"

### For Business Logic Developer (you):

1. **Pull changes**:
   ```bash
   git pull
   ```

2. **Review service methods**:
   - Check `src/services/user.service.js`
   - Understand available methods

3. **Use in controller**:
   ```javascript
   const userService = require('../services/user.service');
   ```

4. **Test integration**:
   - Create controller
   - Create routes
   - Test with Postman/Thunder Client

---

## 🔧 Quick Test Template

Create this file for any service:

```javascript
// src/services/tests/[service].service.test.js
require('dotenv').config();
const service = require('../[service].service');

async function runTests() {
  try {
    console.log('🧪 Testing [Service] Service\n');

    // Test getAll
    console.log('Test: getAll()');
    const all = await service.getAll();
    console.log('✅ Found:', all.length, 'records\n');

    // Test create
    console.log('Test: create()');
    const created = await service.create({
      // your data
    });
    console.log('✅ Created:', created.id, '\n');

    // Test getById
    console.log('Test: getById()');
    const found = await service.getById(created.id);
    console.log('✅ Found:', found, '\n');

    // Test update
    console.log('Test: update()');
    const updated = await service.update(created.id, {
      // updated data
    });
    console.log('✅ Updated:', updated, '\n');

    // Test delete
    console.log('Test: delete()');
    await service.delete(created.id);
    console.log('✅ Deleted\n');

    console.log('🎉 All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runTests();
```

---

## ✅ Summary

**Best approach for your team:**

1. **Shared Git Repository** - Everyone clones the same project
2. **Local .env** - Each developer has their own database
3. **Test files** - Queries Developer creates test files
4. **Prisma Studio** - Visual verification
5. **Git workflow** - Push/pull to share code

**Commands Queries Developer needs:**
```bash
# Setup (once)
npm install
npx prisma generate
npx prisma migrate dev

# Testing
node src/services/tests/[service].service.test.js
npx prisma studio

# Share
git add src/services/[service].service.js
git commit -m "Add service"
git push
```

**You (Business Logic):**
```bash
# Get updates
git pull

# Use service
const service = require('./services/[service].service');
```
