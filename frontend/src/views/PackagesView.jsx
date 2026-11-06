import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Save, Calculator, Check, Sparkles, Layers, Building, Palette } from 'lucide-react';
import { packagesAPI } from '../services/api';

const PackagesView = () => {
  const [pkgData, setPkgData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeServiceTab, setActiveServiceTab] = useState('elevation'); // 'plan' | 'elevation' | 'interior'

  // Live simulator state
  const [simServices, setSimServices] = useState({ plan: true, elevation: true, interior: false });
  const [simPlanSqft, setSimPlanSqft] = useState(1500);
  const [simElevSqft, setSimElevSqft] = useState(1760);
  const [simIntSqft, setSimIntSqft] = useState(1200);

  useEffect(() => {
    const fetchPackage = async () => {
      setLoading(true);
      try {
        const res = await packagesAPI.get();
        if (res.data?.success) {
          setPkgData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching package:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, []);

  if (loading || !pkgData) {
    return <div className="p-12 text-center text-slate-500">Loading Pricing Packages...</div>;
  }

  // Get active slab array
  const getActiveSlabs = () => {
    if (activeServiceTab === 'plan') return pkgData.planPriceSlabs || [];
    if (activeServiceTab === 'interior') return pkgData.interiorPriceSlabs || [];
    return pkgData.elevationPriceSlabs || [];
  };

  // Update slab field
  const handleSlabChange = (index, field, value) => {
    const key =
      activeServiceTab === 'plan'
        ? 'planPriceSlabs'
        : activeServiceTab === 'interior'
        ? 'interiorPriceSlabs'
        : 'elevationPriceSlabs';

    const currentSlabs = [...(pkgData[key] || [])];
    currentSlabs[index] = {
      ...currentSlabs[index],
      [field]: field === 'label' ? value : Number(value),
    };
    setPkgData({ ...pkgData, [key]: currentSlabs });
  };

  // Add slab
  const handleAddSlab = () => {
    const key =
      activeServiceTab === 'plan'
        ? 'planPriceSlabs'
        : activeServiceTab === 'interior'
        ? 'interiorPriceSlabs'
        : 'elevationPriceSlabs';

    const currentSlabs = [...(pkgData[key] || [])];
    const last = currentSlabs[currentSlabs.length - 1];
    const newMin = last ? last.maxSqft : 1000;
    const newMax = newMin + 500;
    const newRate = last ? Math.max(5, last.ratePerSqft - 2) : 20;

    currentSlabs.push({
      minSqft: newMin,
      maxSqft: newMax,
      ratePerSqft: newRate,
      label: `${newMin} - ${newMax} sqft`,
    });

    setPkgData({ ...pkgData, [key]: currentSlabs });
  };

  // Delete slab
  const handleDeleteSlab = (index) => {
    const key =
      activeServiceTab === 'plan'
        ? 'planPriceSlabs'
        : activeServiceTab === 'interior'
        ? 'interiorPriceSlabs'
        : 'elevationPriceSlabs';

    const updated = (pkgData[key] || []).filter((_, i) => i !== index);
    setPkgData({ ...pkgData, [key]: updated });
  };

  // Save changes to backend
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await packagesAPI.update(pkgData);
      if (res.data?.success) {
        alert('Pricing slabs for Plan, Elevation, and Interior saved successfully!');
      }
    } catch (err) {
      alert('Failed to save package: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Simulator calculation
  const findRate = (slabs, sqft, fallback = 20) => {
    if (!slabs || slabs.length === 0) return fallback;
    for (const slab of slabs) {
      if (sqft >= slab.minSqft && sqft < slab.maxSqft) {
        return slab.ratePerSqft;
      }
    }
    return slabs[slabs.length - 1]?.ratePerSqft || fallback;
  };

  const calculateSim = () => {
    const planRate = findRate(pkgData.planPriceSlabs, simPlanSqft, 12);
    const planSub = simServices.plan ? Math.round(simPlanSqft * planRate) : 0;

    const elevRate = findRate(pkgData.elevationPriceSlabs, simElevSqft, 22);
    const elevSub = simServices.elevation ? Math.round(simElevSqft * elevRate) : 0;

    const intRate = findRate(pkgData.interiorPriceSlabs, simIntSqft, 35);
    const intSub = simServices.interior ? Math.round(simIntSqft * intRate) : 0;

    const total = planSub + elevSub + intSub;

    return { planRate, planSub, elevRate, elevSub, intRate, intSub, total };
  };

  const sim = calculateSim();
  const activeSlabs = getActiveSlabs();

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Service Packages & Tiered Pricing Slabs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure dynamic square feet pricing slabs for Planning, Elevation, and Interior services
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center space-x-2 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Pricing Slabs'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Service Slabs Selector & Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* Service Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Service Pricing Slabs (₹ / Sq.Ft)
                </h3>
                <p className="text-xs text-slate-500">
                  Select a service below to configure its range of square feet pricing
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSlab}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs flex items-center space-x-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tier</span>
              </button>
            </div>

            {/* 3 Service Buttons (Plan, Elevation, Interior) */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveServiceTab('plan')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  activeServiceTab === 'plan'
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Planning Slabs</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveServiceTab('elevation')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  activeServiceTab === 'elevation'
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Elevation Slabs</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveServiceTab('interior')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  activeServiceTab === 'interior'
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Interior Slabs</span>
              </button>
            </div>

            {/* Slabs Table for Active Service */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Min Sq.Ft</th>
                    <th className="py-3 px-4">Max Sq.Ft</th>
                    <th className="py-3 px-4">Rate (₹ / Sq.Ft)</th>
                    <th className="py-3 px-4">Tier Label</th>
                    <th className="py-3 px-4 text-center w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {activeSlabs.map((slab, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-4">
                        <input
                          type="number"
                          value={slab.minSqft}
                          onChange={(e) => handleSlabChange(idx, 'minSqft', e.target.value)}
                          className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="number"
                          value={slab.maxSqft}
                          onChange={(e) => handleSlabChange(idx, 'maxSqft', e.target.value)}
                          className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-slate-400 font-bold">₹</span>
                          <input
                            type="number"
                            value={slab.ratePerSqft}
                            onChange={(e) => handleSlabChange(idx, 'ratePerSqft', e.target.value)}
                            className="w-20 px-2 py-1 bg-amber-50 border border-amber-300 rounded font-bold text-slate-900 text-xs"
                          />
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={slab.label || ''}
                          onChange={(e) => handleSlabChange(idx, 'label', e.target.value)}
                          placeholder="e.g. 500-700 sqft"
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteSlab(idx)}
                          className="text-slate-400 hover:text-red-600 p-1 transition"
                          title="Delete slab"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Common Multi-Service Simulator */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5 sticky top-24">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Calculator className="w-4 h-4 text-slate-800" />
            <h3 className="font-extrabold text-sm text-slate-900">Multi-Service Simulator</h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Service Checkboxes in Simulator */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={simServices.plan}
                  onChange={(e) => setSimServices({ ...simServices, plan: e.target.checked })}
                  className="accent-black w-4 h-4 rounded"
                />
                <span>Include Planning</span>
              </label>
              {simServices.plan && (
                <div className="pl-6">
                  <span className="text-[11px] text-slate-500">Plan Area:</span>
                  <input
                    type="number"
                    value={simPlanSqft}
                    onChange={(e) => setSimPlanSqft(Number(e.target.value))}
                    className="w-full mt-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                  />
                </div>
              )}

              <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800 pt-1">
                <input
                  type="checkbox"
                  checked={simServices.elevation}
                  onChange={(e) => setSimServices({ ...simServices, elevation: e.target.checked })}
                  className="accent-black w-4 h-4 rounded"
                />
                <span>Include Elevation</span>
              </label>
              {simServices.elevation && (
                <div className="pl-6">
                  <span className="text-[11px] text-slate-500">Elevation Area:</span>
                  <input
                    type="number"
                    value={simElevSqft}
                    onChange={(e) => setSimElevSqft(Number(e.target.value))}
                    className="w-full mt-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                  />
                </div>
              )}

              <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800 pt-1">
                <input
                  type="checkbox"
                  checked={simServices.interior}
                  onChange={(e) => setSimServices({ ...simServices, interior: e.target.checked })}
                  className="accent-black w-4 h-4 rounded"
                />
                <span>Include Interior Design</span>
              </label>
              {simServices.interior && (
                <div className="pl-6">
                  <span className="text-[11px] text-slate-500">Interior Area:</span>
                  <input
                    type="number"
                    value={simIntSqft}
                    onChange={(e) => setSimIntSqft(Number(e.target.value))}
                    className="w-full mt-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                  />
                </div>
              )}
            </div>

            {/* Simulated Live Calculation Card (Add-ons removed) */}
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 mt-4">
              {simServices.plan && (
                <div className="flex justify-between items-center text-xs">
                  <span>Planning ({simPlanSqft} sqft @ ₹{sim.planRate}):</span>
                  <span>₹ {sim.planSub.toLocaleString('en-IN')}</span>
                </div>
              )}
              {simServices.elevation && (
                <div className="flex justify-between items-center text-xs">
                  <span>Elevation ({simElevSqft} sqft @ ₹{sim.elevRate}):</span>
                  <span>₹ {sim.elevSub.toLocaleString('en-IN')}</span>
                </div>
              )}
              {simServices.interior && (
                <div className="flex justify-between items-center text-xs">
                  <span>Interior ({simIntSqft} sqft @ ₹{sim.intRate}):</span>
                  <span>₹ {sim.intSub.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-700 flex justify-between items-baseline font-bold">
                <span className="text-xs uppercase text-slate-300">Simulated Total:</span>
                <span className="text-xl text-amber-400 font-black">
                  ₹ {sim.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackagesView;
