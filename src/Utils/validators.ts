export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Remove caracteres especiais de um documento (mantém apenas números)
 */
const cleanDocument = (doc: string): string => {
  return doc.replace(/\D/g, '');
};

/**
 * Verifica se todos os dígitos são iguais
 */
const allDigitsEqual = (doc: string): boolean => {
  return /^(\d)\1+$/.test(doc);
};

// ============================================
// HOSPITAL VALIDATORS
// ============================================

export const validateHospitalName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Name is required' };
  }
  if (name.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  if (name.length > 200) {
    return { isValid: false, error: 'Name must be less than 200 characters' };
  }
  if (!/^[a-zA-ZÀ-ÿ0-9\s&.\/\(\)\-]+$/.test(name)) {
    return { isValid: false, error: 'Name must contain only letters, numbers, spaces and basic punctuation (&./()-)' };
  }
  return { isValid: true };
};

export const validateNationality = (nationality: string): ValidationResult => {
  const validNationalities = ['Brasileira', 'Argentina', 'Paraguaia', 'Uruguaia', 'Boliviana', 'Chilena'];
  if (!validNationalities.includes(nationality)) {
    return { isValid: false, error: 'Nationality must be one of: Brasileira, Argentina, Paraguaia, Uruguaia, Boliviana, Chilena' };
  }
  return { isValid: true };
};

export const validateDocumentType = (documentType: string): ValidationResult => {
  const validTypes = ['CNPJ', 'CUIT', 'RUC', 'RUT', 'NIT', 'OTHER'];
  if (!validTypes.includes(documentType)) {
    return { isValid: false, error: 'Document type must be one of: CNPJ, CUIT, RUC, RUT, NIT, OTHER' };
  }
  return { isValid: true };
};

export const validateDocument = (document: string, documentType: string): ValidationResult => {
  if (!document || document.trim().length === 0) {
    return { isValid: false, error: 'Document is required' };
  }

  const cleanDoc = cleanDocument(document);

  if (document.length < 5) {
    return { isValid: false, error: 'Document must be at least 5 characters long' };
  }
  if (document.length > 30) {
    return { isValid: false, error: 'Document must be less than 30 characters' };
  }

  switch (documentType) {
    case 'CNPJ':
      if (cleanDoc.length !== 14) {
        return { isValid: false, error: 'CNPJ must have exactly 14 digits' };
      }
      if (allDigitsEqual(cleanDoc)) {
        return { isValid: false, error: 'CNPJ cannot have all digits the same' };
      }
      break;

    case 'CUIT':
      if (cleanDoc.length !== 11) {
        return { isValid: false, error: 'CUIT must have exactly 11 digits' };
      }
      if (allDigitsEqual(cleanDoc)) {
        return { isValid: false, error: 'CUIT cannot have all digits the same' };
      }
      break;

    case 'RUC':
      if (cleanDoc.length < 6 || cleanDoc.length > 9) {
        return { isValid: false, error: 'RUC must have between 6 and 9 digits' };
      }
      break;

    case 'RUT':
      if (document.length < 8 || document.length > 9) {
        return { isValid: false, error: 'RUT must have between 8 and 9 characters' };
      }
      break;

    case 'NIT':
      if (cleanDoc.length < 7 || cleanDoc.length > 10) {
        return { isValid: false, error: 'NIT must have between 7 and 10 digits' };
      }
      break;

    case 'OTHER':
      if (!/^[a-zA-Z0-9\-\.\/]+$/.test(document)) {
        return { isValid: false, error: 'Document must contain only letters, numbers, hyphens, dots and slashes' };
      }
      break;
  }

  return { isValid: true };
};

export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }
  if (email.length < 5) {
    return { isValid: false, error: 'Email must be at least 5 characters long' };
  }
  if (email.length > 100) {
    return { isValid: false, error: 'Email must be less than 100 characters' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Email must be a valid email address' };
  }

  // Validar domínio
  const domain = email.split('@')[1];
  if (!domain || !domain.includes('.')) {
    return { isValid: false, error: 'Invalid email domain format' };
  }

  return { isValid: true };
};

export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: 'Phone is required' };
  }
  if (phone.length < 8) {
    return { isValid: false, error: 'Phone must be at least 8 characters long' };
  }
  if (phone.length > 20) {
    return { isValid: false, error: 'Phone must be less than 20 characters' };
  }
  if (!/^[\+]?[\d\s\-\(\)\.]{8,20}$/.test(phone)) {
    return { isValid: false, error: 'Phone must be a valid phone number' };
  }
  return { isValid: true };
};

export const validateCity = (city: string): ValidationResult => {
  if (!city || city.trim().length === 0) {
    return { isValid: false, error: 'City is required' };
  }
  if (city.length < 2) {
    return { isValid: false, error: 'City must be at least 2 characters long' };
  }
  if (city.length > 100) {
    return { isValid: false, error: 'City must be less than 100 characters' };
  }
  if (!/^[a-zA-ZÀ-ÿ\s\-'\.]+$/.test(city)) {
    return { isValid: false, error: 'City must contain only letters, spaces, hyphens, apostrophes and dots' };
  }
  return { isValid: true };
};

// ============================================
// USER VALIDATORS
// ============================================

export const validateUserName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Name is required' };
  }
  if (name.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  if (name.length > 100) {
    return { isValid: false, error: 'Name must be less than 100 characters' };
  }
  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
    return { isValid: false, error: 'Name must contain only letters and spaces' };
  }
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.trim().length === 0) {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  if (password.length > 128) {
    return { isValid: false, error: 'Password must be less than 128 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }
  return { isValid: true };
};

// ============================================
// JOB TITLE VALIDATORS
// ============================================

export const validateJobTitle = (title: string): ValidationResult => {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: 'Title is required' };
  }
  if (title.length < 2) {
    return { isValid: false, error: 'Title must be at least 2 characters long' };
  }
  if (title.length > 100) {
    return { isValid: false, error: 'Title must be less than 100 characters' };
  }
  if (!/^[a-zA-ZÀ-ÿ0-9\s&.\/\(\)\-]+$/.test(title)) {
    return { isValid: false, error: 'Title must contain only letters, numbers, spaces and basic punctuation (&./()-)' };
  }
  return { isValid: true };
};

