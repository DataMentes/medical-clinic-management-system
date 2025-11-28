/**
 * Simple test file for service methods
 * Developer can run this independently to test queries
 * 
 * Usage: node src/services/tests/user.service.test.js
 */

require('dotenv').config();
const userService = require('../user.service');

async function testUserService() {
  console.log('🧪 Testing User Service...\n');

  try {
    // Test 1: Get all users
    console.log('Test 1: Get all users');
    const users = await userService.getAll();
    console.log('✅ Success:', users.length, 'users found');
    console.log(users);
    console.log('\n---\n');

    // Test 2: Create user
    console.log('Test 2: Create new user');
    const newUser = await userService.create({
      name: 'Test User',
      email: `test${Date.now()}@example.com`
    });
    console.log('✅ Success: User created');
    console.log(newUser);
    console.log('\n---\n');

    // Test 3: Get user by ID
    console.log('Test 3: Get user by ID');
    const user = await userService.getById(newUser.id);
    console.log('✅ Success: User found');
    console.log(user);
    console.log('\n---\n');

    // Test 4: Update user
    console.log('Test 4: Update user');
    const updated = await userService.update(newUser.id, {
      name: 'Updated Name'
    });
    console.log('✅ Success: User updated');
    console.log(updated);
    console.log('\n---\n');

    // Test 5: Delete user
    console.log('Test 5: Delete user');
    await userService.delete(newUser.id);
    console.log('✅ Success: User deleted');
    console.log('\n---\n');

    console.log('🎉 All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
testUserService();
