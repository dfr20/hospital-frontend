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
  '/users': {
    breadcrumb: ['Home', 'Users'],
    title: 'Usuários',
    actions: [
      { id: 'settings', icon: Settings, type: 'icon' },
      { id: 'logout', icon: LogOut, type: 'icon' }
    ]
  },
  '/hospitals': {
    breadcrumb: ['Home', 'Hospitals'],
    title: 'Hospitais',
    actions: [
      { id: 'settings', icon: Settings, type: 'icon' },
      { id: 'logout', icon: LogOut, type: 'icon' }
    ]
  },
  '/dashboard': {
    breadcrumb: ['Home', 'Dashboard'],
    title: 'Dashboard',
    actions: [
      { id: 'settings', icon: Settings, type: 'icon' },
      { id: 'logout', icon: LogOut, type: 'icon' }
    ]
  },
  '/job-titles': {
    breadcrumb: ['Home', 'Job Titles'],
    title: 'Cargos',
    actions: [
      { id: 'settings', icon: Settings, type: 'icon' },
      { id: 'logout', icon: LogOut, type: 'icon' }
    ]
  },
  '/catalog': {
    breadcrumb: ['Home', 'Catalog'],
    title: 'Catálogo',
    actions: [
      { id: 'settings', icon: Settings, type: 'icon' },
      { id: 'logout', icon: LogOut, type: 'icon' }
    ]
  }

};

// Header padrão (fallback)
export const headerData: HeaderDataType = headerConfigs['/users'];