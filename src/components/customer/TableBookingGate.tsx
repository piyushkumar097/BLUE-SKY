import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock3, ShieldCheck } from 'lucide-react';
import { TableBookingResult } from '../../types';
import { formatINR } from '../../utils/calculations';

type BookingGateState = 'checking' | 'payment_required' | 'unavailable' | 'cancelled' | 'released';

interface TableBookingGateProps {
  tableNumber: number | null;
  state: BookingGateState;
  depositAmount: number;
  onPay: () => boolean;
  onCancel: () => void;
  onRetry: () => TableBookingResult;
}

export const TableBookingGate: React.FC<TableBookingGateProps> = ({
  tableNumber,
  state,
  depositAmount,
  onPay,
  onCancel,
  onRetry,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const handlePayment = () => {
    setIsProcessing(true);
    setPaymentError('');
    window.setTimeout(() => {
      if (!onPay()) {
        setPaymentError('This booking hold expired. Please try again.');
      }
      setIsProcessing(false);
    }, 500);
  };

  const handleRetry = () => {
    const result = onRetry();
    if (result.status === 'payment_required') {
      setPaymentError('');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400">
            <ShieldCheck size={23} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-sky-300">BLUE SKY • Table Booking</p>
            <h1 className="text-xl font-black text-white">
              {tableNumber ? `Table #${String(tableNumber).padStart(2, '0')}` : 'Invalid table QR'}
            </h1>
          </div>
        </div>

        {state === 'checking' && (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
            <Clock3 size={18} className="text-sky-400" />
            Checking table availability…
          </div>
        )}

        {state === 'payment_required' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4">
              <p className="text-sm font-bold text-white">Reserve this table with a deposit</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                The deposit is credited toward your final bill. It is a demo payment and no real money will be charged.
              </p>
              <p className="mt-4 text-2xl font-black text-sky-300">{formatINR(depositAmount)}</p>
            </div>
            {paymentError && (
              <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {paymentError}
              </p>
            )}
            <button
              type="button"
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-500 disabled:cursor-wait disabled:opacity-60"
            >
              {isProcessing ? 'Processing demo payment…' : `Simulate ${formatINR(depositAmount)} Deposit Payment`}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="w-full rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-60"
            >
              Cancel booking
            </button>
          </div>
        )}

        {state === 'unavailable' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
              <AlertCircle size={19} className="mt-0.5 shrink-0 text-amber-300" />
              <p className="text-sm leading-relaxed text-slate-200">
                This table is no longer available for this booking. The menu stays locked until a reservation is confirmed.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="w-full rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              Check table again
            </button>
          </div>
        )}

        {state === 'cancelled' && (
          <div className="space-y-4">
            <p className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-relaxed text-slate-300">
              A deposit is required before this table’s menu can be opened.
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-500"
            >
              Continue table booking
            </button>
          </div>
        )}

        {state === 'released' && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-emerald-300" />
            <p className="text-sm leading-relaxed text-slate-200">
              Your bill is settled and this table is now available for the next guest. Thank you for dining with us.
            </p>
          </div>
        )}

        <p className="mt-5 border-t border-slate-800 pt-4 text-[11px] leading-relaxed text-slate-500">
          Demo only: bookings and simulated payments are stored in this browser. Real reservations require a shared backend and payment provider.
        </p>
      </section>
    </main>
  );
};
