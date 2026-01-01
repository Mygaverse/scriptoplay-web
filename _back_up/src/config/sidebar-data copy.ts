import { ICONS } from './icons';
import { SidebarSection } from '@/interface/sidebar';

export const INITIAL_SIDEBAR_DATA: SidebarSection[] = [
  {
    id: 'main',
    items: [
      { id: 'dash', label: 'Dashboard', icon: ICONS.dashboard, href: '/dashboard' },
      { id: 'docs', label: 'Documents', icon: ICONS.documents, href: '/dashboard/documents' },
      { id: 'pres', label: 'AI Presentation', icon: ICONS.presentation, href: '/dashboard/presentation' },
    ]
  },
  {
    id: 'bots',
    title: 'Smart Bots',
    items: [
      { id: 'bot-chat', label: 'AI Chat Bots', icon: ICONS.bot, badge: 'NEW' },
      { id: 'bot-voice', label: 'AI Voice Bots', icon: ICONS.voice, badge: 'NEW' },
      { id: 'bot-human', label: 'Human Agent', icon: ICONS.user, badge: 'NEW' },
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing Bot',
    items: [
      { id: 'mkt-bot', label: 'Marketing Bot', icon: ICONS.megaphone, badge: 'NEW' },
      { id: 'mkt-inbox', label: 'Inbox', icon: ICONS.inbox },
      { 
        id: 'campaigns', 
        label: 'Campaigns', 
        icon: ICONS.megaphone, 
        submenu: ['Campaign List', 'Create Campaign', 'Analytics'] 
      },
      { 
        id: 'telegram', 
        label: 'Telegram', 
        icon: ICONS.send, 
        submenu: ['Telegram Bots', 'Settings'] 
      },
    ]
  },
  {
    id: 'content',
    title: 'AI Content',
    items: [
      { id: 'writer', label: 'AI Writer', icon: ICONS.documents },
      { id: 'music-pro', label: 'AI Music Pro', icon: ICONS.music, badge: 'NEW' },
      { id: 'code', label: 'AI Code', icon: ICONS.code, highlighted: true },
    ]
  },
  {
    id: 'admin',
    title: 'Admin',
    items: [
        { id: 'adm-users', label: 'User Management', icon: ICONS.user, submenu: ['Users List', 'Activities', 'Permissions'] },
        { id: 'adm-finance', label: 'Finance', icon: ICONS.wallet, submenu: ['Transactions', 'Plans'] },
        { id: 'adm-settings', label: 'Settings', icon: ICONS.settings, submenu: ['General', 'Payment'] },
    ]
  }
];