import React from 'react';
import { X, Image as ImageIcon, MapPin, Compass, FileText, Share2, Layers } from 'lucide-react';

const ViewDetailsModal = ({ isOpen, onClose, enquiry, onRevise, onGeneratePdf, onWhatsApp }) => {
  if (!isOpen || !enquiry) return null;

  const site = enquiry.siteDetails || {};
  const spatial = enquiry.spatialRequirements || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/20 text-white">
                #{enquiry.sno}
              </span>
              <h3 className="font-bold text-base tracking-tight">{enquiry.projectName || 'Project Details'}</h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Client: {enquiry.clientName} • Mobile: {enquiry.mobileNo} • {enquiry.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Architectural Drawing & Dimension Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-slate-500" />
                Site Plan & Dimension Drawings
              </span>
              <span className="text-[11px] text-slate-500">
                Orientation: <strong className="text-slate-800">{site.orientation || 'North'}</strong>
              </span>
            </div>

            {/* Dimension diagram illustration */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center relative min-h-[160px]">
              <div className="w-48 h-32 border-2 border-dashed border-slate-400 rounded flex flex-col items-center justify-center relative bg-slate-50/50">
                <span className="text-[10px] absolute -top-3 bg-white px-1 text-slate-600 font-mono">
                  X1: {site.sideDetails?.[0]?.feet ?? 28}' {site.sideDetails?.[0]?.inches ?? 6}"
                </span>
                <span className="text-[10px] absolute -bottom-3 bg-white px-1 text-slate-600 font-mono">
                  X3: {site.sideDetails?.[2]?.feet ?? 28}' {site.sideDetails?.[2]?.inches ?? 6}"
                </span>
                <span className="text-[10px] absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 bg-white px-1 text-slate-600 font-mono">
                  X4: {site.sideDetails?.[3]?.feet ?? 112}'
                </span>
                <span className="text-[10px] absolute -right-12 top-1/2 -translate-y-1/2 rotate-90 bg-white px-1 text-slate-600 font-mono">
                  X2: {site.sideDetails?.[1]?.feet ?? 112}'
                </span>
                <div className="text-center p-2">
                  <div className="text-xs font-bold text-slate-800">Plot: {site.area || 3192} sq.ft</div>
                  <div className="text-[11px] text-slate-500">Built-up: {site.builtUpArea || 1760} sq.ft</div>
                </div>
              </div>
            </div>
          </div>

          {/* Site Boundaries and Setbacks Table */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2">Technical Boundaries & Setbacks</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[10px] text-slate-400 font-semibold">Front Setback (S1)</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">
                  {site.setbackDetails?.[0]?.feet ?? 3} ft {site.setbackDetails?.[0]?.inches ?? 0} in
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[10px] text-slate-400 font-semibold">Rear Setback (S2)</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">
                  {site.setbackDetails?.[1]?.feet ?? 3} ft {site.setbackDetails?.[1]?.inches ?? 0} in
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[10px] text-slate-400 font-semibold">Road Width (R1)</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">
                  {site.roadWidth?.[0]?.feet ?? 27} ft 0 in
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[10px] text-slate-400 font-semibold">Diagonal (Z1)</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">
                  {site.diagonalDetails?.[0]?.feet ?? 134} ft 0 in
                </div>
              </div>
            </div>
          </div>

          {/* Mandatory Spatial Highlights */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-600" />
              Included Spatial Rooms & Amenities
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-emerald-50/60 border border-emerald-200 rounded-lg text-emerald-900 font-semibold text-[11px]">
                ✓ Family Room / Lounge
              </div>
              <div className="p-2 bg-emerald-50/60 border border-emerald-200 rounded-lg text-emerald-900 font-semibold text-[11px]">
                ✓ Fitness / Gym Room
              </div>
              <div className="p-2 bg-emerald-50/60 border border-emerald-200 rounded-lg text-emerald-900 font-semibold text-[11px]">
                ✓ Yoga & Meditation Space
              </div>
              <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-semibold text-[11px]">
                ✓ Staircase (With OTS Shaft)
              </div>
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 font-semibold text-[11px]">
                ✓ Terrace Space ({spatial.hasTerrace ? 'Included' : 'None'})
              </div>
              <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-semibold text-[11px]">
                ✓ Master & Guest Bedrooms
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400">Total Quotation Value</div>
              <div className="text-lg font-black text-amber-400">
                ₹ {(enquiry.pricing?.grandTotal || 17590).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-300">
              <div>Rate: ₹{enquiry.pricing?.appliedRatePerSqft || 22} / sq.ft</div>
              <div>Payment: {enquiry.pricing?.paymentType || 'Double (50-50)'}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onGeneratePdf && onGeneratePdf(enquiry)}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-800 flex items-center space-x-1"
            >
              <FileText className="w-3.5 h-3.5 text-red-600" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={() => onWhatsApp && onWhatsApp(enquiry)}
              className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-lg text-xs font-semibold text-emerald-800 flex items-center space-x-1"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Send WhatsApp</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onRevise) onRevise(enquiry);
            }}
            className="px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Open Quote Estimator
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailsModal;
