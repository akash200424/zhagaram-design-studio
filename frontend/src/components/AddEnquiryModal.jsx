import React, { useState } from "react";
import { X, Plus, Sparkles, Building2 } from "lucide-react";

const AddEnquiryModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    mobileNo: "",
    email: "",
    projectName: "",
    projectType: "Elevation",
    projectDescription: "elevation",
    area: 2400,
    builtUpArea: 1760,
    chosenFloor: "Ground",
    orientation: "North",
    hasTerrace: true,
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        clientName: formData.clientName,
        mobileNo: formData.mobileNo,
        email: formData.email,
        projectName: formData.projectName || `${formData.clientName} residence`,
        projectType: formData.projectType,
        projectDescription: formData.projectDescription,
        siteDetails: {
          area: Number(formData.area),
          builtUpArea: Number(formData.builtUpArea),
          orientation: formData.orientation,
        },
        spatialRequirements: {
          chosenFloor: formData.chosenFloor,
          hasTerrace: formData.hasTerrace,
          terraceArea: 650,
        },
        pricing: {
          elevationSqft: Number(formData.builtUpArea),
        },
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error("Error creating enquiry:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">
                Add New SketchUp Enquiry
              </h3>
              <p className="text-[11px] text-slate-400">
                Zhagaram Design Studio Architectural Intake
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="clientName"
                required
                value={formData.clientName}
                onChange={handleChange}
                placeholder="e.g. Venkat / sri.raam"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="mobileNo"
                required
                value={formData.mobileNo}
                onChange={handleChange}
                placeholder="e.g. 9789951092"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. client@gmail.com"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                placeholder="e.g. Venkat residence"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Type
              </label>
              <select
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="Elevation">Elevation</option>
                <option value="Plan">Plan</option>
                <option value="Plan + Elevation">Plan + Elevation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Floor Level
              </label>
              <select
                name="chosenFloor"
                value={formData.chosenFloor}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="Ground">Ground</option>
                <option value="Ground +1 Floor">Ground +1 Floor</option>
                <option value="Ground +2 Floor">Ground +2 Floor</option>
                <option value="Ground +3 Floor">Ground +3 Floor</option>
                <option value="Stilt +1 Floor">Stilt +1 Floor</option>
                <option value="Stilt +2 Floor">Stilt +2 Floor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Plot Area (Sqft)
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Built-up (Sqft)
              </label>
              <input
                type="number"
                name="builtUpArea"
                value={formData.builtUpArea}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Orientation
              </label>
              <select
                name="orientation"
                value={formData.orientation}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Client Notes
            </label>
            <textarea
              name="projectDescription"
              rows={2}
              value={formData.projectDescription}
              onChange={handleChange}
              placeholder="Elevation with family room, living room, and modern facade..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold bg-black text-white hover:bg-slate-800 rounded-xl flex items-center space-x-1.5 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{loading ? "Creating..." : "Create Enquiry"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEnquiryModal;
