import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi,
  Bell,
  Search,
  Leaf,
  ShoppingBag,
  Award,
  Sparkles,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { MENU_ITEMS } from '../../data/menuData';
import { MenuItem, TableBookingResult } from '../../types';
import { DishCard } from './DishCard';
import { DishCustomizerModal } from './DishCustomizerModal';
import { CartDrawer } from './CartDrawer';
import { LiveOrderTracker } from './LiveOrderTracker';
import { PaymentModal } from './PaymentModal';
import { DigitalReceiptModal } from './DigitalReceiptModal';
import { TableBookingGate } from './TableBookingGate';
import { formatINR } from '../../utils/calculations';
import { TABLE_BOOKING_DEPOSIT_INR } from '../../constants';

type BookingGateState =
  | 'checking'
  | 'payment_required'
  | 'unavailable'
  | 'cancelled'
  | 'released'
  | 'booked'
  | 'none';

function getBookingSessionId(tableNumber: number): string | null {
  try {
    return sessionStorage.getItem(`bluesky_table_booking_${tableNumber}`);
  } catch (error) {
    console.warn('Unable to read table booking session', error);
    return null;
  }
}

function setBookingSessionId(tableNumber: number, bookingId: string | null): void {
  try {
    const key = `bluesky_table_booking_${tableNumber}`;
    if (bookingId) {
      sessionStorage.setItem(key, bookingId);
    } else {
      sessionStorage.removeItem(key);
    }
  } catch (error) {
    console.warn('Unable to update table booking session', error);
  }
}

