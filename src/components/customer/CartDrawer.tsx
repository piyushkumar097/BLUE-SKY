import React, { useState } from 'react';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, Clock, ChefHat } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatINR } from '../../utils/calculations';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPayment?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, updateCartItemQuantity, removeFromCart, placeOrder, selectedTable } = useRestaurant();
  const [customerNote, setCustomerNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, curr) => acc + curr.itemTotal, 0);
  const totalItemCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const estPrep = cart.length > 0 ? Math.max(...cart.map((c) => c.menuItem.prepTimeMinutes)) : 0;

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    setOrderError('');
    try {
      await placeOrder(selectedTable, customerNote);
      onClose();
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'Unable to place the order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in no-print">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl shadow-2xl text-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/30">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Your Order Cart</h3>
              <p className="text-xs text-sky-300">
                Table #{String(selectedTable).padStart(2, '0')} • {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShoppingBag size={40} className="mx-auto text-slate-600 mb-2" />
              <p className="font-medium text-sm">Your order cart is empty</p>
              <p className="text-xs text-slate-500 mt-1">Select items from our rooftop menu to begin</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.cartItemId}
                className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-3 flex flex-col space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <h4 className="font-bold text-white text-sm leading-tight">{item.menuItem.name}</h4>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md font-medium">
                        {item.selectedPortion}
                      </span>
                      <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded-md font-medium">
                        {item.selectedSpice}
                      </span>
                    </div>
                    {item.instructions && (
                      <p className="text-[11px] text-sky-300 mt-1 italic">
                        &quot;{item.instructions}&quot;
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-700/40">
                  <div className="flex items-center space-x-2 bg-slate-900 px-2 py-1 rounded-xl border border-slate-700">
                    <button
                      onClick={() => updateCartItemQuantity(item.cartItemId, -1)}
                      className="p-0.5 text-slate-400 hover:text-white transition"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-5 text-center font-bold text-xs text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItemQuantity(item.cartItemId, 1)}
                      className="p-0.5 text-slate-400 hover:text-white transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-black text-sm text-white">{formatINR(item.itemTotal)}</span>
                </div>
              </div>
            ))
          )}

          {cart.length > 0 && (
            <div className="pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center space-x-1">
                <ChefHat size={14} className="text-sky-400" />
                <span>Notes for Staff & Kitchen</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Serve starters first, bringing a guest..."
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                maxLength={90}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          )}
        </div>

        {/* Footer with Calculations and Place Order Button */}
        {cart.length > 0 && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0 space-y-3">
            {orderError && (
              <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                {orderError}
              </p>
            )}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <Clock size={13} className="text-sky-400" />
                <span>Estimated Preparation:</span>
              </span>
              <span className="font-semibold text-slate-200">~{estPrep} minutes</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300 font-medium">Subtotal</span>
              <span className="font-bold text-white text-base">{formatINR(subtotal)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-sky-600 via-sky-500 to-sky-600 hover:from-sky-500 hover:to-sky-400 text-white font-bold rounded-2xl transition shadow-lg shadow-sky-600/30 flex items-center justify-between px-5 text-sm active:scale-98 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Sending to Kitchen...' : `Place Order (Table #${String(selectedTable).padStart(2, '0')})`}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
