const mongoose = require('mongoose');

const priceSlabSchema = new mongoose.Schema({
  minSqft: {
    type: Number,
    required: true,
  },
  maxSqft: {
    type: Number,
    required: true,
  },
  ratePerSqft: {
    type: Number,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
});

const packageSchema = new mongoose.Schema({
  packageName: {
    type: String,
    required: true,
    default: 'Zhagaram Architectural & Interior Packages',
  },
  packageCode: {
    type: String,
    required: true,
    default: 'ZHAGARAM_SERVICES_STD',
  },
  description: {
    type: String,
    default: 'Comprehensive architectural planning, elevation, and interior design estimation.',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  measurementUnit: {
    type: String,
    enum: ['sqft', 'metre'],
    default: 'sqft',
  },
  // 1. Planning Tiered Price Slabs
  planPriceSlabs: {
    type: [priceSlabSchema],
    default: [
      { minSqft: 0, maxSqft: 500, ratePerSqft: 18, label: 'Compact Plan (0 - 500 sqft)' },
      { minSqft: 500, maxSqft: 700, ratePerSqft: 15, label: 'Mid Plan 1 (500 - 700 sqft)' },
      { minSqft: 700, maxSqft: 900, ratePerSqft: 12, label: 'Mid Plan 2 (700 - 900 sqft)' },
      { minSqft: 900, maxSqft: 1500, ratePerSqft: 10, label: 'Standard Plan (900 - 1500 sqft)' },
      { minSqft: 1500, maxSqft: 2500, ratePerSqft: 8, label: 'Large Villa (1500 - 2500 sqft)' },
      { minSqft: 2500, maxSqft: 100000, ratePerSqft: 6, label: 'Palatial Estate (2500+ sqft)' },
    ],
  },
  // 2. Elevation Tiered Price Slabs (500-700 = ₹25, 700-900 = ₹22, etc.)
  elevationPriceSlabs: {
    type: [priceSlabSchema],
    default: [
      { minSqft: 0, maxSqft: 500, ratePerSqft: 28, label: 'Small Elevation (0 - 500 sqft)' },
      { minSqft: 500, maxSqft: 700, ratePerSqft: 25, label: 'Mid Elevation 1 (500 - 700 sqft)' },
      { minSqft: 700, maxSqft: 900, ratePerSqft: 22, label: 'Mid Elevation 2 (700 - 900 sqft)' },
      { minSqft: 900, maxSqft: 1500, ratePerSqft: 19, label: 'Large Elevation (900 - 1500 sqft)' },
      { minSqft: 1500, maxSqft: 2500, ratePerSqft: 16, label: 'Villa Elevation (1500 - 2500 sqft)' },
      { minSqft: 2500, maxSqft: 100000, ratePerSqft: 14, label: 'Estate Elevation (2500+ sqft)' },
    ],
  },
  // 3. Interior Tiered Price Slabs
  interiorPriceSlabs: {
    type: [priceSlabSchema],
    default: [
      { minSqft: 0, maxSqft: 500, ratePerSqft: 45, label: 'Compact Interior (0 - 500 sqft)' },
      { minSqft: 500, maxSqft: 700, ratePerSqft: 40, label: 'Mid Interior 1 (500 - 700 sqft)' },
      { minSqft: 700, maxSqft: 900, ratePerSqft: 35, label: 'Mid Interior 2 (700 - 900 sqft)' },
      { minSqft: 900, maxSqft: 1500, ratePerSqft: 30, label: 'Full Interior (900 - 1500 sqft)' },
      { minSqft: 1500, maxSqft: 2500, ratePerSqft: 25, label: 'Luxury Interior (1500 - 2500 sqft)' },
      { minSqft: 2500, maxSqft: 100000, ratePerSqft: 20, label: 'Ultra Luxury (2500+ sqft)' },
    ],
  },
  // Legacy / fallback elevation slabs
  priceSlabs: {
    type: [priceSlabSchema],
    default: [],
  },
  staircaseOtsCharge: {
    type: Number,
    default: 2500,
  },
  terraceRatePerSqft: {
    type: Number,
    default: 10,
  },
  whiteLabelFee: {
    type: Number,
    default: 3000,
  },
  defaultDiscountPercentage: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Package', packageSchema);
