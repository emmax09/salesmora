const COUNTRY_CODES = `AD AE AF AG AI AL AM AO AR AT AU AW AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ES ET FI FJ FM FR GA GB GD GE GH GM GN GR GT GW GY HK HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KR KW KZ LA LB LC LK LR LS LT LU LV MA MD ME MG MK ML MM MN MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TW TZ UA UG US UY UZ VC VE VN VU WS YE ZA ZM ZW`;
const CURRENCIES = `USD EUR GBP NGN CAD AUD NZD INR JPY CNY SGD HKD AED SAR ZAR KES GHS UGX TZS XOF XAF CHF SEK NOK DKK PLN CZK HUF RON TRY BRL MXN ARS CLP COP PEN IDR MYR THB PHP KRW PKR BDT EGP MAD`;
const INDUSTRIES = [
  'Agriculture',
  'Construction',
  'Education',
  'Financial services',
  'Healthcare',
  'Hospitality',
  'Manufacturing',
  'Media and entertainment',
  'Nonprofit',
  'Professional services',
  'Retail',
  'Software and technology',
  'Transportation and logistics',
  'Other',
];

export function getCountryOptions() {
  const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
  return COUNTRY_CODES.split(' ')
    .map((code) => ({ code, name: displayNames.of(code) ?? code }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const currencyOptions = CURRENCIES.split(' ');
export const industryOptions = INDUSTRIES;
export const timezoneOptions =
  typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('timeZone')
    : ['UTC', 'Africa/Lagos', 'Europe/London', 'America/New_York', 'Asia/Tokyo'];

export function defaultCurrencyForCountry(country: string): string {
  if (country === 'NG') return 'NGN';
  if (country === 'GB') return 'GBP';
  if (country === 'US') return 'USD';
  if (country === 'CA') return 'CAD';
  if (country === 'AU') return 'AUD';
  if (country === 'IN') return 'INR';
  if ('AT BE CY DE EE ES FI FR GR HR IE IT LT LU LV MT NL PT SI SK'.split(' ').includes(country))
    return 'EUR';
  return 'USD';
}
