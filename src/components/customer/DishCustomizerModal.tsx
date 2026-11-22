import React, { useState } from 'react';
import { X, Plus, Minus, Flame, UtensilsCrossed } from 'lucide-react';
import { MenuItem, PortionSize, SpiceLevel } from '../../types';
import { formatINR } from '../../utils/calculations';

interface DishCustomizerModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    portion: PortionSize,
    spice: SpiceLevel,
    instructions: string,
    quantity: number
  ) => void;
}

export const DishCustomizerModal: React.FC<DishCustomizerModalProps> = ({
  item,
  onClose,
  onAddToCart,
}) => {
  if (!item) return null;

  const portionOptions: PortionSize[] = item.portionPrices
    ? (Object.keys(item.portionPrices) as PortionSize[])
    : ['Regular'];

  const [selectedPortion, setSelectedPortion] = useState<PortionSize>(portionOptions[0]);
  const [selectedSpice, setSelectedSpice] = useState<SpiceLevel>('Medium 🌶️');
  const [instructions, setInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  const unitPrice = item.portionPrices?.[selectedPortion] || item.price;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    onAddToCart(item, selectedPortion, selectedSpice, instructions, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in no-print">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl shadow-2xl text-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative h-40 w-full overflow-hidden shrink-0 bg-slate-950">
          <img
            src={item.image}
            alt={item.name}
            className={`w-full h-full object-cover ${
              item.imagePosition === 'top'
                ? 'object-top'
                : item.imagePosition === 'bottom'
                  ? 'object-bottom'
                  : 'object-center'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-slate-300 hover:text-white backdrop-blur transition"
          >
            <X size={18} />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-xl font-bold text-white leading-tight">{item.name}</h3>
            <p className="text-xs text-sky-300 mt-0.5">{item.category} • {item.prepTimeMinutes} mins prep</p>
          </div>
        </div>

        {/* Scrollable Customization Body */}
        <div className="p-4 overflow-y-auto space-y-5 flex-1">
          {/* Portion Size Selection */}
          {portionOptions.length > 1 && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Select Portion Size
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {portionOptions.map((portion) => {
                  const price = item.portionPrices?.[portion] || item.price;
                  const isSelected = selectedPortion === portion;
                  return (
                    <button
                      key={portion}
                      type="button"
                      onClick={() => setSelectedPortion(portion)}
                      className={`p-3 rounded-xl border text-left flex justify-between items-center transition ${
                        isSelected
                          ? 'border-sky-500 bg-sky-500/10 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-semibold text-sm">{portion}</span>
                      <span className="text-xs font-bold text-sky-400">{formatINR(price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Spice Level Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center space-x-1">
              <Flame size={14} className="text-amber-400" />
              <span>Spice Customization</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Mild 🌿', 'Medium 🌶️', 'Extra Spicy 🔥'] as SpiceLevel[]).map((spice) => {
                const isSelected = selectedSpice === spice;
                return (
                  <button
                    key={spice}
                    type="button"
                    onClick={() => setSelectedSpice(spice)}
                    className={`py-2 px-1.5 rounded-xl border text-xs font-semibold text-center transition ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300 shadow-sm'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {spice}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Cooking Instructions */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center space-x-1">
              <UtensilsCrossed size={14} className="text-sky-400" />
              <span>Special Chef Note (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Less oil, extra green chili, crispy bread..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              maxLength={80}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-sm font-semibold text-slate-300">Quantity</span>
            <div className="flex items-center space-x-3 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-1 rounded text-slate-400 hover:text-white transition disabled:opacity-30"
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <span className="w-6 text-center font-bold text-white text-base">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                className="p-1 rounded text-slate-400 hover:text-white transition"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0">
          <button
            onClick={handleAdd}
            className="w-full py-3 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold rounded-xl transition shadow-lg shadow-sky-600/30 flex items-center justify-between px-5 text-sm active:scale-98"
          >
            <span>Add to Order</span>
            <span className="text-base font-black">{formatINR(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
