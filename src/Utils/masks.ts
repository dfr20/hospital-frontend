// ============================================
// MASKS AND FORMATTERS
// ============================================

/**
 * Remove caracteres não numéricos de uma string
 */
export const removeNonNumeric = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Aplica máscara de telefone brasileiro: (XX) XXXXX-XXXX
 */
export const applyPhoneMask = (value: string): string => {
  const cleaned = removeNonNumeric(value);

  if (cleaned.length === 0) return '';

  if (cleaned.length <= 2) {
    return `(${cleaned}`;
  } else if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  } else if (cleaned.length <= 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
  } else {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  }
};

/**
 * Aplica máscara de CNPJ: XX.XXX.XXX/XXXX-XX
 */
export const applyCNPJMask = (value: string): string => {
  const cleaned = removeNonNumeric(value);

  return cleaned
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
};

/**
 * Aplica máscara de CUIT (Argentina): XX-XXXXXXXX-X
 */
export const applyCUITMask = (value: string): string => {
  const cleaned = removeNonNumeric(value);

  return cleaned
    .replace(/^(\d{2})(\d)/, '$1-$2')
    .replace(/^(\d{2})-(\d{8})(\d)/, '$1-$2-$3')
    .slice(0, 13);
};

/**
 * Aplica máscara de RUT (Chile/Uruguai): XX.XXX.XXX-X
 */
export const applyRUTMask = (value: string): string => {
  const cleaned = removeNonNumeric(value);

  if (cleaned.length <= 2) {
    return cleaned;
  } else if (cleaned.length <= 5) {
    return cleaned.replace(/^(\d{2})(\d)/, '$1.$2');
  } else if (cleaned.length <= 8) {
    return cleaned.replace(/^(\d{2})(\d{3})(\d)/, '$1.$2.$3');
  } else {
    return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d)/, '$1.$2.$3-$4').slice(0, 12);
  }
};

/**
 * Aplica máscara de acordo com o tipo de documento
 */
export const applyDocumentMask = (value: string, documentType: string): string => {
  switch (documentType) {
    case 'CNPJ':
      return applyCNPJMask(value);
    case 'CUIT':
      return applyCUITMask(value);
    case 'RUT':
      return applyRUTMask(value);
    case 'RUC':
    case 'NIT':
      // RUC e NIT são apenas números, sem máscara especial
      return removeNonNumeric(value).slice(0, 10);
    default:
      return value;
  }
};

/**
 * Retorna a máscara apropriada para react-input-mask
 */
export const getDocumentMaskPattern = (documentType: string): string | undefined => {
  switch (documentType) {
    case 'CNPJ':
      return '99.999.999/9999-99';
    case 'CUIT':
      return '99-99999999-9';
    case 'RUT':
      return '99.999.999-9';
    default:
      return undefined;
  }
};

/**
 * Retorna a máscara de telefone para react-input-mask
 */
export const getPhoneMaskPattern = (): string => {
  return '(99) 99999-9999';
};
