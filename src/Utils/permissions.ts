export const RoleName = {
  DESENVOLVEDOR: 'Desenvolvedor',
  GERENTE: 'Gerente',
  ADMINISTRADOR: 'Administrador',
  PREGOEIRO: 'Pregoeiro',
  AVALIADOR_TECNICO: 'Avaliador Técnico',
  AVALIADOR_FUNCIONAL: 'Avaliador Funcional'
} as const;

export type RoleNameType = typeof RoleName[keyof typeof RoleName];

export interface Permission {
  page: string;
  roles: RoleNameType[];
}

export const permissions: Permission[] = [
  // Usuários - Desenvolvedor, Administrador e Gerente
  {
    page: '/users',
    roles: [RoleName.DESENVOLVEDOR, RoleName.ADMINISTRADOR, RoleName.GERENTE]
  },
  // Itens - Administrador e Gerente
  {
    page: '/items',
    roles: [RoleName.ADMINISTRADOR, RoleName.GERENTE]
  },
  // Categorias - Administrador e Gerente
  {
    page: '/categories',
    roles: [RoleName.ADMINISTRADOR, RoleName.GERENTE]
  },
  // Subcategorias - Administrador e Gerente
  {
    page: '/subcategories',
    roles: [RoleName.ADMINISTRADOR, RoleName.GERENTE]
  },
  // Hospitais - Apenas Desenvolvedor
  {
    page: '/hospitals',
    roles: [RoleName.DESENVOLVEDOR]
  },
  // Catálogo - Apenas Desenvolvedor
  {
    page: '/catalog',
    roles: [RoleName.DESENVOLVEDOR]
  },
  // Fornecedores - Administrador e Gerente
  {
    page: '/suppliers',
    roles: [RoleName.ADMINISTRADOR, RoleName.GERENTE]
  },
  // Cargos - Apenas Desenvolvedor
  {
    page: '/job-titles',
    roles: [RoleName.DESENVOLVEDOR]
  },
  // Dashboard - Todos os cargos
  {
    page: '/dashboard',
    roles: [RoleName.DESENVOLVEDOR, RoleName.GERENTE, RoleName.ADMINISTRADOR, RoleName.PREGOEIRO, RoleName.AVALIADOR_TECNICO, RoleName.AVALIADOR_FUNCIONAL]
  },
  // Licitações Públicas - Todos os cargos exceto Desenvolvedor
  {
    page: '/public-acquisitions',
    roles: [RoleName.ADMINISTRADOR, RoleName.GERENTE, RoleName.PREGOEIRO, RoleName.AVALIADOR_TECNICO, RoleName.AVALIADOR_FUNCIONAL]
  },
  // Questões - Administrador e Gerente
  {
    page: '/questions',
    roles: [RoleName.ADMINISTRADOR, RoleName.GERENTE]
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
