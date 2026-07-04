import React from 'react';
import { User, RefreshCcw, MapPin } from 'lucide-react';

const propsList = [
  { title: 'MY ACCOUNT', description: 'Find all your details here', icon: <User className="w-6 h-6 stroke-[1.2]" /> },
  { title: 'RETURN & EXCHANGES', description: 'Return & Exchange on the mail site', icon: <RefreshCcw className="w-6 h-6 stroke-[1.2]" /> },
  { title: 'ORDER TRACKING', description: "We'll always keep you updated", icon: <MapPin className="w-6 h-6 stroke-[1.2]" /> },
];

export default function ValueProps() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-brand-cream-dark">
          {propsList.map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left gap-4 py-6 md:py-4 px-6 group cursor-pointer">
              <div className="w-12 h-12 rounded-full border border-brand-cream-dark flex items-center justify-center text-brand-brown hover:text-brand-brown-dark hover:border-brand-brown group-hover:bg-brand-cream/30 group-hover:scale-105 transition-all duration-300">
                {item.icon}
              </div>
              <div className="flex flex-col">
                <h4 className="font-sans text-[11px] font-bold tracking-[0.2em] text-brand-dark mb-1">{item.title}</h4>
                <p className="font-sans text-[10px] text-brand-dark/60 tracking-wider font-medium">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
