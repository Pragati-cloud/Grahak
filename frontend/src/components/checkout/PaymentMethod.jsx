import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CreditCard, Utensils } from 'lucide-react';

const PaymentMethod = ({ paymentMethod, setPaymentMethod, onBack, onProcess }) => {
  return (
    <motion.div 
      key="method" 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
    >
      <button onClick={onBack} className="flex items-center gap-2 text-on-surface/60 hover:text-secondary mb-4 transition-colors text-sm">
        <ArrowLeft size={16} /> Back to Summary
      </button>
      <h2 className="text-2xl sm:text-4xl font-headline font-extrabold tracking-tighter mb-6">Choose Payment Method</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button 
          onClick={() => setPaymentMethod('online')}
          className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-3 ${paymentMethod === 'online' ? 'border-secondary bg-secondary/5' : 'border-outline-variant/20 hover:border-secondary/40'}`}
        >
          <CreditCard size={24} className={paymentMethod === 'online' ? 'text-secondary' : 'text-on-surface/40'} />
          <div>
            <h4 className="text-lg font-headline font-bold">Online Payment</h4>
            <p className="text-xs text-on-surface/60">Pay securely using your credit or debit card.</p>
          </div>
        </button>
        <button 
          onClick={() => setPaymentMethod('cash')}
          className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-3 ${paymentMethod === 'cash' ? 'border-secondary bg-secondary/5' : 'border-outline-variant/20 hover:border-secondary/40'}`}
        >
          <Utensils size={24} className={paymentMethod === 'cash' ? 'text-secondary' : 'text-on-surface/40'} />
          <div>
            <h4 className="text-lg font-headline font-bold">Cash on Delivery</h4>
            <p className="text-xs text-on-surface/60">Pay in cash when your delicious meal arrives.</p>
          </div>
        </button>
      </div>
      <button 
        onClick={onProcess}
        className="w-full bg-secondary text-white font-headline font-bold py-4 rounded-xl hover:bg-accent transition-all shadow-lg text-lg active:scale-95"
      >
        {paymentMethod === 'online' ? 'Pay with Razorpay (UPI/Card)' : 'Place Order (Cash on Delivery)'}
      </button>
    </motion.div>
  );
};

export default PaymentMethod;
