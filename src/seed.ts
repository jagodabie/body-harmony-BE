import mongoose from 'mongoose';
import { bodyMetricRepository } from './repository/body-metric/body-metric.instance.js';
import type { CreateBodyMetricDTO } from './repository/body-metric/body-metric.types.js';
import Meal from './models/Meal.js';
import { MealProduct } from './models/meal/meal-product.model.js';
import Product from './models/Product.js';
import DailyNutrition from './models/DailyNutrition.js';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';

const ObjectId = mongoose.Types.ObjectId;

// Fixed IDs for meals (deterministic seed – same IDs after every reseed)
const MEAL_IDS = {
  breakfast15: new ObjectId('698899e9020118128710f893'),
  secondBreakfast15: new ObjectId('698899e9020118128710f894'),
  lunch15: new ObjectId('698899e9020118128710f895'),
  snack15: new ObjectId('698899e9020118128710f896'),
  dinner15: new ObjectId('698899e9020118128710f897'),
  breakfast16: new ObjectId('698899e9020118128710f898'),
  lunch16: new ObjectId('698899e9020118128710f899'),
  dinner16: new ObjectId('698899e9020118128710f89a'),
};

// Fixed IDs for meal products (same order as in seed)
const MEAL_PRODUCT_IDS = [
  new ObjectId('698899e9020118128710f89c'), // breakfast15 - bread
  new ObjectId('698899e9020118128710f89d'), // breakfast15 - butter
  new ObjectId('698899e9020118128710f89e'), // breakfast15 - apple
  new ObjectId('698899e9020118128710f89f'), // secondBreakfast15 - yogurt
  new ObjectId('698899e9020118128710f8a0'), // lunch15 - chicken
  new ObjectId('698899e9020118128710f8a1'), // lunch15 - rice
  new ObjectId('698899e9020118128710f8a2'), // snack15 - apple
  new ObjectId('698899e9020118128710f8a3'), // dinner15 - bread
  new ObjectId('698899e9020118128710f8a4'), // dinner15 - butter
  new ObjectId('698899e9020118128710f8a5'), // breakfast16 - bread
  new ObjectId('698899e9020118128710f8a6'), // breakfast16 - butter
  new ObjectId('698899e9020118128710f8a7'), // lunch16 - chicken
  new ObjectId('698899e9020118128710f8a8'), // lunch16 - rice
  new ObjectId('698899e9020118128710f8a9'), // dinner16 - yogurt
]; // 14 items

/** Dates relative to "today" – computed when seed runs (wczoraj / dziś). */
function getSeedDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return { yesterday, today };
}

function getSampleData(yesterday: Date, today: Date) {
  return [
    { type: 'weight', value: '75.5', unit: 'kg', notes: 'Morning before breakfast', date: yesterday },
    { type: 'weight', value: '75.2', unit: 'kg', notes: 'Morning before breakfast', date: today },
    { type: 'measurement', value: '85', unit: 'cm', notes: 'Waist circumference', date: yesterday },
    { type: 'mood', value: '8', unit: null, notes: 'Good day, lots of energy', date: yesterday },
    { type: 'energy', value: '7', unit: null, notes: 'Average energy level', date: yesterday },
    { type: 'sleep', value: '7.5', unit: 'hours', notes: 'Good sleep, but could be longer', date: yesterday },
    { type: 'exercise', value: '45', unit: 'minutes', notes: 'Jogging in the park', date: yesterday },
    { type: 'nutrition', value: '1800', unit: 'calories', notes: 'Healthy diet, lots of vegetables', date: yesterday },
    { type: 'water', value: '8', unit: 'glasses', notes: 'Good hydration', date: yesterday },
  ];
}

