import React, { useEffect, useState } from "react";
import {
  Box,
  CheckCircle2,
  Clock,
  CheckCheck,
  TrendingUp,
  FileText,
  Share2,
  ArrowRight,
  Plus,
  Sparkles,
  Layers,
} from "lucide-react";
import { enquiriesAPI } from "../services/api";

const DashboardView = ({
  onNavigate,
  onReviseQuote,
  onWhatsApp,
  onGeneratePdf,
  onOpenAddModal,
}) => {
  const [stats, setStats] = useState({
    sketchupEnquiriesCount: 53,
    confirmedOrdersCount: 1,
    ongoingOrdersCount: 2,
    completedOrdersCount: 186,
    totalRevenue: 32600,
    ongoingPipelineValue: 65400,
    recentEnquiries: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await enquiriesAPI.getDashboardStats();
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Sketch Up Enquiries",
      count: stats.sketchupEnquiriesCount,
      icon: Box,
      bg: "bg-white",
      borderColor: "border-slate-200",
      textColor: "text-slate-900",
      actionTab: "sketchup_enquiries",
      highlight: true,
    },
    {
      title: "Ongoing Orders",
      count: stats.ongoingOrdersCount,
      icon: Clock,
      bg: "bg-white",
      borderColor: "border-slate-200",
      textColor: "text-blue-600",
      actionTab: "ongoing_orders",
    },
    {
      title: "Completed Orders",
      count: stats.completedOrdersCount,
      icon: CheckCheck,
      bg: "bg-white",
      borderColor: "border-slate-200",
      textColor: "text-emerald-600",
      actionTab: "completed_orders",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Studio Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial from-amber-400 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4 max-w-xl">
            <img
              src="/zhagaram-icon.jpg"
              alt="Zhagaram Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/20 shadow-xl shrink-0"
            />
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>ZHAGARAM DESIGN STUDIO • ARCHITECTURAL CONSOLE</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Architecture & Elevation Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Purpose-built platform for architects to manage enquiries,
                calculate tiered sq.ft pricing, and export official quotations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="px-5 py-3 rounded-2xl bg-white text-slate-950 font-bold text-xs flex items-center space-x-2 hover:bg-slate-100 transition shadow-lg"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span> Add SketchUp Enquiry</span>
            </button>
            <button
              onClick={() => onNavigate("packages")}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center space-x-2 transition border border-white/10"
            >
              <span>Pricing Slabs (₹/Sqft)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Pipeline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(card.actionTab)}
              className={`p-6 rounded-2xl border ${card.borderColor} ${card.bg} shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center transition-colors text-slate-700">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className={`text-3xl font-black ${card.textColor}`}>
                  {card.count}
                </div>
                <div className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-900 flex items-center space-x-1">
                  <span>View</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue & Tier Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Active Pricing Tiers
            </h3>
            <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Live Slabs
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 flex justify-between items-center border border-slate-100">
              <span className="font-medium text-slate-700">
                500 - 700 Sq.Ft
              </span>
              <span className="font-extrabold text-slate-900">₹25 / sq.ft</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 flex justify-between items-center border border-slate-100">
              <span className="font-medium text-slate-700">
                700 - 900 Sq.Ft
              </span>
              <span className="font-extrabold text-slate-900">₹22 / sq.ft</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 flex justify-between items-center border border-slate-100">
              <span className="font-medium text-slate-700">
                900 - 1500 Sq.Ft
              </span>
              <span className="font-extrabold text-slate-900">₹19 / sq.ft</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 flex justify-between items-center border border-slate-100">
              <span className="font-medium text-slate-700">
                Staircase with OTS Shaft
              </span>
              <span className="font-extrabold text-emerald-700">+ ₹2,500</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate("packages")}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
          >
            Manage Package Slabs
          </button>
        </div>

        {/* Spatial Architecture Standards */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-slate-800" />
              <h3 className="text-sm font-bold text-slate-900">
                Mandatory Spatial Architectural Features
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Pre-configured into quotes
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="font-bold text-slate-800">Family Room</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Private family lounge zone
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="font-bold text-slate-800">Gym Room</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Fitness & weights area
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="font-bold text-slate-800">Yoga Room</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Meditation & wellness
              </div>
            </div>
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900">
              <div className="font-bold">Staircase (With OTS)</div>
              <div className="text-[11px] text-blue-700 mt-0.5">
                Open-To-Sky ventilation shaft
              </div>
            </div>
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900">
              <div className="font-bold">Terrace Package</div>
              <div className="text-[11px] text-amber-700 mt-0.5">
                Roof garden / open terrace
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="font-bold text-slate-800">Master Bedroom</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Dressing & attached ensuite
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between text-emerald-900">
            <span className="font-semibold">
              Quick Quote Estimator ready for live client drafting
            </span>
            <button
              onClick={() => onNavigate("sketchup_enquiries")}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] transition"
            >
              Go to Enquiries
            </button>
          </div>
        </div>
      </div>

      {/* Recent Enquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Recent SketchUp Enquiries
            </h3>
            <p className="text-[11px] text-slate-400">
              Latest enquiries logged for elevation estimation
            </p>
          </div>
          <button
            onClick={() => onNavigate("sketchup_enquiries")}
            className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1"
          >
            <span>View All ({stats.sketchupEnquiriesCount})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Sno</th>
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4">Project Name</th>
                <th className="py-3 px-4">Mobile No</th>
                <th className="py-3 px-4">Built-up Area</th>
                <th className="py-3 px-4">Quotation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(stats.recentEnquiries || []).slice(0, 5).map((enq) => (
                <tr key={enq._id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {enq.sno}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {enq.clientName}
                  </td>
                  <td className="py-3.5 px-4">{enq.projectName}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    {enq.mobileNo}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {enq.pricing?.elevationSqft ||
                      enq.siteDetails?.builtUpArea ||
                      1760}{" "}
                    sq.ft
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    ₹{" "}
                    {(enq.pricing?.grandTotal || 17590).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => onReviseQuote(enq)}
                      className="px-2.5 py-1 bg-black text-white hover:bg-slate-800 rounded-lg font-bold text-[11px] transition"
                    >
                      Revise Quote
                    </button>
                    <button
                      onClick={() => onWhatsApp(enq)}
                      className="px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-semibold text-[11px] transition"
                      title="Send via WhatsApp"
                    >
                      WhatsApp
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
