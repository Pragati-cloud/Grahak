import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Clock, Phone, Map, Navigation, CheckCircle2 } from 'lucide-react';

const StoreDetailPage = ({ onMenuClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="pb-24"
    >
      {/* Banner */}
      <div className="relative w-full h-[400px] md:h-[500px]">
        <img 
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2000&auto=format&fit=crop" 
          alt="Restaurant Interior" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent flex items-end">
          <div className="px-8 md:px-12 pb-12 pt-32 max-w-7xl mx-auto w-full">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-white/80 font-bold mb-3 block">Authentic Indian Flavors</span>
            <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter text-white mb-2 drop-shadow-lg">Spice Haven</h1>
            <div className="flex items-center gap-2 text-green-400 font-bold">
              <CheckCircle2 size={18} />
              <span>Open Now</span>
              <span className="text-white/60 font-medium ml-2">— Closes at 11:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 md:px-12 -mt-8 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Info Cards */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-accent/5 flex flex-col gap-6"
        >
          <div>
            <h3 className="text-xl font-headline font-bold mb-4 flex items-center gap-2"><MapPin size={20} className="text-secondary" /> Address</h3>
            <p className="font-body text-on-surface/70 leading-relaxed">
              123 Culinary Boulevard<br />
              Flavor District<br />
              Mumbai, MH 400001
            </p>
          </div>
          <hr className="border-accent/10" />
          <div>
            <h3 className="text-xl font-headline font-bold mb-4 flex items-center gap-2"><Clock size={20} className="text-secondary" /> Opening Hours</h3>
            <ul className="space-y-2 font-body text-on-surface/70">
              <li className="flex justify-between"><span>Mon - Fri</span> <span className="font-bold text-on-surface">11:00 AM - 11:00 PM</span></li>
              <li className="flex justify-between"><span>Weekend</span> <span className="font-bold text-on-surface">10:00 AM - 12:00 AM</span></li>
            </ul>
          </div>
          <hr className="border-accent/10" />
          <div>
            <h3 className="text-xl font-headline font-bold mb-4 flex items-center gap-2"><Phone size={20} className="text-secondary" /> Contact</h3>
            <p className="font-body text-on-surface/70 leading-relaxed">
              +91 98765 43210<br />
              info@spicehaven.com
            </p>
          </div>
        </motion.div>

        {/* Action Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-6"
        >
          <div className="bg-surface-container-low p-8 rounded-3xl border border-accent/10 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mb-4">
              <Map size={32} />
            </div>
            <h3 className="font-headline font-bold text-2xl mb-2">Find Us</h3>
            <p className="font-body text-on-surface/60 mb-6 text-sm">Get directions to our restaurant from your current location.</p>
            <button className="flex items-center gap-2 bg-on-surface text-surface px-6 py-3 rounded-full font-bold hover:bg-black transition-colors w-full justify-center">
              <Navigation size={18} /> Get Directions
            </button>
          </div>

          <button 
            onClick={onMenuClick}
            className="w-full bg-secondary text-white py-5 rounded-3xl font-headline font-bold text-xl uppercase tracking-wider hover:bg-accent transition-colors shadow-lg shadow-secondary/30 text-center"
          >
            Explore the Menu
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StoreDetailPage;
