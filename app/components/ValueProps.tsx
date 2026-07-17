import React from 'react';
import { User, RefreshCcw, MapPin } from 'lucide-react';

const propsList = [
  { title: 'MY ACCOUNT', description: 'Find all your details here', icon: <User className="w-6 h-6 stroke-[1.2]" /> },
  { title: 'RETURN & EXCHANGES', description: 'Return & Exchange on the mail site', icon: <RefreshCcw className="w-6 h-6 stroke-[1.2]" /> },
  { title: 'ORDER TRACKING', description: "We'll always keep you updated", icon: <MapPin className="w-6 h-6 stroke-[1.2]" /> },
];

export default function ValueProps() {
  return (
    <section className="py-16 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-black/10">
          {propsList.map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left gap-5 py-6 md:py-4 px-6 group cursor-pointer">
              <div className="w-12 h-12 border-2 border-black flex items-center justify-center bg-white text-black group-hover:bg-[#FFCB05] transition-all duration-300 shadow-[2px_2px_0_0_#111111] group-hover:shadow-[3.5px_3.5px_0_0_#111111] group-hover:-translate-x-[1.5px] group-hover:-translate-y-[1.5px] -rotate-3 group-hover:rotate-0 shrink-0">
                {item.icon}
              </div>
              <div className="flex flex-col">
                <h4 className="attiz-display text-sm tracking-widest text-black mb-1 group-hover:text-[#E63B2E] transition-colors">{item.title}</h4>
                <p className="attiz-body text-[10px] text-black/55 tracking-wider font-light leading-normal">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
