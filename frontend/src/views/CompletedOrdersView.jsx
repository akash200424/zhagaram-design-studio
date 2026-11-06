import React, { useState, useEffect } from 'react';
import { CheckCheck, Share2, FileText, RefreshCw, Calendar, Check } from 'lucide-react';
import { enquiriesAPI } from '../services/api';

const CompletedOrdersView = ({ onGeneratePdf, onWhatsApp, onReviseQuote }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await enquiriesAPI.getAll({ status: 'completed' });
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching completed orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Completed Orders</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Delivered elevation CAD and architectural visualization projects
          </p>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-600 text-white rounded-lg">
          {orders.length} Completed Projects
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">Sno</th>
                <th className="py-3.5 px-4">Project Name</th>
                <th className="py-3.5 px-4">Client Details</th>
                <th className="py-3.5 px-4">Built-up Area</th>
                <th className="py-3.5 px-4">Delivery Status</th>
                <th className="py-3.5 px-4">Final Revenue</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-600" />
                    <span>Loading completed orders...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No completed orders in archive.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-mono font-medium text-center text-slate-800">
                      {ord.sno}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <div>{ord.projectName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Type: {ord.projectType || 'Elevation'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800">{ord.clientName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{ord.mobileNo}</div>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800">
                      {ord.pricing?.elevationSqft || ord.siteDetails?.builtUpArea || 1760} sq.ft
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>Deliverables Sent</span>
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">Payment: Fully Paid</div>
                    </td>
                    <td className="py-4 px-4 font-black text-slate-900 text-sm">
                      ₹ {(ord.pricing?.grandTotal || 17590).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => onReviseQuote(ord)}
                        className="text-slate-700 hover:text-black font-semibold text-xs"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => onGeneratePdf(ord)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Download Invoice/Quote"
                      >
                        <FileText className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => onWhatsApp(ord)}
                        className="text-emerald-600 hover:text-emerald-800 p-1"
                        title="WhatsApp Deliverables Note"
                      >
                        <Share2 className="w-4 h-4 inline" />
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

export default CompletedOrdersView;
