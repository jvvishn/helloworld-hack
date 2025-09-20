// BEGIN FILE: seedDatabase.js
const { db, auth } = require('../src/config/firebase');
const { faker } = require('@faker-js/faker');

const seedUsers = async (count = 5) => {
  console.log('Seeding users...');
  const users = [];
  for (let i = 0; i < count; i++) {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const name = faker.person.fullName();

    try {
    // Create a user in Firebase Auth
      const userRecord = await auth.createUser({ email, password, displayName: name });
      
      // Store extra profile data in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        name,
        email,
        createdAt: new Date(),
        profile: {
          learningStyle: faker.helpers.arrayElement(['Visual', 'Auditory', 'Kinesthetic']),
          subjects: faker.helpers.arrayElements(['CS 301', 'MA 261', 'PHYS 241', 'ENGL 106'], { min: 1, max: 3 }),
          schedule: {
            // Mocking some busy times
            Monday: [{ start: '09:00', end: '10:00' }],
            Tuesday: [{ start: '13:00', end: '14:00' }],
            Wednesday: [{ start: '10:00', end: '11:00' }],
          },
          preferences: {},
        }
      });
      users.push({ uid: userRecord.uid, name, email });
      console.log(`Created user: ${name}`);
    } catch (error) {
      console.error(`Failed to create user ${email}:`, error.message);
    }
  }
  return users;
};

const seedGroups = async (users) => {
  console.log('Seeding groups...');
  if (users.length < 2) {
    console.error('Not enough users to create groups.');
    return;
  }

  const groupsCollection = db.collection('groups');
  
  // Create a small group with a few members
  const group1Members = users.slice(0, 2).map(u => u.uid);
  const group1 = {
    name: 'Hackathon Wizards',
    subject: 'AI/ML',
    members: group1Members,
    createdBy: group1Members[0],
    createdAt: new Date()
  };
  await groupsCollection.add(group1);
  console.log('Created group: Hackathon Wizards');

  // Create a larger group
  const group2Members = users.slice(2, 5).map(u => u.uid);
  const group2 = {
    name: 'Physics Study Crew',
    subject: 'PHYS 241',
    members: group2Members,
    createdBy: group2Members[0],
    createdAt: new Date()
  };
  await groupsCollection.add(group2);
  console.log('Created group: Physics Study Crew');

  console.log('Database seeding complete!');
};

const runSeed = async () => {
  // Make sure the faker library is installed first!
  try {
    const users = await seedUsers();
    await seedGroups(users);
  } catch (error) {
    console.error('Failed to run seed script:', error);
  }
  process.exit();
};

runSeed();
// END FILE: seedDatabase.js