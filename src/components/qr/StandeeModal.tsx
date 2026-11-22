import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Download, Sparkles, QrCode } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { generateQRCodeDataUrl, buildTableOrderUrl } from '../../utils/qrGenerator';
import { TABLE_BOOKING_DEPOSIT_INR } from '../../constants';

export const StandeeModal: React.FC = () => {
  const { isStandeeModalOpen, toggleStandeeModal } = useRestaurant();
  const [selectedTable, setSelectedTable] = useState<number>(4);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const standeeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isStandeeModalOpen) return;
    const url = buildTableOrderUrl(selectedTable);
    generateQRCodeDataUrl(url, { width: 340 }).then(setQrDataUrl);
  }, [isStandeeModalOpen, selectedTable]);

  if (!isStandeeModalOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `BlueSky-Table-${String(selectedTable).padStart(2, '0')}-Standee.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 my-8">
        {/* Close Button (no-print) */}
        <button
          onClick={() => toggleStandeeModal(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition no-print"
        >
          <X size={22} />
        </button>

        {/* Modal Header (no-print) */}
        <div className="mb-6 no-print">
          <div className="flex items-center space-x-2 text-sky-400 mb-1">
            <QrCode size={20} />
            <span className="text-xs font-bold uppercase tracking-wider">Physical Table Standee Studio</span>
          </div>
          <h2 className="text-2xl font-black text-white">Smart QR Standee Generator</h2>
          <p className="text-sm text-slate-400">Generate, preview and print acrylic standees for restaurant tables.</p>

          {/* Table Selector Pills */}
          <div className="mt-4 flex items-center space-x-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((tbl) => (
              <button
                key={tbl}
                onClick={() => setSelectedTable(tbl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedTable === tbl
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                Table #{String(tbl).padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>

        {/* Printable Standee Card (Print View) */}
        <div
          ref={standeeRef}
          className="mx-auto w-full max-w-sm bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden print-break-inside-avoid"
        >
          {/* Subtle Golden Glow effect */}
          <div className="absolute -top-20 -left-20 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="flex items-center justify-center space-x-2 text-amber-400 mb-1">
            <Sparkles size={16} />
            <span className="text-[11px] font-bold tracking-widest uppercase">Rooftop Lounge Experience</span>
            <Sparkles size={16} />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
            BLUE <span className="text-sky-400">SKY</span>
          </h1>
          <p className="text-[11px] font-medium text-slate-300 uppercase tracking-wider mb-4">
            Modern Indian Dining & Rooftop Lounge
          </p>

          {/* Table Number Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 border border-amber-400/50 px-4 py-1.5 rounded-full text-amber-300 font-bold text-sm mb-5 shadow-sm">
            <span>TABLE #{String(selectedTable).padStart(2, '0')}</span>
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-4 rounded-2xl shadow-xl inline-block border-4 border-slate-800 mx-auto">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`Table ${selectedTable} QR Code`}
                className="w-48 h-48 rounded-lg mx-auto object-contain"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                Generating QR...
              </div>
            )}
          </div>

          {/* Instruction */}
          <div className="mt-4 space-y-1">
            <p className="text-base font-bold text-white">Scan with your camera to reserve this table</p>
            <p className="text-xs text-sky-300">Reserve with a {`₹${TABLE_BOOKING_DEPOSIT_INR}`} deposit • Browse Menu • Order at Your Table</p>
          </div>

          {/* Wi-Fi & Venue Info */}
          <div className="mt-5 pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="text-slate-300 font-medium">
              Free Wi-Fi: <span className="text-white font-mono">BlueSky_Guest_5G</span> | Pass:{' '}
              <span className="text-amber-300 font-mono">BlueSky@2026</span>
            </p>
            <p className="text-slate-500">
              4th Floor, Skyview Plaza, Bailey Road, Patna | GSTIN: 10AABCB4821M1Z5
            </p>
          </div>
        </div>

        {/* Modal Actions (no-print) */}
        <div className="mt-6 flex items-center justify-end space-x-3 no-print">
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-sm transition"
          >
            <Download size={16} />
            <span>Save QR Image</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-sky-600/30"
          >
            <Printer size={16} />
            <span>Print Acrylic Standee</span>
          </button>
        </div>
      </div>
    </div>
  );
};
