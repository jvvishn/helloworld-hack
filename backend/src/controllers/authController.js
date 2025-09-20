const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { auth, db } = require('../config/firebase');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      // Check if user exists in Firebase Auth
      try {
        await auth.getUserByEmail(email);
        return res.status(400).json({ message: 'User already exists' });
      } catch (error) {
        // User doesn't exist, proceed with registration
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });

      // Store additional user data in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        name,
        email,
        createdAt: new Date(),
        profile: {
          learningStyle: null,
          subjects: [],
          schedule: {},
          preferences: {}
        }
      });

      // Generate JWT token
      const token = jwt.sign(
        { uid: userRecord.uid, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          uid: userRecord.uid,
          name,
          email
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Get user from Firebase Auth
      const userRecord = await auth.getUserByEmail(email);
      
      // Get user data from Firestore
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ message: 'User data not found' });
      }

      const userData = userDoc.data();

      // Generate JWT token
      const token = jwt.sign(
        { uid: userRecord.uid, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          uid: userRecord.uid,
          name: userData.name,
          email: userData.email,
          profile: userData.profile
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ message: 'Invalid credentials' });
    }
  }

  // Get current user
  async getCurrentUser(req, res) {
    try {
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userData = userDoc.data();
      
      res.json({
        success: true,
        user: {
          uid: req.user.uid,
          name: userData.name,
          email: userData.email,
          profile: userData.profile
        }
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user data' });
    }
  }
}

module.exports = new AuthController();
