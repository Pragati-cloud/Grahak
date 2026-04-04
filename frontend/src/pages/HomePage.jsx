import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus } from 'lucide-react';

const HomePage = ({ menuItems, onAddToCart }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category.includes(activeCategory.split(' ')[0]); 
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, activeCategory]);

  const categories = ['All', 'Appetizers', 'Mains', 'Sides', 'Drinks'];
  
  // Dynamic Banner imagery
  const getBannerImage = (cat) => {
    if (cat.includes('Appetizer')) return "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=1000";
    if (cat.includes('Main')) return "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=1000";
    if (cat.includes('Side')) return "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=1000";
    if (cat.includes('Drink')) return "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=1000";
    return "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1000";
  };

  const currentBanner = getBannerImage(activeCategory);

  const renderItem = (item) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout 
      key={item._id || item.id || item.title} 
      onClick={() => onAddToCart(item)}
      className="flex gap-4 items-center p-4 bg-white hover:bg-orange-50/30 cursor-pointer active:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 group"
    >
      <img src={item.image} className="w-16 h-16 rounded-full object-cover shadow-sm flex-shrink-0" alt={item.title} />
      <div className="flex-1 min-w-0 pr-2">
        <h3 className="font-bold text-[15px] text-gray-900 leading-tight mb-0.5 truncate">{item.title}</h3>
        <p className="text-xs text-gray-500 line-clamp-1 mb-1 font-body">{item.description}</p>
        <p className="text-[10px] italic text-gray-400 font-serif">Contains exquisite spices</p>
      </div>
      <div className="text-right flex flex-col items-end gap-1">
        <span className="font-black text-[#e85d04] text-sm md:text-base">₹{item.price}</span>
        <div className="w-6 h-6 rounded-full bg-orange-50 text-[#e85d04] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus size={14} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-[#fcfbf9] min-h-screen pb-24 font-body">
      
      {/* Elegantly minimal top header section */}
      <div className="pt-8 pb-4 text-center bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] z-50 relative px-4 border-b border-gray-100/50">
        <h1 className="font-serif italic text-4xl font-bold tracking-tight text-gray-900 mt-6 md:mt-10">Spice Haven</h1>
        <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mt-2 font-semibold">Restaurant - Bar - Authentic Indian</p>
        
        {/* Slim Search Bar */}
        <div className="relative w-full max-w-md mx-auto mt-6 mb-2">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text"
            placeholder="Search our menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-full py-3.5 pl-12 pr-4 focus:ring-1 focus:ring-[#e85d04] focus:border-[#e85d04] outline-none transition-all text-sm shadow-inner font-medium text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Horizontal Category Scroller */}
      <div className="relative z-40 bg-white border-b border-gray-100 px-4 mt-2">
        <div className="flex gap-6 overflow-x-auto no-scrollbar py-3 max-w-2xl mx-auto">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap text-[13px] md:text-sm font-bold transition-all relative px-1 uppercase tracking-wide ${
                activeCategory === cat ? 'text-[#e85d04]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {cat}
              {activeCategory === cat && (
                <motion.div layoutId="category-underline" className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#e85d04]" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-0 mt-6 relative z-10">
        {/* Decorative Banner Image */}
        <AnimatePresence mode="wait">
          {!searchQuery && (
            <motion.div 
              key={activeCategory}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-t-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="w-full h-36 md:h-48 relative">
                <img src={currentBanner} alt={activeCategory} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
              </div>
              <div className="text-center py-6 relative bg-white">
                <div className="absolute top-1/2 left-8 md:left-16 -translate-y-1/2 w-8 md:w-20 h-px bg-gray-200"></div>
                <div className="absolute top-1/2 right-8 md:right-16 -translate-y-1/2 w-8 md:w-20 h-px bg-gray-200"></div>
                <h2 className="text-2xl font-serif italic text-gray-800">~ {activeCategory === 'All' ? 'Our Menu' : activeCategory} ~</h2>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Served with perfection</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unified Item List */}
        <div className={`bg-white shadow-sm border border-gray-100 ${!searchQuery ? 'rounded-b-3xl border-t-0' : 'rounded-3xl mt-2'}`}>
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p>No delicious items found.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredItems.map(renderItem)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default HomePage;
