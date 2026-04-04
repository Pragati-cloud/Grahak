import React from 'react';
import { motion } from 'motion/react';
import { Trash2, CreditCard, Plus, Minus } from 'lucide-react';
import SpicinessIndicator from '../SpicinessIndicator';

const CheckoutSummary = ({ cart, onAdd, onSubtract, onRemove, onClear, onNext, total, coins, applyCoins, setApplyCoins, discountAmount, finalTotal }) => {
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
            <div className="flex items-center gap-2 bg-surface-container-low rounded-full px-2 py-1">
              <button onClick={() => onSubtract(item)} className="p-1 hover:bg-surface-container rounded-full text-on-surface/60 transition-colors">
                <Minus size={14} />
              </button>
              <span className="font-bold text-sm min-w-[20px] text-center">{item.quantity || 1}</span>
              <button onClick={() => onAdd(item)} className="p-1 hover:bg-surface-container rounded-full text-on-surface/60 transition-colors">
                <Plus size={14} />
              </button>
            </div>
            <button onClick={() => onRemove(item)} className="text-error hover:bg-error/10 p-2 rounded-full transition-colors ml-2">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
      <div className="border border-accent/20 rounded-2xl p-4 mb-4 bg-white shadow-sm flex justify-between items-center">
        <div>
          <p className="font-bold text-sm text-gray-800">Your Coins</p>
          <p className="text-xs text-gray-500">🪙 {coins} coins available (₹{Math.floor(coins/100)} off)</p>
        </div>
        {coins >= 100 && (
          <button 
            onClick={() => setApplyCoins(!applyCoins)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${applyCoins ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {applyCoins ? 'Applied' : 'Redeem'}
          </button>
        )}
      </div>

      <div className="border-t border-accent/20 pt-4 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 mb-8">
        <div className="text-center sm:text-left w-full sm:w-auto">
          <div className="flex justify-between sm:block opacity-60 text-xs font-bold mb-1">
            <span>Subtotal:</span>
            <span className="sm:inline hidden ml-2">₹{total.toFixed(2)}</span>
            <span className="sm:hidden">₹{total.toFixed(2)}</span>
          </div>
          {applyCoins && discountAmount > 0 && (
            <div className="flex justify-between sm:block text-green-600 text-xs font-bold mb-1">
              <span>Coin Discount:</span>
              <span className="sm:inline hidden ml-2">- ₹{discountAmount.toFixed(2)}</span>
              <span className="sm:hidden">- ₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <p className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-on-surface/40 mb-1 mt-2">Total Order Value</p>
          <p className="text-3xl sm:text-4xl font-headline font-black text-accent">₹{finalTotal.toFixed(2)}</p>
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
