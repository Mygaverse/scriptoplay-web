import { ICONS } from './icons';
import { SidebarSection } from '@/interface/sidebar';
import { useAuth } from '@/context/AuthContext';

export const INITIAL_SIDEBAR_DATA: SidebarSection[] = [
  {
    id: 'main',
    items: [
      { id: 'dash', label: 'Dashboard', icon: ICONS.dashboard, href: '/dashboard' },
      { id: 'docs', label: 'My Projects', icon: ICONS.folder, href: '/dashboard/projects' },
      { id: 'assets', label: 'My Assets', icon: ICONS.image, href: '/dashboard/assets' },

    ]
  },
  {
    id: 'agents',
    title: 'AI Agents',
    items: [
      { id: 'bot-human', label: 'Character Agent', icon: ICONS.user, badge: 'NEW' },
    ]
  },
  {
    id: 'content',
    title: 'AI Content',
    items: [
      { id: 'writer', label: 'AI Writer', icon: ICONS.documents },

    ]
  },

];