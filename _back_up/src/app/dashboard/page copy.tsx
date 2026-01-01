'use client';

import React from 'react';
import EmptyStateDashboard from '@/components/dashboard/home/EmptyStateDashboard'; // Adjust path if needed

const GlobalFooter = () => (
  <footer className="py-4 px-6 border-t border-[#262626] bg-[#0a0a0a] text-xs text-zinc-500 flex justify-between shrink-0 mt-auto">
    <span>Version: 9.8.0</span>
    <span>Copyright © 2025 Scriptoplay. All rights reserved.</span>
  </footer>
);

export default function DashboardPage() {
  const hasProjects = false; 

  return (
    // FIX: w-full h-full flex flex-col to fill the Shell container
    <div className="w-full h-full flex flex-col overflow-hidden relative">
       
       {/* Scrollable Content Area */}
       <div className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 p-6">
          <div className="max-w-6xl mx-auto min-h-full pb-10">
             {!hasProjects ? (
                <EmptyStateDashboard />
             ) : (
                <div>Dashboard Content...</div>
             )}
          </div>
       </div>
    </div>
  );
}