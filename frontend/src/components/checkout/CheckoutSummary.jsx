import React from 'react';
import { motion } from 'motion/react';
import { Trash2, CreditCard } from 'lucide-react';
import SpicinessIndicator from '../SpicinessIndicator';

const CheckoutSummary = ({ cart, onRemove, onClear, onNext, total }) => {
  return (
    <motion.div 
      key="summary" 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 20 }}
    >
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl sm:text-4xl font-headline font-extrabold tracking-tighter">Your Order</h2>
        <button onClick={onClear} className="text-accent hover:underline font-bold text-sm flex items-center gap-2">
          <Trash2 size={16} /> Clear All
        </button>
      </div>
      <div className="space-y-4 mb-8">
        {cart.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-xl editorial-shadow">
            <img src={item.image || 'https://picsum.photos/seed/food/200'} className="w-16 h-16 object-cover rounded-lg" />
            <div className="flex-1">
              <SpicinessIndicator level={item.spiciness} />
              <h4 className="font-headline font-bold text-sm sm:text-base">{item.title}</h4>
              <p className="text-sm text-accent font-bold">₹{item.price}</p>
            </div>
            <button onClick={() => onRemove(idx)} className="text-error hover:bg-error/10 p-2 rounded-full transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
      <div className="border-t border-accent/20 pt-4 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 mb-8">
        <div className="text-center sm:text-left">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-on-surface/40 mb-1">Total Order Value</p>
          <p className="text-3xl sm:text-4xl font-headline font-black text-accent">₹{total.toFixed(2)}</p>
        </div>
        <button 
          onClick={onNext} 
          className="w-full sm:w-auto bg-[#B71C1C] text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-headline font-bold hover:bg-red-900 transition-all flex flex-col items-center justify-center shadow-xl leading-tight text-center active:scale-95"
        >
          <span className="text-[10px] sm:text-xs uppercase tracking-wider mb-0.5 opacity-80">Select</span>
          <div className="flex items-center gap-2 text-sm sm:text-lg">
            <span>Payment</span>
            <CreditCard size={14} className="opacity-80" />
          </div>
          <span className="text-sm sm:text-lg">Method</span>
        </button>
      </div>
    </motion.div>
  );
};

export default CheckoutSummary;
