const mongoose = require('mongoose');
const Log = require('./models/Logs');
const Meal = require("./models/Meal");
const MealProduct = require("./models/MealProduct");
const Product = require("./models/Product");
const DailyNutrition = require("./models/DailyNutrition");
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

// Sample meals data
const sampleMeals = [
  {
    name: 'Śniadanie',
    date: new Date('2024-01-15'),
    time: '08:30',
    notes: 'Dobre śniadanie przed pracą'
  },
  {
    name: 'Drugie śniadanie',
    date: new Date('2024-01-15'),
    time: '11:00',
    notes: 'Przekąska w pracy'
  },
  {
    name: 'Obiad',
    date: new Date('2024-01-15'),
    time: '14:00',
    notes: 'Ciepły obiad w domu'
  },
  {
    name: 'Podwieczorek',
    date: new Date('2024-01-15'),
    time: '16:30',
    notes: 'Owoc i orzechy'
  },
  {
    name: 'Kolacja',
    date: new Date('2024-01-15'),
    time: '19:30',
    notes: 'Lekka kolacja'
  },
  {
    name: 'Śniadanie',
    date: new Date('2024-01-16'),
    time: '09:00',
    notes: 'Weekendowe śniadanie'
  },
  {
    name: 'Obiad',
    date: new Date('2024-01-16'),
    time: '13:30',
    notes: 'Rodzinny obiad'
  },
  {
    name: 'Kolacja',
    date: new Date('2024-01-16'),
    time: '20:00',
    notes: 'Wieczorna kolacja'
  }
];

