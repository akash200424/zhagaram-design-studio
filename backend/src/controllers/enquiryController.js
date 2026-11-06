const Enquiry = require("../models/Enquiry");
const Package = require("../models/Package");
const {
  findRateInSlabs,
  defaultPlanSlabs,
  defaultElevationSlabs,
  defaultInteriorSlabs,
} = require("./packageController");

// Helper to generate the exact array of floors for the floor choice
const getFloorNamesForType = (floorType) => {
  switch (floorType) {
    case "Ground":
      return ["Ground Floor"];
    case "Ground +1 Floor":
      return ["Ground Floor", "First Floor"];
    case "Ground +2 Floor":
      return ["Ground Floor", "First Floor", "Second Floor"];
    case "Ground +3 Floor":
      return ["Ground Floor", "First Floor", "Second Floor", "Third Floor"];
    case "Stilt +1 Floor":
      return ["Stilt Floor", "First Floor"];
    case "Stilt +2 Floor":
      return ["Stilt Floor", "First Floor", "Second Floor"];
    case "Stilt +3 Floor":
      return ["Stilt Floor", "First Floor", "Second Floor", "Third Floor"];
    case "Stilt +4 Floor":
      return [
        "Stilt Floor",
        "First Floor",
        "Second Floor",
        "Third Floor",
        "Fourth Floor",
      ];
    default:
      return ["Ground Floor"];
  }
};

// Default room list builder (Removed Bike/Cycle, Car, and Maid Kitchen as instructed)
const getDefaultRoomsForFloor = (floorName) => [
  {
    areaName: "Parking",
    selected: true,
    nos: 1,
    minArea: 40,
    requiredArea: 40,
    total: 40,
  },
  {
    areaName: "Sitout",
    selected: true,
    nos: 1,
    minArea: 25,
    requiredArea: 25,
    total: 25,
  },
  {
    areaName: "Foyer",
    selected: true,
    nos: 1,
    minArea: 25,
    requiredArea: 25,
    total: 25,
  },
  {
    areaName: "Living Hall",
    selected: true,
    nos: 1,
    minArea: 80,
    requiredArea: 80,
    total: 80,
  },
  {
    areaName: "Dining Hall",
    selected: true,
    nos: 1,
    minArea: 80,
    requiredArea: 80,
    total: 80,
  },
  {
    areaName: "Kitchen",
    selected: true,
    nos: 1,
    minArea: 60,
    requiredArea: 60,
    total: 60,
  },
  {
    areaName: "Kitchen Store",
    selected: true,
    nos: 1,
    minArea: 25,
    requiredArea: 25,
    total: 25,
  },
  {
    areaName: "Utility",
    selected: true,
    nos: 1,
    minArea: 25,
    requiredArea: 25,
    total: 25,
  },
  {
    areaName: "Pooja",
    selected: true,
    nos: 1,
    minArea: 20,
    requiredArea: 20,
    total: 20,
  },
  {
    areaName: "Courtyard",
    selected: true,
    nos: 1,
    minArea: 30,
    requiredArea: 30,
    total: 30,
  },
  {
    areaName: "Master Bedroom",
    selected: true,
    nos: 1,
    minArea: 160,
    requiredArea: 160,
    total: 160,
  },
  {
    areaName: "Guest Bedroom",
    selected: true,
    nos: 1,
    minArea: 70,
    requiredArea: 70,
    total: 70,
  },
  {
    areaName: "Family Room",
    selected: true,
    nos: 1,
    minArea: 100,
    requiredArea: 100,
    total: 100,
  },
  {
    areaName: "Gym",
    selected: true,
    nos: 1,
    minArea: 100,
    requiredArea: 100,
    total: 100,
  },
  {
    areaName: "Yoga Room",
    selected: true,
    nos: 1,
    minArea: 100,
    requiredArea: 100,
    total: 100,
  },
  {
    areaName: "Store Room",
    selected: true,
    nos: 1,
    minArea: 40,
    requiredArea: 40,
    total: 40,
  },
  {
    areaName: "Home Theatre",
    selected: true,
    nos: 1,
    minArea: 110,
    requiredArea: 110,
    total: 110,
  },
  {
    areaName: "Staircase",
    selected: true,
    nos: 1,
    minArea: 80,
    requiredArea: 80,
    total: 80,
    hasOts: false,
  },
  {
    areaName: "Lift",
    selected: true,
    nos: 1,
    minArea: 25,
    requiredArea: 25,
    total: 25,
  },
];

