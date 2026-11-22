import React from 'react';
import { Clock, Plus, Flame } from 'lucide-react';
import { MenuItem } from '../../types';
import { formatINR } from '../../utils/calculations';

interface DishCardProps {
  item: MenuItem;
  onOpenCustomizer: (item: MenuItem) => void;
}

export const DishCard: React.FC<DishCardProps> = ({ item, onOpenCustomizer }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition flex flex-col justify-between group shadow-lg">
      <div className="relative h-44 w-full overflow-hidden bg-slate-950">
        <img
          src={item.image}
          alt={item.name}
          className={`w-full h-full object-cover ${
            item.imagePosition === 'top'
              ? 'object-top'
              : item.imagePosition === 'bottom'
                ? 'object-bottom'
                : 'object-center'
          } group-hover:scale-105 transition duration-500`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/20" />

        {/* Veg / Non-Veg Indicator */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700 shadow-md">
          <div
            className={`w-3.5 h-3.5 border-2 rounded-sm flex items-center justify-center ${
              item.isVeg ? 'border-emerald-500' : 'border-rose-500'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </div>
        </div>

        {/* Popular / Prep Time Badges */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5">
          {item.isPopular && (
            <span className="flex items-center space-x-1 bg-amber-500/90 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
              <Flame size={12} />
              <span>POPULAR</span>
            </span>
          )}
          <span className="flex items-center space-x-1 bg-slate-900/80 backdrop-blur text-slate-200 text-[11px] font-medium px-2 py-0.5 rounded-full border border-slate-700 shadow">
            <Clock size={11} className="text-sky-400" />
            <span>{item.prepTimeMinutes}m</span>
          </span>
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-2 left-3">
          <span className="text-xs text-slate-400">from </span>
          <span className="text-lg font-black text-white tracking-tight">
            {formatINR(item.price)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition leading-snug">
            {item.name}
          </h3>
          <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
          {item.imageAttribution && (
            <p className="mt-2 text-[10px] text-slate-500">
              Photo:{' '}
              <a
                href={item.imageAttribution.url}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-slate-600 underline-offset-2 hover:text-sky-400"
              >
                {item.imageAttribution.creator}
              </a>
              {' · '}
              <a
                href={item.imageAttribution.licenseUrl}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-slate-600 underline-offset-2 hover:text-sky-400"
              >
                {item.imageAttribution.license}
              </a>
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-medium">
            Customizable (Portion & Spice)
          </div>

          <button
            onClick={() => onOpenCustomizer(item)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-sky-600/90 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-sky-600/20 active:scale-95"
          >
            <Plus size={15} />
            <span>ADD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
