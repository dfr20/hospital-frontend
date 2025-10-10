import { Building2, Home, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  route: string;
}

export interface SidebarDataType {
  logo: {
    title: string;
    icon: LucideIcon;
  };
  menuItems: MenuItem[];
}

export const sidebarData: SidebarDataType = {
  logo: {
    title: 'ADM - Responsáveis',
    icon: Building2
  },
  menuItems: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, route: '/dashboard' },
    { id: 'hospitais', label: 'Hospitais', icon: Building2, route: '/hospitals' },
    { id: 'usuarios', label: 'Usuários', icon: Users, route: '/users' },
  ]
};

// Mapeamento de rotas para IDs de página
export const routeToPageId: Record<string, string> = {
  '/users': 'usuarios',
  '/hospitals': 'hospitais',
  '/dashboard': 'dashboard'
};