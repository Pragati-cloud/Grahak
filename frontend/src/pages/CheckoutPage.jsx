import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import CheckoutSummary from '../components/checkout/CheckoutSummary';
import PaymentMethod from '../components/checkout/PaymentMethod';
import SuccessPage from '../pages/SuccessPage';
import CancelPage from '../pages/CancelPage';

const CheckoutPage = ({ cart, onRemove, onClear, onComplete }) => {
  const [step, setStep] = useState('summary'); // summary, method, success, failure
  const [paymentMethod, setPaymentMethod] = useState('online'); // online, cash
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  
  const total = useMemo(() => cart.reduce((acc, item) => acc + item.price, 0), [cart]);

  const handleRazorpayPayment = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, currency: 'INR' }),
      });
      const order = await response.json();

      if (!order.id) {
        setError('Failed to create order. Please try again.');
        setStep('failure');
        return;
      }

      const options = {
        key: 'rzp_test_SY6G9EpmYtpkRJ', 
        amount: order.amount,
        currency: order.currency,
        name: 'Spice Haven',
        description: 'Authentic Indian Cuisine',
        image: 'https://picsum.photos/seed/spice/200',
        order_id: order.id,
        handler: async function (response) {
          const verifyRes = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: total,
              currency: 'INR',
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.status === 'success') {
            setToken(verifyData.token);
            setStep('success');
          } else {
            setError('Payment verification failed. Please contact support.');
            setStep('failure');
          }
        },
        prefill: {
          name: 'Arjun Kapoor',
          email: 'arjun@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#B71C1C',
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        setError(response.error.description);
        setStep('failure');
      });
      rzp1.open();
    } catch (error) {
      console.error('Razorpay Error:', error);
      setError('An error occurred while processing payment.');
      setStep('failure');
    }
  };

  const handleProcessOrder = async (e) => {
    if (e) e.preventDefault();
    if (paymentMethod === 'online') {
      handleRazorpayPayment();
      return;
    }
    
    try {
      const response = await fetch('/api/orders/cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, currency: 'INR' }),
      });
      const data = await response.json();
      console.log('Cash Order Response:', data);
      
      if (data.status === 'success') {
        console.log('Setting token:', data.token);
        setToken(data.token);
        setStep('success');
      } else {
        setError(data.message || 'Failed to process cash order. Please try again.');
        setStep('failure');
      }
    } catch (error) {
      console.error('Cash Order Error:', error);
      setError('An error occurred while processing your order.');
      setStep('failure');
    }
  };

  if (cart.length === 0 && step !== 'success') {
    return (
      <div className="pt-40 text-center px-8 mandala-bg min-h-[60vh]">
        <ShoppingBag size={64} className="mx-auto text-accent/20 mb-6" />
        <h2 className="text-3xl font-headline font-bold mb-4">Your cart is empty</h2>
        <p className="text-on-surface/60 mb-8">Begin your spicy journey by adding items from our menu.</p>
        <button onClick={() => onComplete()} className="bg-secondary text-white px-8 py-4 rounded-full font-bold">Back to Menu</button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-20 px-8 max-w-4xl mx-auto pb-20 mandala-bg">
      <AnimatePresence mode="wait">
        {step === 'summary' && (
          <CheckoutSummary 
            cart={cart} 
            onRemove={onRemove} 
            onClear={onClear} 
            onNext={() => setStep('method')} 
            total={total} 
          />
        )}

        {step === 'method' && (
          <PaymentMethod 
            paymentMethod={paymentMethod} 
            setPaymentMethod={setPaymentMethod} 
            onBack={() => setStep('summary')} 
            onProcess={handleProcessOrder} 
          />
        )}

        {step === 'success' && (
          <SuccessPage 
            token={token} 
            paymentMethod={paymentMethod} 
            cart={cart}
            onReturn={() => { onClear(); onComplete(); }} 
          />
        )}

        {step === 'failure' && (
          <CancelPage 
            error={error} 
            onRetry={() => setStep('method')} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CheckoutPage;
