const mongoose = require('mongoose');
const Log = require('./models/Logs');
require('dotenv').config();

const sampleData = [
  {
    type: 'weight',
    value: '75.5',
    unit: 'kg',
    notes: 'Morning before breakfast',
    date: new Date('2024-01-15')
  },
  {
    type: 'weight',
    value: '75.2',
    unit: 'kg',
    notes: 'Morning before breakfast',
    date: new Date('2024-01-16')
  },
  {
    type: 'measurement',
    value: '85',
    unit: 'cm',
    notes: 'Waist circumference',
    date: new Date('2024-01-15')
  },
  {
    type: 'mood',
    value: '8',
    unit: null,
    notes: 'Good day, lots of energy',
    date: new Date('2024-01-15')
  },
  {
    type: 'energy',
    value: '7',
    unit: null,
    notes: 'Average energy level',
    date: new Date('2024-01-15')
  },
  {
    type: 'sleep',
    value: '7.5',
    unit: 'hours',
    notes: 'Good sleep, but could be longer',
    date: new Date('2024-01-15')
  },
  {
    type: 'exercise',
    value: '45',
    unit: 'minutes',
    notes: 'Jogging in the park',
    date: new Date('2024-01-15')
  },
  {
    type: 'nutrition',
    value: '1800',
    unit: 'calories',
    notes: 'Healthy diet, lots of vegetables',
    date: new Date('2024-01-15')
  },
  {
    type: 'water',
    value: '8',
    unit: 'glasses',
    notes: 'Good hydration',
    date: new Date('2024-01-15')
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Log.deleteMany({});
    console.log('Cleared existing data');

    // Add sample data
    const logs = await Log.insertMany(sampleData);
    console.log(`Added ${logs.length} sample logs`);

    // Show statistics
    const stats = await Log.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\nStatistics of added data:');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} entries`);
    });

    console.log('\n✅ Database has been populated with sample data!');
    console.log('You can now test the API:');
    console.log('- GET http://localhost:4000/logs');
    console.log('- GET http://localhost:4000/logs/stats/summary');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run seeding if file is called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase; 