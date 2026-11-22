import React from 'react';
import {
  Smartphone,
  LayoutDashboard,
  ChefHat,
  Volume2,
  VolumeX,
  FastForward,
  RotateCcw,
  QrCode,
  Bell,
  Clock,
  CheckCircle2,
  Banknote,
  Sun,
  Moon,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const TopDemoBar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    selectedTable,
    setSelectedTable,
    tables,
    orders,
    waiterCalls,
    isMuted,
    theme,
    toggleTheme,
    toggleMute,
    fastForwardTwoMinutes,
    resetDemoData,
    toggleStandeeModal,
  } = useRestaurant();

  // Badge calculations
  const unresolvedCallsCount = waiterCalls.filter((c) => !c.resolved).length;
  const pendingApprovalsCount = orders.filter((o) => o.status === 'pending_approval').length;
  const readyOrdersCount = orders.filter((o) => o.status === 'ready').length;
  const cashDueCount = orders.filter((o) => o.paymentStatus === 'cash_pending').length;
  const kitchenTicketsCount = orders.filter(
    (o) => o.status === 'preparing' || o.status === 'pending_approval'
  ).length;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0d1727]/95 px-3 py-2 text-xs shadow-lg backdrop-blur-md no-print sm:px-4">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        {/* Brand & Roles */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Brand Tag */}
          <div className="flex items-center space-x-1.5 pr-2 border-r border-slate-700/80 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="font-extrabold tracking-wider text-white text-sm">
              BLUE <span className="text-sky-400">SKY</span>
            </span>
          </div>

          {/* View 1: Customer */}
          <button
            onClick={() => setActiveView('customer')}
            aria-label="Open customer mobile view"
            className={`flex min-h-10 items-center space-x-1.5 rounded-lg px-3 py-2 font-semibold transition ${
              activeView === 'customer'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Smartphone size={15} />
            <span className="hidden md:inline">1. Customer Mobile View</span>
            <span className="bg-black/30 text-[10px] px-1.5 py-0.5 rounded-md font-mono">
              #{String(selectedTable).padStart(2, '0')}
            </span>
          </button>

          {/* View 2: Staff POS */}
          <button
            onClick={() => setActiveView('staff')}
            aria-label="Open staff POS"
            className={`relative flex min-h-10 items-center space-x-1.5 rounded-lg px-3 py-2 font-semibold transition ${
              activeView === 'staff'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={15} />
            <span className="hidden md:inline">2. Staff / Waiter POS</span>

            {/* Badges */}
            <div className="flex items-center space-x-1 ml-1">
              {unresolvedCallsCount > 0 && (
                <span
                  title="Active Waiter Calls"
                  className="flex items-center space-x-0.5 bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse"
                >
                  <Bell size={10} />
                  <span>{unresolvedCallsCount}</span>
                </span>
              )}
              {pendingApprovalsCount > 0 && (
                <span
                  title="Orders Pending Approval"
                  className="flex items-center space-x-0.5 bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold"
                >
                  <Clock size={10} />
                  <span>{pendingApprovalsCount}</span>
                </span>
              )}
              {readyOrdersCount > 0 && (
                <span
                  title="Orders Ready to Serve"
                  className="flex items-center space-x-0.5 bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold"
                >
                  <CheckCircle2 size={10} />
                  <span>{readyOrdersCount}</span>
                </span>
              )}
              {cashDueCount > 0 && (
                <span
                  title="Cash Collection Due"
                  className="flex items-center space-x-0.5 bg-purple-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold"
                >
                  <Banknote size={10} />
                  <span>{cashDueCount}</span>
                </span>
              )}
            </div>
          </button>

          {/* View 3: Kitchen Display System */}
          <button
            onClick={() => setActiveView('kitchen')}
            aria-label="Open kitchen display"
            className={`flex min-h-10 items-center space-x-1.5 rounded-lg px-3 py-2 font-semibold transition ${
              activeView === 'kitchen'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ChefHat size={15} />
            <span className="hidden md:inline">3. Kitchen Display (KDS)</span>
            {kitchenTicketsCount > 0 && (
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {kitchenTicketsCount}
              </span>
            )}
          </button>
        </div>

        {/* Controls: Table Dropdown & Simulator Tools */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Active Table Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700">
            <span className="hidden text-slate-400 font-medium md:inline">Table:</span>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(Number(e.target.value))}
              className="bg-slate-900 text-sky-400 font-bold rounded-lg px-2 py-0.5 border border-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {tables.map((t) => (
                <option key={t.tableNumber} value={t.tableNumber}>
                  Table #{String(t.tableNumber).padStart(2, '0')} ({t.status.replace('_', ' ').toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Standee QR Preview Modal Trigger */}
          <button
            onClick={() => toggleStandeeModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium border border-slate-700 transition"
            title="Preview and print physical QR Standee for tables"
          >
            <QrCode size={14} className="text-sky-400" />
            <span className="hidden sm:inline">Standee QR</span>
          </button>

          {/* Fast-Forward +2 Mins */}
          <button
            onClick={fastForwardTwoMinutes}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl font-medium transition active:scale-95"
            title="Advances kitchen timer by 2 minutes and awards +10 loyalty points"
          >
            <FastForward size={14} />
            <span className="hidden sm:inline">+2 Mins</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={resetDemoData}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 rounded-xl font-medium transition"
            title="Reset to default clean state (Table #02 preparing, Table #04 clean)"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Audio Synthesizer Mute Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'night' ? 'day' : 'night'} view`}
            aria-pressed={theme === 'day'}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-amber-400 transition hover:bg-slate-700 focus-ring"
            title={`Switch to ${theme === 'night' ? 'day' : 'night'} view`}
          >
            {theme === 'night' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Audio Synthesizer Mute Toggle */}
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            className={`p-1.5 rounded-xl border transition ${
              isMuted
                ? 'bg-rose-950/60 border-rose-800 text-rose-400'
                : 'bg-slate-800 border-slate-700 text-emerald-400 hover:text-white'
            }`}
            title={isMuted ? 'Unmute Audio Synthesizer' : 'Mute Audio Synthesizer'}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
};