function getSampleMeals(yesterday: Date, today: Date) {
  return [
    { _id: MEAL_IDS.breakfast15, name: 'Breakfast', mealType: 'BREAKFAST' as const, date: yesterday, time: '08:30', notes: 'Good breakfast before work' },
    { _id: MEAL_IDS.secondBreakfast15, name: 'Second breakfast', mealType: 'SUPPER' as const, date: yesterday, time: '11:00', notes: 'Snack at work' },
    { _id: MEAL_IDS.lunch15, name: 'Lunch', mealType: 'LUNCH' as const, date: yesterday, time: '14:00', notes: 'Warm lunch at home' },
    { _id: MEAL_IDS.snack15, name: 'Afternoon snack', mealType: 'SNACK' as const, date: yesterday, time: '16:30', notes: 'Fruit and nuts' },
    { _id: MEAL_IDS.dinner15, name: 'Dinner', mealType: 'DINNER' as const, date: yesterday, time: '19:30', notes: 'Light dinner' },
    { _id: MEAL_IDS.breakfast16, name: 'Breakfast', mealType: 'BREAKFAST' as const, date: today, time: '09:00', notes: 'Weekend breakfast' },
    { _id: MEAL_IDS.lunch16, name: 'Lunch', mealType: 'LUNCH' as const, date: today, time: '13:30', notes: 'Family lunch' },
    { _id: MEAL_IDS.dinner16, name: 'Dinner', mealType: 'DINNER' as const, date: today, time: '20:00', notes: 'Evening dinner' },
  ];
}