export const CustomerView: React.FC = () => {
  const {
    selectedTable,
    tables,
    orders,
    cart,
    addToCart,
    activeTableOrder,
    callWaiter,
    waiterCalls,
    toggleWifiModal,
    beginTableBooking,
    completeTableBooking,
    cancelTableBooking,
    setSelectedTable,
  } = useRestaurant();
  const [qrTableQuery] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('table')
  );
  const requestedTableNumber = qrTableQuery !== null && /^\d+$/.test(qrTableQuery)
    ? Number(qrTableQuery)
    : null;
  const hasQrRequest = qrTableQuery !== null;
  const [bookingState, setBookingState] = useState<BookingGateState>(
    hasQrRequest ? 'checking' : 'none'
  );
  const [bookingId, setBookingId] = useState<string | null>(null);
  const bookingInitialized = useRef(false);

  // Category and filter state
  const [activeCategory, setActiveCategory] = useState<'All' | 'Starters' | 'Mains' | 'Drinks' | 'Desserts'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  // Modals state
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastPaidOrderId, setLastPaidOrderId] = useState<string | null>(null);

  // Waiter Call Cooldown state
  const currentTable = tables.find((t) => t.tableNumber === selectedTable);
  const activeCall = waiterCalls.find((c) => c.tableNumber === selectedTable && !c.resolved);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (!hasQrRequest || bookingInitialized.current) return;
    bookingInitialized.current = true;

    if (
      requestedTableNumber === null ||
      requestedTableNumber < 1 ||
      requestedTableNumber > 8
    ) {
      setBookingState('unavailable');
      return;
    }

    setSelectedTable(requestedTableNumber);

    const existingBookingId = getBookingSessionId(requestedTableNumber);
    const result = beginTableBooking(requestedTableNumber, existingBookingId);
    setBookingId(result.bookingId || null);
    setBookingState(result.status);
    if (result.status === 'payment_required') {
      setBookingSessionId(requestedTableNumber, result.bookingId);
    } else if (result.status === 'released' || result.status === 'unavailable') {
      setBookingSessionId(requestedTableNumber, null);
    }
  }, [beginTableBooking, hasQrRequest, requestedTableNumber, setSelectedTable]);

  useEffect(() => {
    if (
      hasQrRequest &&
      bookingState === 'booked' &&
      currentTable?.status === 'available' &&
      !currentTable.bookingId
    ) {
      setBookingState('released');
      if (requestedTableNumber !== null) {
        setBookingSessionId(requestedTableNumber, null);
      }
    }
  }, [bookingState, currentTable?.bookingId, currentTable?.status, hasQrRequest, requestedTableNumber]);

  useEffect(() => {
    if (!activeCall) {
      setCooldownSeconds(0);
      return;
    }
    const updateCooldown = () => {
      const elapsed = Math.floor((Date.now() - activeCall.timestamp) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      setCooldownSeconds(remaining);
    };
    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [activeCall]);

  const handleCallWaiter = () => {
    if (cooldownSeconds > 0) return;
    callWaiter(selectedTable);
  };

  const handleBookingPayment = (): boolean => {
    if (requestedTableNumber === null || !bookingId) return false;
    if (!completeTableBooking(requestedTableNumber, bookingId)) {
      setBookingSessionId(requestedTableNumber, null);
      setBookingState('unavailable');
      return false;
    }

    setBookingSessionId(requestedTableNumber, bookingId);
    setBookingState('booked');
    return true;
  };

  const handleCancelBooking = () => {
    if (requestedTableNumber !== null && bookingId) {
      cancelTableBooking(requestedTableNumber, bookingId);
    }
    if (requestedTableNumber !== null) {
      setBookingSessionId(requestedTableNumber, null);
    }
    setBookingId(null);
    setBookingState('cancelled');
  };

  const retryTableBooking = (): TableBookingResult => {
    if (requestedTableNumber === null) {
      setBookingState('unavailable');
      return { status: 'unavailable' };
    }
    const result = beginTableBooking(requestedTableNumber);
    setBookingId(result.bookingId || null);
    setBookingState(result.status);
    if (result.status === 'payment_required') {
      setBookingSessionId(requestedTableNumber, result.bookingId);
    } else if (result.status === 'released' || result.status === 'unavailable') {
      setBookingSessionId(requestedTableNumber, null);
    }
    return result;
  };

  if (hasQrRequest && bookingState !== 'booked') {
    return (
      <>
        <TableBookingGate
          tableNumber={requestedTableNumber}
          state={bookingState === 'none' ? 'checking' : bookingState}
          depositAmount={TABLE_BOOKING_DEPOSIT_INR}
          onPay={handleBookingPayment}
          onCancel={handleCancelBooking}
          onRetry={retryTableBooking}
        />
        {bookingState === 'released' && (
          <DigitalReceiptModal
            order={lastPaidOrderId ? orders.find((order) => order.id === lastPaidOrderId) : undefined}
            isOpen={isReceiptOpen}
            onClose={() => {
              setIsReceiptOpen(false);
              setLastPaidOrderId(null);
            }}
          />
        )}
      </>
    );
  }

  // Filter dishes
  const filteredDishes = MENU_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesVeg = !vegOnly || item.isVeg;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesVeg && matchesSearch;
  });

  const cartItemCount = cart.reduce((acc, c) => acc + c.quantity, 0);
  const cartSubtotal = cart.reduce((acc, c) => acc + c.itemTotal, 0);

  // Loyalty pill for active table
  const tableLoyalty = currentTable?.totalLoyaltyPoints || activeTableOrder?.loyaltyEarned || 0;

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center py-0 sm:py-6 px-0 sm:px-4">
      {/* 480px Centered Mobile Device Frame */}
      <div className="w-full max-w-[480px] bg-slate-900 border-0 sm:border sm:border-slate-800 sm:rounded-[36px] shadow-2xl flex flex-col min-h-screen sm:min-h-[840px] relative overflow-hidden pb-24">
        {/* Sticky Customer Header */}
        <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Brand Logo & Rooftop Badge */}
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white font-black text-sm shadow-md shadow-sky-600/30">
                BS
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <h1 className="text-base font-black tracking-tight text-white">BLUE SKY</h1>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-500/40">
                    ROOFTOP
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Patna • Modern Indian Dining</p>
              </div>
            </div>

            {/* Right Header Badges: Table Number, Loyalty & Wi-Fi */}
            <div className="flex items-center space-x-1.5">
              {/* Table Badge */}
              <div className="bg-slate-800 border border-slate-700 px-2 py-1 rounded-xl text-xs font-mono font-bold text-sky-400">
                Table #{String(selectedTable).padStart(2, '0')}
              </div>

              {/* Loyalty Pill */}
              <div
                title="Table Loyalty Points"
                className="flex items-center space-x-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-1 rounded-xl text-[11px] font-bold"
              >
                <Award size={13} className="text-amber-400" />
                <span>{tableLoyalty} pts</span>
              </div>

              {/* Free Wi-Fi Modal Trigger */}
              <button
                onClick={() => toggleWifiModal(true)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl border border-slate-700 transition"
                title="View Complimentary Wi-Fi Credentials"
              >
                <Wifi size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-4 space-y-4 flex-1">
          {/* Active Live Order Tracker (Pinned if order exists) */}
          {activeTableOrder && (
            <LiveOrderTracker
              order={activeTableOrder}
              onOpenPayment={() => setIsPaymentOpen(true)}
            />
          )}

          {/* Search Bar & Veg-Only Filter */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search royal starters, biryanis, drinks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            {/* Veg-Only Toggle Button */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-2xl border text-xs font-bold transition shrink-0 ${
                vegOnly
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Leaf size={14} className={vegOnly ? 'text-emerald-400' : ''} />
              <span>Veg Only</span>
            </button>
          </div>

          {/* Sticky Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {(['All', 'Starters', 'Mains', 'Drinks', 'Desserts'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  activeCategory === cat
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Dish Cards */}
          <div className="space-y-4 pt-1">
            {filteredDishes.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No culinary delicacies matched your filter.
              </div>
            ) : (
              filteredDishes.map((dish) => (
                <DishCard
                  key={dish.id}
                  item={dish}
                  onOpenCustomizer={(item) => setSelectedDish(item)}
                />
              ))
            )}
          </div>
        </div>

        {/* Floating Emergency "Call Waiter" Button */}
        <div className="fixed sm:absolute bottom-5 right-4 z-30">
          <button
            onClick={handleCallWaiter}
            disabled={cooldownSeconds > 0}
            className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-full font-bold text-xs shadow-2xl transition active:scale-95 border ${
              cooldownSeconds > 0
                ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-rose-600/30 animate-pulse'
            }`}
          >
            <Bell size={16} />
            <span>
              {cooldownSeconds > 0
                ? `Waiter Notified (${cooldownSeconds}s)`
                : 'Call Waiter'}
            </span>
          </button>
        </div>

        {/* Floating Bottom Cart Bar */}
        {cartItemCount > 0 && (
          <div className="fixed sm:absolute bottom-5 left-4 right-20 z-20">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-gradient-to-r from-sky-600 via-sky-500 to-sky-600 text-white p-3 rounded-2xl shadow-xl shadow-sky-600/30 flex items-center justify-between text-xs font-bold border border-sky-400/40 animate-bounce-subtle"
            >
              <div className="flex items-center space-x-2">
                <div className="bg-black/30 p-1.5 rounded-lg">
                  <ShoppingBag size={16} />
                </div>
                <span>
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-black">{formatINR(cartSubtotal)}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px]">View Cart →</span>
              </div>
            </button>
          </div>
        )}

        {/* Modals */}
        <DishCustomizerModal
          item={selectedDish}
          onClose={() => setSelectedDish(null)}
          onAddToCart={addToCart}
        />

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
        />

        {activeTableOrder && (
          <PaymentModal
            order={activeTableOrder}
            isOpen={isPaymentOpen}
            onClose={() => setIsPaymentOpen(false)}
            onPaymentComplete={(id) => {
              setLastPaidOrderId(id);
              setIsPaymentOpen(false);
              setIsReceiptOpen(true);
            }}
          />
        )}

        <DigitalReceiptModal
          order={
            lastPaidOrderId
              ? orders.find((o) => o.id === lastPaidOrderId)
              : activeTableOrder
          }
          isOpen={isReceiptOpen}
          onClose={() => {
            setIsReceiptOpen(false);
            setLastPaidOrderId(null);
          }}
        />
      </div>
    </div>
  );
};
