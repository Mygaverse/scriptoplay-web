import React from 'react';
import { cn } from '@/utils/cn'; // Ensure path is correct based on your setup

interface AboutCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  className?: string;
}

const AboutCard = ({ icon, title, desc, className }: AboutCardProps) => {
  return (
    <div 
      className={cn(
        "bg-[#111] p-8 h-full rounded-2xl border border-white/10 transition-all duration-300",
        "hover:border-white/20 hover:-translate-y-1 group",
        className
      )}
    >
      <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 text-white group-hover:bg-white/10 group-hover:text-brand transition-colors">
        {/* We render the icon passed as a prop here */}
        {icon}
      </div>
      
      <h3 className="text-xl font-bold mb-3 text-white">
        {title}
      </h3>
      
      <p className="text-zinc-500 text-base leading-relaxed">
        {desc}
      </p>
    </div>
  );
};

export default AboutCard;