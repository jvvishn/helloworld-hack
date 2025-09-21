const request = require('supertest');
const { app, server } = require('../app');
const { db, auth } = require('../src/config/firebase');

// Describe a group of tests for the Authentication endpoints
describe('Authentication Endpoints', () => {
  let testUserEmail = 'testuser@test.com';
  let testUserPassword = 'password123';
  let testUserId;

  // Before all tests run, set up the environment
  beforeAll(async () => {
    // Make sure we have a clean slate by trying to delete any leftover test user
    try {
      const userRecord = await auth.getUserByEmail(testUserEmail);
      await auth.deleteUser(userRecord.uid);
    } catch (error) {
      // Ignore if user doesn't exist
    }
  });

  // After all tests have finished, clean up the test user and close the server
  afterAll(async () => {
    if (testUserId) {
      // Delete the test user from Firebase Auth
      await auth.deleteUser(testUserId);
      // Delete the test user's data from Firestore
      await db.collection('users').doc(testUserId).delete();
    }
    // Close the server connection
    server.close();
  });

  // Test 1: Successful user registration
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: testUserEmail,
        password: testUserPassword,
      });

    // Check the response status and body
    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe(testUserEmail);
    expect(response.body.token).toBeDefined();

    // Save the user ID for cleanup
    const userRecord = await auth.getUserByEmail(testUserEmail);
    testUserId = userRecord.uid;
  });

  // Test 2: Cannot register with an existing email
  it('should not register a user with an existing email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another User',
        email: testUserEmail,
        password: 'newpassword',
      });

    // Check the response status and error message
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('User already exists');
  });

  // Test 3: Successful user login
  it('should allow an existing user to log in', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUserEmail,
        password: testUserPassword,
      });

    // Check the response status and body
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe(testUserEmail);
    expect(response.body.token).toBeDefined();
  });
});
