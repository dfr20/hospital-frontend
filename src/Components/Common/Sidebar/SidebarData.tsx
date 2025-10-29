import { Building2, Home, Users, Package, FolderTree, Layers, Briefcase, ShoppingCart, BookOpen, Truck } from 'lucide-react';
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
    title: 'Painel',
    icon: Building2
  },
  menuItems: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, route: '/dashboard' },
    { id: 'usuarios', label: 'Usuários', icon: Users, route: '/users' },
    { id: 'hospitais', label: 'Hospitais', icon: Building2, route: '/hospitals' },
    { id: 'suppliers', label: 'Fornecedores', icon: Truck, route: '/suppliers' },
    { id: 'catalog', label: 'Catálogo', icon: BookOpen, route: '/catalog' },
    { id: 'items', label: 'Itens', icon: Package, route: '/items' },
    { id: 'categories', label: 'Categorias', icon: FolderTree, route: '/categories' },
    { id: 'subcategories', label: 'Subcategorias', icon: Layers, route: '/subcategories' },
    { id: 'cargos', label: 'Cargos', icon: Briefcase, route: '/job-titles' },
    { id: 'public-acquisitions', label: 'Licitações Públicas', icon: ShoppingCart, route: '/public-acquisitions' },
  ]
};

// Mapeamento de rotas para IDs de página
export const routeToPageId: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/users': 'usuarios',
  '/hospitals': 'hospitais',
  '/suppliers': 'suppliers',
  '/catalog': 'catalog',
  '/items': 'items',
  '/categories': 'categories',
  '/subcategories': 'subcategories',
  '/job-titles': 'cargos',
  '/public-acquisitions': 'public-acquisitions'
};