// ============================================
// CATEGORY VALIDATORS
// ============================================

export const validateCategoryName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Category name is required' };
  }
  if (name.length < 2) {
    return { isValid: false, error: 'Category name must be at least 2 characters long' };
  }
  if (name.length > 100) {
    return { isValid: false, error: 'Category name must be less than 100 characters' };
  }
  if (!/^[a-zA-ZÀ-ÿ0-9\s\-&\(\)\.]+$/.test(name)) {
    return { isValid: false, error: 'Category name must contain only letters, numbers, spaces, hyphens, ampersands, and parentheses' };
  }
  return { isValid: true };
};

export const validateCategoryDescription = (description: string): ValidationResult => {
  if (description && description.length > 500) {
    return { isValid: false, error: 'Category description must be less than 500 characters' };
  }
  return { isValid: true };
};

// ============================================
// SUBCATEGORY VALIDATORS
// ============================================

export const validateSubCategoryName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'SubCategory name is required' };
  }
  if (name.length < 2) {
    return { isValid: false, error: 'SubCategory name must be at least 2 characters long' };
  }
  if (name.length > 100) {
    return { isValid: false, error: 'SubCategory name must be less than 100 characters' };
  }
  if (!/^[a-zA-ZÀ-ÿ0-9\s\-&\(\)\.]+$/.test(name)) {
    return { isValid: false, error: 'SubCategory name must contain only letters, numbers, spaces, hyphens, ampersands, and parentheses' };
  }
  return { isValid: true };
};

export const validateSubCategoryDescription = (description: string): ValidationResult => {
  if (description && description.length > 500) {
    return { isValid: false, error: 'SubCategory description must be less than 500 characters' };
  }
  return { isValid: true };
};

// ============================================
// CATALOG VALIDATORS
// ============================================

export const validateCatalogName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Catalog name is required' };
  }
  if (name.length < 2) {
    return { isValid: false, error: 'Catalog name must be at least 2 characters long' };
  }
  if (name.length > 200) {
    return { isValid: false, error: 'Catalog name must be less than 200 characters' };
  }
  if (!/^[a-zA-ZÀ-ÿ0-9\s\-&\(\)\.,\/\+]+$/.test(name)) {
    return { isValid: false, error: 'Catalog name contains invalid characters' };
  }
  return { isValid: true };
};

export const validateCatalogDescription = (description: string): ValidationResult => {
  if (description && description.length > 500) {
    return { isValid: false, error: 'Catalog description must be less than 500 characters' };
  }
  return { isValid: true };
};

export const validateCatalogFullDescription = (fullDescription: string): ValidationResult => {
  if (fullDescription && fullDescription.length > 2000) {
    return { isValid: false, error: 'Catalog full description must be less than 2000 characters' };
  }
  return { isValid: true };
};

export const validateCatalogPresentation = (presentation: string): ValidationResult => {
  if (presentation && presentation.length > 100) {
    return { isValid: false, error: 'Catalog presentation must be less than 100 characters' };
  }
  return { isValid: true };
};

// ============================================
// FORM VALIDATORS
// ============================================

/**
 * Valida todos os campos de um hospital
 */
export const validateHospitalForm = (data: {
  name: string;
  nationality: string;
  document_type: string;
  document: string;
  email: string;
  phone: string;
  city: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  const nameValidation = validateHospitalName(data.name);
  if (!nameValidation.isValid) errors.name = nameValidation.error!;

  const nationalityValidation = validateNationality(data.nationality);
  if (!nationalityValidation.isValid) errors.nationality = nationalityValidation.error!;

  const docTypeValidation = validateDocumentType(data.document_type);
  if (!docTypeValidation.isValid) errors.document_type = docTypeValidation.error!;

  const docValidation = validateDocument(data.document, data.document_type);
  if (!docValidation.isValid) errors.document = docValidation.error!;

  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) errors.email = emailValidation.error!;

  const phoneValidation = validatePhone(data.phone);
  if (!phoneValidation.isValid) errors.phone = phoneValidation.error!;

  const cityValidation = validateCity(data.city);
  if (!cityValidation.isValid) errors.city = cityValidation.error!;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida todos os campos de um usuário
 */
export const validateUserForm = (data: {
  name: string;
  email: string;
  phone: string;
  password?: string;
}, isCreating = false): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  const nameValidation = validateUserName(data.name);
  if (!nameValidation.isValid) errors.name = nameValidation.error!;

  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) errors.email = emailValidation.error!;

  const phoneValidation = validatePhone(data.phone);
  if (!phoneValidation.isValid) errors.phone = phoneValidation.error!;

  if (isCreating || data.password) {
    const passwordValidation = validatePassword(data.password || '');
    if (!passwordValidation.isValid) errors.password = passwordValidation.error!;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
