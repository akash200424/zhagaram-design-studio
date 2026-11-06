import React from 'react';
import { FileText, Share2, ArrowRight, Save, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';

const CartTotalCard = ({
  pricing,
  services = { plan: false, elevation: true, interior: false },
  onChangePricing,
  onSaveDraft,
  onMoveToOrder,
  onGeneratePdf,
  onOpenWhatsApp,
  isSaving,
  isMandatoryFilled = true,
}) => {
  const handleMoveOrderClick = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
    onMoveToOrder();
  };

  const handleWhatsAppClick = () => {
    if (!isMandatoryFilled) {
      alert('Please fill mandatory customer details (Name, Mobile, Project) and area before sending quote.');
      return;
    }
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
    });
    onOpenWhatsApp();
  };

  const handlePdfClick = () => {
    if (!isMandatoryFilled) {
      alert('Please fill mandatory customer details (Name, Mobile, Project) and area before generating PDF.');
      return;
    }
    onGeneratePdf();
  };

  const planSqft = pricing?.planSqft || 0;
  const planRate = pricing?.planRate || 12;
  const planSubtotal = pricing?.planSubtotal || Math.round(planSqft * planRate);

  const elevationSqft = pricing?.elevationSqft || 0;
  const elevationRate = pricing?.elevationRate || 22;
  const elevationSubtotal = pricing?.elevationSubtotal || Math.round(elevationSqft * elevationRate);

  const interiorSqft = pricing?.interiorSqft || 0;
  const interiorRate = pricing?.interiorRate || 35;
  const interiorSubtotal = pricing?.interiorSubtotal || Math.round(interiorSqft * interiorRate);

  // Surcharges & add-ons completely removed as instructed
  const discount = Number(pricing?.discount || 0);

  const calculatedSubtotal =
    (services.plan ? planSubtotal : 0) +
    (services.elevation ? elevationSubtotal : 0) +
    (services.interior ? interiorSubtotal : 0);

  const grandTotal = Math.max(0, calculatedSubtotal - discount);
  const paymentType = pricing?.paymentType || 'Double';
  const paymentStatus = pricing?.paymentStatus || 'Unpaid';

  let advance = pricing?.advanceAmount !== undefined ? Number(pricing.advanceAmount) : (paymentStatus === 'Fully Paid' ? grandTotal : paymentStatus === 'Advance Paid' ? Math.round(grandTotal / 2) : 0);
  let balance = pricing?.balanceAmount !== undefined ? Number(pricing.balanceAmount) : Math.max(0, grandTotal - advance);

  const handleSelectStatus = (newStatus) => {
    if (!onChangePricing) return;
    let newAdv = advance;
    let newBal = balance;

    if (newStatus === 'Fully Paid') {
      newAdv = grandTotal;
      newBal = 0;
    } else if (newStatus === 'Unpaid') {
      newAdv = 0;
      newBal = grandTotal;
    } else if (newStatus === 'Advance Paid') {
      newAdv = Math.round(grandTotal / 2);
      newBal = grandTotal - newAdv;
    }

    onChangePricing({
      ...pricing,
      paymentStatus: newStatus,
      advanceAmount: newAdv,
      balanceAmount: newBal,
    });
  };

  const handleCustomAdvance = (val) => {
    if (!onChangePricing) return;
    const num = Number(val || 0);
    const newBal = Math.max(0, grandTotal - num);
    let newStatus = paymentStatus;
    if (num >= grandTotal && grandTotal > 0) newStatus = 'Fully Paid';
    else if (num > 0) newStatus = 'Advance Paid';
    else newStatus = 'Unpaid';

    onChangePricing({
      ...pricing,
      advanceAmount: num,
      balanceAmount: newBal,
      paymentStatus: newStatus,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 sticky top-20 sm:top-24 space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">Price Calculator</h3>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-white font-bold">
          Summary
        </span>
      </div>

      {/* Selected Services breakdown */}
      <div className="space-y-2 text-xs">
        {/* Planning line */}
        {services.plan && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex justify-between items-center text-slate-700 font-bold">
              <span>Architectural Planning</span>
              <span className="font-mono text-slate-900">₹ {planSubtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>{planSqft} sq.ft</span>
              <span>@ ₹{planRate}/sq.ft</span>
            </div>
          </div>
        )}

        {/* Elevation line */}
        {services.elevation && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex justify-between items-center text-slate-700 font-bold">
              <span>Elevation Package</span>
              <span className="font-mono text-slate-900">₹ {elevationSubtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>{elevationSqft} sq.ft</span>
              <span>@ ₹{elevationRate}/sq.ft</span>
            </div>
          </div>
        )}

        {/* Interior line */}
        {services.interior && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex justify-between items-center text-slate-700 font-bold">
              <span>Interior Design</span>
              <span className="font-mono text-slate-900">₹ {interiorSubtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>{interiorSqft} sq.ft</span>
              <span>@ ₹{interiorRate}/sq.ft</span>
            </div>
          </div>
        )}

        {/* Subtotal */}
        <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-slate-700">
          <span className="font-semibold">Subtotal</span>
          <span className="font-bold text-slate-900 text-sm">₹ {calculatedSubtotal.toLocaleString('en-IN')}</span>
        </div>

        {/* Discount input */}
        <div className="pt-1">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Discount (₹)</label>
          <input
            type="number"
            min="0"
            value={pricing?.discount ?? 0}
            onChange={(e) => onChangePricing && onChangePricing({ ...pricing, discount: Number(e.target.value) })}
            placeholder="0"
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Grand Total */}
        <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-baseline">
          <span className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">Grand Total</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900">₹ {grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Manual Payment Marking Section */}
      <div className="pt-3 border-t border-slate-100 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
            <span>Payment Marking</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">Manual control</span>
        </div>

        {/* Status Toggle Buttons */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => handleSelectStatus('Unpaid')}
            className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition text-center ${
              paymentStatus === 'Unpaid'
                ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Unpaid
          </button>
          <button
            type="button"
            onClick={() => handleSelectStatus('Advance Paid')}
            className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition text-center ${
              paymentStatus === 'Advance Paid'
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Advance
          </button>
          <button
            type="button"
            onClick={() => handleSelectStatus('Fully Paid')}
            className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition text-center ${
              paymentStatus === 'Fully Paid'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Fully Paid
          </button>
        </div>

        {/* Manual Amount Fields */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
          <div>
            <label className="block text-slate-500 font-medium mb-0.5">Paid Amount (₹)</label>
            <input
              type="number"
              min="0"
              max={grandTotal}
              value={advance}
              onChange={(e) => handleCustomAdvance(e.target.value)}
              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-slate-500 font-medium mb-0.5">Balance Due (₹)</label>
            <div className="w-full px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono font-bold">
              ₹ {balance.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Validation Warning */}
      {!isMandatoryFilled && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium leading-relaxed">
          ⚠️ Enter Customer Name, Mobile, Project Name & Square Feet to generate Quote PDF & WhatsApp dispatch.
        </div>
      )}

      {/* Action Buttons: WhatsApp Quote + PDF + Save + Move */}
      <div className="space-y-2 pt-1">
        {/* WhatsApp Icon Button with PDF attachment capability */}
        <button
          type="button"
          disabled={!isMandatoryFilled}
          onClick={handleWhatsAppClick}
          className={`w-full py-2.5 px-4 font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 transition ${
            isMandatoryFilled
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
          title={isMandatoryFilled ? 'Send quotation via WhatsApp (with PDF)' : 'Fill mandatory fields to enable'}
        >
          <Share2 className="w-4 h-4" />
          <span>WhatsApp Quote (with PDF)</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="w-full py-2.5 px-3 bg-black text-white hover:bg-slate-800 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Quote</span>
          </button>

          <button
            type="button"
            disabled={!isMandatoryFilled}
            onClick={handlePdfClick}
            className={`w-full py-2.5 px-3 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition border ${
              isMandatoryFilled
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
            }`}
            title={isMandatoryFilled ? 'Download Quote PDF' : 'Fill mandatory fields to enable'}
          >
            <FileText className={`w-3.5 h-3.5 ${isMandatoryFilled ? 'text-red-600' : 'text-slate-300'}`} />
            <span>Quote PDF</span>
          </button>
        </div>

        {/* Move to Order Button */}
        <button
          type="button"
          onClick={handleMoveOrderClick}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-sm"
        >
          <span>Move to Ongoing Order</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default CartTotalCard;