import React, { useState } from 'react';
import { Wifi, Copy, Check, X, ShieldCheck } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const WifiModal: React.FC = () => {
  const { isWifiModalOpen, toggleWifiModal } = useRestaurant();
  const [copied, setCopied] = useState(false);

  if (!isWifiModalOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText('BlueSky@2026');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in no-print">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-sky-500/30 rounded-2xl p-6 shadow-2xl text-slate-100">
        <button
          onClick={() => toggleWifiModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X size={20} />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
            <Wifi size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Complimentary Rooftop Wi-Fi</h3>
            <p className="text-xs text-sky-300">High-speed 5GHz guest network</p>
          </div>
        </div>

        <div className="space-y-4 bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Network Name (SSID)</label>
            <div className="mt-1 flex items-center justify-between text-base font-mono text-white bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-700">
              <span>BlueSky_Guest_5G</span>
              <span className="flex items-center text-xs text-emerald-400 font-sans font-medium">
                <ShieldCheck size={14} className="mr-1" /> WPA3 Secure
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Network Password</label>
            <div className="mt-1 flex items-center justify-between text-base font-mono text-amber-300 bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-700">
              <span>BlueSky@2026</span>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 text-xs font-sans px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded transition shadow"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col space-y-2">
          <button
            onClick={handleCopy}
            className="w-full py-3 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-semibold rounded-xl transition shadow-lg shadow-sky-600/25 flex items-center justify-center space-x-2"
          >
            {copied ? <Check size={18} /> : <Wifi size={18} />}
            <span>{copied ? 'Password Copied to Clipboard!' : 'Copy Password & Auto-Connect'}</span>
          </button>
          <p className="text-center text-[11px] text-slate-500">
            Terms: Unlimited speed courtesy of Blue Sky Modern Indian Dining.
          </p>
        </div>
      </div>
    </div>
  );
};
