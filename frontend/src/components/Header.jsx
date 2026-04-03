import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ShoppingBag } from 'lucide-react';

const Header = ({ onNavigate, cartCount, currentPage, user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled || currentPage !== 'home' ? 'bg-surface/80 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
        <div className="flex justify-between items-center px-8 md:px-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsMenuOpen(true)} className="text-on-surface hover:text-primary transition-colors">
              <Menu size={24} />
            </button>
            <nav className="hidden md:flex gap-8 items-center">
              <button onClick={() => onNavigate('home')} className={`${currentPage === 'home' ? 'text-primary border-b-2 border-primary-container' : 'text-on-surface'} font-headline tracking-tight font-bold`}>The Gallery</button>
            </nav>
          </div>
          <h1 onClick={() => onNavigate('home')} className="text-xl md:text-2xl font-headline font-black tracking-tighter text-on-surface uppercase text-center cursor-pointer">
            Spice Haven
          </h1>
          <div className="flex items-center gap-6">
            {!user ? (
              <button 
                onClick={() => onNavigate('auth')} 
                className="text-sm font-bold uppercase tracking-wider text-on-surface hover:text-primary transition-colors hidden sm:block"
              >
                Sign In
              </button>
            ) : (
              <button 
                onClick={onLogout} 
                className="text-sm font-bold uppercase tracking-wider text-accent hover:text-red-700 transition-colors hidden sm:block"
              >
                Logout
              </button>
            )}
            <button onClick={() => onNavigate('checkout')} className="text-on-surface hover:text-primary transition-colors relative">
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-[60]"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[70] p-8 w-80 bg-surface shadow-2xl"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-12">
                  <h2 className="font-headline text-lg font-bold text-primary">Menu</h2>
                  <button onClick={() => setIsMenuOpen(false)} className="text-on-surface">
                    <X size={24} />
                  </button>
                </div>
                <nav className="space-y-4">
                  {[
                    { label: 'The Gallery', page: 'home' },
                    { label: 'Your Selection', page: 'checkout' },
                  ].map((item) => (
                    <button 
                      key={item.label}
                      onClick={() => { onNavigate(item.page); setIsMenuOpen(false); }}
                      className="w-full text-left flex items-center gap-4 p-4 hover:bg-surface-container rounded-full font-headline text-lg font-medium transition-all hover:translate-x-2"
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
