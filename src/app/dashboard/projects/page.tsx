'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { projectService } from '@/services/projectService';
import { ProjectDocument } from '@/types/firestore';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import { ICONS } from '@/config/icons';

// Filter Categories
const CATEGORIES = [
  { id: 'all', label: 'All Projects' },
  { id: 'film', label: 'Feature Films' },
  { id: 'tv', label: 'TV Series' },
  { id: 'animation', label: 'Animation' },
];

export default function MyProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    async function load() {
      if (user?.uid) {
        try {
          const data = await projectService.getUserProjects(user.uid);
          setProjects(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    }
    load();
  }, [user]);

  // Mock filtering for MVP (Since we haven't strictly saved 'type' yet)
  // In a real app, you'd check: project.data.type === activeFilter
  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(p => false); // For now, everything shows under ALL until we save 'type'

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[#0a0a0a]">
       
       {/* HEADER */}
       <div className="px-8 py-6 border-b border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
             <h1 className="text-2xl font-bold text-white mb-1">My Projects</h1>
             <p className="text-sm text-gray-400">Manage your scripts and development files.</p>
          </div>
          <Link href="/dashboard/create">
             <Button variant="primary" icon={ICONS.plus}>New Project</Button>
          </Link>
       </div>

       {/* FILTERS */}
       <div className="px-8 py-4 border-b border-[#262626] bg-[#0f0f0f] shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2">
             {CATEGORIES.map((cat) => (
               <button
                 key={cat.id}
                 onClick={() => setActiveFilter(cat.id)}
                 className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                   activeFilter === cat.id 
                     ? 'bg-purple-600 text-white' 
                     : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#262626]'
                 }`}
               >
                 {cat.label}
               </button>
             ))}
          </div>
       </div>

       {/* GRID */}
       <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-zinc-800">
          {loading ? (
             <div className="text-gray-500">Loading library...</div>
          ) : filteredProjects.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Icon icon={ICONS.folder} size={48} className="mb-4 opacity-20" />
                <p>No projects found in this category.</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProjects.map((project) => (
                   <Link key={project.id} href={`/dashboard/workspace?id=${project.id}`}>
                      <div className="group bg-[#141414] border border-[#262626] rounded-xl overflow-hidden hover:border-gray-600 transition-all cursor-pointer flex flex-col h-[280px]">
                         
                         {/* Thumbnail Placeholder */}
                         <div className="h-32 bg-gradient-to-br from-gray-800 to-black relative p-4 flex items-center justify-center">
                            <Icon icon={ICONS.fileText} size={32} className="text-gray-600 group-hover:text-purple-400 transition-colors" />
                            {/* Status Tag */}
                            <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/50 backdrop-blur rounded text-[10px] text-gray-300 border border-white/10 uppercase tracking-wide">
                               {project.status}
                            </div>
                         </div>

                         {/* Content */}
                         <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-purple-400 transition-colors">
                              {project.title}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-3 mb-4 flex-1 leading-relaxed">
                               {project.data.logline || "No logline description available."}
                            </p>
                            
                            <div className="flex items-center justify-between text-[10px] text-gray-600 pt-4 border-t border-[#262626] mt-auto">
                               <span>Updated {project.lastModified?.toDate().toLocaleDateString()}</span>
                               <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                            </div>
                         </div>
                      </div>
                   </Link>
                ))}
             </div>
          )}
       </div>
    </div>
  );
}