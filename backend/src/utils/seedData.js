const User = require("../models/User");
const Package = require("../models/Package");
const Enquiry = require("../models/Enquiry");
const Revision = require("../models/Revision");
const {
  defaultPlanSlabs,
  defaultElevationSlabs,
  defaultInteriorSlabs,
} = require("../controllers/packageController");

const seedInitialData = async () => {
  try {
    // 1. Delete old "Arvinth" user if exists and ensure "Karthi (Founder)" is created
    await User.deleteMany({ email: "arvinth@zhagaram.com" });

    let founderUser = await User.findOne({
      email: "zhagaramprojects@gmail.com",
    });
    if (!founderUser) {
      console.log(
        "[Seeding] Creating Founder user Karthi (zhagaramprojects@gmail.com)...",
      );
      founderUser = await User.create({
        name: "Karthi",
        email: "zhagaramprojects@gmail.com",
        password: "viyan",
        role: "founder",
        designation: "Founder of the company",
        phone: "8489904344",
        isCheckedIn: true,
      });
      console.log(
        "[Seeding] Founder Karthi created successfully: zhagaramprojects@gmail.com / admin",
      );
    } else {
      founderUser.name = "Karthi";
      founderUser.designation = "Founder of the company";
      founderUser.phone = "8489904344";
      founderUser.role = "founder";
      await founderUser.save();
    }

    // 2. Ensure package has Plan, Elevation, and Interior slabs
    let pkg = await Package.findOne({ isActive: true });
    if (!pkg) {
      console.log("[Seeding] Creating default multi-service package...");
      pkg = await Package.create({
        packageName: "Zhagaram Architectural & Interior Packages",
        packageCode: "ZHAGARAM_SERVICES_STD",
        description:
          "Comprehensive architectural planning, elevation, and interior design estimation.",
        planPriceSlabs: defaultPlanSlabs,
        elevationPriceSlabs: defaultElevationSlabs,
        interiorPriceSlabs: defaultInteriorSlabs,
        staircaseOtsCharge: 0,
        terraceRatePerSqft: 0,
        whiteLabelFee: 0,
      });
    } else {
      let modified = false;
      if (!pkg.planPriceSlabs || pkg.planPriceSlabs.length === 0) {
        pkg.planPriceSlabs = defaultPlanSlabs;
        modified = true;
      }
      if (!pkg.elevationPriceSlabs || pkg.elevationPriceSlabs.length === 0) {
        pkg.elevationPriceSlabs = defaultElevationSlabs;
        modified = true;
      }
      if (!pkg.interiorPriceSlabs || pkg.interiorPriceSlabs.length === 0) {
        pkg.interiorPriceSlabs = defaultInteriorSlabs;
        modified = true;
      }
      if (modified) await pkg.save();
    }

    // 3. Ensure existing enquiries have services and assigned to Karthi
    const existingEnquiries = await Enquiry.find({});
    for (const enq of existingEnquiries) {
      let needsSave = false;
      if (enq.ongoingDetails?.assignedArchitect?.includes("Arvinth")) {
        enq.ongoingDetails.assignedArchitect = "Karthi (Founder)";
        needsSave = true;
      }
      if (
        !enq.services ||
        (!enq.services.plan &&
          !enq.services.elevation &&
          !enq.services.interior)
      ) {
        enq.services = {
          plan: enq.projectType?.toLowerCase().includes("plan") || false,
          elevation: true,
          interior:
            enq.projectType?.toLowerCase().includes("interior") || false,
        };
        needsSave = true;
      }
      if (needsSave) {
        await enq.save();
      }
    }
  } catch (err) {
    console.error("[Seeding Error]:", err.message);
  }
};

module.exports = seedInitialData;
