import React, { useState, useEffect } from 'react';
import { Plus, Search, Share2, FileText, ArrowRight, RefreshCw, Check, Trash2 } from 'lucide-react';
import { enquiriesAPI } from '../services/api';
import confetti from 'canvas-confetti';

const SketchUpEnquiriesView = ({
  onReviseQuote,
  onOpenAddModal,
  onWhatsApp,
  onGeneratePdf,
  onOrderMoved,
}) => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [movingId, setMovingId] = useState(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await enquiriesAPI.getAll({ search, limit: 1000 });
      if (res.data?.success) {
        // Sort strictly recent to old (newest enquiry first)
        const sorted = (res.data.data || []).sort((a, b) => {
          const dateA = new Date(a.createdAt || a.enquiryDate || 0).getTime();
          const dateB = new Date(b.createdAt || b.enquiryDate || 0).getTime();
          if (dateB !== dateA) return dateB - dateA;
          return (b.sno || 0) - (a.sno || 0);
        });
        setEnquiries(sorted);
      }
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchEnquiries();
  }, [search]);

  // Handle Move to Order button (Transitions to Ongoing Orders)
  const handleMoveToOrder = async (enquiry) => {
    setMovingId(enquiry._id);
    try {
      const res = await enquiriesAPI.moveToOrder(enquiry._id, {
        assignedArchitect: 'Karthi (Founder)',
        workNotes: 'Moved from Enquiries list directly into Ongoing Orders production.',
      });

      if (res.data?.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        setEnquiries((prev) =>
          prev.map((item) =>
            item._id === enquiry._id ? { ...item, status: 'ongoing' } : item
          )
        );

        if (onOrderMoved) {
          onOrderMoved(enquiry);
        }
      }
    } catch (err) {
      console.error('Error moving to ongoing order:', err);
      alert('Failed to move order: ' + err.message);
    } finally {
      setMovingId(null);
    }
  };

  // Handle Delete Enquiry (User requirement: "enable delete icon at the end of all sketch up enquiry")
  const handleDeleteEnquiry = async (enquiry) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete enquiry #${enquiry.sno} for "${enquiry.projectName}"?`
    );
    if (!confirmDelete) return;

    try {
      const res = await enquiriesAPI.delete(enquiry._id);
      if (res.data?.success) {
        setEnquiries((prev) => prev.filter((item) => item._id !== enquiry._id));
        if (onOrderMoved) {
          onOrderMoved();
        }
      }
    } catch (err) {
      alert('Failed to delete enquiry: ' + err.message);
    }
  };

  // Manual payment cycle
  const handleQuickPaymentToggle = async (enquiry) => {
    const current = enquiry.pricing?.paymentStatus || 'Unpaid';
    const nextStatus =
      current === 'Unpaid'
        ? 'Advance Paid'
        : current === 'Advance Paid'
        ? 'Fully Paid'
        : 'Unpaid';
    try {
      const res = await enquiriesAPI.updatePayment(enquiry._id, {
        paymentStatus: nextStatus,
      });
      if (res.data?.success) {
        setEnquiries((prev) =>
          prev.map((e) =>
            e._id === enquiry._id ? { ...e, pricing: res.data.data.pricing } : e
          )
        );
      }
    } catch (err) {
      alert('Error updating payment: ' + err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '24-08-2026';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const totalEntries = enquiries.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const displayedEnquiries = enquiries.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Sketch Up Enquires Lists
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Planning, Elevation & Interior client intake pipeline
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Enquiry</span>
        </button>
      </div>

      {/* Main Table Card (Email and View Images removed as instructed) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls (Show entries & Search) */}
        <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white border border-slate-300 rounded focus:outline-none text-xs font-medium"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-medium text-slate-700">Search:</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Client, project or phone..."
              className="px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-black text-xs w-52"
            />
          </div>
        </div>

        {/* Clean Table: View Images and Email columns ELIMINATED */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold text-slate-700 text-center w-12">Sno</th>
                <th className="py-3.5 px-4 font-semibold text-slate-700">Name</th>
                <th className="py-3.5 px-4 font-semibold text-slate-700">Mobile No</th>
                <th className="py-3.5 px-4 font-semibold text-slate-700">Project Name</th>
                <th className="py-3.5 px-4 font-semibold text-slate-700 text-center">Services</th>
                <th className="py-3.5 px-4 font-semibold text-slate-700">Project Description</th>
                <th className="py-3.5 px-4 font-semibold text-slate-700">Enquiry Date</th>
                <th className="py-3.5 px-4 font-semibold text-slate-700 text-center min-w-[120px]">Quote</th>
                <th className="py-3.5 px-4 font-semibold text-slate-700 text-center min-w-[160px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-600" />
                    <span>Loading enquiries...</span>
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No enquiries found. Click "+ Add Enquiry" to record a project.
                  </td>
                </tr>
              ) : (
                displayedEnquiries.map((enq) => {
                  const isOngoing = enq.status === 'ongoing';
                  const isCompleted = enq.status === 'completed';
                  const services = enq.services || {
                    plan: enq.projectType?.toLowerCase().includes('plan') || false,
                    elevation: true,
                    interior: enq.projectType?.toLowerCase().includes('interior') || false,
                  };

                  return (
                    <tr key={enq._id} className="hover:bg-slate-50 transition-colors">
                      {/* Sno */}
                      <td className="py-4 px-4 font-mono font-medium text-center text-slate-800">
                        {enq.sno}
                      </td>

                      {/* Name */}
                      <td className="py-4 px-4 font-medium text-slate-900">
                        {enq.clientName}
                      </td>

                      {/* Mobile No */}
                      <td className="py-4 px-4 font-mono text-slate-700">
                        {enq.mobileNo}
                      </td>

                      {/* Project Name */}
                      <td className="py-4 px-4 font-medium text-slate-900">
                        <div>{enq.projectName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {enq.pricing?.elevationSqft || enq.siteDetails?.builtUpArea || 1760} sq.ft
                        </div>
                      </td>

                      {/* Services Badges (Plan, Elevation, Interior) */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {services.plan && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Plan
                            </span>
                          )}
                          {services.elevation && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white">
                              Elevation
                            </span>
                          )}
                          {services.interior && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              Interior
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Project Description */}
                      <td className="py-4 px-4 text-slate-600 max-w-xs truncate">
                        {enq.projectDescription || enq.projectType || 'Elevation'}
                      </td>

                      {/* Enquiry Date */}
                      <td className="py-4 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {formatDate(enq.enquiryDate)}
                      </td>

                      {/* Quote (Status + Edit / Quote Button) */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center space-y-1">
                          <button
                            type="button"
                            onClick={() => handleQuickPaymentToggle(enq)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                              enq.pricing?.paymentStatus === 'Fully Paid'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : enq.pricing?.paymentStatus === 'Advance Paid'
                                ? 'bg-blue-50 text-blue-700 border-blue-300'
                                : 'bg-amber-50 text-amber-700 border-amber-300'
                            }`}
                            title="Click to manually toggle payment (Unpaid -> Advance Paid -> Fully Paid)"
                          >
                            {enq.pricing?.paymentStatus || 'Unpaid'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onReviseQuote(enq)}
                            className="px-3 py-1 bg-black hover:bg-slate-800 text-white rounded font-bold text-[11px] whitespace-nowrap transition shadow-2xs"
                          >
                            Edit / Quote
                          </button>
                        </div>
                      </td>

                      {/* Actions: Move to Order + WhatsApp + PDF + DELETE ICON */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {isOngoing ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
                              <Check className="w-3 h-3" />
                              <span>Ongoing</span>
                            </span>
                          ) : isCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                              <Check className="w-3 h-3" />
                              <span>Done</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMoveToOrder(enq)}
                              disabled={movingId === enq._id}
                              className="px-3 py-1.5 bg-black hover:bg-emerald-700 text-white rounded font-bold text-[11px] transition shadow-2xs whitespace-nowrap flex items-center justify-center space-x-1"
                              title="Move to Ongoing Orders"
                            >
                              <span>{movingId === enq._id ? 'Moving...' : 'Move to Order'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {/* WhatsApp Icon Button */}
                          <button
                            type="button"
                            onClick={() => onWhatsApp(enq)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg transition"
                            title="Send Quote via WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {/* PDF shortcut */}
                          <button
                            type="button"
                            onClick={() => onGeneratePdf(enq)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-red-600 border border-slate-200 rounded-lg transition"
                            title="Download PDF"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* DELETE ICON (User command: "enable delete icon at the end of all sketch up enquiry") */}
                          <button
                            type="button"
                            onClick={() => handleDeleteEnquiry(enq)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 border border-rose-200 rounded-lg transition"
                            title="Delete Enquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & Working Pagination Controls */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            Showing {totalEntries === 0 ? 0 : startIndex + 1} to {endIndex} of {totalEntries} entries
          </div>
          <div className="flex items-center space-x-1 flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition ${
                  pageNum === safePage
                    ? 'bg-black text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SketchUpEnquiriesView;
