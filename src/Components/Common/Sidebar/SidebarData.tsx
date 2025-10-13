import { Briefcase, Building2, Home, Users, Package } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  route: string;
}

export interface SidebarDataType {
  logo: {
    title?: string;
    icon: LucideIcon;
  };
  menuItems: MenuItem[];
}

export const sidebarData: SidebarDataType = {
  logo: {
    title: 'Painel do Administrador',
    icon: Building2
  },
  menuItems: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, route: '/dashboard' },
    { id: 'hospitais', label: 'Hospitais', icon: Building2, route: '/hospitals' },
    { id: 'usuarios', label: 'Usuários', icon: Users, route: '/users' },
    { id: 'cargos', label: 'Cargos', icon: Briefcase, route: '/job-titles' },
    { id: 'catalogo', label: 'Catálogo', icon: Package, route: '/catalog' }
  ]
};

// Mapeamento de rotas para IDs de página
export const routeToPageId: Record<string, string> = {
  '/users': 'usuarios',
  '/hospitals': 'hospitais',
  '/dashboard': 'dashboard',
  '/job-titles': 'cargos',
  '/catalog': 'catalogo'
};