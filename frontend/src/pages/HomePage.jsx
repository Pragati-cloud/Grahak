import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Info, Plus, Coffee, GlassWater, Droplets } from 'lucide-react';
import Badge from '../components/Badge';
import SpicinessIndicator from '../components/SpicinessIndicator';

const HomePage = ({ menuItems, onAddToCart }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category.includes(activeCategory);
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, activeCategory]);

  const categories = ['All', 'Appetizers', 'Mains', 'Sides', 'Drinks'];

  const appetizers = filteredItems.filter(i => i.category === 'Appetizers');
  const mains = filteredItems.filter(i => i.category === 'Mains (Curries)');
  const sides = filteredItems.filter(i => i.category === 'Sides (Naan, Roti)');
  const drinks = filteredItems.filter(i => i.category === 'Drinks');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mandala-bg">
      {/* Hero */}
      <section className="px-8 md:px-12 max-w-7xl mx-auto pt-32 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-end">
          <div className="md:col-span-5">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-accent font-bold mb-4 block">Authentic Indian Flavors</span>
            <h2 className="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter leading-[0.9] text-on-surface mb-8">
              Experience the <br/><span className="text-secondary italic">Spice.</span>
            </h2>
            <p className="text-lg text-on-surface/70 max-w-md font-body leading-relaxed mb-8">
              A curated selection of traditional spices and fresh ingredients, precisely assembled for the modern palate.
            </p>
            
            {searchQuery && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="mb-6 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg max-h-[300px] overflow-y-auto custom-scrollbar border border-accent/10"
              >
                <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-3">Found {filteredItems.length} items</p>
                <div className="space-y-3">
                  {filteredItems.slice(0, 5).map(item => (
                    <div key={item._id || item.id || item.title} className="flex items-center gap-3 cursor-pointer hover:bg-accent/5 p-2 rounded-lg transition-colors" onClick={() => onAddToCart(item)}>
                      <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-headline font-bold text-sm">{item.title}</p>
                        <p className="text-xs text-accent font-bold">₹{item.price}</p>
                      </div>
                      <Plus size={16} className="ml-auto text-secondary" />
                    </div>
                  ))}
                  {filteredItems.length > 5 && (
                    <p className="text-[10px] text-center text-on-surface/40 pt-2 border-t border-accent/5">Scroll down for more results</p>
                  )}
                </div>
              </motion.div>
            )}

            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40" size={20} />
              <input 
                type="text"
                placeholder="Search for your favorite dish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-accent/10 rounded-full py-4 pl-12 pr-6 shadow-sm focus:ring-2 focus:ring-secondary outline-none transition-all"
              />
            </div>
          </div>
          <div className="hidden md:block md:col-span-7 relative h-[400px] md:h-[500px] overflow-hidden rounded-xl">
            <img src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=1200&auto=format&fit=crop" alt="Indian Feast" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <div className="px-8 md:px-12 max-w-7xl mx-auto mb-16 overflow-x-auto flex gap-4 pb-4 no-scrollbar">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-8 py-3 rounded-full font-headline font-bold whitespace-nowrap transition-all ${
              activeCategory === cat 
                ? 'bg-secondary text-white shadow-lg' 
                : 'bg-white text-on-surface/60 border border-accent/10 hover:border-secondary/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-20">
          <Info size={48} className="mx-auto text-accent/20 mb-4" />
          <p className="text-xl font-headline font-bold text-on-surface/60">No dishes found matching your search.</p>
        </div>
      ) : (
        <>
      {/* Appetizers */}
          {appetizers.length > 0 && (
            <section className="px-4 md:px-12 max-w-7xl mx-auto mb-20 sm:mb-28">
              <div className="flex items-baseline justify-between mb-8 sm:mb-12 border-b border-accent/20 pb-4">
                <h3 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight text-on-surface">Appetizers</h3>
                <span className="font-body text-sm text-on-surface/60">Tangy & Crispy</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 sm:gap-x-12 gap-y-6 sm:gap-y-16">
                {appetizers.map(item => (
                  <motion.div layout key={item._id || item.id || item.title} className="group cursor-pointer" onClick={() => onAddToCart(item)}>
                    <div className="relative overflow-hidden rounded-xl mb-2 sm:mb-6 aspect-square sm:aspect-[4/3] bg-surface-container">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {item.badge && <Badge text={item.badge} type={item.badgeType} />}
                        <SpicinessIndicator level={item.spiciness} />
                        <h4 className="text-base sm:text-xl font-headline font-bold mb-1 sm:mb-2 group-hover:text-secondary transition-colors truncate">{item.title}</h4>
                        <p className="hidden sm:block text-sm text-on-surface/70 font-body leading-relaxed max-w-sm">{item.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 sm:gap-4">
                        <span className="text-base sm:text-lg font-headline font-bold text-accent">₹{item.price}</span>
                        <button className="sm:hidden w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Mains */}
          {mains.length > 0 && (
            <section className="bg-surface-container-low py-16 sm:py-24 mb-20 sm:mb-28">
              <div className="px-4 md:px-12 max-w-7xl mx-auto">
                <div className="flex items-baseline justify-between mb-10 sm:mb-16 border-b border-accent/20 pb-4">
                  <h3 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight text-on-surface">Mains (Curries)</h3>
                  <span className="font-body text-sm text-on-surface/60">Rich & Spiced</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
                  {mains.map(item => (
                    <motion.div layout key={item._id || item.id || item.title} onClick={() => onAddToCart(item)} className="bg-white p-2 sm:p-8 rounded-xl editorial-shadow group hover:-translate-y-2 transition-transform duration-300 cursor-pointer flex flex-col h-full">
                      <div className="overflow-hidden rounded-lg aspect-square sm:aspect-[16/10] mb-2 sm:mb-6 bg-surface-container">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="flex-1">
                        {item.badge && <Badge text={item.badge} type={item.badgeType} />}
                        <SpicinessIndicator level={item.spiciness} />
                        <h4 className="text-base sm:text-2xl font-headline font-bold mb-1 sm:mb-2 truncate">{item.title}</h4>
                        <p className="hidden sm:block text-on-surface/70 font-body mb-6 text-sm leading-relaxed">{item.description}</p>
                      </div>
                      <div className="flex justify-between items-center mt-auto">
                        <span className="text-base sm:text-xl font-headline font-bold text-accent">₹{item.price}</span>
                        <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-accent/30 flex items-center justify-center group-hover:bg-secondary group-hover:border-secondary group-hover:text-white transition-colors active:scale-90">
                          <Plus size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Sides */}
          {sides.length > 0 && (
            <section className="px-4 md:px-12 max-w-7xl mx-auto mb-20 sm:mb-28">
              <div className="flex items-baseline justify-between mb-8 sm:mb-12 border-b border-accent/20 pb-4">
                <h3 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight text-on-surface">Sides (Naan, Roti)</h3>
                <span className="font-body text-sm text-on-surface/60">Freshly Baked</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
                {sides.map(item => (
                  <motion.div layout key={item._id || item.id || item.title} onClick={() => onAddToCart(item)} className="p-2 sm:p-8 rounded-xl border border-outline-variant/10 hover:border-secondary/40 transition-all hover:bg-white/50 cursor-pointer group">
                    <div className="overflow-hidden rounded-lg aspect-square mb-2 sm:mb-4">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <h4 className="text-base sm:text-xl font-headline font-bold mb-1 sm:mb-2 truncate">{item.title}</h4>
                    <p className="hidden sm:block text-on-surface/60 font-body text-sm mb-4">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-base sm:text-lg font-headline font-bold text-accent">₹{item.price}</span>
                      <div className="w-8 h-8 rounded-full bg-secondary text-white sm:bg-secondary/10 sm:text-secondary flex items-center justify-center shadow-lg sm:shadow-none active:scale-90 transition-transform">
                        <Plus size={16} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Drinks */}
          {drinks.length > 0 && (
            <section className="px-4 md:px-12 max-w-7xl mx-auto py-16 sm:py-28 bg-surface-container-low rounded-3xl mb-20 sm:mb-28">
              <div className="flex items-baseline justify-between mb-8 sm:mb-12 border-b border-accent/20 pb-4">
                <h3 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight text-on-surface">Refreshments</h3>
                <span className="font-body text-sm text-on-surface/60">Cool & Sweet</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
                {drinks.map(item => {
                  const IconMap = { Coffee, GlassWater, Droplets };
                  const Icon = IconMap[item.icon] || Coffee;
                  return (
                    <motion.div layout key={item._id || item.id || item.title} onClick={() => onAddToCart(item)} className="p-2 sm:p-8 rounded-xl border border-outline-variant/10 hover:border-secondary/40 transition-all hover:bg-white/50 cursor-pointer group">
                      <Icon className="text-secondary mb-2 sm:mb-4 group-hover:scale-110 transition-transform" size={24} />
                      <h4 className="text-base sm:text-xl font-headline font-bold mb-1 sm:mb-2 truncate">{item.title}</h4>
                      <p className="hidden sm:block text-on-surface/60 font-body text-sm mb-4">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-base sm:text-lg font-headline font-bold text-accent">₹{item.price}</span>
                        <div className="w-8 h-8 rounded-full bg-secondary text-white sm:bg-secondary/10 sm:text-secondary flex items-center justify-center shadow-lg sm:shadow-none active:scale-90 transition-transform">
                          <Plus size={16} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </motion.div>
  );
};

export default HomePage;
