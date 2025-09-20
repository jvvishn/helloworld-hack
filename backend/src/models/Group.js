const { db } = require('../config/firebase');

class Group {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.subject = data.subject;
    this.members = data.members || [];
    this.maxMembers = data.maxMembers || 4;
    this.schedule = data.schedule || {};
    this.location = data.location;
    this.status = data.status || 'active';
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt || new Date();
  }

  // Save group to Firestore
  async save() {
    try {
      const groupRef = this.id ? 
        db.collection('groups').doc(this.id) : 
        db.collection('groups').doc();
      
      this.id = groupRef.id;
      
      await groupRef.set({
        name: this.name,
        subject: this.subject,
        members: this.members,
        maxMembers: this.maxMembers,
        schedule: this.schedule,
        location: this.location,
        status: this.status,
        createdBy: this.createdBy,
        createdAt: this.createdAt
      });
      
      return this;
    } catch (error) {
      throw new Error(`Failed to save group: ${error.message}`);
    }
  }

  // Find group by ID
  static async findById(groupId) {
    try {
      const doc = await db.collection('groups').doc(groupId).get();
      if (!doc.exists) {
        return null;
      }
      return new Group({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error(`Failed to find group: ${error.message}`);
    }
  }

  // Find groups by member
  static async findByMember(userId) {
    try {
      const snapshot = await db.collection('groups')
        .where('members', 'array-contains', userId)
        .get();
      
      return snapshot.docs.map(doc => 
        new Group({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      throw new Error(`Failed to find groups by member: ${error.message}`);
    }
  }

  // Add member to group
  async addMember(userId) {
    try {
      if (this.members.includes(userId)) {
        throw new Error('User is already a member');
      }
      
      if (this.members.length >= this.maxMembers) {
        throw new Error('Group is full');
      }

      this.members.push(userId);
      await db.collection('groups').doc(this.id).update({
        members: this.members,
        updatedAt: new Date()
      });
      
      return this;
    } catch (error) {
      throw new Error(`Failed to add member: ${error.message}`);
    }
  }

  // Remove member from group
  async removeMember(userId) {
    try {
      this.members = this.members.filter(id => id !== userId);
      await db.collection('groups').doc(this.id).update({
        members: this.members,
        updatedAt: new Date()
      });
      
      return this;
    } catch (error) {
      throw new Error(`Failed to remove member: ${error.message}`);
    }
  }

  static async findAll() {
    try {
        const snapshot = await db.collection('groups').get();
        return snapshot.docs.map(doc => new Group({ id: doc.id, ...doc.data() }));
    } catch (error) {
        throw new Error(`Failed to fetch groups: ${error.message}`);
    }
  }

}

module.exports = Group;
