import React from 'react';
import {
  LayoutDashboard,
  Box,
  Clock,
  CheckCheck,
  Package,
  X,
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, counts = {}, isOpen = false, onClose = () => {} }) => {
  // STRICTLY the 5 modules requested:
  // Dashboard, Sketch Up Enquiries, Ongoing Orders, Completed Orders, Packages
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'sketchup_enquiries',
      label: 'Sketch Up Enquires',
      icon: Box,
      badge: counts.sketchupEnquiries ?? 0,
      isPrimary: true,
    },
    {
      id: 'ongoing_orders',
      label: 'Ongoing Orders',
      icon: Clock,
      badge: counts.ongoingOrders ?? 0,
    },
    {
      id: 'completed_orders',
      label: 'Completed Orders',
      icon: CheckCheck,
      badge: counts.completedOrders ?? 0,
    },
    {
      id: 'packages',
      label: 'Packages',
      icon: Package,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-50 select-none transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Studio Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <img
              src="/zhagaram-icon.jpg"
              alt="Zhagaram Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-200"
            />
            <div>
              <div className="font-extrabold text-[15px] tracking-tight text-slate-900 leading-tight">
                ZHAGARAM
              </div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                Design Studio
              </div>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Internal Architect Purpose Badge */}
        <div className="mx-4 my-3 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Architect Portal
          </span>
          <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded font-mono">
            Internal
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all group ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
                </div>

                {item.badge !== null && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-colors ${
                      isActive ? 'bg-white/20 text-white' : 'bg-black text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Studio Footer Info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">Zhagaram Console</span>
              <span className="text-emerald-600 font-bold">Online</span>
            </div>
            <div className="text-[10px] text-slate-400">Salem • Tamil Nadu</div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;