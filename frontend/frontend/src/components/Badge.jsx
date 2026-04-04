import React from 'react';

const Badge = ({ text, type }) => {
  const styles = {
    chef: 'bg-[#fefccf] text-[#61613e]',
    vegan: 'bg-[#e4e2e2] text-[#5c5b5b]',
    new: 'bg-[#675c00] text-[#fff4b5]',
    sustainable: 'bg-[#fefccf] text-[#61613e]',
    popular: "bg-accent/10 text-accent border-accent/20",
    spicy: "bg-error/10 text-error border-error/20"
  };
  const currentStyle = type ? styles[type] : styles.vegan;
  return (
    <span className={`${currentStyle} text-[10px] px-2 py-0.5 rounded-sm font-headline uppercase font-bold tracking-wider mb-2 inline-block`}>
      {text}
    </span>
  );
};

export default Badge;
