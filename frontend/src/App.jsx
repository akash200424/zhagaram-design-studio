import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardView from './views/DashboardView';
import SketchUpEnquiriesView from './views/SketchUpEnquiriesView';
import OngoingOrdersView from './views/OngoingOrdersView';
import CompletedOrdersView from './views/CompletedOrdersView';
import PackagesView from './views/PackagesView';
import QuoteReviseView from './views/QuoteReviseView';
import LoginView from './views/LoginView';
import WhatsAppModal from './components/WhatsAppModal';
import { useAuth } from './context/AuthContext';
import { enquiriesAPI } from './services/api';
import { generateQuotePdf } from './utils/pdfGenerator';
import { openWhatsApp } from './utils/whatsappHelper';

export function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  // Navigation tab state
  // Dashboard, sketchup_enquiries, ongoing_orders, completed_orders, packages, quote_revise
  const [activeTab, setActiveTab] = useState('sketchup_enquiries');

  // Mobile navigation drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Currently active enquiry being edited/created in single unified workflow
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isNewEnquiry, setIsNewEnquiry] = useState(false);

  // WhatsApp modal state
  const [whatsAppEnquiry, setWhatsAppEnquiry] = useState(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Counts for sidebar badges
  const [counts, setCounts] = useState({
    sketchupEnquiries: 0,
    ongoingOrders: 0,
    completedOrders: 0,
  });

  // Fetch counts
  const refreshCounts = async () => {
    try {
      const statsRes = await enquiriesAPI.getDashboardStats();
      if (statsRes.data?.success) {
        const d = statsRes.data.data;
        setCounts({
          sketchupEnquiries: d.sketchupEnquiriesCount ?? 0,
          ongoingOrders: d.ongoingOrdersCount ?? 0,
          completedOrders: d.completedOrdersCount ?? 0,
        });
      }
    } catch (e) {
      console.warn('Error refreshing counts:', e.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshCounts();
    }
  }, [isAuthenticated, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center text-slate-600 font-semibold text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-slate-900 animate-ping"></div>
          <span>Loading Zhagaram Design Studio...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Handle open Revise Quote view
  const handleOpenReviseQuote = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsNewEnquiry(false);
    setActiveTab('quote_revise');
  };

  // Single Unified Enquiry Creation (All inputs start as 0 or blank as requested)
  const handleStartNewEnquiry = () => {
    const blankEnquiry = {
      clientName: '',
      mobileNo: '',
      address: '',
      email: '', // optional as requested
      projectName: '',
      projectType: 'Elevation',
      projectDescription: '',
      services: {
        plan: false,
        elevation: true,
        interior: false,
      },
      siteDetails: {
        area: 0,
        builtUpArea: 0,
        orientation: 'North',
        noOfSides: 4,
        sideDetails: [
          { label: 'X1', feet: 0, inches: 0 },
          { label: 'X2', feet: 0, inches: 0 },
          { label: 'X3', feet: 0, inches: 0 },
          { label: 'X4', feet: 0, inches: 0 },
        ],
        setbackDetails: [
          { label: 'S1', feet: 0, inches: 0 },
          { label: 'S2', feet: 0, inches: 0 },
          { label: 'S3', feet: 0, inches: 0 },
          { label: 'S4', feet: 0, inches: 0 },
        ],
        roadWidth: [
          { label: 'R1', selected: false, feet: 0, inches: 0 },
          { label: 'R2', selected: false, feet: 0, inches: 0 },
        ],
        diagonalDetails: [
          { label: 'Z1', feet: 0, inches: 0 },
          { label: 'Z2', feet: 0, inches: 0 },
        ],
        note: '',
      },
      elevationDetails: {
        elevationSqft: 0,
        note: '',
      },
      interiorDetails: {
        interiorSqft: 0,
        note: '',
      },
      spatialRequirements: {
        chosenFloor: 'Ground',
        hasTerrace: false,
        terraceArea: 0,
      },
      pricing: {
        planSqft: 0,
        planRate: 12,
        planSubtotal: 0,
        elevationSqft: 0,
        elevationRate: 22,
        elevationSubtotal: 0,
        interiorSqft: 0,
        interiorRate: 35,
        interiorSubtotal: 0,
        otsFee: 0,
        whiteLabelFees: 0,
        discount: 0,
        grandTotal: 0,
        paymentType: 'Double',
        advanceAmount: 0,
        balanceAmount: 0,
        paymentStatus: 'Unpaid',
      },
    };

    setSelectedEnquiry(blankEnquiry);
    setIsNewEnquiry(true);
    setActiveTab('quote_revise');
  };

  // Move directly to Ongoing Order
  const handleMoveToOrder = async (enquiry) => {
    try {
      if (enquiry._id) {
        await enquiriesAPI.moveToOrder(enquiry._id);
      }
      refreshCounts();
      setActiveTab('ongoing_orders');
    } catch (err) {
      console.error(err);
    }
  };

  // Handle PDF Generation (Validates mandatory details before generating)
  const handleGeneratePdf = async (enquiry) => {
    if (!enquiry?.clientName?.trim() || !enquiry?.mobileNo?.trim() || !enquiry?.projectName?.trim()) {
      alert('Please fill mandatory customer details (Name, Mobile, Project) before generating the Quote PDF.');
      return;
    }
    try {
      await generateQuotePdf(enquiry, { autoDownload: true });
    } catch (err) {
      console.error('PDF error:', err);
      alert('Error generating PDF: ' + err.message);
    }
  };

  // Handle WhatsApp (Validates mandatory details before opening)
  const handleOpenWhatsApp = (enquiry) => {
    if (!enquiry?.clientName?.trim() || !enquiry?.mobileNo?.trim()) {
      alert('Please fill mandatory customer details (Name, Mobile) before dispatching quote via WhatsApp.');
      return;
    }
    setWhatsAppEnquiry(enquiry);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col md:flex-row">
      {/* Sidebar with strictly the 5 active modules */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={counts}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen w-full overflow-x-hidden">
        <Navbar
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <main className="flex-1 p-3.5 sm:p-6 md:p-8 pt-20 sm:pt-22 md:pt-24 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={setActiveTab}
              onReviseQuote={handleOpenReviseQuote}
              onWhatsApp={handleOpenWhatsApp}
              onGeneratePdf={handleGeneratePdf}
              onOpenAddModal={handleStartNewEnquiry}
            />
          )}

          {activeTab === 'sketchup_enquiries' && (
            <SketchUpEnquiriesView
              onReviseQuote={handleOpenReviseQuote}
              onOpenAddModal={handleStartNewEnquiry}
              onWhatsApp={handleOpenWhatsApp}
              onGeneratePdf={handleGeneratePdf}
              onOrderMoved={() => refreshCounts()}
            />
          )}

          {activeTab === 'quote_revise' && selectedEnquiry && (
            <QuoteReviseView
              enquiry={selectedEnquiry}
              isNew={isNewEnquiry}
              onBack={() => setActiveTab('sketchup_enquiries')}
              onSaveSuccess={() => {
                refreshCounts();
                setActiveTab('sketchup_enquiries');
              }}
              onMoveToOrder={handleMoveToOrder}
              onGeneratePdf={handleGeneratePdf}
              onWhatsApp={handleOpenWhatsApp}
            />
          )}

          {activeTab === 'ongoing_orders' && (
            <OngoingOrdersView
              onOrderCompleted={() => {
                refreshCounts();
                setActiveTab('completed_orders');
              }}
              onGeneratePdf={handleGeneratePdf}
              onWhatsApp={handleOpenWhatsApp}
              onReviseQuote={handleOpenReviseQuote}
            />
          )}

          {activeTab === 'completed_orders' && (
            <CompletedOrdersView
              onGeneratePdf={handleGeneratePdf}
              onWhatsApp={handleOpenWhatsApp}
              onReviseQuote={handleOpenReviseQuote}
            />
          )}

          {activeTab === 'packages' && <PackagesView />}
        </main>
      </div>

      {/* WhatsApp Modal with direct Send with PDF capability */}
      <WhatsAppModal
        isOpen={!!whatsAppEnquiry}
        enquiry={whatsAppEnquiry}
        onClose={() => setWhatsAppEnquiry(null)}
        onQuoteSent={async (id) => {
          if (id) {
            await enquiriesAPI.recordQuoteSent(id, { channel: 'WhatsApp' });
          }
          refreshCounts();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <React.StrictMode>
      <AppContent />
    </React.StrictMode>
  );
}