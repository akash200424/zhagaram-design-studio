import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  AlertTriangle,
  Layers,
  Building,
  Palette,
  MapPin,
  Compass,
} from "lucide-react";
import CartTotalCard from "../components/CartTotalCard";
import { enquiriesAPI, packagesAPI } from "../services/api";

const QuoteReviseView = ({
  enquiry,
  isNew = false,
  onBack,
  onSaveSuccess,
  onMoveToOrder,
  onGeneratePdf,
  onWhatsApp,
}) => {
  const [formData, setFormData] = useState(null);
  const [activePackage, setActivePackage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Floor room generator for accurate floor count and rooms
  const generateFloorsList = (floorType) => {
    let names = ["Ground Floor"];
    if (floorType === "Ground +1 Floor")
      names = ["Ground Floor", "First Floor"];
    if (floorType === "Ground +2 Floor")
      names = ["Ground Floor", "First Floor", "Second Floor"];
    if (floorType === "Ground +3 Floor")
      names = ["Ground Floor", "First Floor", "Second Floor", "Third Floor"];
    if (floorType === "Stilt +1 Floor") names = ["Stilt Floor", "First Floor"];
    if (floorType === "Stilt +2 Floor")
      names = ["Stilt Floor", "First Floor", "Second Floor"];
    if (floorType === "Stilt +3 Floor")
      names = ["Stilt Floor", "First Floor", "Second Floor", "Third Floor"];
    if (floorType === "Stilt +4 Floor")
      names = [
        "Stilt Floor",
        "First Floor",
        "Second Floor",
        "Third Floor",
        "Fourth Floor",
      ];

    const defaultRoomsTemplate = [
      {
        areaName: "Parking",
        selected: false,
        nos: 1,
        minArea: 40,
        requiredArea: 40,
        total: 40,
      },
      {
        areaName: "Sitout",
        selected: false,
        nos: 1,
        minArea: 25,
        requiredArea: 25,
        total: 25,
      },
      {
        areaName: "Foyer",
        selected: false,
        nos: 1,
        minArea: 25,
        requiredArea: 25,
        total: 25,
      },
      {
        areaName: "Living Hall",
        selected: false,
        nos: 1,
        minArea: 80,
        requiredArea: 80,
        total: 80,
      },
      {
        areaName: "Dining Hall",
        selected: false,
        nos: 1,
        minArea: 80,
        requiredArea: 80,
        total: 80,
      },
      {
        areaName: "Kitchen",
        selected: false,
        nos: 1,
        minArea: 60,
        requiredArea: 60,
        total: 60,
      },
      {
        areaName: "Kitchen Store",
        selected: false,
        nos: 1,
        minArea: 25,
        requiredArea: 25,
        total: 25,
      },
      {
        areaName: "Utility",
        selected: false,
        nos: 1,
        minArea: 25,
        requiredArea: 25,
        total: 25,
      },
      {
        areaName: "Pooja",
        selected: false,
        nos: 1,
        minArea: 20,
        requiredArea: 20,
        total: 20,
      },
      {
        areaName: "Courtyard",
        selected: false,
        nos: 1,
        minArea: 30,
        requiredArea: 30,
        total: 30,
      },
      {
        areaName: "Master Bedroom",
        selected: false,
        nos: 1,
        minArea: 160,
        requiredArea: 160,
        total: 160,
      },
      {
        areaName: "Guest Bedroom",
        selected: false,
        nos: 1,
        minArea: 70,
        requiredArea: 70,
        total: 70,
      },
      {
        areaName: "Family Room",
        selected: false,
        nos: 1,
        minArea: 100,
        requiredArea: 100,
        total: 100,
      },
      {
        areaName: "Gym",
        selected: false,
        nos: 1,
        minArea: 100,
        requiredArea: 100,
        total: 100,
      },
      {
        areaName: "Yoga Room",
        selected: false,
        nos: 1,
        minArea: 100,
        requiredArea: 100,
        total: 100,
      },
      {
        areaName: "Store Room",
        selected: false,
        nos: 1,
        minArea: 40,
        requiredArea: 40,
        total: 40,
      },
      {
        areaName: "Home Theatre",
        selected: false,
        nos: 1,
        minArea: 110,
        requiredArea: 110,
        total: 110,
      },
      {
        areaName: "Staircase",
        selected: false,
        nos: 1,
        minArea: 80,
        requiredArea: 80,
        total: 80,
        hasOts: false,
      },
      {
        areaName: "Lift",
        selected: false,
        nos: 1,
        minArea: 25,
        requiredArea: 25,
        total: 25,
      },
    ];

    const getRoomsForLevel = (levelName) => {
      return defaultRoomsTemplate.map((rm) => ({ ...rm }));
    };

    return names.map((name) => ({
      floorName: name,
      rooms: getRoomsForLevel(name),
    }));
  };

  // State to hold new custom room inputs per floor
  const [customRoomInputs, setCustomRoomInputs] = useState({});

  // Fetch package pricing slabs
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await packagesAPI.get();
        if (res.data?.success) {
          setActivePackage(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching package slabs:", err);
      }
    };
    fetchPackage();
  }, []);

  // Initialize formData
  useEffect(() => {
    if (enquiry) {
      const copy = JSON.parse(JSON.stringify(enquiry));
      if (!copy.services) {
        copy.services = {
          plan: true,
          elevation: true,
          interior: false,
        };
      }
      if (!copy.elevationDetails) {
        copy.elevationDetails = {
          elevationSqft:
            copy.pricing?.elevationSqft || copy.siteDetails?.builtUpArea || 0,
          note: "",
        };
      }
      if (!copy.interiorDetails) {
        copy.interiorDetails = {
          interiorSqft: copy.pricing?.interiorSqft || 0,
          note: "",
        };
      }
      if (!copy.address) {
        copy.address = "";
      }

      // Ensure floors exist
      const chosenFloor = copy.spatialRequirements?.chosenFloor || "Ground";
      if (
        !copy.spatialRequirements?.floors ||
        copy.spatialRequirements.floors.length === 0
      ) {
        copy.spatialRequirements = {
          ...copy.spatialRequirements,
          chosenFloor,
          floors: generateFloorsList(chosenFloor),
        };
      }

      setFormData(copy);
    }
  }, [enquiry]);

  // Dynamic Common Price Calculation
  useEffect(() => {
    if (!formData || !activePackage) return;

    const services = formData.services || {
      plan: false,
      elevation: true,
      interior: false,
    };

    const findRate = (slabs, sqft, fallback = 20) => {
      if (!slabs || slabs.length === 0) return fallback;
      for (const slab of slabs) {
        if (sqft >= slab.minSqft && sqft < slab.maxSqft) {
          return slab.ratePerSqft;
        }
      }
      return slabs[slabs.length - 1]?.ratePerSqft || fallback;
    };

    // 1. Plan
    const planSqft = Number(formData.siteDetails?.builtUpArea || 0);
    const planRate = findRate(activePackage.planPriceSlabs, planSqft, 12);
    const planSubtotal = services.plan ? Math.round(planSqft * planRate) : 0;

    // 2. Elevation
    const elevationSqft = Number(formData.elevationDetails?.elevationSqft || 0);
    const elevationRate = findRate(
      activePackage.elevationPriceSlabs,
      elevationSqft,
      22,
    );
    const elevationSubtotal = services.elevation
      ? Math.round(elevationSqft * elevationRate)
      : 0;

    // 3. Interior
    const interiorSqft = Number(formData.interiorDetails?.interiorSqft || 0);
    const interiorRate = findRate(
      activePackage.interiorPriceSlabs,
      interiorSqft,
      35,
    );
    const interiorSubtotal = services.interior
      ? Math.round(interiorSqft * interiorRate)
      : 0;

    // Add-ons & surcharges removed as instructed
    const otsFee = 0;
    const whiteLabel = 0;
    const subtotal = planSubtotal + elevationSubtotal + interiorSubtotal;
    const discount = Number(formData.pricing?.discount || 0);
    const grandTotal = Math.max(0, subtotal - discount);
    const advance = Math.round(grandTotal / 2);
    const balance = grandTotal - advance;

    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
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
        whiteLabelFees: whiteLabel,
        subtotal,
        grandTotal,
        paymentStatus: prev.pricing?.paymentStatus || "Unpaid",
        advanceAmount:
          prev.pricing?.advanceAmount !== undefined
            ? prev.pricing.advanceAmount
            : prev.pricing?.paymentStatus === "Fully Paid"
              ? grandTotal
              : prev.pricing?.paymentStatus === "Advance Paid"
                ? advance
                : 0,
        balanceAmount:
          prev.pricing?.balanceAmount !== undefined
            ? prev.pricing.balanceAmount
            : Math.max(0, grandTotal - (prev.pricing?.advanceAmount || 0)),
      },
    }));
  }, [
    formData?.services,
    formData?.siteDetails?.builtUpArea,
    formData?.elevationDetails?.elevationSqft,
    formData?.interiorDetails?.interiorSqft,
    formData?.pricing?.discount,
    formData?.spatialRequirements?.floors,
    activePackage,
  ]);

  if (!formData) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading Enquiry Form...
      </div>
    );
  }

  const services = formData.services || {
    plan: true,
    elevation: true,
    interior: false,
  };
  const site = formData.siteDetails || {};
  const spatial = formData.spatialRequirements || {};
  const currentFloorType = spatial.chosenFloor || "Ground";

  // Calculate sum of room square feet across all visible floors
  const computeTotalPlannedRoomArea = () => {
    let sum = 0;
    (spatial.floors || []).forEach((fl) => {
      (fl.rooms || []).forEach((rm) => {
        if (rm.selected) {
          sum += Number(
            rm.total || (rm.nos || 1) * (rm.requiredArea || rm.minArea || 0),
          );
        }
      });
    });
    return sum;
  };

  const totalRoomSqft = computeTotalPlannedRoomArea();
  const builtUpLimit = Number(site.builtUpArea || 0);
  const isAreaExceeded = builtUpLimit > 0 && totalRoomSqft > builtUpLimit;
  const areaDifference = totalRoomSqft - builtUpLimit;

  // Toggle Services Checkbox
  const handleServiceToggle = (key) => {
    const updatedServices = { ...services, [key]: !services[key] };
    setFormData((prev) => ({ ...prev, services: updatedServices }));
  };

  // Change floor configuration: "Ground +1 Floor" shows Ground Floor + First Floor rooms!
  const handleFloorSelect = (floorType) => {
    const newFloors = generateFloorsList(floorType);
    setFormData((prev) => ({
      ...prev,
      spatialRequirements: {
        ...prev.spatialRequirements,
        chosenFloor: floorType,
        floors: newFloors,
      },
    }));
  };

  // Room checkbox / area change
  const handleRoomChange = (floorIndex, roomIndex, field, value) => {
    setFormData((prev) => {
      const floors = [...prev.spatialRequirements.floors];
      const floor = { ...floors[floorIndex] };
      const rooms = [...floor.rooms];
      const room = { ...rooms[roomIndex], [field]: value };

      if (field === "requiredArea" || field === "nos") {
        const nos = field === "nos" ? Number(value) : room.nos || 1;
        const req =
          field === "requiredArea" ? Number(value) : room.requiredArea || 0;
        room.total = nos * req;
      }

      rooms[roomIndex] = room;
      floor.rooms = rooms;
      floors[floorIndex] = floor;

      return {
        ...prev,
        spatialRequirements: {
          ...prev.spatialRequirements,
          floors,
        },
      };
    });
  };

  // Custom room add for a specific floor
  const handleAddCustomRoom = (floorIndex) => {
    const inputState = customRoomInputs[floorIndex] || {};
    const name = inputState.name?.trim();
    const req = Number(inputState.area || 100);

    if (!name) return;

    setFormData((prev) => {
      const floors = [...prev.spatialRequirements.floors];
      const floor = { ...floors[floorIndex] };
      const rooms = [
        ...floor.rooms,
        {
          areaName: name,
          selected: true,
          nos: 1,
          minArea: req,
          requiredArea: req,
          total: req,
          hasOts: name.toLowerCase().includes("staircase"),
        },
      ];
      floor.rooms = rooms;
      floors[floorIndex] = floor;

      return {
        ...prev,
        spatialRequirements: {
          ...prev.spatialRequirements,
          floors,
        },
      };
    });

    setCustomRoomInputs((prev) => ({
      ...prev,
      [floorIndex]: { name: "", area: "" },
    }));
  };

  // Save Enquiry with strict frontend validation
  const handleSave = async () => {
    if (!formData?.clientName?.trim()) {
      alert("Please enter Customer Name");
      return;
    }
    if (!formData?.mobileNo?.trim()) {
      alert("Please enter Mobile Number");
      return;
    }
    if (!formData?.projectName?.trim()) {
      alert("Please enter Project Name");
      return;
    }

    const services = formData.services || {
      plan: false,
      elevation: false,
      interior: false,
    };
    if (!services.plan && !services.elevation && !services.interior) {
      alert("Please select at least one service: Plan, Elevation, or Interior");
      return;
    }

    setIsSaving(true);
    try {
      let res;
      if (formData._id && !isNew) {
        res = await enquiriesAPI.update(formData._id, formData);
      } else {
        const payload = { ...formData };
        delete payload._id; // Prevent CastError on new record creation
        res = await enquiriesAPI.create(payload);
      }
      if (res.data?.success) {
        alert("Enquiry & Quotation Saved Successfully!");
        if (onSaveSuccess) onSaveSuccess(res.data.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert("Failed to save enquiry: " + msg);
    } finally {
      setIsSaving(false);
    }
  };

  const floorButtons = [
    "Ground",
    "Ground +1 Floor",
    "Ground +2 Floor",
    "Ground +3 Floor",
    "Stilt +1 Floor",
    "Stilt +2 Floor",
    "Stilt +3 Floor",
    "Stilt +4 Floor",
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-bold text-slate-800 hover:text-black transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Enquiries</span>
        </button>

        <div className="flex items-center space-x-3 text-xs">
          {!isNew && formData._id && (
            <button
              type="button"
              onClick={async () => {
                if (
                  window.confirm(
                    `Are you sure you want to delete enquiry #${formData.sno} for "${formData.projectName}"?`,
                  )
                ) {
                  try {
                    await enquiriesAPI.delete(formData._id);
                    onBack();
                  } catch (err) {
                    alert("Error deleting: " + err.message);
                  }
                }
              }}
              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
              title="Delete this enquiry"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Enquiry</span>
            </button>
          )}
          <span className="font-mono text-slate-500">
            {formData.quoteNumber ||
              (isNew ? "NEW ENQUIRY" : `#${formData.sno}`)}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-black text-white font-bold text-[11px]">
            {formData.quoteStatus || "Draft"}
          </span>
        </div>
      </div>

      {/* Main Page Title */}
      <div className="py-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {isNew ? "Add Enquiry" : "Edit Enquiry & Quotation"}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Fill customer details, select required services (Planning, Elevation,
          Interior), and manage estimation
        </p>
      </div>

      {/* Two Column Layout: Main Form (Left 8 cols) & Common Calculator (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* ================= SECTION 1: CUSTOMER DETAILS ================= */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Customer Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  placeholder="e.g. Venkat / sri.raam"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.mobileNo || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, mobileNo: e.target.value })
                  }
                  placeholder="e.g. 9789951092"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium font-mono focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Site / Customer Address
                </label>
                <input
                  type="text"
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="e.g. Plot No 14, Anna Nagar, Chennai"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Email Address{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="e.g. client@gmail.com (optional)"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.projectName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, projectName: e.target.value })
                  }
                  placeholder="e.g. Venkat residence"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          </div>

          {/* ================= SECTION 2: THREE SERVICES SELECTION ================= */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Select Services Needed
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Planning Checkbox */}
              <label
                className={`p-4 rounded-xl border-2 flex items-start space-x-3 cursor-pointer transition select-none ${
                  services.plan
                    ? "border-black bg-slate-950 text-white shadow-sm"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={services.plan}
                  onChange={() => handleServiceToggle("plan")}
                  className="w-4 h-4 mt-0.5 rounded accent-amber-400"
                />
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Planning (Plan)</span>
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 ${services.plan ? "text-slate-300" : "text-slate-500"}`}
                  >
                    Site details, setbacks & multi-floor rooms
                  </div>
                </div>
              </label>

              {/* Elevation Checkbox */}
              <label
                className={`p-4 rounded-xl border-2 flex items-start space-x-3 cursor-pointer transition select-none ${
                  services.elevation
                    ? "border-black bg-slate-950 text-white shadow-sm"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={services.elevation}
                  onChange={() => handleServiceToggle("elevation")}
                  className="w-4 h-4 mt-0.5 rounded accent-amber-400"
                />
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>Elevation</span>
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 ${services.elevation ? "text-slate-300" : "text-slate-500"}`}
                  >
                    Input square feet only
                  </div>
                </div>
              </label>

              {/* Interior Checkbox */}
              <label
                className={`p-4 rounded-xl border-2 flex items-start space-x-3 cursor-pointer transition select-none ${
                  services.interior
                    ? "border-black bg-slate-950 text-white shadow-sm"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={services.interior}
                  onChange={() => handleServiceToggle("interior")}
                  className="w-4 h-4 mt-0.5 rounded accent-amber-400"
                />
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    <span>Interior</span>
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 ${services.interior ? "text-slate-300" : "text-slate-500"}`}
                  >
                    Input square feet only
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* ================= SECTION 3: PLANNING FLOW (ONLY IF PLAN CHECKED) ================= */}
          {services.plan && (
            <div className="bg-white rounded-2xl border-2 border-black/10 shadow-xs p-6 space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-slate-900" />
                  <h2 className="text-base font-extrabold text-slate-900">
                    Planning Specifications (Plan Flow)
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
                  Site, Setbacks & Floor Rooms
                </span>
              </div>

              {/* Live Area Exceed Indicator Banner */}
              {isAreaExceeded && (
                <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl flex items-start space-x-3 text-amber-900 animate-pulse">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-extrabold text-xs">
                      ⚠️ Warning: Planned Room Area Exceeds Built-up Area!
                    </div>
                    <div className="text-[11px] text-amber-800 mt-0.5">
                      Total room square footage (
                      <strong>{totalRoomSqft} sq.ft</strong>) exceeds the
                      designated built-up area (
                      <strong>{builtUpLimit} sq.ft</strong>) by{" "}
                      <strong className="text-red-700">
                        +{areaDifference} sq.ft
                      </strong>
                      . Please adjust room requirements or increase designated
                      built-up area.
                    </div>
                  </div>
                </div>
              )}

              {/* Designated Plot & Built-up Area Side-by-Side */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    1. Designated Project Areas
                  </span>
                  <div className="font-mono text-[11px]">
                    Rooms Sum:{" "}
                    <strong
                      className={
                        isAreaExceeded ? "text-red-600" : "text-emerald-700"
                      }
                    >
                      {totalRoomSqft} sq.ft
                    </strong>{" "}
                    / Built-up: <strong>{builtUpLimit} sq.ft</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Plot Area (Sq.Ft)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={site.area || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          siteDetails: {
                            ...prev.siteDetails,
                            area: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Designated Built-up Area (Sq.Ft){" "}
                      <span className="text-amber-600 font-bold">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={site.builtUpArea || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          siteDetails: {
                            ...prev.siteDetails,
                            builtUpArea: Number(e.target.value),
                          },
                        }))
                      }
                      className={`w-full px-3 py-2 text-xs rounded-lg font-bold text-slate-900 border ${
                        isAreaExceeded
                          ? "bg-amber-50 border-amber-400"
                          : "bg-white border-slate-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Orientation
                    </label>
                    <select
                      value={site.orientation || "North"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          siteDetails: {
                            ...prev.siteDetails,
                            orientation: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium"
                    >
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="East">East</option>
                      <option value="West">West</option>
                      <option value="North-East">North-East</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Site Boundaries and Setbacks (X1-X4, S1-S4) */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800">
                  2. Technical Boundaries & Setbacks
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  {/* Side Details (X1-X4) */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-700 mb-2">
                      Side Details
                    </div>
                    {(
                      site.sideDetails || [
                        { label: "X1", feet: 28, inches: 6 },
                        { label: "X2", feet: 112, inches: 0 },
                        { label: "X3", feet: 28, inches: 6 },
                        { label: "X4", feet: 112, inches: 0 },
                      ]
                    ).map((side, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center space-x-1.5 mb-1.5"
                      >
                        <span className="w-5 font-bold text-slate-600">
                          {side.label}
                        </span>
                        <input
                          type="number"
                          value={side.feet}
                          onChange={(e) => {
                            const updated = [...(site.sideDetails || [])];
                            if (updated[sIdx])
                              updated[sIdx].feet = Number(e.target.value);
                            setFormData({
                              ...formData,
                              siteDetails: { ...site, sideDetails: updated },
                            });
                          }}
                          className="w-12 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-center"
                        />
                        <span className="text-[10px] text-slate-400">ft</span>
                        <input
                          type="number"
                          value={side.inches}
                          onChange={(e) => {
                            const updated = [...(site.sideDetails || [])];
                            if (updated[sIdx])
                              updated[sIdx].inches = Number(e.target.value);
                            setFormData({
                              ...formData,
                              siteDetails: { ...site, sideDetails: updated },
                            });
                          }}
                          className="w-12 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-center"
                        />
                        <span className="text-[10px] text-slate-400">in</span>
                      </div>
                    ))}
                  </div>

                  {/* Setback Details (S1-S4) */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-700 mb-2">
                      Setback Details
                    </div>
                    {(
                      site.setbackDetails || [
                        { label: "S1", feet: 3, inches: 0 },
                        { label: "S2", feet: 3, inches: 0 },
                        { label: "S3", feet: 3, inches: 0 },
                        { label: "S4", feet: 3, inches: 0 },
                      ]
                    ).map((sb, sbIdx) => (
                      <div
                        key={sbIdx}
                        className="flex items-center space-x-1.5 mb-1.5"
                      >
                        <span className="w-5 font-bold text-slate-600">
                          {sb.label}
                        </span>
                        <input
                          type="number"
                          value={sb.feet}
                          onChange={(e) => {
                            const updated = [...(site.setbackDetails || [])];
                            if (updated[sbIdx])
                              updated[sbIdx].feet = Number(e.target.value);
                            setFormData({
                              ...formData,
                              siteDetails: { ...site, setbackDetails: updated },
                            });
                          }}
                          className="w-12 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-center"
                        />
                        <span className="text-[10px] text-slate-400">ft</span>
                        <input
                          type="number"
                          value={sb.inches}
                          onChange={(e) => {
                            const updated = [...(site.setbackDetails || [])];
                            if (updated[sbIdx])
                              updated[sbIdx].inches = Number(e.target.value);
                            setFormData({
                              ...formData,
                              siteDetails: { ...site, setbackDetails: updated },
                            });
                          }}
                          className="w-12 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-center"
                        />
                        <span className="text-[10px] text-slate-400">in</span>
                      </div>
                    ))}
                  </div>

                  {/* Road Width (R1-R2) */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-700 mb-2">
                      Road Width
                    </div>
                    {(
                      site.roadWidth || [
                        { label: "R1", selected: true, feet: 27, inches: 0 },
                        { label: "R2", selected: true, feet: 30, inches: 0 },
                      ]
                    ).map((rw, rwIdx) => (
                      <div
                        key={rwIdx}
                        className="flex items-center space-x-1.5 mb-1.5"
                      >
                        <span className="w-5 font-bold text-slate-600">
                          {rw.label}
                        </span>
                        <input
                          type="number"
                          value={rw.feet}
                          onChange={(e) => {
                            const updated = [...(site.roadWidth || [])];
                            if (updated[rwIdx])
                              updated[rwIdx].feet = Number(e.target.value);
                            setFormData({
                              ...formData,
                              siteDetails: { ...site, roadWidth: updated },
                            });
                          }}
                          className="w-14 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-center"
                        />
                        <span className="text-[10px] text-slate-400">ft</span>
                      </div>
                    ))}
                  </div>

                  {/* Diagonals (Z1) */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-700 mb-2">
                      Diagonals
                    </div>
                    {(
                      site.diagonalDetails || [
                        { label: "Z1", feet: 134, inches: 0 },
                      ]
                    ).map((dg, dgIdx) => (
                      <div
                        key={dgIdx}
                        className="flex items-center space-x-1.5 mb-1.5"
                      >
                        <span className="w-5 font-bold text-slate-600">
                          {dg.label}
                        </span>
                        <input
                          type="number"
                          value={dg.feet}
                          onChange={(e) => {
                            const updated = [...(site.diagonalDetails || [])];
                            if (updated[dgIdx])
                              updated[dgIdx].feet = Number(e.target.value);
                            setFormData({
                              ...formData,
                              siteDetails: {
                                ...site,
                                diagonalDetails: updated,
                              },
                            });
                          }}
                          className="w-14 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-center"
                        />
                        <span className="text-[10px] text-slate-400">ft</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Choose the Floor Buttons & Terrace */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    3. Choose Floor Configuration
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Selecting Ground + 1 displays both Ground & 1st Floor rooms!
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {floorButtons.map((btn) => {
                    const isSelected = currentFloorType === btn;
                    return (
                      <button
                        key={btn}
                        type="button"
                        onClick={() => handleFloorSelect(btn)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                          isSelected
                            ? "bg-black text-white shadow-sm"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        )}
                        <span>{btn}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Terrace Option */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 mt-2">
                  <div>
                    <div className="font-bold text-xs text-slate-800">
                      Need Terrace Consideration
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Includes weatherproofing & open terrace architectural
                      layout
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        spatialRequirements: {
                          ...prev.spatialRequirements,
                          hasTerrace: !prev.spatialRequirements.hasTerrace,
                        },
                      }))
                    }
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                      spatial.hasTerrace
                        ? "bg-black text-white"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Terrace Space</span>
                  </button>
                </div>
              </div>

              {/* 4. Floor Spatial Requirements (STACKED FOR EVERY FLOOR: e.g. Ground Floor + First Floor!) */}
              <div className="space-y-6 pt-2">
                <div className="text-xs font-bold text-slate-800">
                  4. Multi-Floor Spatial & Room Requirements (
                  {spatial.floors?.length || 1} Floor Levels Active)
                </div>

                {(spatial.floors || []).map((floor, fIdx) => (
                  <div
                    key={fIdx}
                    className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                        <h3 className="font-extrabold text-sm text-slate-900">
                          {floor.floorName}
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {floor.rooms?.filter((r) => r.selected).length || 0}{" "}
                        Rooms Selected
                      </span>
                    </div>

                    {/* Quick Add Custom Room for this floor */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-slate-700">
                        Add Room to {floor.floorName}:
                      </span>
                      <input
                        type="text"
                        value={customRoomInputs[fIdx]?.name || ""}
                        onChange={(e) =>
                          setCustomRoomInputs({
                            ...customRoomInputs,
                            [fIdx]: {
                              ...customRoomInputs[fIdx],
                              name: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. Prayer Room / Library"
                        className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded text-xs w-44"
                      />
                      <span className="font-bold text-slate-700">
                        Area (Sq.ft):
                      </span>
                      <input
                        type="number"
                        value={customRoomInputs[fIdx]?.area || ""}
                        onChange={(e) =>
                          setCustomRoomInputs({
                            ...customRoomInputs,
                            [fIdx]: {
                              ...customRoomInputs[fIdx],
                              area: e.target.value,
                            },
                          })
                        }
                        placeholder="120"
                        className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded text-xs w-20"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCustomRoom(fIdx)}
                        className="px-3.5 py-1 bg-black hover:bg-slate-800 text-white rounded font-bold text-xs"
                      >
                        Add
                      </button>
                    </div>

                    {/* Rooms Table */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-black text-white font-bold">
                          <tr>
                            <th className="py-2 px-3">Room / Space</th>
                            <th className="py-2 px-3 text-center w-20">Nos</th>
                            <th className="py-2 px-3 text-center w-24">
                              Min Area
                            </th>
                            <th className="py-2 px-3 text-center w-28">
                              Required
                            </th>
                            <th className="py-2 px-3 text-center w-24">
                              Total
                            </th>
                            <th className="py-2 px-3 text-center w-36">
                              Special Option
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {(floor.rooms || []).map((room, rIdx) => {
                            const isStaircase = room.areaName
                              .toLowerCase()
                              .includes("staircase");
                            return (
                              <tr
                                key={rIdx}
                                className="hover:bg-slate-50/70 transition"
                              >
                                <td className="py-2 px-3">
                                  <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={room.selected}
                                      onChange={(e) =>
                                        handleRoomChange(
                                          fIdx,
                                          rIdx,
                                          "selected",
                                          e.target.checked,
                                        )
                                      }
                                      className="accent-black w-4 h-4 rounded"
                                    />
                                    <span className="font-semibold text-slate-800">
                                      {room.areaName}
                                    </span>
                                  </label>
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <input
                                    type="number"
                                    min="1"
                                    value={room.nos || 1}
                                    onChange={(e) =>
                                      handleRoomChange(
                                        fIdx,
                                        rIdx,
                                        "nos",
                                        e.target.value,
                                      )
                                    }
                                    className="w-14 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-center text-xs"
                                  />
                                </td>
                                <td className="py-2 px-3 text-center font-mono text-slate-500">
                                  {room.minArea || 0}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <input
                                    type="number"
                                    value={
                                      room.requiredArea || room.minArea || 0
                                    }
                                    onChange={(e) =>
                                      handleRoomChange(
                                        fIdx,
                                        rIdx,
                                        "requiredArea",
                                        e.target.value,
                                      )
                                    }
                                    className="w-20 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-center text-xs font-bold"
                                  />
                                </td>
                                <td className="py-2 px-3 text-center font-bold font-mono text-slate-900">
                                  {room.total ||
                                    (room.nos || 1) *
                                      (room.requiredArea || room.minArea || 0)}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  {isStaircase ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRoomChange(
                                          fIdx,
                                          rIdx,
                                          "hasOts",
                                          !room.hasOts,
                                        )
                                      }
                                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition border ${
                                        room.hasOts
                                          ? "bg-blue-600 text-white border-blue-600"
                                          : "bg-slate-100 text-slate-600 border-slate-300"
                                      }`}
                                    >
                                      {room.hasOts
                                        ? "✓ With OTS (+₹2500)"
                                        : "Without OTS"}
                                    </button>
                                  ) : (
                                    <span className="text-slate-300 text-[11px]">
                                      —
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= SECTION 4: ELEVATION FLOW (SQUARE FEET ONLY) ================= */}
          {services.elevation && (
            <div className="bg-white rounded-2xl border-2 border-black/10 shadow-xs p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-slate-900" />
                  <h2 className="text-base font-extrabold text-slate-900">
                    Elevation Specifications (Square Feet Input Only)
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-slate-900 text-white font-bold text-[11px]">
                  Elevation
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Elevation Square Footage (Sq.Ft){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.elevationDetails?.elevationSqft || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        elevationDetails: {
                          ...prev.elevationDetails,
                          elevationSqft: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-1 focus:ring-black"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Rate: ₹{formData.pricing?.elevationRate || 22}/sq.ft applied
                    automatically from tier slab
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Elevation Styling Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.elevationDetails?.note || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        elevationDetails: {
                          ...prev.elevationDetails,
                          note: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g. Modern contemporary facade with brick jali and wooden louvers..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 5: INTERIOR FLOW (SQUARE FEET ONLY) ================= */}
          {services.interior && (
            <div className="bg-white rounded-2xl border-2 border-black/10 shadow-xs p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-slate-900" />
                  <h2 className="text-base font-extrabold text-slate-900">
                    Interior Design Specifications (Square Feet Input Only)
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[11px] border border-purple-200">
                  Interior Package
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Interior Square Footage (Sq.Ft){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.interiorDetails?.interiorSqft || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        interiorDetails: {
                          ...prev.interiorDetails,
                          interiorSqft: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-1 focus:ring-black"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Rate: ₹{formData.pricing?.interiorRate || 35}/sq.ft applied
                    automatically from interior slab
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Interior Scope Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.interiorDetails?.note || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        interiorDetails: {
                          ...prev.interiorDetails,
                          note: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g. Modular kitchen, living room TV unit, false ceiling lighting..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Column: Common Price Calculator & Actions (4 cols) */}
        <div className="lg:col-span-4">
          {(() => {
            const hasValidArea =
              (services.plan &&
                (Number(formData.siteDetails?.builtUpArea) > 0 ||
                  Number(formData.pricing?.planSqft) > 0)) ||
              (services.elevation &&
                (Number(formData.elevationDetails?.elevationSqft) > 0 ||
                  Number(formData.pricing?.elevationSqft) > 0)) ||
              (services.interior &&
                (Number(formData.interiorDetails?.interiorSqft) > 0 ||
                  Number(formData.pricing?.interiorSqft) > 0));

            const isMandatoryFilled = Boolean(
              formData?.clientName?.trim() &&
              formData?.mobileNo?.trim() &&
              formData?.projectName?.trim() &&
              hasValidArea,
            );

            return (
              <CartTotalCard
                pricing={formData.pricing}
                services={services}
                onChangePricing={(updatedPricing) =>
                  setFormData((prev) => ({ ...prev, pricing: updatedPricing }))
                }
                onSaveDraft={handleSave}
                onMoveToOrder={() => onMoveToOrder(formData)}
                onGeneratePdf={() => onGeneratePdf(formData)}
                onOpenWhatsApp={() => onWhatsApp(formData)}
                isSaving={isSaving}
                isMandatoryFilled={isMandatoryFilled}
              />
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default QuoteReviseView;
