import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, Share2, FileText, Clock, RefreshCw } from 'lucide-react';
import { enquiriesAPI } from '../services/api';

const ConfirmedOrdersView = ({ onMoveToOngoing, onGeneratePdf, onWhatsApp, onReviseQuote }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await enquiriesAPI.getAll({ status: 'confirmed' });
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching confirmed orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleMove = async (order) => {
    try {
      await enquiriesAPI.moveToOrder(order._id);
      setOrders((prev) => prev.filter((o) => o._id !== order._id));
      if (onMoveToOngoing) onMoveToOngoing(order);
    } catch (err) {
      alert('Error moving to ongoing: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Confirmed Orders</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Client confirmed projects awaiting SketchUp 3D visualization kickoff
          </p>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 bg-black text-white rounded-lg">
          {orders.length} Confirmed
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">Sno</th>
                <th className="py-3.5 px-4">Project & Client</th>
                <th className="py-3.5 px-4">Area & Orientation</th>
                <th className="py-3.5 px-4">Payment Details</th>
                <th className="py-3.5 px-4">Quote Total</th>
                <th className="py-3.5 px-4 text-center">Kickoff Production</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-600" />
                    <span>Loading confirmed orders...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No confirmed orders yet. Orders will appear here once confirmed.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-mono font-medium text-center text-slate-800">
                      {ord.sno}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{ord.projectName}</div>
                      <div className="text-[11px] text-slate-500">
                        {ord.clientName} • {ord.mobileNo}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800">
                        {ord.pricing?.elevationSqft || ord.siteDetails?.builtUpArea || 1760} sq.ft
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Facing: {ord.siteDetails?.orientation || 'North'} • {ord.spatialRequirements?.chosenFloor || 'Ground'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {ord.pricing?.paymentStatus || 'Advance Paid'}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {ord.pricing?.paymentType || 'Double'} Payment Mode
                      </div>
                    </td>
                    <td className="py-4 px-4 font-black text-slate-900 text-sm">
                      ₹ {(ord.pricing?.grandTotal || 17590).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleMove(ord)}
                        className="px-3.5 py-1.5 bg-black hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition flex items-center justify-center space-x-1.5 mx-auto shadow-2xs"
                      >
                        <span>Move to Ongoing</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => onReviseQuote(ord)}
                        className="text-slate-700 hover:text-black font-semibold text-xs"
                      >
                        Estimator
                      </button>
                      <button
                        onClick={() => onWhatsApp(ord)}
                        className="text-emerald-600 hover:text-emerald-800 p-1"
                      >
                        <Share2 className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => onGeneratePdf(ord)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <FileText className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConfirmedOrdersView;