// Sample products data (mock products for seeding)
const sampleProducts = [
  {
    code: '1234567890123',
    name: 'Chleb pełnoziarnisty',
    brands: 'Piekarnia XYZ',
    nutriscore: 'A',
    nutriments: {
      'energy-kcal_100g': 250,
      proteins_100g: 12.5,
      fat_100g: 3.2,
      'saturated-fat_100g': 0.8,
      carbohydrates_100g: 45.0,
      sugars_100g: 5.2,
      salt_100g: 1.1
    }
  },
  {
    code: '2345678901234',
    name: 'Masło',
    brands: 'Mleczarnia ABC',
    nutriscore: 'D',
    nutriments: {
      'energy-kcal_100g': 750,
      proteins_100g: 0.8,
      fat_100g: 82.5,
      'saturated-fat_100g': 52.0,
      carbohydrates_100g: 0.6,
      sugars_100g: 0.6,
      salt_100g: 0.02
    }
  },
  {
    code: '3456789012345',
    name: 'Jabłko',
    brands: 'Sad XYZ',
    nutriscore: 'A',
    nutriments: {
      'energy-kcal_100g': 52,
      proteins_100g: 0.3,
      fat_100g: 0.2,
      'saturated-fat_100g': 0.0,
      carbohydrates_100g: 13.8,
      sugars_100g: 10.4,
      salt_100g: 0.0
    }
  },
  {
    code: '4567890123456',
    name: 'Kurczak (pierś)',
    brands: 'Ferma ABC',
    nutriscore: 'A',
    nutriments: {
      'energy-kcal_100g': 165,
      proteins_100g: 31.0,
      fat_100g: 3.6,
      'saturated-fat_100g': 1.0,
      carbohydrates_100g: 0.0,
      sugars_100g: 0.0,
      salt_100g: 0.1
    }
  },
  {
    code: '5678901234567',
    name: 'Ryż brązowy',
    brands: 'Ziarno XYZ',
    nutriscore: 'A',
    nutriments: {
      'energy-kcal_100g': 111,
      proteins_100g: 2.6,
      fat_100g: 0.9,
      'saturated-fat_100g': 0.2,
      carbohydrates_100g: 23.0,
      sugars_100g: 0.4,
      salt_100g: 0.0
    }
  },
  {
    code: '6789012345678',
    name: 'Jogurt naturalny',
    brands: 'Mleczarnia DEF',
    nutriscore: 'B',
    nutriments: {
      'energy-kcal_100g': 59,
      proteins_100g: 10.0,
      fat_100g: 0.4,
      'saturated-fat_100g': 0.2,
      carbohydrates_100g: 3.6,
      sugars_100g: 3.6,
      salt_100g: 0.1
    }
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Log.deleteMany({});
    await Meal.deleteMany({});
    await MealProduct.deleteMany({});
    await DailyNutrition.deleteMany({});
    console.log("Cleared existing data");

    // Add sample logs
    const logs = await Log.insertMany(sampleData);
    console.log(`Added ${logs.length} sample logs`);

    // Add sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`Added ${products.length} sample products`);

    // Add sample meals
    const meals = await Meal.insertMany(sampleMeals);
    console.log(`Added ${meals.length} sample meals`);

    // Add sample meal products
    const mealProducts = [];

    // Śniadanie 15.01 - chleb z masłem i jabłko
    const breakfast15 = meals.find(
      (m) =>
        m.name === "Śniadanie" &&
        m.date.toDateString() === new Date("2024-01-15").toDateString()
    );
    const bread = products.find((p) => p.name === "Chleb pełnoziarnisty");
    const butter = products.find((p) => p.name === "Masło");
    const apple = products.find((p) => p.name === "Jabłko");

    if (breakfast15 && bread && butter && apple) {
      mealProducts.push(
        {
          mealId: breakfast15._id,
          productId: bread._id,
          quantity: 80,
          unit: "g",
        },
        {
          mealId: breakfast15._id,
          productId: butter._id,
          quantity: 15,
          unit: "g",
        },
        {
          mealId: breakfast15._id,
          productId: apple._id,
          quantity: 150,
          unit: "g",
        }
      );
    }

    // Drugie śniadanie 15.01 - jogurt
    const secondBreakfast15 = meals.find(
      (m) =>
        m.name === "Drugie śniadanie" &&
        m.date.toDateString() === new Date("2024-01-15").toDateString()
    );
    const yogurt = products.find((p) => p.name === "Jogurt naturalny");

    if (secondBreakfast15 && yogurt) {
      mealProducts.push({
        mealId: secondBreakfast15._id,
        productId: yogurt._id,
        quantity: 200,
        unit: "g",
      });
    }

    // Obiad 15.01 - kurczak z ryżem
    const lunch15 = meals.find(
      (m) =>
        m.name === "Obiad" &&
        m.date.toDateString() === new Date("2024-01-15").toDateString()
    );
    const chicken = products.find((p) => p.name === "Kurczak (pierś)");
    const rice = products.find((p) => p.name === "Ryż brązowy");

    if (lunch15 && chicken && rice) {
      mealProducts.push(
        {
          mealId: lunch15._id,
          productId: chicken._id,
          quantity: 150,
          unit: "g",
        },
        { mealId: lunch15._id, productId: rice._id, quantity: 100, unit: "g" }
      );
    }

    // Podwieczorek 15.01 - jabłko
    const snack15 = meals.find(
      (m) =>
        m.name === "Podwieczorek" &&
        m.date.toDateString() === new Date("2024-01-15").toDateString()
    );

    if (snack15 && apple) {
      mealProducts.push({
        mealId: snack15._id,
        productId: apple._id,
        quantity: 100,
        unit: "g",
      });
    }

    // Kolacja 15.01 - chleb z masłem
    const dinner15 = meals.find(
      (m) =>
        m.name === "Kolacja" &&
        m.date.toDateString() === new Date("2024-01-15").toDateString()
    );

    if (dinner15 && bread && butter) {
      mealProducts.push(
        { mealId: dinner15._id, productId: bread._id, quantity: 60, unit: "g" },
        { mealId: dinner15._id, productId: butter._id, quantity: 10, unit: "g" }
      );
    }

    // Śniadanie 16.01 - chleb z masłem
    const breakfast16 = meals.find(
      (m) =>
        m.name === "Śniadanie" &&
        m.date.toDateString() === new Date("2024-01-16").toDateString()
    );

    if (breakfast16 && bread && butter) {
      mealProducts.push(
        {
          mealId: breakfast16._id,
          productId: bread._id,
          quantity: 100,
          unit: "g",
        },
        {
          mealId: breakfast16._id,
          productId: butter._id,
          quantity: 20,
          unit: "g",
        }
      );
    }

    // Obiad 16.01 - kurczak z ryżem
    const lunch16 = meals.find(
      (m) =>
        m.name === "Obiad" &&
        m.date.toDateString() === new Date("2024-01-16").toDateString()
    );

    if (lunch16 && chicken && rice) {
      mealProducts.push(
        {
          mealId: lunch16._id,
          productId: chicken._id,
          quantity: 200,
          unit: "g",
        },
        { mealId: lunch16._id, productId: rice._id, quantity: 150, unit: "g" }
      );
    }

    // Kolacja 16.01 - jogurt
    const dinner16 = meals.find(
      (m) =>
        m.name === "Kolacja" &&
        m.date.toDateString() === new Date("2024-01-16").toDateString()
    );

    if (dinner16 && yogurt) {
      mealProducts.push({
        mealId: dinner16._id,
        productId: yogurt._id,
        quantity: 300,
        unit: "g",
      });
    }

    const insertedMealProducts = await MealProduct.insertMany(mealProducts);
    console.log(`Added ${insertedMealProducts.length} sample meal products`);

    // Calculate daily nutrition for seeded dates
    await DailyNutrition.calculateDailyNutrition(new Date("2024-01-15"));
    await DailyNutrition.calculateDailyNutrition(new Date("2024-01-16"));
    console.log("Calculated daily nutrition summaries");

    // Show statistics
    const logStats = await Log.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    const mealStats = await Meal.aggregate([
      {
        $group: {
          _id: "$name",
          count: { $sum: 1 },
        },
      },
    ]);

    const nutritionStats = await DailyNutrition.find({});

    console.log("\n📊 Statistics of added data:");
    console.log("\n📝 Logs:");
    logStats.forEach((stat) => {
      console.log(`  ${stat._id}: ${stat.count} entries`);
    });

    console.log("\n🍽️ Meals:");
    mealStats.forEach((stat) => {
      console.log(`  ${stat._id}: ${stat.count} entries`);
    });

    console.log("\n📈 Nutrition summaries:");
    console.log(`  Daily nutrition records: ${nutritionStats.length}`);

    console.log("\n✅ Database has been populated with sample data!");
    console.log("\n🧪 You can now test the API:");
    console.log("📝 Logs:");
    console.log("  - GET http://localhost:4000/logs");
    console.log("  - GET http://localhost:4000/logs/stats/summary");
    console.log("\n🍽️ Meals:");
    console.log("  - GET http://localhost:4000/meals?date=2024-01-15");
    console.log(
      "  - GET http://localhost:4000/meals?startDate=2024-01-15&endDate=2024-01-16"
    );
    console.log("\n📊 Nutrition:");
    console.log("  - GET http://localhost:4000/nutrition/daily/2024-01-15");
    console.log(
      "  - GET http://localhost:4000/nutrition/daily/2024-01-15/detailed"
    );
    console.log("  - GET http://localhost:4000/nutrition/stats?days=7");
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