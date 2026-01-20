/**
 * Helper functions for nutrition calculations
 */

/**
 * Calculate total macros from an array of products
 * @param {Array} products - Array of products with nutrition property
 * @returns {Object} Object with calories, proteins, carbs, fat (rounded to 1 decimal)
 */
function calculateMealMacros(products) {
  let mealTotals = {
    calories: 0,
    proteins: 0,
    carbs: 0,
    fat: 0,
  };

  products.forEach((product) => {
    if (product.nutrition) {
      mealTotals.calories += product.nutrition.calories || 0;
      mealTotals.proteins += product.nutrition.proteins || 0;
      mealTotals.carbs += product.nutrition.carbs || 0;
      mealTotals.fat += product.nutrition.fat || 0;
    }
  });

  // Round values to 1 decimal place
  Object.keys(mealTotals).forEach((key) => {
    mealTotals[key] = Math.round(mealTotals[key] * 10) / 10;
  });

  return mealTotals;
}

module.exports = {
  calculateMealMacros,
};