const generateFloorsForType = (floorType) => {
  const floorNames = getFloorNamesForType(floorType);
  return floorNames.map((name) => ({
    floorName: name,
    rooms: getDefaultRoomsForFloor(name),
  }));
};

// Common Price Calculation across Plan, Elevation, and Interior
const computePricing = async (data) => {
  const pkg = await Package.findOne({ isActive: true });
  const planSlabs = pkg?.planPriceSlabs?.length
    ? pkg.planPriceSlabs
    : defaultPlanSlabs;
  const elevSlabs = pkg?.elevationPriceSlabs?.length
    ? pkg.elevationPriceSlabs
    : defaultElevationSlabs;
  const intSlabs = pkg?.interiorPriceSlabs?.length
    ? pkg.interiorPriceSlabs
    : defaultInteriorSlabs;

  const services = data.services || {
    plan: false,
    elevation: true,
    interior: false,
  };

  // Plan calculation
  const planSqft = Number(
    data.siteDetails?.builtUpArea || data.pricing?.planSqft || 0,
  );
  let planRate = 0;
  let planSubtotal = 0;
  if (services.plan && planSqft > 0) {
    planRate = findRateInSlabs(planSlabs, planSqft, 12);
    planSubtotal = Math.round(planSqft * planRate);
  }

  // Elevation calculation
  const elevationSqft = Number(
    data.elevationDetails?.elevationSqft ||
      data.pricing?.elevationSqft ||
      data.siteDetails?.builtUpArea ||
      0,
  );
  let elevationRate = 0;
  let elevationSubtotal = 0;
  if (services.elevation && elevationSqft > 0) {
    elevationRate = findRateInSlabs(elevSlabs, elevationSqft, 22);
    elevationSubtotal = Math.round(elevationSqft * elevationRate);
  }

  // Interior calculation
  const interiorSqft = Number(
    data.interiorDetails?.interiorSqft || data.pricing?.interiorSqft || 0,
  );
  let interiorRate = 0;
  let interiorSubtotal = 0;
  if (services.interior && interiorSqft > 0) {
    interiorRate = findRateInSlabs(intSlabs, interiorSqft, 35);
    interiorSubtotal = Math.round(interiorSqft * interiorRate);
  }

  // Surcharges removed as instructed: "we dont want architectural add ons and surcharges remove that from packages and price calculator and total"
  const otsFee = 0;
  const whiteLabelFees = 0;
  const subtotal = planSubtotal + elevationSubtotal + interiorSubtotal;
  const discount = Number(data.pricing?.discount || 0);
  const grandTotal = Math.max(0, subtotal - discount);
  const paymentType = data.pricing?.paymentType || "Double";
  const paymentStatus = data.pricing?.paymentStatus || "Unpaid";

  let advanceAmount = data.pricing?.advanceAmount;
  let balanceAmount = data.pricing?.balanceAmount;

  if (advanceAmount === undefined || advanceAmount === null) {
    if (paymentStatus === "Fully Paid") {
      advanceAmount = grandTotal;
      balanceAmount = 0;
    } else if (paymentStatus === "Advance Paid") {
      advanceAmount = Math.round(grandTotal / 2);
      balanceAmount = grandTotal - advanceAmount;
    } else {
      advanceAmount = 0;
      balanceAmount = grandTotal;
    }
  } else {
    advanceAmount = Number(advanceAmount);
    balanceAmount =
      balanceAmount !== undefined
        ? Number(balanceAmount)
        : Math.max(0, grandTotal - advanceAmount);
  }

  return {
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
    whiteLabelFees,
    subtotal,
    discount,
    grandTotal,
    paymentType,
    advanceAmount,
    balanceAmount,
    paymentStatus,
  };
};

