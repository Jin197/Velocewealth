/**
 * Comprehensive list of world currencies with symbols.
 * Grouped by region for better UX.
 */

export type CurrencyInfo = {
  code: string;
  symbol: string;
  name: string;
  region: string;
};

export const currencies: CurrencyInfo[] = [
  // ── Europe ──
  { code: 'EUR', symbol: '€', name: 'Euro', region: 'Europe' },
  { code: 'GBP', symbol: '£', name: 'Livre sterling', region: 'Europe' },
  { code: 'CHF', symbol: 'Fr', name: 'Franc suisse', region: 'Europe' },
  { code: 'SEK', symbol: 'kr', name: 'Couronne suédoise', region: 'Europe' },
  { code: 'NOK', symbol: 'kr', name: 'Couronne norvégienne', region: 'Europe' },
  { code: 'DKK', symbol: 'kr', name: 'Couronne danoise', region: 'Europe' },
  { code: 'PLN', symbol: 'zł', name: 'Zloty polonais', region: 'Europe' },
  { code: 'CZK', symbol: 'Kč', name: 'Couronne tchèque', region: 'Europe' },
  { code: 'HUF', symbol: 'Ft', name: 'Forint hongrois', region: 'Europe' },
  { code: 'RON', symbol: 'lei', name: 'Leu roumain', region: 'Europe' },
  { code: 'BGN', symbol: 'лв', name: 'Lev bulgare', region: 'Europe' },
  { code: 'HRK', symbol: 'kn', name: 'Kuna croate', region: 'Europe' },
  { code: 'ISK', symbol: 'kr', name: 'Couronne islandaise', region: 'Europe' },
  { code: 'RSD', symbol: 'din', name: 'Dinar serbe', region: 'Europe' },
  { code: 'UAH', symbol: '₴', name: 'Hryvnia ukrainienne', region: 'Europe' },
  { code: 'RUB', symbol: '₽', name: 'Rouble russe', region: 'Europe' },
  { code: 'TRY', symbol: '₺', name: 'Livre turque', region: 'Europe' },
  { code: 'GEL', symbol: '₾', name: 'Lari géorgien', region: 'Europe' },
  { code: 'MDL', symbol: 'L', name: 'Leu moldave', region: 'Europe' },
  { code: 'ALL', symbol: 'L', name: 'Lek albanais', region: 'Europe' },
  { code: 'MKD', symbol: 'ден', name: 'Denar macédonien', region: 'Europe' },
  { code: 'BAM', symbol: 'KM', name: 'Mark convertible', region: 'Europe' },

  // ── Amériques ──
  { code: 'USD', symbol: '$', name: 'Dollar américain', region: 'Amériques' },
  { code: 'CAD', symbol: 'C$', name: 'Dollar canadien', region: 'Amériques' },
  { code: 'MXN', symbol: '$', name: 'Peso mexicain', region: 'Amériques' },
  { code: 'BRL', symbol: 'R$', name: 'Réal brésilien', region: 'Amériques' },
  { code: 'ARS', symbol: '$', name: 'Peso argentin', region: 'Amériques' },
  { code: 'CLP', symbol: '$', name: 'Peso chilien', region: 'Amériques' },
  { code: 'COP', symbol: '$', name: 'Peso colombien', region: 'Amériques' },
  { code: 'PEN', symbol: 'S/', name: 'Sol péruvien', region: 'Amériques' },
  { code: 'UYU', symbol: '$U', name: 'Peso uruguayen', region: 'Amériques' },
  { code: 'BOB', symbol: 'Bs', name: 'Boliviano', region: 'Amériques' },
  { code: 'PYG', symbol: '₲', name: 'Guarani paraguayen', region: 'Amériques' },
  { code: 'VES', symbol: 'Bs.S', name: 'Bolívar vénézuélien', region: 'Amériques' },
  { code: 'DOP', symbol: 'RD$', name: 'Peso dominicain', region: 'Amériques' },
  { code: 'CRC', symbol: '₡', name: 'Colón costaricain', region: 'Amériques' },
  { code: 'GTQ', symbol: 'Q', name: 'Quetzal guatémaltèque', region: 'Amériques' },
  { code: 'HNL', symbol: 'L', name: 'Lempira hondurien', region: 'Amériques' },
  { code: 'PAB', symbol: 'B/', name: 'Balboa panaméen', region: 'Amériques' },
  { code: 'JMD', symbol: 'J$', name: 'Dollar jamaïcain', region: 'Amériques' },
  { code: 'TTD', symbol: 'TT$', name: 'Dollar trinidadien', region: 'Amériques' },
  { code: 'HTG', symbol: 'G', name: 'Gourde haïtienne', region: 'Amériques' },

  // ── Afrique ──
  { code: 'XOF', symbol: 'F CFA', name: 'Franc CFA (BCEAO)', region: 'Afrique' },
  { code: 'XAF', symbol: 'F CFA', name: 'Franc CFA (BEAC)', region: 'Afrique' },
  { code: 'MAD', symbol: 'DH', name: 'Dirham marocain', region: 'Afrique' },
  { code: 'TND', symbol: 'DT', name: 'Dinar tunisien', region: 'Afrique' },
  { code: 'DZD', symbol: 'DA', name: 'Dinar algérien', region: 'Afrique' },
  { code: 'EGP', symbol: 'E£', name: 'Livre égyptienne', region: 'Afrique' },
  { code: 'ZAR', symbol: 'R', name: 'Rand sud-africain', region: 'Afrique' },
  { code: 'NGN', symbol: '₦', name: 'Naira nigérian', region: 'Afrique' },
  { code: 'GHS', symbol: 'GH₵', name: 'Cedi ghanéen', region: 'Afrique' },
  { code: 'KES', symbol: 'KSh', name: 'Shilling kényan', region: 'Afrique' },
  { code: 'TZS', symbol: 'TSh', name: 'Shilling tanzanien', region: 'Afrique' },
  { code: 'UGX', symbol: 'USh', name: 'Shilling ougandais', region: 'Afrique' },
  { code: 'ETB', symbol: 'Br', name: 'Birr éthiopien', region: 'Afrique' },
  { code: 'RWF', symbol: 'RF', name: 'Franc rwandais', region: 'Afrique' },
  { code: 'CDF', symbol: 'FC', name: 'Franc congolais', region: 'Afrique' },
  { code: 'AOA', symbol: 'Kz', name: 'Kwanza angolais', region: 'Afrique' },
  { code: 'MZN', symbol: 'MT', name: 'Metical mozambicain', region: 'Afrique' },
  { code: 'MGA', symbol: 'Ar', name: 'Ariary malgache', region: 'Afrique' },
  { code: 'MUR', symbol: '₨', name: 'Roupie mauricienne', region: 'Afrique' },
  { code: 'BWP', symbol: 'P', name: 'Pula botswanais', region: 'Afrique' },
  { code: 'ZMW', symbol: 'ZK', name: 'Kwacha zambien', region: 'Afrique' },
  { code: 'GMD', symbol: 'D', name: 'Dalasi gambien', region: 'Afrique' },
  { code: 'GNF', symbol: 'FG', name: 'Franc guinéen', region: 'Afrique' },
  { code: 'LYD', symbol: 'LD', name: 'Dinar libyen', region: 'Afrique' },
  { code: 'SCR', symbol: '₨', name: 'Roupie seychelloise', region: 'Afrique' },
  { code: 'CVE', symbol: '$', name: 'Escudo cap-verdien', region: 'Afrique' },
  { code: 'SOS', symbol: 'Sh', name: 'Shilling somalien', region: 'Afrique' },
  { code: 'SDG', symbol: 'LS', name: 'Livre soudanaise', region: 'Afrique' },

  // ── Asie-Pacifique ──
  { code: 'JPY', symbol: '¥', name: 'Yen japonais', region: 'Asie-Pacifique' },
  { code: 'CNY', symbol: '¥', name: 'Yuan chinois', region: 'Asie-Pacifique' },
  { code: 'INR', symbol: '₹', name: 'Roupie indienne', region: 'Asie-Pacifique' },
  { code: 'KRW', symbol: '₩', name: 'Won sud-coréen', region: 'Asie-Pacifique' },
  { code: 'AUD', symbol: 'A$', name: 'Dollar australien', region: 'Asie-Pacifique' },
  { code: 'NZD', symbol: 'NZ$', name: 'Dollar néo-zélandais', region: 'Asie-Pacifique' },
  { code: 'SGD', symbol: 'S$', name: 'Dollar singapourien', region: 'Asie-Pacifique' },
  { code: 'HKD', symbol: 'HK$', name: 'Dollar de Hong Kong', region: 'Asie-Pacifique' },
  { code: 'TWD', symbol: 'NT$', name: 'Dollar taïwanais', region: 'Asie-Pacifique' },
  { code: 'THB', symbol: '฿', name: 'Baht thaïlandais', region: 'Asie-Pacifique' },
  { code: 'MYR', symbol: 'RM', name: 'Ringgit malaisien', region: 'Asie-Pacifique' },
  { code: 'IDR', symbol: 'Rp', name: 'Roupie indonésienne', region: 'Asie-Pacifique' },
  { code: 'PHP', symbol: '₱', name: 'Peso philippin', region: 'Asie-Pacifique' },
  { code: 'VND', symbol: '₫', name: 'Đồng vietnamien', region: 'Asie-Pacifique' },
  { code: 'PKR', symbol: '₨', name: 'Roupie pakistanaise', region: 'Asie-Pacifique' },
  { code: 'BDT', symbol: '৳', name: 'Taka bangladais', region: 'Asie-Pacifique' },
  { code: 'LKR', symbol: '₨', name: 'Roupie srilankaise', region: 'Asie-Pacifique' },
  { code: 'NPR', symbol: '₨', name: 'Roupie népalaise', region: 'Asie-Pacifique' },
  { code: 'MMK', symbol: 'K', name: 'Kyat birman', region: 'Asie-Pacifique' },
  { code: 'KHR', symbol: '៛', name: 'Riel cambodgien', region: 'Asie-Pacifique' },
  { code: 'LAK', symbol: '₭', name: 'Kip laotien', region: 'Asie-Pacifique' },
  { code: 'MNT', symbol: '₮', name: 'Tugrik mongol', region: 'Asie-Pacifique' },
  { code: 'KZT', symbol: '₸', name: 'Tenge kazakh', region: 'Asie-Pacifique' },
  { code: 'UZS', symbol: 'сўм', name: 'Sum ouzbek', region: 'Asie-Pacifique' },
  { code: 'FJD', symbol: 'FJ$', name: 'Dollar fidjien', region: 'Asie-Pacifique' },
  { code: 'PGK', symbol: 'K', name: 'Kina papou-néo-guinéen', region: 'Asie-Pacifique' },

  // ── Moyen-Orient ──
  { code: 'AED', symbol: 'د.إ', name: 'Dirham des ÉAU', region: 'Moyen-Orient' },
  { code: 'SAR', symbol: '﷼', name: 'Riyal saoudien', region: 'Moyen-Orient' },
  { code: 'QAR', symbol: '﷼', name: 'Riyal qatari', region: 'Moyen-Orient' },
  { code: 'KWD', symbol: 'د.ك', name: 'Dinar koweïtien', region: 'Moyen-Orient' },
  { code: 'BHD', symbol: 'BD', name: 'Dinar bahreïni', region: 'Moyen-Orient' },
  { code: 'OMR', symbol: '﷼', name: 'Rial omanais', region: 'Moyen-Orient' },
  { code: 'JOD', symbol: 'JD', name: 'Dinar jordanien', region: 'Moyen-Orient' },
  { code: 'ILS', symbol: '₪', name: 'Shekel israélien', region: 'Moyen-Orient' },
  { code: 'LBP', symbol: 'L£', name: 'Livre libanaise', region: 'Moyen-Orient' },
  { code: 'IQD', symbol: 'ع.د', name: 'Dinar irakien', region: 'Moyen-Orient' },
  { code: 'IRR', symbol: '﷼', name: 'Rial iranien', region: 'Moyen-Orient' },
  { code: 'AFN', symbol: '؋', name: 'Afghani afghan', region: 'Moyen-Orient' },
];

/** Get unique region labels in display order */
export const currencyRegions = [
  'Europe',
  'Amériques',
  'Afrique',
  'Moyen-Orient',
  'Asie-Pacifique',
] as const;

/** Group currencies by region */
export function getCurrenciesByRegion() {
  return currencyRegions.map((region) => ({
    region,
    currencies: currencies.filter((c) => c.region === region),
  }));
}

/** Find a currency by code */
export function findCurrency(code: string): CurrencyInfo | undefined {
  return currencies.find((c) => c.code === code);
}
