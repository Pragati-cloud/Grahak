import React from 'react';
import { Droplets } from 'lucide-react';

const SpicinessIndicator = ({ level }) => {
  if (!level) return null;
  return (
    <div className="flex gap-0.5 mb-2">
      {[...Array(3)].map((_, i) => (
        <Droplets 
          key={i} 
          size={14} 
          className={i < level ? "text-secondary fill-secondary" : "text-on-surface/10"} 
        />
      ))}
    </div>
  );
};

export default SpicinessIndicator;
