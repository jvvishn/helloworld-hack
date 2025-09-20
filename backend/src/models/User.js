const { db } = require('../config/firebase');

class User {
  constructor(data) {
    this.uid = data.uid;
    this.name = data.name;
    this.email = data.email;
    this.profile = data.profile || {};
    this.createdAt = data.createdAt || new Date();
  }

  // Save user to Firestore
  async save() {
    try {
      await db.collection('users').doc(this.uid).set({
        name: this.name,
        email: this.email,
        profile: this.profile,
        createdAt: this.createdAt
      });
      return this;
    } catch (error) {
      throw new Error(`Failed to save user: ${error.message}`);
    }
  }

  // Find user by UID
  static async findById(uid) {
    try {
      const doc = await db.collection('users').doc(uid).get();
      if (!doc.exists) {
        return null;
      }
      return new User({ uid, ...doc.data() });
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const snapshot = await db.collection('users').where('email', '==', email).get();
      if (snapshot.empty) {
        return null;
      }
      const doc = snapshot.docs[0];
      return new User({ uid: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      await db.collection('users').doc(this.uid).update({
        profile: { ...this.profile, ...profileData },
        updatedAt: new Date()
      });
      this.profile = { ...this.profile, ...profileData };
      return this;
    } catch (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }
}

module.exports = User;
