import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Home, Loader2 } from 'lucide-react'; 

const SuccessPage = ({ token, paymentMethod, cart, apiUrl, shopId, deviceId, finalTotal, onOrderComplete, coinsRedeemed, onReturn }) => {
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState(null);
  const dispatchAttempted = useRef(false);

  useEffect(() => {
    // Prevent duplicate dispatch by using a ref running in React StrictMode
    if (dispatchAttempted.current) return;
    dispatchAttempted.current = true;

    const dispatchToDB = async () => {
      try {
        // Extract Shop ID and Token dynamically from URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlShopId = urlParams.get('shopId') || shopId; // fallback to props if not in URL
        const encryptedToken = urlParams.get('token') || "missing_token";

        // Map cart to the new requested schema format
        const formattedProducts = cart.map(item => ({
             product_id: item._id || item.id,
             quantity: item.quantity || 1
        }));
        
        // Grab username or fallback
        let userName = "Guest";
        try {
          const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
          if (userData.name) userName = userData.name;
          else if (userData.phone) userName = userData.phone;
        } catch (e) {}

        const paymentAmount = finalTotal;

        // Build the precise payload
        const payload = {
          shopId: urlShopId,
          encryptedToken: encryptedToken,
          user: { name: userName },
          payment: { type: paymentMethod, amount: paymentAmount },
          products: formattedProducts
        };

        console.log("🚀 Placing order with mapped schema:", JSON.stringify(payload, null, 2));

        const response = await fetch(`${apiUrl}/api/place-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (data.order_id) {
          console.log('🚀 Order successfully placed via Live API:', data);
          setOrderId(data.order_id);
          
          // Loyalty: 5% back in coins (1 Rs = 5 coins. 100 coins = 1 Rs discount, so 5% value)
          const coinsEarned = Math.floor(finalTotal * 5);
          if (onOrderComplete) onOrderComplete(coinsEarned, coinsRedeemed || 0);
          
          // Auto-return to home after 10 seconds following a successful order
          setTimeout(() => {
            onReturn();
          }, 10000);
        } else {
          console.error('Failed to place order:', data);
          setError("Failed to generate order ID");
        }
      } catch (e) {
        console.error('Order Submission Error:', e);
        setError("Network error placing order");
      }
    };

    dispatchToDB();
  }, [apiUrl, cart, deviceId, paymentMethod, token, onReturn]);

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center max-w-4xl mx-auto mandala-bg flex flex-col items-center justify-center py-12"
    >
      <h2 className="text-2xl sm:text-4xl font-headline font-black tracking-tighter mb-2 text-accent">
        {orderId ? "Order Placed Successfully!" : "Finalizing your order..."}
      </h2>
      <p className="text-base text-on-surface/60 mb-1">
        {orderId ? "Your spicy feast is being prepared with love." : "Please do not close this page."}
      </p>

      <div className="flex gap-6 items-center justify-center mb-8 mt-6 w-full max-w-md">
        <div className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-secondary/20 flex flex-col items-center w-full min-h-[300px] justify-center">
          
          {error ? (
             <div className="py-12 flex flex-col items-center text-red-600">
               <p className="font-bold text-xl mb-2">Error</p>
               <p className="text-sm">{error}</p>
             </div>
          ) : orderId ? (
            <motion.div 
               initial={{ scale: 0.5, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="py-12 flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex justify-center items-center mb-4 shadow-inner">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <p className="text-lg font-bold text-green-700 uppercase tracking-widest text-center">
                Order Placed!
              </p>
              <p className="text-xs text-on-surface/50 mt-2 text-center">
                Order ID: <span className="font-mono text-black font-bold">{orderId}</span>
              </p>
            </motion.div>
          ) : (
            <div className="py-12 flex flex-col items-center">
              <Loader2 size={48} className="text-accent animate-spin mb-4" />
              <p className="text-sm font-bold text-on-surface/60 uppercase tracking-widest mt-2">
                Sending to Kitchen...
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
