const MEAL_TYPES = {
  BREAKFAST: 'BREAKFAST',
  LUNCH: 'LUNCH',
  DINNER: 'DINNER',
  SNACK: 'SNACK',
  SUPPER: 'SUPPER'
};

const MEAL_TYPE_ORDER = [
  MEAL_TYPES.BREAKFAST,    // 0
  MEAL_TYPES.SUPPER,       // 1 - II breakfast
  MEAL_TYPES.SNACK,        // 3
  MEAL_TYPES.DINNER        // 4
];

module.exports = {
  MEAL_TYPES,
  MEAL_TYPE_ORDER
};
