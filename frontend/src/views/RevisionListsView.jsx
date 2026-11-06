import React, { useState, useEffect } from 'react';
import { RotateCcw, Plus, Check, Clock, AlertCircle, RefreshCw, X } from 'lucide-react';
import { revisionsAPI, enquiriesAPI } from '../services/api';

const RevisionListsView = () => {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New revision form state
  const [formData, setFormData] = useState({
    enquiryId: '',
    requestedChanges: '',
    scopeOfRevision: 'Elevation Facade',
    priority: 'Normal',
    assignedArchitect: 'Karthi (Founder)',
  });

  const fetchRevisions = async () => {
    setLoading(true);
    try {
      const res = await revisionsAPI.getAll({ status: statusFilter });
      if (res.data?.success) {
        setRevisions(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching revisions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisions();
  }, [statusFilter]);

  useEffect(() => {
    const fetchEnquiriesList = async () => {
      try {
        const res = await enquiriesAPI.getAll({});
        if (res.data?.success) {
          setEnquiries(res.data.data);
          if (res.data.data.length > 0) {
            setFormData((prev) => ({ ...prev, enquiryId: res.data.data[0]._id }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEnquiriesList();
  }, []);

  const handleStatusChange = async (revId, newStatus) => {
    try {
      const res = await revisionsAPI.update(revId, { status: newStatus });
      if (res.data?.success) {
        setRevisions((prev) =>
          prev.map((r) => (r._id === revId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      alert('Error updating revision status: ' + err.message);
    }
  };

  const handleCreateRevision = async (e) => {
    e.preventDefault();
    try {
      const res = await revisionsAPI.create(formData);
      if (res.data?.success) {
        setIsAddModalOpen(false);
        fetchRevisions();
        setFormData({
          enquiryId: enquiries[0]?._id || '',
          requestedChanges: '',
          scopeOfRevision: 'Elevation Facade',
          priority: 'Normal',
          assignedArchitect: 'Karthi (Founder)',
        });
      }
    } catch (err) {
      alert('Failed to log revision: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Revision Lists</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track client revisions for 3D elevations, OTS shafts, spatial shifts, and material changes
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add Revision</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 text-xs">
        {['all', 'Pending Review', 'In Modeling', 'Approved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === tab
                ? 'bg-black text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab === 'all' ? 'All Revisions' : tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 text-center w-16">Rev #</th>
                <th className="py-3.5 px-4">Project & Client</th>
                <th className="py-3.5 px-4">Scope of Revision</th>
                <th className="py-3.5 px-4">Requested Changes</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-600" />
                    <span>Loading revisions...</span>
                  </td>
                </tr>
              ) : revisions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No revisions found under this filter.
                  </td>
                </tr>
              ) : (
                revisions.map((rev) => (
                  <tr key={rev._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-center text-slate-900">
                      R{rev.revisionNo}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{rev.projectName}</div>
                      <div className="text-[11px] text-slate-500">{rev.clientName}</div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                        {rev.scopeOfRevision}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-700 max-w-sm">
                      {rev.requestedChanges}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rev.priority === 'Urgent'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : rev.priority === 'High'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {rev.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          rev.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rev.status === 'In Modeling'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {rev.status === 'Approved' && <Check className="w-3 h-3" />}
                        <span>{rev.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-1.5">
                      {rev.status !== 'Approved' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(rev._id, 'In Modeling')}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-semibold"
                          >
                            In Modeling
                          </button>
                          <button
                            onClick={() => handleStatusChange(rev._id, 'Approved')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold"
                          >
                            Approve
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Revision Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm tracking-tight">Log Client Revision</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRevision} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Project</label>
                <select
                  value={formData.enquiryId}
                  onChange={(e) => setFormData({ ...formData, enquiryId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  {enquiries.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.projectName} ({e.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scope of Revision</label>
                <select
                  value={formData.scopeOfRevision}
                  onChange={(e) => setFormData({ ...formData, scopeOfRevision: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="Elevation Facade">Elevation Facade</option>
                  <option value="Staircase / OTS Adjustment">Staircase / OTS Adjustment</option>
                  <option value="Room Spatial Layout">Room Spatial Layout</option>
                  <option value="Terrace Styling">Terrace Styling</option>
                  <option value="Material & Color Palette">Material & Color Palette</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Requested Changes / Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.requestedChanges}
                  onChange={(e) => setFormData({ ...formData, requestedChanges: e.target.value })}
                  placeholder="e.g. Move OTS window to east side, widen gym balcony to 150 sqft..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm"
                >
                  Submit Revision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevisionListsView;