// Sample products data (mock products for seeding)
const sampleProducts = [
  {
    code: '1234567890123',
    name: 'Whole grain bread',
    brands: 'Bakery XYZ',
    nutriscore: 'A',
    nutriments: {
      'energy-kcal_100g': 250,
      proteins_100g: 12.5,
      fat_100g: 3.2,
      'saturated-fat_100g': 0.8,
      carbohydrates_100g: 45.0,
      sugars_100g: 5.2,
      salt_100g: 1.1,
    },
  },
  {
    code: '2345678901234',
    name: 'Butter',
    brands: 'Dairy ABC',
    nutriscore: 'D',
    nutriments: {
      'energy-kcal_100g': 750,
      proteins_100g: 0.8,
      fat_100g: 82.5,
      'saturated-fat_100g': 52.0,
      carbohydrates_100g: 0.6,
      sugars_100g: 0.6,
      salt_100g: 0.02,
    },
  },
  {
    code: '3456789012345',
    name: 'Apple',
    brands: 'Orchard XYZ',
    nutriscore: 'A',
    nutriments: {
      'energy-kcal_100g': 52,
      proteins_100g: 0.3,
      fat_100g: 0.2,
      'saturated-fat_100g': 0.0,
      carbohydrates_100g: 13.8,
      sugars_100g: 10.4,
      salt_100g: 0.0,
    },
  },
  {
    code: '4567890123456',
    name: 'Chicken breast',
    brands: 'Farm ABC',
    nutriscore: 'A',
    nutriments: {
      'energy-kcal_100g': 165,
      proteins_100g: 31.0,
      fat_100g: 3.6,
      'saturated-fat_100g': 1.0,
      carbohydrates_100g: 0.0,
      sugars_100g: 0.0,
      salt_100g: 0.1,
    },
  },
  {
    code: '5678901234567',
    name: 'Brown rice',
    brands: 'Grain XYZ',
    nutriscore: 'A',
    nutriments: {
      'energy-kcal_100g': 111,
      proteins_100g: 2.6,
      fat_100g: 0.9,
      'saturated-fat_100g': 0.2,
      carbohydrates_100g: 23.0,
      sugars_100g: 0.4,
      salt_100g: 0.0,
    },
  },
  {
    code: '6789012345678',
    name: 'Natural yogurt',
    brands: 'Dairy DEF',
    nutriscore: 'B',
    nutriments: {
      'energy-kcal_100g': 59,
      proteins_100g: 10.0,
      fat_100g: 0.4,
      'saturated-fat_100g': 0.2,
      carbohydrates_100g: 3.6,
      sugars_100g: 3.6,
      salt_100g: 0.1,
    },
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error(
        'MONGO_URI is missing in environment variables (.env). Add e.g. MONGO_URI=mongodb://localhost:27017/body-harmony'
      );
    }
    // Connect to database
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const shouldClear =
      process.env.CLEAR_BEFORE_SEED === '1' ||
      process.env.CLEAR_BEFORE_SEED === 'true';
    if (shouldClear) {
      // Clear existing data (order: dependent entities first)
      await bodyMetricRepository.deleteMany();
      await MealProduct.deleteMany({});
      await Meal.deleteMany({});
      await DailyNutrition.deleteMany({});
      await Product.deleteMany({});
      console.log('Cleared existing data');
    } else {
      console.log(
        'Skipping clear (set CLEAR_BEFORE_SEED=1 to clear before seeding)'
      );
    }

    const { yesterday, today } = getSeedDates();
    const dateStr = (d: Date) => d.toISOString().slice(0, 10);

    // Add sample body metrics (wczoraj / dziś)
    const sampleData = getSampleData(yesterday, today);
    const bodyMetrics = await bodyMetricRepository.insertMany(
      sampleData as CreateBodyMetricDTO[]
    );
    console.log(`Added ${bodyMetrics.length} sample body metrics`);

    // Add sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`Added ${products.length} sample products`);

    // Add sample meals (wczoraj / dziś)
    const sampleMeals = getSampleMeals(yesterday, today);
    const meals = await Meal.insertMany(sampleMeals);
    console.log(`Added ${meals.length} sample meals`);

    // Add sample meal products (fixed _id so reseed gives same IDs)
    const bread = products.find((p) => p.name === 'Whole grain bread');
    const butter = products.find((p) => p.name === 'Butter');
    const apple = products.find((p) => p.name === 'Apple');
    const yogurt = products.find((p) => p.name === 'Natural yogurt');
    const chicken = products.find((p) => p.name === 'Chicken breast');
    const rice = products.find((p) => p.name === 'Brown rice');

    const mealProducts = [
      // Breakfast Jan 15 - bread, butter, apple
      {
        _id: MEAL_PRODUCT_IDS[0],
        mealId: MEAL_IDS.breakfast15,
        productCode: bread!.code,
        quantity: 80,
        unit: 'g',
        nutrition: { calories: 0, proteins: 0, carbs: 0, fat: 0 },
      },
      {
        _id: MEAL_PRODUCT_IDS[1],
        mealId: MEAL_IDS.breakfast15,
        productCode: butter!.code,
        quantity: 15,
        unit: 'g',
        nutrition: { calories: 0, proteins: 0, carbs: 0, fat: 0 },
      },
      {
        _id: MEAL_PRODUCT_IDS[2],
        mealId: MEAL_IDS.breakfast15,
        productCode: apple!.code,
        quantity: 150,
        unit: 'g',
        nutrition: { calories: 0, proteins: 0, carbs: 0, fat: 0 },
      },
      // Second breakfast Jan 15 - yogurt
      {
        _id: MEAL_PRODUCT_IDS[3],
        mealId: MEAL_IDS.secondBreakfast15,
        productCode: yogurt!.code,
        quantity: 200,
        unit: 'g',
        nutrition: { calories: 0, proteins: 0, carbs: 0, fat: 0 },
      },
      // Lunch Jan 15 - chicken, rice
      {
        _id: MEAL_PRODUCT_IDS[4],
        mealId: MEAL_IDS.lunch15,
        productCode: chicken!.code,
        quantity: 150,
        unit: 'g',
        nutrition: { calories: 0, proteins: 0, carbs: 0, fat: 0 },
      },
      {
        _id: MEAL_PRODUCT_IDS[5],
        mealId: MEAL_IDS.lunch15,
        productCode: rice!.code,
        quantity: 100,
        unit: 'g',
        nutrition: { calories: 0, proteins: 0, carbs: 0, fat: 0 },
      },
      // Afternoon snack Jan 15 - apple
      {
        _id: MEAL_PRODUCT_IDS[6],
        mealId: MEAL_IDS.snack15,
        productCode: apple!.code,
        quantity: 100,
        unit: 'g',
        nutrition: { calories: 0, proteins: 0, carbs: 0, fat: 0 },
      },
      // Dinner Jan 15 - bread, butter
      {
        _id: MEAL_PRODUCT_IDS[7],
        mealId: MEAL_IDS.dinner15,
        productCode: bread!.code,
        quantity: 60,
        unit: 'g',
        nutrition: { calories: 0, proteins: 0, carbs: 0, fat: 0 },
      },
      {
        _id: MEAL_PRODUCT_IDS[8],
        mealId: MEAL_IDS.dinner15,
        productCode: butter!.code,
        quantity: 10,
        unit: 'g',
        nutrition: { calories: 0, proteins: 0, carbs: 0, fat: 0 },
      },
      // Breakfast Jan 16 - bread, butter
      {
        _id: MEAL_PRODUCT_IDS[9],
        mealId: MEAL_IDS.breakfast16,
        productCode: bread!.code,
        quantity: 100,
        unit: 'g',
        nutrition: { calories: 0, proteins: 0, carbs: 0, fat: 0 },
      },
      {
        _id: MEAL_PRODUCT_IDS[10],
        mealId: MEAL_IDS.breakfast16,
        productCode: butter!.code,
        quantity: 20,
        unit: 'g',
        nutrition: { calories: 0, proteins: 0, carbs: 0, fat: 0 },
      },
      // Lunch Jan 16 - chicken, rice
      {
        _id: MEAL_PRODUCT_IDS[11],
        mealId: MEAL_IDS.lunch16,
        productCode: chicken!.code,
        quantity: 200,
        unit: 'g',
        nutrition: { calories: 0, proteins: 0, carbs: 0, fat: 0 },
      },
      {
        _id: MEAL_PRODUCT_IDS[12],
        mealId: MEAL_IDS.lunch16,
        productCode: rice!.code,
        quantity: 150,
        unit: 'g',
        nutrition: { calories: 0, proteins: 0, carbs: 0, fat: 0 },
      },
      // Dinner Jan 16 - yogurt
      {
        _id: MEAL_PRODUCT_IDS[13],
        mealId: MEAL_IDS.dinner16,
        productCode: yogurt!.code,
        quantity: 300,
        unit: 'g',
        nutrition: { calories: 0, proteins: 0, carbs: 0, fat: 0 },
      },
    ];

    const insertedMealProducts = await MealProduct.insertMany(mealProducts);
    console.log(`Added ${insertedMealProducts.length} sample meal products`);

    // Calculate daily nutrition for seeded dates (wczoraj, dziś)
    await (
      DailyNutrition as unknown as {
        calculateDailyNutrition: (d: Date) => Promise<void>;
      }
    ).calculateDailyNutrition(yesterday);
    await (
      DailyNutrition as unknown as {
        calculateDailyNutrition: (d: Date) => Promise<void>;
      }
    ).calculateDailyNutrition(today);
    console.log('Calculated daily nutrition summaries');

    // Show statistics
    const bodyMetricsStats =
      (await bodyMetricRepository.getMetricsSummary()) as {
        _id: string;
        count: number;
      }[];

    const mealStats = await Meal.aggregate([
      {
        $group: {
          _id: '$name',
          count: { $sum: 1 },
        },
      },
    ]);

    const nutritionStats = await DailyNutrition.find({});

    console.log('\n📊 Statistics of added data:');
    console.log('\n📊 Body metrics:');
    bodyMetricsStats.forEach((stat) => {
      console.log(`  ${stat._id}: ${stat.count} entries`);
    });

    console.log('\n🍽️ Meals:');
    mealStats.forEach((stat) => {
      console.log(`  ${stat._id}: ${stat.count} entries`);
    });

    console.log('\n📈 Nutrition summaries:');
    console.log(`  Daily nutrition records: ${nutritionStats.length}`);

    console.log('\n✅ Database has been populated with sample data!');
    console.log(`   Daty: wczoraj ${dateStr(yesterday)}, dziś ${dateStr(today)}`);
    console.log('\n🧪 You can now test the API:');
    console.log('📊 Body metrics:');
    console.log('\n🍽️ Meals:');
    console.log(`  - GET http://localhost:4000/meals?date=${dateStr(yesterday)}`);
    console.log(
      `  - GET http://localhost:4000/meals?startDate=${dateStr(yesterday)}&endDate=${dateStr(today)}`
    );
    console.log('\n📊 Nutrition:');
    console.log(`  - GET http://localhost:4000/nutrition/daily/${dateStr(yesterday)}`);
    console.log(
      `  - GET http://localhost:4000/nutrition/daily/${dateStr(yesterday)}/detailed`
    );
    console.log('  - GET http://localhost:4000/nutrition/stats?days=7');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run seeding if file is called directly
// In ESM, check if this is the main module
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMainModule) {
  seedDatabase();
}

export default seedDatabase;
