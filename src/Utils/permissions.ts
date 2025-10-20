export const RoleName = {
  DESENVOLVEDOR: 'Desenvolvedor',
  GERENTE: 'Gerente',
  ADMINISTRATIVO: 'Administrativo',
  PREGOEIRO: 'Pregoeiro'
} as const;

export type RoleNameType = typeof RoleName[keyof typeof RoleName];

export interface Permission {
  page: string;
  roles: RoleNameType[];
}

export const permissions: Permission[] = [
  {
    page: '/users',
    roles: [RoleName.GERENTE]
  },
  {
    page: '/items',
    roles: [RoleName.ADMINISTRATIVO, RoleName.GERENTE]
  },
  {
    page: '/categories',
    roles: [RoleName.ADMINISTRATIVO, RoleName.GERENTE]
  },
  {
    page: '/subcategories',
    roles: [RoleName.ADMINISTRATIVO, RoleName.GERENTE]
  },
  {
    page: '/hospitals',
    roles: [RoleName.DESENVOLVEDOR]
  },
  {
    page: '/catalog',
    roles: [RoleName.DESENVOLVEDOR]
  },
  {
    page: '/job-titles',
    roles: []
  },
  {
    page: '/dashboard',
    roles: [RoleName.DESENVOLVEDOR, RoleName.GERENTE, RoleName.ADMINISTRATIVO, RoleName.PREGOEIRO]
  },
  {
    page: '/bids',
    roles: [RoleName.PREGOEIRO]
  }
];

/**
 * Verifica se um usuário tem permissão para acessar uma página específica
 * @param userRole Nome da role do usuário
 * @param page Caminho da página
 * @returns true se o usuário tem permissão, false caso contrário
 */
export const hasPermission = (userRole: string, page: string): boolean => {
  const permission = permissions.find(p => p.page === page);

  if (!permission) {
    // Se a página não está na lista de permissões, nega acesso por padrão
    return false;
  }

  // Normaliza a role do usuário (trim e case-insensitive)
  const normalizedUserRole = userRole.trim();

  // Verifica se a role do usuário está na lista de roles permitidas
  // Usando comparação case-insensitive para ser mais flexível
  const hasAccess = permission.roles.some(
    role => role.toLowerCase() === normalizedUserRole.toLowerCase()
  );

  return hasAccess;
};

/**
 * Retorna todas as páginas que um usuário tem permissão para acessar
 * @param userRole Nome da role do usuário
 * @returns Array com os caminhos das páginas permitidas
 */
export const getAllowedPages = (userRole: string): string[] => {
  return permissions
    .filter(p => p.roles.some(role => role.toLowerCase() === userRole.toLowerCase()))
    .map(p => p.page);
};

/**
 * Verifica se um item de menu deve ser exibido para o usuário
 * @param userRole Nome da role do usuário
 * @param route Rota do item de menu
 * @returns true se deve exibir, false caso contrário
 */
export const shouldShowMenuItem = (userRole: string, route: string): boolean => {
  return hasPermission(userRole, route);
};
