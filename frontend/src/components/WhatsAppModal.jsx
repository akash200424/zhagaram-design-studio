import React, { useState, useEffect } from 'react';
import { X, Send, Copy, Check, MessageSquare, FileText, CheckCircle2 } from 'lucide-react';
import { formatWhatsAppMessage, openWhatsApp } from '../utils/whatsappHelper';
import { generateQuotePdf } from '../utils/pdfGenerator';

const WhatsAppModal = ({ isOpen, onClose, enquiry, onQuoteSent }) => {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (enquiry) {
      setPhone(enquiry.mobileNo || '');
      setMessage(formatWhatsAppMessage(enquiry));
    }
  }, [enquiry]);

  if (!isOpen || !enquiry) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    setSending(true);
    try {
      await openWhatsApp({ ...enquiry, mobileNo: phone });
      if (onQuoteSent) {
        onQuoteSent(enquiry._id, 'WhatsApp');
      }
      setTimeout(() => {
        setSending(false);
        onClose();
      }, 500);
    } catch (err) {
      console.error(err);
      setSending(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      await generateQuotePdf(enquiry, { autoDownload: true });
    } catch (err) {
      alert('Error downloading PDF: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-emerald-600 text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">WhatsApp Quote Dispatch</h3>
              <p className="text-[11px] text-emerald-100">Send personalized estimate & attach invoice PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Client & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Client Name</label>
              <input
                type="text"
                disabled
                value={enquiry.clientName || ''}
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Mobile Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 8489904344"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* PDF Dispatch Notice */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Invoice PDF generated with studio logo & tax breakdown</span>
            </div>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="text-emerald-700 hover:text-emerald-900 font-bold underline flex items-center space-x-1 shrink-0 ml-2"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>

          {/* Formatted Message Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">Quotation Message</label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] font-medium text-slate-600 hover:text-slate-900 flex items-center space-x-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
            <textarea
              rows={10}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed text-slate-800"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span className="text-[11px] text-slate-500 text-center sm:text-left">
            Opens WhatsApp with quote & auto-downloads invoice PDF
          </span>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center space-x-1.5 transition shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Dispatching...' : 'Send with PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppModal;