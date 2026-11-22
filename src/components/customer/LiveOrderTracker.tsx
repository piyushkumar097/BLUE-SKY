import React from 'react';
import { Clock, CheckCircle2, Flame, Award, CreditCard } from 'lucide-react';
import { Order } from '../../types';
import { calculateBalanceDue, formatINR } from '../../utils/calculations';

interface LiveOrderTrackerProps {
  order: Order;
  onOpenPayment: () => void;
}

export const LiveOrderTracker: React.FC<LiveOrderTrackerProps> = ({ order, onOpenPayment }) => {
  const isPreparing = order.status === 'preparing';
  const isPending = order.status === 'pending_approval';
  const isReady = order.status === 'ready';
  const isServed = order.status === 'served';

  // Countdown calculations
  const totalPrepSeconds = order.prepEstimatedMinutes * 60;
  const remainingSeconds = Math.max(0, totalPrepSeconds - order.prepElapsedTimeSeconds);
  const remainingMinutes = Math.ceil(remainingSeconds / 60);

  // Loyalty calculations: 10 pts per 2 minutes, 10 pts = ₹5 off
  const nextMilestoneSeconds = 120 - (order.prepElapsedTimeSeconds % 120);
  const milestoneProgress = Math.min(100, Math.round(((120 - nextMilestoneSeconds) / 120) * 100));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
          isReady
            ? 'bg-emerald-500/20'
            : isPreparing
            ? 'bg-amber-500/20'
            : 'bg-sky-500/20'
        }`}
      />

      {/* Header & Order ID */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-sky-400">{order.id}</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
              Table #{String(order.tableNumber).padStart(2, '0')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Status Pill */}
        <div>
          {isPending && (
            <span className="flex items-center space-x-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              <Clock size={13} />
              <span>Pending Approval</span>
            </span>
          )}
          {isPreparing && (
            <span className="flex items-center space-x-1.5 bg-sky-500/10 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-bold">
              <Flame size={13} className="text-amber-400 animate-bounce" />
              <span>Preparing in Kitchen</span>
            </span>
          )}
          {isReady && (
            <span className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
              <CheckCircle2 size={13} />
              <span>Plated & Ready</span>
            </span>
          )}
          {isServed && (
            <span className="flex items-center space-x-1.5 bg-purple-500/10 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold">
              <CheckCircle2 size={13} />
              <span>Served at Table</span>
            </span>
          )}
        </div>
      </div>

      {/* Countdown & Wait-Time Loyalty Progress Card */}
      {isPreparing && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock size={18} className="text-sky-400" />
              <div>
                <p className="text-xs text-slate-400">Estimated Ready In</p>
                <p className="text-lg font-black text-white">~{remainingMinutes} minutes</p>
              </div>
            </div>

            {/* Loyalty Points Pill */}
            <div className="text-right">
              <span className="inline-flex items-center space-x-1 bg-amber-500/10 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-xl text-xs font-bold">
                <Award size={14} className="text-amber-400" />
                <span>+{order.loyaltyEarned} Pts Earned</span>
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">₹{(order.loyaltyEarned * 0.5).toFixed(0)} Bill Discount</p>
            </div>
          </div>

          {/* Dynamic Progress Bar */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Wait-Time Loyalty Progression</span>
              <span className="text-amber-400 font-semibold">+10 pts in {nextMilestoneSeconds}s</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 via-amber-400 to-amber-500 transition-all duration-1000 rounded-full"
                style={{ width: `${milestoneProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Item Summary Checklist */}
      <div className="space-y-1.5 pt-1">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Ordered Items</p>
        <div className="divide-y divide-slate-800/80 bg-slate-950/50 rounded-2xl p-2.5 border border-slate-800">
          {order.items.map((item) => (
            <div key={item.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sky-400">{item.quantity}x</span>
                <div>
                  <span className="font-semibold text-white">{item.name}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">
                    ({item.portion} • {item.spice})
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {item.isCompletedInKitchen && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
                    <CheckCircle2 size={11} className="mr-0.5" /> Plated
                  </span>
                )}
                <span className="font-bold text-slate-300">{formatINR(item.totalPrice)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bill & Payment Action Button */}
      <div className="pt-2">
        <button
          onClick={onOpenPayment}
          className="w-full py-3 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold rounded-2xl transition shadow-lg shadow-sky-600/25 flex items-center justify-between px-4 text-sm"
        >
          <span className="flex items-center space-x-2">
            <CreditCard size={18} />
            <span>{isServed ? 'Pay Bill & Checkout' : 'View Bill & Settle Payment'}</span>
          </span>
          <span className="text-base font-black">
            {formatINR(calculateBalanceDue(order.grandTotal, order.bookingDeposit))}
          </span>
        </button>
      </div>
    </div>
  );
};
