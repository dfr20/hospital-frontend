// ============================================
// COUNTRY CODES WITH FLAGS
// ============================================

export interface CountryCode {
  code: string;
  country: string;
  flag: string;
  dialCode: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: 'BR', country: 'Brasil', flag: '🇧🇷', dialCode: '+55' },
  { code: 'AR', country: 'Argentina', flag: '🇦🇷', dialCode: '+54' },
  { code: 'PY', country: 'Paraguai', flag: '🇵🇾', dialCode: '+595' },
  { code: 'UY', country: 'Uruguai', flag: '🇺🇾', dialCode: '+598' },
  { code: 'CL', country: 'Chile', flag: '🇨🇱', dialCode: '+56' },
  { code: 'BO', country: 'Bolívia', flag: '🇧🇴', dialCode: '+591' },
  { code: 'PE', country: 'Peru', flag: '🇵🇪', dialCode: '+51' },
  { code: 'CO', country: 'Colômbia', flag: '🇨🇴', dialCode: '+57' },
  { code: 'VE', country: 'Venezuela', flag: '🇻🇪', dialCode: '+58' },
  { code: 'EC', country: 'Equador', flag: '🇪🇨', dialCode: '+593' },
];

/**
 * Retorna o código de país baseado no DDI
 */
export const getCountryByDialCode = (dialCode: string): CountryCode | undefined => {
  return COUNTRY_CODES.find(country => country.dialCode === dialCode);
};

/**
 * Retorna o DDI baseado no código do país
 */
export const getDialCodeByCountry = (countryCode: string): string => {
  const country = COUNTRY_CODES.find(c => c.code === countryCode);
  return country?.dialCode || '+55';
};

/**
 * Formata o número de telefone completo com DDI
 */
export const formatPhoneWithDialCode = (dialCode: string, phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  return `${dialCode}${cleanPhone}`;
};

/**
 * Separa o DDI do número de telefone
 */
export const parsePhoneWithDialCode = (fullPhone: string): { dialCode: string; phone: string } => {
  for (const country of COUNTRY_CODES) {
    if (fullPhone.startsWith(country.dialCode)) {
      return {
        dialCode: country.dialCode,
        phone: fullPhone.substring(country.dialCode.length)
      };
    }
  }

  // Default para Brasil
  return {
    dialCode: '+55',
    phone: fullPhone.replace(/\D/g, '')
  };
};
