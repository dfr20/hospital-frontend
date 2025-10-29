import { Settings, LogOut } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface HeaderAction {
  id: string;
  icon: LucideIcon;
  type: 'icon' | 'button';
  label?: string;
}

export interface HeaderDataType {
  breadcrumb: string[];
  title: string;
  actions: HeaderAction[];
}

// Configuração de headers por rota
export const headerConfigs: Record<string, HeaderDataType> = {
  '/dashboard': {
    breadcrumb: ['Admin', 'Dashboard'],
    title: 'Dashboard',
    actions: [
      { id: 'settings', icon: Settings, type: 'icon' },
      { id: 'logout', icon: LogOut, type: 'icon' }
    ]
  },
  '/public-acquisitions': {
    breadcrumb: ['Admin', 'Public Acquisitions'],
    title: 'Aquisições Públicas',
    actions: [
      { id: 'settings', icon: Settings, type: 'icon' },
      { id: 'logout', icon: LogOut, type: 'icon' }
    ]
  },
  '/hospitals': {
    breadcrumb: ['Admin', 'Hospitals'],
    title: 'Hospitais',
    actions: [
      { id: 'settings', icon: Settings, type: 'icon' },
      { id: 'logout', icon: LogOut, type: 'icon' }
    ]
  },
  '/job-titles': {
    breadcrumb: ['Admin', 'Job Titles'],
    title: 'Cargos',
    actions: [
      { id: 'settings', icon: Settings, type: 'icon' },
      { id: 'logout', icon: LogOut, type: 'icon' }
    ]
  },
  '/catalog': {
    breadcrumb: ['Admin', 'Catalog'],
    title: 'Catálogo',
    actions: [
      { id: 'settings', icon: Settings, type: 'icon' },
      { id: 'logout', icon: LogOut, type: 'icon' }
    ]
  },
  '/categories': {
    breadcrumb: ['Admin', 'Categories'],
    title: 'Categorias',
    actions: [
      { id: 'settings', icon: Settings, type: 'icon' },
      { id: 'logout', icon: LogOut, type: 'icon' }
    ]
  },
  '/subcategories': {
    breadcrumb: ['Admin', 'Subcategories'],
    title: 'Subcategorias',
    actions: [
      { id: 'settings', icon: Settings, type: 'icon' },
      { id: 'logout', icon: LogOut, type: 'icon' }
    ]
  },
  '/items': {
    breadcrumb: ['Admin', 'Items'],
    title: 'Items',
    actions: [
      { id: 'settings', icon: Settings, type: 'icon' },
      { id: 'logout', icon: LogOut, type: 'icon' }
    ]
  },
  '/suppliers': {
    breadcrumb: ['Admin', 'Suppliers'],
    title: 'Fornecedores',
    actions: [
      { id: 'settings', icon: Settings, type: 'icon' },
      { id: 'logout', icon: LogOut, type: 'icon' }
    ]
  },
  '/users': {
    breadcrumb: ['Admin', 'Users'],
    title: 'Usuários',
    actions: [
      { id: 'settings', icon: Settings, type: 'icon' },
      { id: 'logout', icon: LogOut, type: 'icon' }
    ]
  }
};

// Header padrão (fallback)
export const headerData: HeaderDataType = headerConfigs['/users'];