'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { projectService } from '../../services/projectService';
import { ProjectDocument } from '@/types/firestore';
import Icon from '@/components/ui/Icon';
import { ICONS } from '@/config/icons';
import EmptyStateDashboard from '@/components/dashboard/home/EmptyStateDashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      if (user?.uid) {
        try {
          const data = await projectService.getUserProjects(user.uid);
          setProjects(data);
        } catch (error) {
          console.error("Failed to load projects", error);
        } finally {
          setLoading(false);
        }
      }
    }
    loadProjects();
  }, [user]);

  if (loading) return <div className="p-10 text-gray-500">Loading your studio...</div>;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
       <div className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 p-6">
          <div className="max-w-7xl mx-auto min-h-full pb-10">
             
             {/* Header */}
             <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-white">My Projects</h1>
                <Link href="/dashboard/create">
                   <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                      <Icon icon={ICONS.plus} size={16} /> New Project
                   </button>
                </Link>
             </div>

             {/* Content */}
             {projects.length === 0 ? (
                <EmptyStateDashboard />
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {projects.map((project) => (
                      <Link key={project.id} href={`/dashboard/workspace?id=${project.id}`}>
                         <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 hover:border-purple-500/50 hover:shadow-lg transition-all cursor-pointer group">
                            <div className="flex justify-between items-start mb-4">
                               <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center border border-[#333]">
                                  <Icon icon={ICONS.fileText} size={20} className="text-gray-300 group-hover:text-white" />
                               </div>
                               <span className={`text-[10px] px-2 py-0.5 rounded border ${
                                  project.status === 'completed' 
                                  ? 'bg-green-900/20 text-green-400 border-green-500/20' 
                                  : 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20'
                               }`}>
                                  {project.status.toUpperCase()}
                               </span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{project.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                               {project.data.logline || "No logline yet..."}
                            </p>
                            <div className="mt-4 pt-4 border-t border-[#262626] flex items-center justify-between text-xs text-gray-600">
                               <span>Updated {project.lastModified?.toDate().toLocaleDateString()}</span>
                               <span>Open Studio &rarr;</span>
                            </div>
                         </div>
                      </Link>
                   ))}
                </div>
             )}
          </div>
       </div>
    </div>
  );
}