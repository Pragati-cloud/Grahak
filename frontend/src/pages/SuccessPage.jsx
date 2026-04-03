import React, { useReducer, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Home, Camera } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';

const initialState = {
  scannedCode: null,
  username: "Guest User", 
  deviceId: navigator.userAgent.substring(0, 30),
  items: [],
  total: 0,
  paymentMethod: "unknown",
  status: "pending"
};

function payloadReducer(state, action) {
  switch (action.type) {
    case 'INIT_DATA':
      return {
        ...state,
        items: action.payload.cart,
        paymentMethod: action.payload.paymentMethod,
        total: action.payload.cart.reduce((a, b) => a + b.price, 0)
      };
    case 'SCAN_SUCCESS':
      return {
        ...state,
        scannedCode: action.payload.code,
        status: "scanned_ready_to_sync"
      };
    default:
      return state;
  }
}

const SuccessPage = ({ token, paymentMethod, cart, onReturn }) => {
  const [state, dispatch] = useReducer(payloadReducer, initialState);
  const [scanComplete, setScanComplete] = useState(false);

  React.useEffect(() => {
    dispatch({ type: 'INIT_DATA', payload: { cart, paymentMethod } });
  }, [cart, paymentMethod]);

  const handleScan = (result) => {
    if (result && result.length > 0 && !scanComplete) {
      const scannedCode = result[0].rawValue;
      dispatch({ type: 'SCAN_SUCCESS', payload: { code: scannedCode } });
      setScanComplete(true);
      
      // MOCK SPACETIMEDB SUBMISSION
      console.log("---- SPACETIMEDB PAYLOAD READY ----");
      console.log(JSON.stringify({
        ...state,
        scannedCode: scannedCode,
        status: "scanned_ready_to_sync",
        items: cart,
        paymentMethod
      }, null, 2));
      console.log("-----------------------------------");

      // Auto-return to menu after successful scan
      setTimeout(() => {
        onReturn();
      }, 2500);
    }
  };

  return (
    <motion.div 
      key="success" 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="text-center max-w-4xl mx-auto mandala-bg flex flex-col items-center justify-center py-12"
    >
     
      <h2 className="text-2xl sm:text-4xl font-headline font-black tracking-tighter mb-2 text-accent">Order will be placed once this QR code is scanned.</h2>
      <p className="text-base text-on-surface/60 mb-1">Your spicy feast is being prepared with love.</p>
      
      <div className="flex gap-6 items-center justify-center mb-8 mt-6 w-full max-w-md">
        <div className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-secondary/20 flex flex-col items-center w-full overflow-hidden relative">
          
          {!scanComplete ? (
            <>
              <p className="text-sm font-bold text-secondary uppercase tracking-widest text-center mb-4">
                Verify Pickup<br/><span className="text-xs text-on-surface/50">Point exactly at the Order Window QR</span>
              </p>
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-black relative shadow-inner">
                <Scanner 
                   onScan={handleScan}
                   components={{ tracker: true }}
                />
              </div>
              <p className="text-[10px] uppercase font-bold text-on-surface/40 flex items-center gap-1 mt-4">
                <Camera size={12} /> Live Scanner Active
              </p>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center">
               <div className="w-20 h-20 bg-green-100 rounded-full flex justify-center items-center mb-4">
                 <CheckCircle2 size={40} className="text-green-600" />
               </div>
               <p className="text-lg font-bold text-green-700 uppercase tracking-widest text-center">
                 Verified!
               </p>
               <p className="text-xs text-on-surface/50 mt-2 text-center">
                 Code: <span className="font-mono">{state.scannedCode}</span><br/>
                 Payload dispatched to SpacetimeDB securely.
               </p>
            </div>
          )}

        </div>
      </div>
      
      <div className="block mt-4">
        <button onClick={onReturn} className="bg-secondary text-white px-8 py-4 rounded-full font-bold hover:bg-accent transition-colors shadow-lg flex items-center gap-2 text-sm sm:text-base">
          <Home size={18} /> Return to Menu
        </button>
      </div>
    </motion.div>
  );
};

export default SuccessPage;
