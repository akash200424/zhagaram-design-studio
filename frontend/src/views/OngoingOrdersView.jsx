import React, { useState, useEffect } from 'react';
import { Clock, CheckCheck, Share2, FileText, User, Calendar, RefreshCw, ArrowRight, CreditCard, Check } from 'lucide-react';
import { enquiriesAPI } from '../services/api';
import confetti from 'canvas-confetti';

const OngoingOrdersView = ({ onOrderCompleted, onGeneratePdf, onWhatsApp, onReviseQuote }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await enquiriesAPI.getAll({ status: 'ongoing' });
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching ongoing orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Manual payment status update
  const handleUpdatePayment = async (orderId, newStatus) => {
    setUpdatingPaymentId(orderId);
    try {
      const res = await enquiriesAPI.updatePayment(orderId, { paymentStatus: newStatus });
      if (res.data?.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, pricing: res.data.data.pricing } : o))
        );
      }
    } catch (err) {
      alert('Failed to update payment: ' + err.message);
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  const handleComplete = async (order) => {
    try {
      const res = await enquiriesAPI.moveToCompleted(order._id);
      if (res.data?.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        setOrders((prev) => prev.filter((o) => o._id !== order._id));
        if (onOrderCompleted) onOrderCompleted(order);
      }
    } catch (err) {
      alert('Error completing order: ' + err.message);
    }
  };

  const stages = [
    'Elevation CAD & Drafting',
    'Detailed Elevation Detailing',
    'Color Palette & Material Specifications',
    'High-Res CAD Production',
    'Final Architectural Sign-off',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Ongoing Orders</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active architectural drafting, planning, and elevation design
          </p>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 bg-blue-600 text-white rounded-lg self-start sm:self-auto">
          {orders.length} Active in Production
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-600" />
          <span>Loading ongoing orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          No orders currently in ongoing production. Move an enquiry from SketchUp Enquiries to begin.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {orders.map((ord) => {
            const progress = ord.ongoingDetails?.progressPercent || 35;
            const currentStage = ord.ongoingDetails?.currentStage || 'Elevation CAD & Drafting';
            const paymentStatus = ord.pricing?.paymentStatus || 'Unpaid';
            const grandTotal = ord.pricing?.grandTotal || 0;
            const advance = ord.pricing?.advanceAmount || 0;
            const balance = ord.pricing?.balanceAmount ?? Math.max(0, grandTotal - advance);

            return (
              <div
                key={ord._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-400">#{ord.sno}</span>
                    <h3 className="text-base font-extrabold text-slate-900">{ord.projectName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Client: {ord.clientName} • {ord.mobileNo}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
                    In Production
                  </span>
                </div>

                {/* Technical specs pill */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold">Area</div>
                    <div className="font-bold text-slate-800">
                      {ord.pricing?.elevationSqft || ord.siteDetails?.builtUpArea || 1760} sqft
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold">Floor</div>
                    <div className="font-bold text-slate-800">
                      {ord.spatialRequirements?.chosenFloor || 'Ground'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold">Quotation</div>
                    <div className="font-extrabold text-slate-900">
                      ₹ {grandTotal.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Production Stage Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700">{currentStage}</span>
                    <span className="font-mono font-bold text-blue-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Manual Payment Marking Section */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                      <span>Payment Status</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        paymentStatus === 'Fully Paid'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : paymentStatus === 'Advance Paid'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {paymentStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
                    <span>Paid: ₹{advance.toLocaleString('en-IN')}</span>
                    <span>Balance: ₹{balance.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Manual Mark Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      type="button"
                      disabled={updatingPaymentId === ord._id}
                      onClick={() => handleUpdatePayment(ord._id, 'Unpaid')}
                      className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition text-center ${
                        paymentStatus === 'Unpaid'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Mark Unpaid
                    </button>
                    <button
                      type="button"
                      disabled={updatingPaymentId === ord._id}
                      onClick={() => handleUpdatePayment(ord._id, 'Advance Paid')}
                      className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition text-center ${
                        paymentStatus === 'Advance Paid'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Mark Advance
                    </button>
                    <button
                      type="button"
                      disabled={updatingPaymentId === ord._id}
                      onClick={() => handleUpdatePayment(ord._id, 'Fully Paid')}
                      className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition text-center ${
                        paymentStatus === 'Fully Paid'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Mark Paid
                    </button>
                  </div>
                </div>

                {/* Architect & Notes */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ord.ongoingDetails?.assignedArchitect || 'Karthi (Founder)'}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Delivery in 7 Days</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onReviseQuote(ord)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition"
                    >
                      Estimator
                    </button>
                    <button
                      onClick={() => onGeneratePdf(ord)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-red-600 rounded-lg transition"
                      title="Quotation PDF"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onWhatsApp(ord)}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition"
                      title="Client WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleComplete(ord)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-sm ml-auto"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OngoingOrdersView;