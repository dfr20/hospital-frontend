// ============================================
// CONSTANTS - Form Options & Enums
// ============================================
// Based on backend validation rules
// Last updated: 2025-10-11

export interface SelectOption {
  value: string;
  label: string;
}

// ============================================
// NACIONALIDADES (Mercosul e Associados)
// ============================================

export const NATIONALITIES: SelectOption[] = [
  { value: 'Brasileira', label: 'Brasileira 🇧🇷' },
  { value: 'Argentina', label: 'Argentina 🇦🇷' },
  { value: 'Paraguaia', label: 'Paraguaia 🇵🇾' },
  { value: 'Uruguaia', label: 'Uruguaia 🇺🇾' },
  { value: 'Boliviana', label: 'Boliviana 🇧🇴' },
  { value: 'Chilena', label: 'Chilena 🇨🇱' },
];

// ============================================
// TIPOS DE DOCUMENTO (Empresas)
// ============================================

export const DOCUMENT_TYPES: SelectOption[] = [
  { value: 'CNPJ', label: 'CNPJ' },
  { value: 'CUIT', label: 'CUIT' },
  { value: 'RUC', label: 'RUC' },
  { value: 'RUT', label: 'RUT' },
  { value: 'NIT', label: 'NIT' },
  { value: 'OTHER', label: 'Outro' },
];

// ============================================
// MAPA DE DOCUMENTO POR NACIONALIDADE
// ============================================

export const DOCUMENT_TYPE_BY_NATIONALITY: Record<string, string[]> = {
  Brasileira: ['CNPJ'],
  Argentina: ['CUIT'],
  Paraguaia: ['RUC'],
  Uruguaia: ['RUT'],
  Chilena: ['RUT'],
  Boliviana: ['NIT'],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Retorna os tipos de documento válidos para uma nacionalidade
 */
export const getDocumentTypesForNationality = (nationality: string): SelectOption[] => {
  const validTypes = DOCUMENT_TYPE_BY_NATIONALITY[nationality];

  if (!validTypes) {
    return DOCUMENT_TYPES;
  }

  return DOCUMENT_TYPES.filter(doc =>
    validTypes.includes(doc.value) || doc.value === 'OTHER'
  );
};

/**
 * Retorna o formato esperado para um tipo de documento
 */
export const getDocumentFormat = (documentType: string): string => {
  const formats: Record<string, string> = {
    CNPJ: 'XX.XXX.XXX/XXXX-XX',
    CUIT: 'XX-XXXXXXXX-X',
    RUC: 'XXXXXX (6-9 dígitos)',
    RUT: 'XX.XXX.XXX-X (8-9 caracteres)',
    NIT: 'XXXXXXX (7-10 dígitos)',
    OTHER: 'Formato livre',
  };

  return formats[documentType] || 'Formato livre';
};

/**
 * Formata um documento de acordo com seu tipo
 */
export const formatDocument = (document: string, documentType: string): string => {
  const cleanDoc = document.replace(/\D/g, '');

  switch (documentType) {
    case 'CNPJ':
      // Formato: XX.XXX.XXX/XXXX-XX
      if (cleanDoc.length === 14) {
        return cleanDoc.replace(
          /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
          '$1.$2.$3/$4-$5'
        );
      }
      break;

    case 'CUIT':
      // Formato: XX-XXXXXXXX-X
      if (cleanDoc.length === 11) {
        return cleanDoc.replace(
          /^(\d{2})(\d{8})(\d{1})$/,
          '$1-$2-$3'
        );
      }
      break;

    case 'RUT':
      // Formato: XX.XXX.XXX-X
      if (cleanDoc.length >= 8 && cleanDoc.length <= 9) {
        const rut = cleanDoc.slice(0, -1);
        const dv = cleanDoc.slice(-1);

        if (rut.length <= 2) return `${rut}-${dv}`;
        if (rut.length <= 5) return `${rut.slice(0, -3)}.${rut.slice(-3)}-${dv}`;

        return `${rut.slice(0, -6)}.${rut.slice(-6, -3)}.${rut.slice(-3)}-${dv}`;
      }
      break;
  }

  return document;
};
