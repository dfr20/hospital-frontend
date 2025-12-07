import { Building2, Home, Users, Package, FolderTree, Briefcase, ShoppingCart, BookOpen, Truck, HelpCircle } from 'lucide-react';
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
    { id: 'dashboard', label: 'Home', icon: Home, route: '/dashboard' },
    { id: 'usuarios', label: 'Usuários', icon: Users, route: '/users' },
    { id: 'hospitais', label: 'Hospitais', icon: Building2, route: '/hospitals' },
    { id: 'suppliers', label: 'Fornecedores', icon: Truck, route: '/suppliers' },
    { id: 'catalog', label: 'Catálogo', icon: BookOpen, route: '/catalog' },
    { id: 'items', label: 'Itens', icon: Package, route: '/items' },
    { id: 'categories', label: 'Categorias', icon: FolderTree, route: '/categories' },
    { id: 'cargos', label: 'Cargos', icon: Briefcase, route: '/job-titles' },
    { id: 'public-acquisitions', label: 'Licitações Públicas', icon: ShoppingCart, route: '/public-acquisitions' },
    { id: 'questions', label: 'Questões', icon: HelpCircle, route: '/questions' },
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
  '/job-titles': 'cargos',
  '/public-acquisitions': 'public-acquisitions',
  '/questions': 'questions'
};

// Função para obter o pageId baseado na rota, incluindo rotas dinâmicas
export const getPageIdFromRoute = (pathname: string): string => {
  // Tenta match exato primeiro
  if (routeToPageId[pathname]) {
    return routeToPageId[pathname];
  }

  // Verifica rotas que começam com /public-acquisitions (incluindo detalhes)
  if (pathname.startsWith('/public-acquisitions')) {
    return 'public-acquisitions';
  }

  // Verifica rotas que começam com /evaluations (questionário)
  if (pathname.startsWith('/evaluations')) {
    return 'public-acquisitions';
  }

  // Verifica outras rotas base
  for (const route in routeToPageId) {
    if (pathname.startsWith(route) && route !== '/') {
      return routeToPageId[route];
    }
  }

  // Fallback para dashboard
  return 'dashboard';
};