export interface SidebarItem {
  id: string;
  label: string;
  icon: string; // Key from ICONS or direct iconify string
  href?: string;
  badge?: string; // 'NEW', etc
  highlighted?: boolean; // For purple text
  submenu?: string[]; // Array of strings for now (as per your simple string array example), or complex objects
}

export interface SidebarSection {
  id: string;
  title?: string; // e.g. "Smart Bots"
  items: SidebarItem[];
}