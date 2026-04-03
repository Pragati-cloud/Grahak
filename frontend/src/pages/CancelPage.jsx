import React from 'react';
import { motion } from 'motion/react';
import { XCircle, ArrowLeft } from 'lucide-react';

const CancelPage = ({ error, onRetry }) => {
  return (
    <motion.div 
      key="failure" 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="text-center py-20 px-8 max-w-4xl mx-auto mandala-bg min-h-screen flex flex-col items-center justify-center"
    >
      <XCircle size={64} className="text-error mb-6" />
      <h2 className="text-3xl sm:text-6xl font-headline font-black tracking-tighter mb-2 text-error">Payment Cancelled</h2>
      <p className="text-base sm:text-xl text-on-surface/60 mb-6">{error || "Something went wrong with your transaction."}</p>
      
      <div className="flex flex-col gap-4 items-center">
        <button onClick={onRetry} className="bg-secondary text-white px-8 py-4 rounded-full font-bold hover:bg-accent transition-colors shadow-lg flex items-center gap-2 text-sm sm:text-base">
          <ArrowLeft size={18} /> Try Again
        </button>
      </div>
    </motion.div>
  );
};

export default CancelPage;
