import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 px-6 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-3">
      <div className="text-sm text-gray-700">
        Mostrando <span className="font-medium">{startItem}</span> a{' '}
        <span className="font-medium">{endItem}</span> de{' '}
        <span className="font-medium">{totalItems}</span> resultados
      </div>
      <div className="flex gap-2">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>
        <div className="flex items-center px-3 py-1 text-sm text-gray-700">
          Página {currentPage} de {totalPages}
        </div>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default Pagination;
