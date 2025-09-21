const { db, auth, admin } = require('../src/config/firebase');
const { faker } = require('@faker-js/faker');

const seedUsers = async (count = 5) => {
  console.log('Seeding users...');
  const users = [];
  for (let i = 0; i < count; i++) {
    const email = faker.internet.email();
    const password = 'password123';
    const name = faker.person.fullName();

    console.log(`Created user: ${name}, Email: ${email}, Password: ${password}`);

    try {
      const userRecord = await auth.createUser({ email, password, displayName: name });
      
      await db.collection('users').doc(userRecord.uid).set({
        name,
        email,
        createdAt: new Date(),
        profile: {
          learningStyle: faker.helpers.arrayElement(['Visual', 'Auditory', 'Kinesthetic']),
          subjects: faker.helpers.arrayElements(['CS 301', 'MA 261', 'PHYS 241', 'ENGL 106'], { min: 1, max: 3 }),
          schedule: {
            Monday: [{ start: '09:00:00', end: '10:00:00' }],
            Tuesday: [{ start: '13:00:00', end: '14:00:00' }],
            Wednesday: [{ start: '10:00:00', end: '11:00:00' }],
          },
          preferences: {},
          dayPreferences: [0, 1, 2, 3, 4], // 0-4 for Monday-Friday
          classLocations: [
            { location: 'LWSN B146', day: 'Monday', end_time: '10:00' },
            { location: 'MATH G008', day: 'Monday', end_time: '11:00' }
          ]
        }
      });
      users.push({ uid: userRecord.uid, name, email });
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
  
  const group1Members = users.slice(0, 2).map(u => u.uid);
  const group1 = {
    name: 'Hackathon Wizards',
    subject: 'AI/ML',
    members: group1Members,
    createdBy: group1Members[0],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };
  await groupsCollection.add(group1);
  console.log('Created group: Hackathon Wizards');

  const group2Members = users.slice(2, 5).map(u => u.uid);
  const group2 = {
    name: 'Physics Study Crew',
    subject: 'PHYS 241',
    members: group2Members,
    createdBy: group2Members[0],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };
  await groupsCollection.add(group2);
  console.log('Created group: Physics Study Crew');

  console.log('Database seeding complete!');
};

const runSeed = async () => {
  try {
    const users = await seedUsers();
    await seedGroups(users);
  } catch (error) {
    console.error('Failed to run seed script:', error);
  }
  process.exit();
};

runSeed();
