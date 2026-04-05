import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { INITIAL_APPETIZERS, INITIAL_MAINS, INITIAL_SIDES, INITIAL_DRINKS } from './constants';
import Header from './components/Header';
import Toast from './components/Toast';
import HomePage from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';
import StoreDetailPage from './pages/StoreDetailPage';

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
  
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('spice_haven_coins');
    return saved ? parseInt(saved, 10) : 0;
  });
  const handleOrderComplete = (earned, redeemed) => {
    setCoins(prev => {
      const newBalance = Math.max(0, prev - redeemed) + earned;
      localStorage.setItem('spice_haven_coins', newBalance);
      if (earned > 0) {
        setTimeout(() => setToast(`You earned ${earned} coins (₹${(earned/100).toFixed(2)})!`), 2000);
      }
      return newBalance;
    });
  };

  const [shopId, setShopId] = useState(() => {
    const p = window.location.pathname.split('/').filter(Boolean);
    return p.length >= 2 ? p[0] : "69d0d18cc7cde5669b3585ad";
  });
  const [deviceId, setDeviceId] = useState(null);
  
  // Using Render production backend explicitly
  const API_URL = "https://grahak-e8yr.onrender.com";

  useEffect(() => {
    const initApp = async () => {
      try {
        const currentShopId = shopId;
        
        // 1. Get Devices
        let currentDeviceId = localStorage.getItem('qrdine_device_id');
        if (!currentDeviceId) {
          try {
            const devRes = await fetch(`${API_URL}/api/shops/${currentShopId}/devices`);
            if (devRes.ok) {
              const devData = await devRes.json();
              if (devData.devices && devData.devices.length > 0) {
                currentDeviceId = devData.devices[0]._id;
                localStorage.setItem('qrdine_device_id', currentDeviceId);
              }
            }
          } catch(e) { console.warn("Failed retrieving devices", e); }
        }
        // Fallback for demo if devices array is completely empty from backend
        if (!currentDeviceId) currentDeviceId = "dev_fallback_123";
        setDeviceId(currentDeviceId);

        // 2. Get Menu
        const menuRes = await fetch(`${API_URL}/api/shops/${currentShopId}/products`);
        const menuData = await menuRes.json();
        
        console.log("=== MENU DATA FETCHED FROM BACKEND ===");
        console.log("Raw Response Data:", menuData);
        if (menuData.products) {
          console.log("Raw Products Array:", menuData.products);
        }
          
        if (menuData.products && menuData.products.length > 0) {
          const mappedMenu = menuData.products
            .filter(p => p.available !== false)
            .map((p, index) => ({
              _id: p._id,
              id: p._id,
              title: p.name,
              price: p.price / 100, // paise to rupees
              category: index % 2 === 0 ? "Mains (Curries)" : "Appetizers", // Match exact string expected by HomePage
              image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80",
              description: "Authentic Indian flavors.",
            }));
            
          console.log("=== MENU DATA MAPPED FOR FRONTEND ===");
          console.log("Mapped Menu Array:", mappedMenu);
          
          setMenuItems(mappedMenu);
          localStorage.setItem('spice_haven_menu', JSON.stringify(mappedMenu));
          return; // Success
        }
        
        // Fallback if no products found locally or remotely
        loadFallbackMenu();
      } catch (err) {
        console.error("Failed to fetch from QRDine Live API:", err);
        loadFallbackMenu();
      }
    };

    const loadFallbackMenu = () => {
      const saved = localStorage.getItem('spice_haven_menu');
      if (saved) {
        setMenuItems(JSON.parse(saved));
      } else {
        setMenuItems([...INITIAL_APPETIZERS, ...INITIAL_MAINS, ...INITIAL_SIDES, ...INITIAL_DRINKS]);
      }
    };

    initApp();
  }, []);

  const handleAddToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find(c => 
        (c._id && c._id === item._id) || 
        (c.id && c.id === item.id) || 
        (c.title && c.title === item.title)
      );
      if (existing) {
        setToast(`Added another ${item.title}`);
        return prevCart.map(c => c === existing ? { ...c, quantity: (c.quantity || 1) + 1 } : c);
      } else {
        setToast(`${item.title} added to your selection`);
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const handleSubtractFromCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find(c => 
        (c._id && c._id === item._id) || 
        (c.id && c.id === item.id) || 
        (c.title && c.title === item.title)
      );
      if (!existing) return prevCart;
      
      if (existing.quantity > 1) {
        return prevCart.map(c => c === existing ? { ...c, quantity: c.quantity - 1 } : c);
      } else {
        setToast(`${item.title} removed`);
        return prevCart.filter(c => c !== existing);
      }
    });
  };

  const handleRemoveFromCart = (item) => {
    setCart((prevCart) => prevCart.filter(c => 
      (c._id ? c._id !== item._id : true) && 
      (c.id ? c.id !== item.id : true) && 
      (c.title ? c.title !== item.title : true)
    ));
    setToast(`${item.title} removed from selection`);
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
        coins={coins}
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
              apiUrl={API_URL}
              shopId={shopId}
              deviceId={deviceId}
              onAdd={handleAddToCart}
              onSubtract={handleSubtractFromCart}
              onRemove={handleRemoveFromCart} 
              onClear={() => setCart([])}
              coins={coins}
              onOrderComplete={handleOrderComplete}
              onComplete={() => setCurrentPage('home')}
            />
          )}
          {currentPage === 'auth' && (
            <AuthPage 
              key="auth" 
              apiUrl={API_URL}
              onComplete={(userData) => {
                if (userData) {
                  setUser(userData);
                  setToast(`Welcome back, ${userData.name}!`);
                }
                setCurrentPage('home');
              }}
            />
          )}
          {currentPage === 'store' && (
            <StoreDetailPage 
              key="store" 
              onMenuClick={() => setCurrentPage('home')}
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
