import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  ChefHat,
  Banknote,
  Star,
  Users,
  Flame,
  Check,
  TrendingUp,
  Receipt,
  Utensils,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { calculateBalanceDue, formatINR } from '../../utils/calculations';
import { DigitalReceiptModal } from '../customer/DigitalReceiptModal';
import { Order } from '../../types';

export const StaffDashboard: React.FC = () => {
  const {
    tables,
    orders,
    waiterCalls,
    reviews,
    approveOrder,
    markFoodServed,
    confirmCashCollected,
    resolveWaiterCall,
    setSelectedTable,
    setActiveView,
  } = useRestaurant();

  const [receiptOrder, setReceiptOrder] = useState<Order | undefined>(undefined);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Filter queues
  const activeWaiterCalls = waiterCalls.filter((c) => !c.resolved);
  const pendingApprovalOrders = orders.filter((o) => o.status === 'pending_approval');
  const activeServiceOrders = orders.filter(
    (o) =>
      o.status === 'preparing' ||
      o.status === 'ready' ||
      o.status === 'served' ||
      o.paymentStatus === 'cash_pending'
  );

  // Statistics
  const completedOrders = orders.filter((o) => o.paymentStatus === 'paid');
  const totalRevenue = completedOrders.reduce((acc, curr) => acc + curr.grandTotal, 0);
  const totalTips = completedOrders.reduce((acc, curr) => acc + curr.tip, 0);
  const activeKitchenOrders = orders.filter((o) => o.status === 'preparing').length;

  const handleViewReceipt = (order: Order) => {
    setReceiptOrder(order);
    setIsReceiptOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top POS Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Staff & Waiter POS</h1>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-2 py-0.5 rounded-full">
              Floor Terminal
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time floor control • Tables 01–08 • Kitchen Dispatch • Cash Settle
          </p>
        </div>

        {/* Live Metrics Bar */}
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 xl:grid-cols-6">
          {[
            ['Total orders', orders.length, 'text-white'],
            ['Pending', pendingApprovalOrders.length, 'text-amber-400'],
            ['In kitchen', activeKitchenOrders, 'text-sky-400'],
            ['Ready / served', orders.filter((o) => o.status === 'ready' || o.status === 'served').length, 'text-emerald-400'],
            ['Completed', completedOrders.length, 'text-slate-200'],
            ['Revenue', formatINR(totalRevenue), 'text-emerald-400'],
          ].map(([label, value, color]) => (
            <div key={String(label)} className="min-w-24 border border-slate-800 bg-slate-900 px-3 py-2 rounded-lg">
              <span className="text-slate-400 block">{label}</span>
              <span className={`text-sm font-black ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Flashing Waiter Call Alert Banner */}
      {activeWaiterCalls.length > 0 && (
        <div className="space-y-2 animate-bounce-subtle">
          {activeWaiterCalls.map((call) => (
            <div
              key={call.id}
              className="bg-rose-950/80 border-2 border-rose-500/80 rounded-2xl p-4 flex items-center justify-between shadow-xl shadow-rose-900/30"
            >
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-rose-600 text-white rounded-xl animate-pulse">
                  <Bell size={24} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    WAITER ASSISTANCE REQUESTED: TABLE #{String(call.tableNumber).padStart(2, '0')}
                  </h3>
                  <p className="text-xs text-rose-300">
                    Guest tapped &quot;Call Waiter&quot; at{' '}
                    {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => resolveWaiterCall(call.id)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs transition shadow-md"
              >
                <Check size={16} />
                <span>Mark Resolved</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Floor Table Status Strip (Tables #01 to #08) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users size={18} className="text-sky-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Floor Plan: Tables 01 to 08
            </h2>
          </div>
          <span className="text-xs text-slate-500">Tap table to preview customer ordering view</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {tables.map((t) => {
            const hasOrder = orders.find(
              (o) => o.tableNumber === t.tableNumber && o.status !== 'completed' && o.status !== 'cancelled'
            );
            const isCashDue = hasOrder?.paymentStatus === 'cash_pending';
            const isPreparing = hasOrder?.status === 'preparing';
            const isReady = hasOrder?.status === 'ready';

            let statusColor = 'border-slate-800 bg-slate-950 text-slate-400';
            let badgeText = 'Available';

            if (t.waiterCallActive) {
              statusColor = 'border-rose-500 bg-rose-950/40 text-rose-300 animate-pulse';
              badgeText = 'Calling!';
            } else if (isCashDue) {
              statusColor = 'border-purple-500 bg-purple-950/40 text-purple-300';
              badgeText = 'Cash Due';
            } else if (t.status === 'booked') {
              statusColor = 'border-sky-500 bg-sky-950/40 text-sky-300';
              badgeText = 'Booked';
            } else if (t.status === 'booking_pending') {
              statusColor = 'border-amber-500 bg-amber-950/40 text-amber-300';
              badgeText = 'Deposit Due';
            } else if (t.status === 'served' || hasOrder?.status === 'served') {
              statusColor = 'border-violet-500 bg-violet-950/40 text-violet-300';
              badgeText = 'Served';
            } else if (isReady) {
              statusColor = 'border-emerald-500 bg-emerald-950/40 text-emerald-300';
              badgeText = 'Food Ready';
            } else if (isPreparing) {
              statusColor = 'border-amber-500 bg-amber-950/40 text-amber-300';
              badgeText = 'Cooking';
            } else if (hasOrder?.status === 'pending_approval') {
              statusColor = 'border-sky-500 bg-sky-950/40 text-sky-300';
              badgeText = 'Approval';
            }

            return (
              <button
                key={t.tableNumber}
                onClick={() => {
                  setSelectedTable(t.tableNumber);
                  setActiveView('customer');
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-between text-center transition hover:scale-105 ${statusColor}`}
              >
                <span className="text-xs font-mono font-bold">Table #{String(t.tableNumber).padStart(2, '0')}</span>
                <span className="text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded-full bg-black/40">
                  {badgeText}
                </span>
                {t.totalLoyaltyPoints > 0 && (
                  <span className="text-[9px] text-amber-400 mt-1">⭐ {t.totalLoyaltyPoints} pts</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Layout: Left (Orders & Cash), Right (Reviews & Stats) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Orders Queues */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incoming Orders Needing Approval */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Clock size={18} className="text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Incoming Orders Requiring Approval
                </h3>
              </div>
              <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingApprovalOrders.length} pending
              </span>
            </div>

            {pendingApprovalOrders.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No orders currently waiting for approval.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApprovalOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-white text-sm">{ord.id}</span>
                        <span className="bg-slate-800 text-sky-400 font-bold text-xs px-2 py-0.5 rounded-md">
                          Table #{String(ord.tableNumber).padStart(2, '0')}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-slate-300 space-y-0.5">
                        {ord.items.map((i) => (
                          <div key={i.id} className="flex items-center space-x-1">
                            <span className="font-bold text-sky-400">{i.quantity}x</span>
                            <span>{i.name}</span>
                            <span className="text-slate-500">({i.portion} • {i.spice})</span>
                          </div>
                        ))}
                      </div>

                      {ord.customerNote && (
                        <p className="mt-2 text-[11px] text-amber-300 italic">
                          &quot;{ord.customerNote}&quot;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Subtotal</p>
                        <p className="text-sm font-black text-white">{formatINR(ord.subtotal)}</p>
                      </div>

                      <button
                        onClick={() => approveOrder(ord.id)}
                        className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-600/20 flex items-center space-x-1.5"
                      >
                        <ChefHat size={16} />
                        <span>Send to Kitchen (1-Tap)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Orders, Food Service & Cash Collection Tracker */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Utensils size={18} className="text-sky-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Active Table Service & Payment Tracker
                </h3>
              </div>
              <span className="text-xs text-slate-400">{activeServiceOrders.length} active</span>
            </div>

            {activeServiceOrders.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No active orders undergoing kitchen prep or table service.
              </div>
            ) : (
              <div className="space-y-3">
                {activeServiceOrders.map((ord) => {
                  const isCashPending = ord.paymentStatus === 'cash_pending';
                  const isReady = ord.status === 'ready';
                  const isServed = ord.status === 'served';

                  return (
                    <div
                      key={ord.id}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-white text-sm">{ord.id}</span>
                          <span className="bg-slate-800 text-sky-400 font-bold text-xs px-2 py-0.5 rounded-md">
                            Table #{String(ord.tableNumber).padStart(2, '0')}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              isReady
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : isServed
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-sky-500/20 text-sky-300'
                            }`}
                          >
                            {ord.status.toUpperCase()}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 mt-1">
                          {ord.items.length} items • Prep elapsed: {Math.floor(ord.prepElapsedTimeSeconds / 60)}m {ord.prepElapsedTimeSeconds % 60}s
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => handleViewReceipt(ord)}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center space-x-1"
                        >
                          <Receipt size={14} />
                          <span>Receipt</span>
                        </button>

                        {isReady && (
                          <button
                            onClick={() => markFoodServed(ord.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-emerald-600/30"
                          >
                            <CheckCircle2 size={15} />
                            <span>Mark Food Served</span>
                          </button>
                        )}

                        {isCashPending && (
                          <button
                            onClick={() => confirmCashCollected(ord.id)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-purple-600/30 animate-pulse"
                          >
                            <Banknote size={15} />
                            <span>
                              Confirm Cash Collected ({formatINR(calculateBalanceDue(ord.grandTotal, ord.bookingDeposit))})
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Live Customer Reviews Feed */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Star size={18} className="text-amber-400 fill-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Live Customer Reviews Feed
                </h3>
              </div>
              <span className="text-xs text-slate-400">{reviews.length} total</span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {reviews.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No guest reviews submitted yet today.
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-white text-xs">
                          {rev.customerName || 'Guest'}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                          Table #{String(rev.tableNumber).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={12} className="fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      &quot;{rev.comment}&quot;
                    </p>

                    <p className="text-[10px] text-slate-500">
                      {new Date(rev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal for Staff */}
      <DigitalReceiptModal
        order={receiptOrder}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />
    </div>
  );
};
