const Package = require('../models/Package');

const defaultPlanSlabs = [
  { minSqft: 0, maxSqft: 500, ratePerSqft: 18, label: '0 - 500 sqft (₹18/sqft)' },
  { minSqft: 500, maxSqft: 700, ratePerSqft: 15, label: '500 - 700 sqft (₹15/sqft)' },
  { minSqft: 700, maxSqft: 900, ratePerSqft: 12, label: '700 - 900 sqft (₹12/sqft)' },
  { minSqft: 900, maxSqft: 1500, ratePerSqft: 10, label: '900 - 1500 sqft (₹10/sqft)' },
  { minSqft: 1500, maxSqft: 2500, ratePerSqft: 8, label: '1500 - 2500 sqft (₹8/sqft)' },
  { minSqft: 2500, maxSqft: 100000, ratePerSqft: 6, label: '2500+ sqft (₹6/sqft)' },
];

const defaultElevationSlabs = [
  { minSqft: 0, maxSqft: 500, ratePerSqft: 28, label: '0 - 500 sqft (₹28/sqft)' },
  { minSqft: 500, maxSqft: 700, ratePerSqft: 25, label: '500 - 700 sqft (₹25/sqft)' },
  { minSqft: 700, maxSqft: 900, ratePerSqft: 22, label: '700 - 900 sqft (₹22/sqft)' },
  { minSqft: 900, maxSqft: 1500, ratePerSqft: 19, label: '900 - 1500 sqft (₹19/sqft)' },
  { minSqft: 1500, maxSqft: 2500, ratePerSqft: 16, label: '1500 - 2500 sqft (₹16/sqft)' },
  { minSqft: 2500, maxSqft: 100000, ratePerSqft: 14, label: '2500+ sqft (₹14/sqft)' },
];

const defaultInteriorSlabs = [
  { minSqft: 0, maxSqft: 500, ratePerSqft: 45, label: '0 - 500 sqft (₹45/sqft)' },
  { minSqft: 500, maxSqft: 700, ratePerSqft: 40, label: '500 - 700 sqft (₹40/sqft)' },
  { minSqft: 700, maxSqft: 900, ratePerSqft: 35, label: '700 - 900 sqft (₹35/sqft)' },
  { minSqft: 900, maxSqft: 1500, ratePerSqft: 30, label: '900 - 1500 sqft (₹30/sqft)' },
  { minSqft: 1500, maxSqft: 2500, ratePerSqft: 25, label: '1500 - 2500 sqft (₹25/sqft)' },
  { minSqft: 2500, maxSqft: 100000, ratePerSqft: 20, label: '2500+ sqft (₹20/sqft)' },
];

// Helper to determine rate from slabs
const findRateInSlabs = (slabs, sqft, fallback = 20) => {
  if (!slabs || slabs.length === 0) return fallback;
  for (const slab of slabs) {
    if (sqft >= slab.minSqft && sqft < slab.maxSqft) {
      return slab.ratePerSqft;
    }
  }
  return slabs[slabs.length - 1].ratePerSqft || fallback;
};

// Get default or active pricing package
const getPackage = async (req, res) => {
  try {
    let pkg = await Package.findOne({ isActive: true });
    if (!pkg) {
      pkg = await Package.create({
        packageName: 'Zhagaram Architectural & Interior Packages',
        planPriceSlabs: defaultPlanSlabs,
        elevationPriceSlabs: defaultElevationSlabs,
        interiorPriceSlabs: defaultInteriorSlabs,
        staircaseOtsCharge: 2500,
        terraceRatePerSqft: 10,
        whiteLabelFee: 3000,
      });
    } else {
      // Ensure slabs exist if migrating from old schema
      let modified = false;
      if (!pkg.planPriceSlabs || pkg.planPriceSlabs.length === 0) {
        pkg.planPriceSlabs = defaultPlanSlabs;
        modified = true;
      }
      if (!pkg.elevationPriceSlabs || pkg.elevationPriceSlabs.length === 0) {
        pkg.elevationPriceSlabs = pkg.priceSlabs?.length ? pkg.priceSlabs : defaultElevationSlabs;
        modified = true;
      }
      if (!pkg.interiorPriceSlabs || pkg.interiorPriceSlabs.length === 0) {
        pkg.interiorPriceSlabs = defaultInteriorSlabs;
        modified = true;
      }
      if (modified) await pkg.save();
    }
    res.json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update package settings
const updatePackage = async (req, res) => {
  try {
    let pkg = await Package.findOne({ isActive: true });
    if (!pkg) {
      pkg = new Package(req.body);
    } else {
      Object.assign(pkg, req.body);
      pkg.updatedAt = new Date();
    }
    await pkg.save();
    res.json({ success: true, data: pkg, message: 'Pricing packages updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Common Price Calculator
const calculateEstimate = async (req, res) => {
  try {
    const {
      services = { plan: false, elevation: true, interior: false },
      planSqft = 0,
      elevationSqft = 0,
      interiorSqft = 0,
      hasOts = false,
      hasTerrace = false,
      terraceSqft = 0,
      discount = 0,
      whiteLabel = true,
    } = req.body;

    const pkg = await Package.findOne({ isActive: true });

    let planRate = 0;
    let planSubtotal = 0;
    if (services.plan) {
      planRate = findRateInSlabs(pkg?.planPriceSlabs || defaultPlanSlabs, planSqft, 12);
      planSubtotal = Math.round(planSqft * planRate);
    }

    let elevationRate = 0;
    let elevationSubtotal = 0;
    if (services.elevation) {
      elevationRate = findRateInSlabs(pkg?.elevationPriceSlabs || defaultElevationSlabs, elevationSqft, 22);
      elevationSubtotal = Math.round(elevationSqft * elevationRate);
    }

    let interiorRate = 0;
    let interiorSubtotal = 0;
    if (services.interior) {
      interiorRate = findRateInSlabs(pkg?.interiorPriceSlabs || defaultInteriorSlabs, interiorSqft, 35);
      interiorSubtotal = Math.round(interiorSqft * interiorRate);
    }

    // Add-ons & surcharges removed as instructed
    const otsFee = 0;
    const terraceFee = 0;
    const whiteLabelFee = 0;

    const subtotal = planSubtotal + elevationSubtotal + interiorSubtotal;
    const grandTotal = Math.max(0, subtotal - Number(discount || 0));

    res.json({
      success: true,
      data: {
        services,
        planSqft,
        planRate,
        planSubtotal,
        elevationSqft,
        elevationRate,
        elevationSubtotal,
        interiorSqft,
        interiorRate,
        interiorSubtotal,
        otsFee,
        terraceFee,
        whiteLabelFee,
        subtotal,
        discount: Number(discount || 0),
        grandTotal,
        paymentType: 'Double',
        advanceAmount: Math.round(grandTotal / 2),
        balanceAmount: grandTotal - Math.round(grandTotal / 2),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPackage,
  updatePackage,
  calculateEstimate,
  findRateInSlabs,
  defaultPlanSlabs,
  defaultElevationSlabs,
  defaultInteriorSlabs,
};
