import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useHospital } from '../../Hooks/useHospital';
import { useUsers } from '../../Hooks/useUsers';
import { useJobTitles } from '../../Hooks/useJobTitles';
import { useCatalog } from '../../Hooks/useCatalog';
import type { Hospital } from '../../Types/Hospital';
import type { User } from '../../Types/User';
import type { JobTitle } from '../../Types/JobTitle';
import type { Catalog } from '../../Types/Catalog';

type SearchType = 'hospital' | 'user' | 'jobTitle' | 'catalog';

type SearchResult = {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
};

interface SearchDataProps {
  onSelect: (item: SearchResult) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  disabled?: boolean;
  searchType?: SearchType;
}

export const SearchData: React.FC<SearchDataProps> = ({
  onSelect,
  placeholder,
  className = "",
  initialValue = "",
  disabled = false,
  searchType: forcedSearchType
}) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(true);

  // Determinar o tipo de busca baseado na rota atual
  const getSearchType = (): SearchType => {
    if (forcedSearchType) return forcedSearchType;

    const path = location.pathname.toLowerCase();
    if (path.includes('hospital')) return 'hospital';
    if (path.includes('user')) return 'user';
    if (path.includes('job-title') || path.includes('cargo')) return 'jobTitle';
    if (path.includes('catalog')) return 'catalog';

    return 'hospital'; // default
  };

  const searchType = getSearchType();

  // Hooks - TODOS devem ser chamados no nível superior do componente
  const { fetchHospitalByName } = useHospital();
  const { fetchUsers } = useUsers();
  const { fetchJobTitleByTitle } = useJobTitles();
  const { fetchCatalogByName } = useCatalog();

  // Chamar todos os hooks no nível superior (Rules of Hooks)
  // Usar enabled para só executar a query quando necessário
  const shouldFetch = debouncedTerm.length >= 2;

  const hospitalQuery = fetchHospitalByName(debouncedTerm, shouldFetch && searchType === 'hospital');
  const usersQuery = fetchUsers(1, 25, shouldFetch && searchType === 'user');
  const jobTitleQuery = fetchJobTitleByTitle(debouncedTerm, shouldFetch && searchType === 'jobTitle');
  const catalogQuery = fetchCatalogByName(debouncedTerm, shouldFetch && searchType === 'catalog');

  // Debounce do termo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Selecionar os dados corretos baseado no tipo de busca
  const getSearchResults = (): { data: any; isLoading: boolean } => {
    if (!debouncedTerm || debouncedTerm.length < 2) {
      return { data: null, isLoading: false };
    }

    switch (searchType) {
      case 'hospital': {
        // Garantir que retorna um array e filtrar pelo nome
        const hospitalData = Array.isArray(hospitalQuery.data)
          ? hospitalQuery.data
          : (hospitalQuery.data as any)?.items || [];

        const filteredHospitals = hospitalData.filter((hospital: Hospital) =>
          hospital.name.toLowerCase().includes(debouncedTerm.toLowerCase())
        );
        return { data: filteredHospitals, isLoading: hospitalQuery.isLoading };
      }
      case 'user': {
        // Filtrar usuários pelo nome
        const filteredUsers = usersQuery.data?.items?.filter((user: User) =>
          user.name.toLowerCase().includes(debouncedTerm.toLowerCase())
        ) || [];
        return { data: filteredUsers, isLoading: usersQuery.isLoading };
      }
      case 'jobTitle': {
        // Garantir que retorna um array e filtrar pelo título
        const jobTitleData = Array.isArray(jobTitleQuery.data)
          ? jobTitleQuery.data
          : (jobTitleQuery.data as any)?.items || [];

        const filteredJobTitles = jobTitleData.filter((jobTitle: JobTitle) =>
          jobTitle.title.toLowerCase().includes(debouncedTerm.toLowerCase())
        );
        return { data: filteredJobTitles, isLoading: jobTitleQuery.isLoading };
      }
      case 'catalog': {
        // Garantir que retorna um array e filtrar pelo nome
        const catalogData = Array.isArray(catalogQuery.data)
          ? catalogQuery.data
          : (catalogQuery.data as any)?.items || [];

        const filteredCatalogs = catalogData.filter((catalog: Catalog) =>
          catalog.name.toLowerCase().includes(debouncedTerm.toLowerCase())
        );
        return { data: filteredCatalogs, isLoading: catalogQuery.isLoading };
      }
      default:
        return { data: null, isLoading: false };
    }
  };

  const { data: searchData, isLoading } = getSearchResults();

  // Converter dados para formato unificado
  const getItems = (): SearchResult[] => {
    if (!searchData) return [];
    if (!Array.isArray(searchData)) return [];

    switch (searchType) {
      case 'hospital':
        return (searchData as Hospital[]).map((hospital) => ({
          id: hospital.public_id,
          name: hospital.name,
          subtitle: hospital.city,
          description: hospital.email
        }));
      case 'user':
        return (searchData as User[]).map((user) => ({
          id: user.public_id,
          name: user.name,
          subtitle: user.job_title?.title || '',
          description: user.email
        }));
      case 'jobTitle':
        return (searchData as JobTitle[]).map((jobTitle) => ({
          id: jobTitle.public_id,
          name: jobTitle.title,
          subtitle: '',
          description: ''
        }));
      case 'catalog':
        return (searchData as Catalog[]).map((catalog) => ({
          id: catalog.public_id,
          name: catalog.name,
          subtitle: catalog.description,
          description: catalog.presentation
        }));
      default:
        return [];
    }
  };

  const items = getItems();

  // Placeholder dinâmico
  const getPlaceholder = (): string => {
    if (placeholder) return placeholder;

    switch (searchType) {
      case 'hospital':
        return 'Digite o nome do hospital...';
      case 'user':
        return 'Digite o nome do usuário...';
      case 'jobTitle':
        return 'Digite o nome do cargo...';
      case 'catalog':
        return 'Digite o nome do item...';
      default:
        return 'Digite para buscar...';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (items.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(items[selectedIndex]);
        }
        break;
      case 'Escape':
        setSearchTerm('');
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelect = (item: SearchResult) => {
    setSearchTerm(item.name);
    setSelectedIndex(-1);
    setShowDropdown(false);
    onSelect(item);
  };

  const getEmptyMessage = (): string => {
    switch (searchType) {
      case 'hospital':
        return 'Nenhum hospital encontrado';
      case 'user':
        return 'Nenhum usuário encontrado';
      case 'jobTitle':
        return 'Nenhum cargo encontrado';
      case 'catalog':
        return 'Nenhum item encontrado';
      default:
        return 'Nenhum resultado encontrado';
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          placeholder={getPlaceholder()}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled || !!initialValue}
          className={`border p-3 rounded-lg w-full focus:ring-2 focus:ring-teal-500 outline-none pr-10 ${
            disabled || !!initialValue ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : ''
          } ${className}`}
        />
        <div className="absolute right-3 top-3.5">
          {isLoading ? (
            <div className="animate-spin h-4 w-4 border-2 border-teal-500 border-t-transparent rounded-full"></div>
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {!disabled && !initialValue && showDropdown && (items.length > 0 || (debouncedTerm.length >= 2 && !isLoading)) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {items.length > 0 ? (
            <ul>
              {items.map((item, index) => (
                <li
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`p-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                    index === selectedIndex
                      ? 'bg-teal-50 border-teal-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{item.name}</div>
                  {item.subtitle && (
                    <div className="text-sm text-gray-600">{item.subtitle}</div>
                  )}
                  {item.description && (
                    <div className="text-xs text-gray-500">{item.description}</div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-sm text-gray-500 text-center">
              {getEmptyMessage()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchData;
