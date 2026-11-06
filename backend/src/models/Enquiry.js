const mongoose = require('mongoose');

const sideDimensionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  feet: { type: Number, default: 0 },
  inches: { type: Number, default: 0 },
});

const roadWidthSchema = new mongoose.Schema({
  label: { type: String, required: true },
  selected: { type: Boolean, default: false },
  feet: { type: Number, default: 0 },
  inches: { type: Number, default: 0 },
});

const roomItemSchema = new mongoose.Schema({
  areaName: { type: String, required: true },
  selected: { type: Boolean, default: true },
  nos: { type: Number, default: 1 },
  minArea: { type: Number, default: 0 },
  requiredArea: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  hasOts: { type: Boolean, default: false }, // Option for staircase: "with ots"
  notes: { type: String, default: '' },
});

const floorGroupSchema = new mongoose.Schema({
  floorName: { type: String, required: true },
  rooms: [roomItemSchema],
});

const enquirySchema = new mongoose.Schema({
  sno: {
    type: Number,
    required: true,
  },
  clientName: {
    type: String,
    required: true,
    trim: true,
  },
  mobileNo: {
    type: String,
    required: true,
    trim: true,
  },
  // Email is explicitly optional as requested by user
  email: {
    type: String,
    required: false,
    default: '',
    trim: true,
  },
  address: {
    type: String,
    default: '',
    trim: true,
  },
  projectName: {
    type: String,
    required: true,
    trim: true,
  },
  projectType: {
    type: String,
    default: 'Elevation',
  },
  projectDescription: {
    type: String,
    default: '',
  },
  enquiryDate: {
    type: Date,
    default: Date.now,
  },

  // 3 Service Types: Planning, Elevation, Interior
  services: {
    plan: { type: Boolean, default: false },
    elevation: { type: Boolean, default: true },
    interior: { type: Boolean, default: false },
  },

  // Main stage status: "sketchup_enquiry" -> "confirmed" -> "ongoing" -> "completed"
  status: {
    type: String,
    enum: ['sketchup_enquiry', 'confirmed', 'ongoing', 'completed'],
    default: 'sketchup_enquiry',
  },
  quoteStatus: {
    type: String,
    enum: ['Draft', 'Quote Sent', 'Revise Quote', 'Revised'],
    default: 'Draft',
  },
  quoteNumber: {
    type: String,
    default: '',
  },

  measurementUnit: {
    type: String,
    enum: ['sqft', 'metre'],
    default: 'sqft',
  },
  is2DPlanOnly: {
    type: Boolean,
    default: false,
  },

  // 1. PLAN FLOW: Site Details, Boundaries & Setbacks
  siteDetails: {
    area: { type: Number, default: 0 },
    builtUpArea: { type: Number, default: 0 },
    orientation: { type: String, default: 'North' },
    noOfSides: { type: Number, default: 4 },
    sideDetails: [sideDimensionSchema],
    setbackDetails: [sideDimensionSchema],
    roadWidth: [roadWidthSchema],
    diagonalDetails: [sideDimensionSchema],
    uploadedFiles: [{ type: String }],
    note: { type: String, default: '' },
  },

  // 1. PLAN FLOW: Floors and Spatial Requirements (Floors only for Plan)
  spatialRequirements: {
    chosenFloor: {
      type: String,
      default: 'Ground',
    },
    hasTerrace: {
      type: Boolean,
      default: false,
    },
    terraceArea: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: '',
    },
    floors: [floorGroupSchema],
  },

  // 2. ELEVATION FLOW: Elevation only requires sqft
  elevationDetails: {
    elevationSqft: { type: Number, default: 0 },
    note: { type: String, default: '' },
  },

  // 3. INTERIOR FLOW: Interior only requires sqft as input
  interiorDetails: {
    interiorSqft: { type: Number, default: 0 },
    note: { type: String, default: '' },
  },

  // Common Price Calculator Breakdown across all 3 services
  pricing: {
    // Plan
    planSqft: { type: Number, default: 0 },
    planRate: { type: Number, default: 12 },
    planSubtotal: { type: Number, default: 0 },

    // Elevation
    elevationSqft: { type: Number, default: 1760 },
    elevationRate: { type: Number, default: 22 },
    elevationSubtotal: { type: Number, default: 0 },

    // Interior
    interiorSqft: { type: Number, default: 0 },
    interiorRate: { type: Number, default: 35 },
    interiorSubtotal: { type: Number, default: 0 },

    // Surcharges & Add-ons
    otsFee: { type: Number, default: 0 },
    terraceFee: { type: Number, default: 0 },
    whiteLabelFees: { type: Number, default: 3000 },

    // Common Totals
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },

    paymentType: {
      type: String,
      enum: ['Single', 'Double'],
      default: 'Double',
    },
    advanceAmount: { type: Number, default: 0 },
    balanceAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Advance Paid', 'Fully Paid'],
      default: 'Unpaid',
    },
  },

  // Ongoing Order execution details
  ongoingDetails: {
    movedToOngoingAt: { type: Date },
    assignedArchitect: { type: String, default: 'Karthi (Founder)' },
    currentStage: {
      type: String,
      default: 'Elevation CAD & Drafting',
    },
    progressPercent: { type: Number, default: 25 },
    targetDeliveryDate: { type: Date },
    workNotes: { type: String, default: '' },
  },

  // Completed Order archive details
  completedDetails: {
    completedAt: { type: Date },
    deliverablesDelivered: { type: Boolean, default: false },
    finalSketchupFileUrl: { type: String, default: '' },
    renderUrls: [{ type: String }],
    finalPaymentReceived: { type: Boolean, default: false },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

enquirySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Enquiry', enquirySchema);
