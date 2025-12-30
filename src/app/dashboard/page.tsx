'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { projectService } from '@/services/projectService';
import { ProjectDocument } from '@/types/firestore';
import Icon from '@/components/ui/Icon';
import { ICONS } from '@/config/icons';
import  Badge from '@/components/ui/Badge';

// Import your existing Empty State component
// If you don't have this file separated yet, I have provided the code for it below this block.
import EmptyStateDashboard from '@/components/dashboard/home/EmptyStateDashboard'; 

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentProjects, setRecentProjects] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Recent Projects (Limit 4)
  useEffect(() => {
    async function loadRecent() {
      if (user?.uid) {
        try {
          // Fetch all user projects
          const data = await projectService.getUserProjects(user.uid);
          // Only show the top 4 most recent on the home page
          setRecentProjects(data.slice(0, 4));
        } catch (error) {
          console.error("Failed to load projects", error);
        } finally {
          setLoading(false);
        }
      }
    }
    loadRecent();
  }, [user]);

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
       <div className="max-w-7xl mx-auto w-full p-8 lg:p-12 space-y-12">
          
          {/* 1. TOP SECTION: ALWAYS SHOW EMPTY STATE (TOOLS) */}
          <section>
             <EmptyStateDashboard />
          </section>

          {/* 2. BOTTOM SECTION: RECENT PROJECTS (Only if they exist) */}
          {!loading && recentProjects.length > 0 && (
            <section className="animate-in slide-in-from-bottom-4 duration-500 border-0 border-[#262626] pt-4">
               <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Icon icon={ICONS.clock} className="text-gray-400" size={20} /> Recent Work
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Pick up where you left off.</p>
                  </div>
                  <Link href="/dashboard/projects" className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                     View All Projects <Icon icon={ICONS.arrowRight} size={14} />
                  </Link>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentProjects.map((project) => (
                      <Link key={project.id} href={`/dashboard/workspace?id=${project.id}`}>
                         <div className="group bg-[#141414] border border-[#262626] rounded-xl p-5 hover:border-purple-500/50 hover:bg-[#1a1a1a] transition-all cursor-pointer h-full flex flex-col shadow-lg shadow-black/20">
                            
                            <div className="flex justify-between items-start mb-4">
                               <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-gray-400 border border-[#333] group-hover:text-white group-hover:border-gray-500 transition-colors">
                                  <Icon icon={ICONS.fileText} size={18} />
                               </div>
                               <Badge variant="neutral" className="text-[10px] py-0.5 px-2 bg-black/40">
                                  {project.lastModified?.toDate().toLocaleDateString()}
                               </Badge> 
                            </div>
                            
                            <h4 className="text-base font-bold text-gray-200 mb-2 line-clamp-1 group-hover:text-purple-400 transition-colors">
                                {project.title}
                            </h4>
                            
                            <p className="text-xs text-gray-500 line-clamp-2 flex-1 leading-relaxed">
                               {project.data.logline || "No logline description..."}
                            </p>
                            
                            <div className="mt-4 pt-4 border-t border-[#262626] flex items-center justify-between text-[10px] text-gray-600 group-hover:text-gray-400">
                               <span>{project.status.toUpperCase()}</span>
                               <Icon icon={ICONS.arrowRight} size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-purple-400" />
                            </div>
                         </div>
                      </Link>
                  ))}
               </div>
            </section>
          )}

          {/* Footer Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Documentation", icon: ICONS.documents, desc: "Master the art of prompting." },
          { title: "Join Community", icon: ICONS.user, desc: "Connect with other creators." },
          { title: "API Access", icon: ICONS.code, desc: "Integrate into your workflow." }
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-4 p-4 rounded-xl hover:bg-[#141414] transition-colors cursor-pointer border border-transparent hover:border-[#262626]">
              <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-gray-400 group-hover:text-white">
                <Icon icon={item.icon} size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-200">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
          </div>
        ))}
      </div>

       </div>
    </div>
  );
}