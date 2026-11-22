import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const KitchenDisplaySystem: React.FC = () => {
  const { orders, markFoodReady, toggleKitchenItemComplete } = useRestaurant();
  const [kitchenTime, setKitchenTime] = useState(new Date());

  // Live ticking kitchen clock
  useEffect(() => {
    const timer = setInterval(() => setKitchenTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // FIFO Queue: approved orders currently in preparation
  const kitchenTickets = orders
    .filter((o) => o.status === 'preparing')
    .sort((a, b) => a.createdAt - b.createdAt); // FIFO
  const completedTickets = orders
    .filter((o) => o.status === 'completed')
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-slate-100 space-y-6">
      {/* KDS Dark-Mode Header with Retro Digital Clock */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <ChefHat size={30} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-white tracking-tight">KITCHEN DISPLAY SYSTEM</h1>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono">
                LIVE FIFO QUEUE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Blue Sky Modern Indian Dining • Expediter & Line Cook Console
            </p>
          </div>
        </div>

        {/* Digital Kitchen Clock & Metrics */}
        <div className="flex items-center space-x-4">
          <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Active Tickets
            </span>
            <span className="text-xl font-black text-amber-400 font-mono">
              {kitchenTickets.length}
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Prep Target
            </span>
            <span className="text-xl font-black text-sky-400 font-mono">15m</span>
          </div>

          {/* Retro Glowing Kitchen Clock */}
          <div className="bg-slate-950 border border-slate-800 px-5 py-2 rounded-2xl text-center shadow-inner">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block flex items-center justify-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>STATION TIME</span>
            </span>
            <span className="text-2xl font-black text-emerald-300 font-mono tracking-wider">
              {kitchenTime.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Ticket Grid */}
      {kitchenTickets.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/50 border border-slate-800/80 rounded-3xl">
          <ChefHat size={48} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-white">Kitchen Queue is Clear!</h3>
          <p className="text-xs text-slate-500 mt-1">
            All tickets plated and dispatched. Ready for new customer orders.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {kitchenTickets.map((ticket, idx) => {
            const isPendingApproval = ticket.status === 'pending_approval';
            const elapsedMins = Math.floor(ticket.prepElapsedTimeSeconds / 60);
            const elapsedSecs = ticket.prepElapsedTimeSeconds % 60;

            // Timer color logic: Green -> Amber at 15m -> Red if > 18m
            let timerBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            let isOvertime = false;
            if (elapsedMins >= 18) {
              timerBadgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse';
              isOvertime = true;
            } else if (elapsedMins >= 14) {
              timerBadgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500';
            }

            const allItemsPlated = ticket.items.every((i) => i.isCompletedInKitchen);

            return (
              <div
                key={ticket.id}
                className={`bg-slate-900 border-2 rounded-3xl p-5 shadow-2xl flex flex-col justify-between transition ${
                  isOvertime
                    ? 'border-rose-500'
                    : isPendingApproval
                    ? 'border-amber-500/50'
                    : 'border-slate-700'
                }`}
              >
                {/* Ticket Top Header */}
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-black text-white font-mono">
                        #{String(ticket.tableNumber).padStart(2, '0')}
                      </span>
                      <span className="text-xs bg-slate-800 text-sky-300 font-mono px-2 py-0.5 rounded-md font-bold">
                        {ticket.id}
                      </span>
                    </div>

                    {/* FIFO Queue Position */}
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                      QUEUE #{idx + 1}
                    </span>
                  </div>

                  {/* Stopwatch */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 text-slate-400">
                      <Clock size={14} />
                      <span>Ordered: {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl font-mono font-bold border ${timerBadgeClass}`}>
                      {isOvertime ? <AlertTriangle size={14} /> : <Flame size={14} />}
                      <span>
                        {String(elapsedMins).padStart(2, '0')}:{String(elapsedSecs).padStart(2, '0')}
                      </span>
                      {isOvertime && <span className="text-[9px] uppercase tracking-wider font-sans">OVERDUE</span>}
                    </div>
                  </div>

                  {/* Customer / Waiter Note */}
                  {ticket.customerNote && (
                    <div className="mt-2.5 p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-medium">
                      ⚠️ Note: &quot;{ticket.customerNote}&quot;
                    </div>
                  )}

                  {completedTickets.length > 0 && (
                    <section className="border-t border-slate-800 pt-5" aria-labelledby="completed-kitchen-title">
                      <div className="mb-3 flex items-center justify-between">
                        <h2 id="completed-kitchen-title" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Recent completed orders
                        </h2>
                        <span className="text-xs text-slate-500">{completedTickets.length} shown</span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {completedTickets.map((ticket) => (
                          <div key={ticket.id} className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm font-bold text-slate-200">{ticket.id}</span>
                              <span className="text-xs font-bold text-emerald-400">Table #{String(ticket.tableNumber).padStart(2, '0')}</span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              {ticket.items.length} items • {ticket.items.reduce((sum, item) => sum + item.quantity, 0)} portions
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Interactive Items Checklist */}
                <div className="py-4 space-y-3 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Items Checklist (Tap to Strike-Off)
                  </p>

                  <div className="space-y-2.5">
                    {ticket.items.map((item) => {
                      const isDone = item.isCompletedInKitchen;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleKitchenItemComplete(ticket.id, item.id)}
                          className={`w-full p-3 rounded-2xl border text-left flex items-start space-x-3 transition ${
                            isDone
                              ? 'bg-slate-950/60 border-slate-800 text-slate-500'
                              : 'bg-slate-950 border-slate-700/80 text-white hover:border-slate-600'
                          }`}
                        >
                          <div className="mt-0.5 text-sky-400 shrink-0">
                            {isDone ? (
                              <CheckSquare size={18} className="text-emerald-400" />
                            ) : (
                              <Square size={18} className="text-slate-500" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={`text-base font-black ${isDone ? 'line-through text-slate-500' : 'text-sky-400'}`}>
                                {item.quantity}x
                              </span>
                              <span className={`font-bold text-sm ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                                {item.name}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mt-1">
                              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                                {item.portion}
                              </span>
                              <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-md font-semibold">
                                {item.spice}
                              </span>
                            </div>

                            {item.instructions && (
                              <p className="text-[11px] text-amber-400 font-medium mt-1">
                                👨‍🍳 Chef: {item.instructions}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Ticket Ready Action */}
                <div className="pt-3 border-t border-slate-800 shrink-0">
                  <button
                    onClick={() => markFoodReady(ticket.id)}
                    className={`w-full py-3.5 rounded-2xl font-black text-sm transition flex items-center justify-center space-x-2 shadow-lg active:scale-98 ${
                      allItemsPlated
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-600/30'
                        : 'bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 size={18} />
                    <span>{allItemsPlated ? '✅ All Plated — Mark Food Ready' : 'Mark Food Ready'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
