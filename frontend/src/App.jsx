import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { INITIAL_APPETIZERS, INITIAL_MAINS, INITIAL_SIDES, INITIAL_DRINKS } from './constants';
import Header from './components/Header';
import Toast from './components/Toast';
import HomePage from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';

// --- Main App ---

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch('/api/menus');
        const data = await res.json();
        
        if (data && data.length > 0) {
          setMenuItems(data);
          localStorage.setItem('spice_haven_menu', JSON.stringify(data));
        } else {
          // Fallback if DB is empty
          const saved = localStorage.getItem('spice_haven_menu');
          if (saved) {
            setMenuItems(JSON.parse(saved));
          } else {
            const fallbackMenu = [...INITIAL_APPETIZERS, ...INITIAL_MAINS, ...INITIAL_SIDES, ...INITIAL_DRINKS];
            setMenuItems(fallbackMenu);
          }
        }
      } catch (err) {
        console.error("Failed to fetch menu:", err);
        const saved = localStorage.getItem('spice_haven_menu');
        if (saved) {
          setMenuItems(JSON.parse(saved));
        } else {
          const fallbackMenu = [...INITIAL_APPETIZERS, ...INITIAL_MAINS, ...INITIAL_SIDES, ...INITIAL_DRINKS];
          setMenuItems(fallbackMenu);
        }
      }
    };
    fetchMenu();
  }, []);

  const handleAddToCart = (item) => {
    setCart([...cart, item]);
    setToast(`${item.title} added to your selection`);
  };

  const handleRemoveFromCart = (index) => {
    const item = cart[index];
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    setToast(`${item.title} removed`);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      <Header 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        cartCount={cart.length} 
        user={user}
        onLogout={() => {
          localStorage.removeItem('user_data');
          localStorage.removeItem('auth_token');
          setUser(null);
          setToast("Logged out successfully");
        }}
      />
      
      <main className="min-h-[80vh]">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <HomePage key="home" menuItems={menuItems} onAddToCart={handleAddToCart} />
          )}
          {currentPage === 'checkout' && (
            <CheckoutPage 
              key="checkout" 
              cart={cart} 
              onRemove={handleRemoveFromCart} 
              onClear={() => setCart([])}
              onComplete={() => setCurrentPage('home')}
            />
          )}
          {currentPage === 'auth' && (
            <AuthPage 
              key="auth" 
              onComplete={(userData) => {
                if (userData) {
                  setUser(userData);
                  setToast(`Welcome back, ${userData.name}!`);
                }
                setCurrentPage('home');
              }}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="w-full mt-20 border-t border-accent/15 bg-surface-container">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-8 md:px-12 py-16">
          <div>
            <h3 className="text-secondary font-bold text-xl mb-6 font-headline uppercase tracking-tighter">Spice Haven</h3>
            <p className="font-body text-sm tracking-wide uppercase text-on-surface/60 max-w-sm mb-8">
              Bringing the authentic taste of India to your doorstep with vibrant spices and traditional recipes.
            </p>
            <p className="font-body text-xs text-on-surface/40">© 2024 Spice Haven. All Rights Reserved.</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-3">
              <a href="#" className="font-body text-sm tracking-wide uppercase text-on-surface/60 hover:text-secondary underline underline-offset-4 transition-all">Our Story</a>
              <a href="#" className="font-body text-sm tracking-wide uppercase text-on-surface/60 hover:text-secondary underline underline-offset-4 transition-all">Sustainability</a>
            </div>
            <div className="flex flex-col gap-3">
              <a href="#" className="font-body text-sm tracking-wide uppercase text-on-surface/60 hover:text-secondary underline underline-offset-4 transition-all">Careers</a>
              <a href="#" className="font-body text-sm tracking-wide uppercase text-on-surface/60 hover:text-secondary underline underline-offset-4 transition-all">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {currentPage === 'home' && (
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentPage('checkout')}
          className="fixed bottom-10 right-10 w-16 h-16 rounded-full signature-gradient editorial-shadow text-white z-40 flex items-center justify-center transition-transform"
        >
          <ShoppingBag size={24} />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-primary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
              {cart.length}
            </span>
          )}
        </motion.button>
      )}
    </div>
  );
}
