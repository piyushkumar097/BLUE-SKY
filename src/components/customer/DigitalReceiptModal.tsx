import React, { useState } from 'react';
import {
  X,
  Printer,
  Mail,
  Check,
  Star,
  Sparkles,
  Download,
} from 'lucide-react';
import { Order } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';
import { calculateBalanceDue, formatINR } from '../../utils/calculations';

interface DigitalReceiptModalProps {
  order: Order | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { addReview } = useRestaurant();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // Review states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!isOpen || !order) return null;

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4000);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    addReview({
      tableNumber: order.tableNumber,
      orderId: order.id,
      rating,
      comment: reviewComment || 'Wonderful dining experience at Blue Sky!',
      customerName: customerName || 'Table Guest',
    });
    setReviewSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl text-slate-100 my-8 flex flex-col overflow-hidden max-h-[95vh]">
        {/* Header (no-print) */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0 no-print">
          <div>
            <h3 className="font-bold text-white text-base">Digital Tax Invoice & Receipt</h3>
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

        {/* Scrollable Receipt Body */}
        <div className="p-4 overflow-y-auto space-y-5 flex-1">
          {/* Printable Invoice Card */}
          <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-lg font-sans relative border border-slate-200 print-break-inside-avoid">
            {/* Watermark */}
            {order.paymentStatus === 'paid' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                <div className="text-emerald-500/15 border-8 border-emerald-500/20 text-6xl font-black uppercase tracking-widest px-8 py-2 rotate-[-25deg] rounded-3xl">
                  PAID
                </div>
              </div>
            )}

            {/* Restaurant Info Header */}
            <div className="text-center pb-4 border-b border-slate-200">
              <h2 className="text-xl font-black tracking-tight text-slate-900">BLUE SKY</h2>
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Modern Indian Dining & Rooftop Lounge
              </p>
              <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                4th Floor, Skyview Plaza, Bailey Road, Patna, Bihar 800001
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                GSTIN: <span className="font-bold text-slate-700">10AABCB4821M1Z5</span> | FSSAI: 10424001000892
              </p>
            </div>

            {/* Invoice Meta */}
            <div className="py-3 border-b border-slate-200 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div>
                <p>
                  Invoice: <span className="font-mono font-bold text-slate-900">INV-{order.id.replace('ORD-', '')}</span>
                </p>
                <p>
                  Table: <span className="font-bold text-slate-900">#{String(order.tableNumber).padStart(2, '0')}</span>
                </p>
              </div>
              <div className="text-right">
                <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                <p>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="py-3 border-b border-slate-200 text-xs">
              <div className="grid grid-cols-12 font-bold text-slate-500 uppercase text-[10px] pb-1.5 border-b border-slate-100">
                <div className="col-span-6">Item</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-4 text-right">Amount</div>
              </div>

              <div className="divide-y divide-slate-100 mt-1">
                {order.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 py-1.5 text-slate-800">
                    <div className="col-span-6 pr-1">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {item.portion} • {item.spice}
                      </p>
                    </div>
                    <div className="col-span-2 text-center font-semibold">{item.quantity}</div>
                    <div className="col-span-4 text-right font-bold text-slate-900">
                      {formatINR(item.totalPrice)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="py-3 space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatINR(order.subtotal)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Loyalty Discount ({order.redeemedPoints} pts)</span>
                  <span>-{formatINR(order.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>CGST (2.5%)</span>
                <span>₹{order.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>SGST (2.5%)</span>
                <span>₹{order.sgst.toFixed(2)}</span>
              </div>

              {order.tip > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Service Tip</span>
                  <span>{formatINR(order.tip)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-slate-900">
                <span>Total Bill</span>
                <span>{formatINR(order.grandTotal)}</span>
              </div>

              {(order.bookingDeposit || 0) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Table Booking Deposit Paid</span>
                  <span>-{formatINR(Math.min(order.bookingDeposit || 0, order.grandTotal))}</span>
                </div>
              )}
              {(order.bookingDeposit || 0) > order.grandTotal && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Unused Deposit Returned</span>
                  <span>{formatINR((order.bookingDeposit || 0) - order.grandTotal)}</span>
                </div>
              )}

              <div className="pt-1 flex justify-between items-center text-sm font-black text-slate-900">
                <span>Balance Paid at Settlement</span>
                <span className="text-base font-black text-slate-950">
                  {formatINR(calculateBalanceDue(order.grandTotal, order.bookingDeposit))}
                </span>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>Payment Mode:</span>
                <span className="font-bold uppercase text-slate-800">
                  {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'CASH'}
                </span>
              </div>
            </div>

            {/* Bottom Thank You */}
            <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500 italic">
              Thank you for dining with Blue Sky! Have a wonderful evening in Patna.
            </div>
          </div>

          {/* Email Receipt Section (no-print) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 no-print">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Mail size={14} className="text-sky-400" />
              <span>Email e-Receipt</span>
            </h4>

            {emailSent ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
                <Check size={16} />
                <span>Invoice receipt successfully sent to your email!</span>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition"
                >
                  Send
                </button>
              </form>
            )}
          </div>

          {/* Customer Feedback & 1-5 Star Review (no-print) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 no-print">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Sparkles size={14} className="text-amber-400" />
              <span>Rate Your Rooftop Experience</span>
            </h4>

            {reviewSubmitted ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center space-x-2">
                <Check size={16} />
                <span>Thank you for your rating! Your review is now live on the staff feed.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-3">
                {/* 5-Star Rating Buttons */}
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition transform hover:scale-110"
                      >
                        <Star
                          size={24}
                          className={filled ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
                        />
                      </button>
                    );
                  })}
                  <span className="text-xs font-bold text-amber-300 ml-2">
                    {rating === 5 ? 'Exceptional 🌟' : rating >= 4 ? 'Great 👍' : 'Good 👌'}
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="Your Name (e.g. Rahul)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />

                <textarea
                  placeholder="Tell us what you loved about our rooftop lounge or food..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-amber-600/20"
                >
                  Post Review to Restaurant Feed
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Modal Actions (no-print) */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between no-print shrink-0">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            <Printer size={15} />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
