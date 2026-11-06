import React, { useState } from 'react';
import { Search, Check, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onSearch, searchQuery, onToggleMobileMenu = () => {} }) => {
  const { user, isCheckedIn, toggleCheckIn, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-0 md:left-64 z-20 flex items-center justify-between px-4 sm:px-6 md:px-8">
      {/* Mobile Menu Button + Search Bar */}
      <div className="flex items-center flex-1 max-w-md mr-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 -ml-1 mr-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            placeholder="Search client, project, mobile..."
            className="w-full pl-9 pr-3 py-1.5 sm:py-2 text-[12px] sm:text-[13px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Check In Button */}
        <button
          onClick={toggleCheckIn}
          className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
            isCheckedIn
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 shadow-2xs'
              : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
          }`}
          title="Toggle Attendance / Check In"
        >
          <div
            className={`w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full flex items-center justify-center text-white ${
              isCheckedIn ? 'bg-emerald-600' : 'bg-slate-400'
            }`}
          >
            <Check className="w-2 sm:w-2.5 h-2 sm:h-2.5 stroke-[3]" />
          </div>
          <span className="hidden xs:inline">{isCheckedIn ? 'Check In' : 'Checked Out'}</span>
        </button>

        {/* User Profile Pill - Karthi (Founder of the company) */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 p-1 pl-1.5 sm:pl-2 pr-2 sm:pr-3 rounded-full hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {user?.name ? user.name[0].toUpperCase() : 'K'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {user?.name || 'Karthi'}
              </div>
              <div className="text-[10px] text-slate-400">
                {user?.designation || 'Founder of the company'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-xs text-slate-700 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="font-semibold text-slate-900">{user?.name || 'Karthi'}</div>
                <div className="text-[11px] text-slate-500">{user?.email || 'zhagaramprojects@gmail.com'}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Phone: 8489904344</div>
                <span className="mt-1 inline-block text-[10px] bg-slate-900 text-amber-400 font-bold px-2 py-0.5 rounded font-mono">
                  {user?.designation || 'Founder of the company'}
                </span>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-rose-600 hover:bg-rose-50 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;