import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  CreditCard,
  Banknote,
  Copy,
  Check,
  Award,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order, PaymentMethod } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';
import { calculateBalanceDue, calculateOrderTotals, formatINR } from '../../utils/calculations';
import { generateQRCodeDataUrl, buildUpiPaymentString } from '../../utils/qrGenerator';

interface PaymentModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (orderId: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onPaymentComplete,
}) => {
  const { processPayment, tables } = useRestaurant();
  const currentTable = tables.find((t) => t.tableNumber === order.tableNumber);
  const availableLoyalty = currentTable?.totalLoyaltyPoints || order.loyaltyEarned || 0;

  const [paymentTab, setPaymentTab] = useState<PaymentMethod>('upi');
  const [selectedTip, setSelectedTip] = useState<number>(50);
  const [customTip, setCustomTip] = useState<string>('');
  const [redeemPoints, setRedeemPoints] = useState<boolean>(false);
  const [upiQrUrl, setUpiQrUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cardError, setCardError] = useState<string>('');

  // Card form state
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('412');
  const [cardName, setCardName] = useState('Patna Guest');

  const activeTip = customTip ? Number(customTip) || 0 : selectedTip;
  const pointsToUse = redeemPoints ? availableLoyalty : 0;
  const totals = calculateOrderTotals(order.subtotal, pointsToUse, availableLoyalty, activeTip);
  const depositPaid = Math.max(order.bookingDeposit || 0, 0);
  const depositCredit = Math.min(depositPaid, totals.grandTotal);
  const depositRefund = Math.max(depositPaid - depositCredit, 0);
  const amountDue = calculateBalanceDue(totals.grandTotal, order.bookingDeposit);

  // Generate UPI QR
  useEffect(() => {
    if (!isOpen) return;
    const upiString = buildUpiPaymentString(amountDue, order.tableNumber, order.id);
    generateQRCodeDataUrl(upiString, { width: 280 }).then(setUpiQrUrl);
  }, [isOpen, amountDue, order.tableNumber, order.id]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('bluesky@icici');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleExecutePayment = (method: PaymentMethod) => {
    if (method === 'card') {
      const digits = cardNumber.replace(/\D/g, '');
      if (digits.length !== 16 || !cardExpiry.trim() || !cardCvv.trim() || !cardName.trim()) {
        setCardError('Enter a 16-digit card number, expiry, CVV, and cardholder name.');
        return;
      }
      setCardError('');
    }

    setIsProcessing(true);
    setTimeout(() => {
      processPayment(order.id, method, activeTip, totals.redeemedPoints);
      setIsProcessing(false);

      if (method === 'cash') {
        // Cash: close the payment modal and show a confirmation toast.
        // The receipt opens only after staff confirms cash collection.
        onClose();
      } else {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        onPaymentComplete(order.id);
        onClose();
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in no-print">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl shadow-2xl text-slate-100 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-white text-base">Settlement & Bill Payment</h3>
            <p className="text-xs text-sky-300">
              {order.id} • Table #{String(order.tableNumber).padStart(2, '0')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Bill & Payment Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Itemized Calculation Summary */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Item Subtotal ({order.items.length} items)</span>
              <span className="font-semibold text-white">{formatINR(totals.subtotal)}</span>
            </div>

            {/* Loyalty Discount Toggle */}
            {availableLoyalty > 0 && (
              <div className="flex items-center justify-between p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Award size={16} className="text-amber-400" />
                  <div>
                    <p className="font-bold text-amber-300">Redeem Loyalty Points</p>
                    <p className="text-[10px] text-slate-400">
                      Use {availableLoyalty} pts for {formatINR(availableLoyalty * 0.5)} off
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRedeemPoints(!redeemPoints)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                    redeemPoints ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>
            )}

            {redeemPoints && totals.discount > 0 && (
              <div className="flex justify-between text-amber-400 font-semibold">
                <span>Loyalty Reward Discount</span>
                <span>-{formatINR(totals.discount)}</span>
              </div>
            )}

            {depositCredit > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Table Booking Deposit Credited</span>
                <span>-{formatINR(depositCredit)}</span>
              </div>
            )}
            {depositRefund > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Unused Deposit Returned</span>
                <span>{formatINR(depositRefund)}</span>
              </div>
            )}

            {/* GST (5% = 2.5% CGST + 2.5% SGST) */}
            <div className="flex justify-between text-slate-400">
              <span>CGST (2.5%)</span>
              <span>₹{totals.cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>SGST (2.5%)</span>
              <span>₹{totals.sgst.toFixed(2)}</span>
            </div>

            {/* Tip Selector */}
            <div className="pt-2 border-t border-slate-800">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center space-x-1">
                <Sparkles size={12} className="text-amber-400" />
                <span>Tip for Table Service</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 20, 50, 100].map((tipVal) => {
                  const isSelected = !customTip && selectedTip === tipVal;
                  return (
                    <button
                      key={tipVal}
                      type="button"
                      onClick={() => {
                        setSelectedTip(tipVal);
                        setCustomTip('');
                      }}
                      className={`py-1.5 rounded-xl border text-xs font-semibold text-center transition ${
                        isSelected
                          ? 'border-sky-500 bg-sky-500/10 text-white'
                          : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {tipVal === 0 ? 'No Tip' : `₹${tipVal}`}
                    </button>
                  );
                })}
              </div>
              <label className="mt-2 block">
                <span className="sr-only">Custom tip amount</span>
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="1"
                  placeholder="Custom tip amount"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                />
              </label>
            </div>

            {/* Grand Total */}
            <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-sm font-black">
              <span className="text-white">Balance Due</span>
              <span className="text-sky-400 text-lg">{formatINR(amountDue)}</span>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentTab('upi')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center space-y-1 transition ${
                  paymentTab === 'upi'
                    ? 'border-sky-500 bg-sky-500/10 text-white shadow-md'
                    : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <QrCode size={20} className={paymentTab === 'upi' ? 'text-sky-400' : ''} />
                <span className="text-xs font-bold">UPI QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentTab('card')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center space-y-1 transition ${
                  paymentTab === 'card'
                    ? 'border-sky-500 bg-sky-500/10 text-white shadow-md'
                    : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <CreditCard size={20} className={paymentTab === 'card' ? 'text-sky-400' : ''} />
                <span className="text-xs font-bold">Credit/Debit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentTab('cash')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center space-y-1 transition ${
                  paymentTab === 'cash'
                    ? 'border-purple-500 bg-purple-500/10 text-white shadow-md'
                    : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Banknote size={20} className={paymentTab === 'cash' ? 'text-purple-400' : ''} />
                <span className="text-xs font-bold">Pay Cash</span>
              </button>
            </div>
          </div>

          {/* Payment Method Panel 1: UPI */}
          {paymentTab === 'upi' && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center space-y-3">
              <div className="bg-white p-3 rounded-2xl inline-block shadow-md">
                {upiQrUrl ? (
                  <img src={upiQrUrl} alt="UPI QR" className="w-40 h-40 mx-auto object-contain" />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-slate-400 text-xs">
                    Generating UPI QR...
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center space-x-2 text-xs">
                <span className="text-slate-400">UPI ID:</span>
                <span className="font-mono text-white font-bold">bluesky@icici</span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                Scan with Google Pay, PhonePe, Paytm, or BHIM UPI app
              </p>

              <button
                type="button"
                onClick={() => handleExecutePayment('upi')}
                disabled={isProcessing}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-600/25 active:scale-98"
              >
                {isProcessing ? 'Verifying UPI...' : 'Simulate UPI Payment Success'}
              </button>
            </div>
          )}

          {/* Payment Method Panel 2: Card */}
          {paymentTab === 'card' && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expires</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CVV</label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cardholder Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              {cardError && (
                <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                  {cardError}
                </p>
              )}

              <div className="flex items-center text-[10px] text-slate-400 space-x-1">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>256-Bit SSL Encrypted Card Simulation</span>
              </div>

              <button
                type="button"
                onClick={() => handleExecutePayment('card')}
                disabled={isProcessing}
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-sky-600/25 active:scale-98"
              >
                {isProcessing ? 'Processing Card...' : `Pay ${formatINR(amountDue)} via Card`}
              </button>
            </div>
          )}

          {/* Payment Method Panel 3: Cash */}
          {paymentTab === 'cash' && (
            <div className="bg-slate-950/80 border border-purple-500/30 rounded-2xl p-4 text-center space-y-3">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-full inline-block">
                <Banknote size={32} />
              </div>
              <h4 className="text-sm font-bold text-white">Cash Payment at Table</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                A server will come to Table #{String(order.tableNumber).padStart(2, '0')} to collect{' '}
                <span className="text-white font-bold">{formatINR(amountDue)}</span> in cash and provide change.
              </p>

              <button
                type="button"
                onClick={() => handleExecutePayment('cash')}
                disabled={isProcessing}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-purple-600/25 active:scale-98"
              >
                {isProcessing ? 'Notifying Staff...' : `Confirm Cash Payment (${formatINR(amountDue)})`}
              </button>
              <p className="text-[10px] text-slate-500 mt-1">
                Your receipt will be generated after the server collects cash.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