// @desc    Get all enquiries
const getEnquiries = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { clientName: regex },
        { projectName: regex },
        { mobileNo: regex },
        { email: regex },
        { projectType: regex },
      ];
    }

    const total = await Enquiry.countDocuments(filter);
    const limitNum = Number(limit) || 1000;
    const pageNum = Number(page) || 1;
    const enquiries = await Enquiry.find(filter)
      .sort({ createdAt: -1, sno: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      count: enquiries.length,
      total,
      data: enquiries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single enquiry
const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    }
    res.json({ success: true, data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new unified Enquiry
const createEnquiry = async (req, res) => {
  try {
    const data = { ...req.body };

    // Mandatory fields validation
    if (!data.clientName || !data.clientName.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Customer Name is required" });
    }
    if (!data.mobileNo || !data.mobileNo.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Mobile Number is required" });
    }
    if (!data.projectName || !data.projectName.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Project Name is required" });
    }

    const highestSno = await Enquiry.findOne().sort({ sno: -1 }).select("sno");
    const nextSno = highestSno && highestSno.sno ? highestSno.sno + 1 : 1;
    data.sno = nextSno;

    // Services default
    if (!data.services) {
      data.services = { plan: false, elevation: true, interior: false };
    }

    // Project type: Elevation
    if (
      !data.projectType ||
      data.projectType.includes("3D") ||
      data.projectType === "Elevation"
    ) {
      data.projectType = "Elevation";
    }

    // Site & boundaries default for Plan flow (set to 0 initially as requested)
    if (
      !data.siteDetails ||
      !data.siteDetails.sideDetails ||
      data.siteDetails.sideDetails.length === 0
    ) {
      data.siteDetails = {
        area: Number(data.siteDetails?.area || 0),
        builtUpArea: Number(data.siteDetails?.builtUpArea || 0),
        orientation: data.siteDetails?.orientation || "North",
        noOfSides: 4,
        sideDetails: [
          { label: "X1", feet: 0, inches: 0 },
          { label: "X2", feet: 0, inches: 0 },
          { label: "X3", feet: 0, inches: 0 },
          { label: "X4", feet: 0, inches: 0 },
        ],
        setbackDetails: [
          { label: "S1", feet: 0, inches: 0 },
          { label: "S2", feet: 0, inches: 0 },
          { label: "S3", feet: 0, inches: 0 },
          { label: "S4", feet: 0, inches: 0 },
        ],
        roadWidth: [
          { label: "R1", selected: false, feet: 0, inches: 0 },
          { label: "R2", selected: false, feet: 0, inches: 0 },
          { label: "R3", selected: false, feet: 0, inches: 0 },
          { label: "R4", selected: false, feet: 0, inches: 0 },
        ],
        diagonalDetails: [
          { label: "Z1", feet: 0, inches: 0 },
          { label: "Z2", feet: 0, inches: 0 },
        ],
        note: data.siteDetails?.note || "",
        uploadedFiles: [],
      };
    }

    // Floor generation for Plan flow
    const chosenFloor = data.spatialRequirements?.chosenFloor || "Ground";
    if (
      !data.spatialRequirements ||
      !data.spatialRequirements.floors ||
      data.spatialRequirements.floors.length === 0
    ) {
      data.spatialRequirements = {
        chosenFloor,
        hasTerrace: data.spatialRequirements?.hasTerrace ?? false,
        terraceArea: data.spatialRequirements?.terraceArea || 0,
        description: data.spatialRequirements?.description || "",
        floors: generateFloorsForType(chosenFloor),
      };
    }

    // Elevation details default
    if (!data.elevationDetails) {
      data.elevationDetails = {
        elevationSqft: Number(data.pricing?.elevationSqft || 0),
        note: "",
      };
    }

    // Interior details default
    if (!data.interiorDetails) {
      data.interiorDetails = {
        interiorSqft: Number(data.pricing?.interiorSqft || 0),
        note: "",
      };
    }

    // Compute Common Pricing
    data.pricing = await computePricing(data);
    data.quoteNumber = `ZDS-QT-${new Date().getFullYear()}-${String(nextSno).padStart(3, "0")}`;

    const enquiry = await Enquiry.create(data);
    res.status(201).json({ success: true, data: enquiry });
  } catch (error) {
    console.error("Error creating enquiry:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update Enquiry details
const updateEnquiry = async (req, res) => {
  try {
    let enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    }

    // If chosen floor changed, regenerate floors
    if (
      req.body.spatialRequirements?.chosenFloor &&
      req.body.spatialRequirements.chosenFloor !==
        enquiry.spatialRequirements?.chosenFloor
    ) {
      req.body.spatialRequirements.floors = generateFloorsForType(
        req.body.spatialRequirements.chosenFloor,
      );
    }

    Object.assign(enquiry, req.body);

    // Recompute Common Pricing
    enquiry.pricing = await computePricing(enquiry);
    enquiry.updatedAt = new Date();
    await enquiry.save();

    res.json({
      success: true,
      data: enquiry,
      message: "Enquiry updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Move Enquiry to Ongoing Orders
const moveToOrder = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    }

    enquiry.status = "ongoing";
    enquiry.quoteStatus = "Revised";
    enquiry.ongoingDetails = {
      movedToOngoingAt: new Date(),
      assignedArchitect: req.body.assignedArchitect || "Karthi (Founder)",
      currentStage: " Elevation CAD & Drafting",
      progressPercent: 25,
      targetDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      workNotes:
        req.body.workNotes ||
        "Moved from Enquiry directly into Active Production.",
    };

    await enquiry.save();

    res.json({
      success: true,
      data: enquiry,
      message: `Enquiry #${enquiry.sno} (${enquiry.projectName}) successfully moved to Ongoing Orders!`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Move to Completed
const moveToCompleted = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    }

    enquiry.status = "completed";
    enquiry.ongoingDetails.progressPercent = 100;
    enquiry.completedDetails = {
      completedAt: new Date(),
      deliverablesDelivered: true,
      finalPaymentReceived: true,
      renderUrls: req.body.renderUrls || [],
    };
    enquiry.pricing.paymentStatus = "Fully Paid";

    await enquiry.save();

    res.json({
      success: true,
      data: enquiry,
      message: `Order #${enquiry.sno} marked as Completed!`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record Quote Sent
const recordQuoteSent = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    }

    const { channel = "WhatsApp" } = req.body;
    enquiry.quoteStatus = "Quote Sent";
    if (!enquiry.quoteNumber) {
      enquiry.quoteNumber = `ZDS-QT-${new Date().getFullYear()}-${String(enquiry.sno).padStart(3, "0")}`;
    }
    await enquiry.save();

    res.json({
      success: true,
      data: enquiry,
      message: `Quotation recorded as sent via ${channel}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Enquiry
const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    }
    res.json({ success: true, message: "Enquiry deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalEnquiries = await Enquiry.countDocuments({
      status: "sketchup_enquiry",
    });
    const confirmedOrders = await Enquiry.countDocuments({
      status: "confirmed",
    });
    const ongoingOrders = await Enquiry.countDocuments({ status: "ongoing" });
    const completedOrders = await Enquiry.countDocuments({
      status: "completed",
    });

    const orders = await Enquiry.find({}, "pricing status");
    let totalRevenue = 0;
    let ongoingValue = 0;
    orders.forEach((o) => {
      if (o.status === "completed") totalRevenue += o.pricing?.grandTotal || 0;
      if (o.status === "ongoing") ongoingValue += o.pricing?.grandTotal || 0;
    });

    const recentEnquiries = await Enquiry.find()
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      data: {
        sketchupEnquiriesCount: totalEnquiries,
        confirmedOrdersCount: confirmedOrders,
        ongoingOrdersCount: ongoingOrders,
        completedOrdersCount: completedOrders,
        totalRevenue,
        ongoingPipelineValue: ongoingValue,
        recentEnquiries,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Enquiry Payment Status manually
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, advanceAmount, balanceAmount } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    }

    if (!enquiry.pricing) enquiry.pricing = {};
    if (paymentStatus) enquiry.pricing.paymentStatus = paymentStatus;

    const total = enquiry.pricing.grandTotal || 0;
    if (advanceAmount !== undefined) {
      enquiry.pricing.advanceAmount = Number(advanceAmount);
    }
    if (balanceAmount !== undefined) {
      enquiry.pricing.balanceAmount = Number(balanceAmount);
    }

    // Auto-fill amounts if not explicitly specified
    if (paymentStatus === "Fully Paid" && advanceAmount === undefined) {
      enquiry.pricing.advanceAmount = total;
      enquiry.pricing.balanceAmount = 0;
    } else if (paymentStatus === "Unpaid" && advanceAmount === undefined) {
      enquiry.pricing.advanceAmount = 0;
      enquiry.pricing.balanceAmount = total;
    } else if (
      paymentStatus === "Advance Paid" &&
      advanceAmount === undefined
    ) {
      enquiry.pricing.advanceAmount = Math.round(total / 2);
      enquiry.pricing.balanceAmount = total - enquiry.pricing.advanceAmount;
    }

    await enquiry.save();
    res.json({
      success: true,
      data: enquiry,
      message: `Payment manually updated to ${enquiry.pricing.paymentStatus}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEnquiries,
  getEnquiryById,
  createEnquiry,
  updateEnquiry,
  moveToOrder,
  moveToCompleted,
  recordQuoteSent,
  deleteEnquiry,
  updatePaymentStatus,
  getDashboardStats,
  generateFloorsForType,
};
