/* ============================================================
   FACILITY MODULE — Real Data
   Source: Book1.pdf — PHCC Grant Coverage Tracker (Lebanon)
   ============================================================ */

export const GRANTS = [
  { id:  1, code: 'AFD',      name: 'Agence Française de Développement',       donor: 'AFD France',        color: 'main'      },
  { id:  2, code: 'AFD2',     name: 'AFD — Phase 2',                            donor: 'AFD France',        color: 'green'     },
  { id:  3, code: 'NDICI',    name: 'NDICI — Global Europe Instrument',         donor: 'European Union',    color: 'secondary' },
  { id:  4, code: 'NDICI2',   name: 'NDICI — Phase 2',                          donor: 'European Union',    color: 'amber'     },
  { id:  5, code: 'LHF1',     name: 'Lebanon Humanitarian Fund 1',              donor: 'OCHA / LHF',        color: 'coral'     },
  { id:  6, code: 'LHF 79',   name: 'Lebanon Humanitarian Fund 79',             donor: 'OCHA / LHF',        color: 'teal'      },
  { id:  7, code: 'LHF 011',  name: 'Lebanon Humanitarian Fund 011',            donor: 'OCHA / LHF',        color: 'coral'     },
  { id:  8, code: 'LHF 78',   name: 'Lebanon Humanitarian Fund 78',             donor: 'OCHA / LHF',        color: 'teal'      },
  { id:  9, code: 'LHF3',     name: 'Lebanon Humanitarian Fund 3',              donor: 'OCHA / LHF',        color: 'coral'     },
  { id: 10, code: 'LHF26001', name: 'Lebanon Humanitarian Fund 26001',          donor: 'OCHA / LHF',        color: 'amber'     },
  { id: 11, code: 'BHA',      name: 'Bureau for Humanitarian Assistance',       donor: 'USAID',             color: 'main'      },
  { id: 12, code: 'IOM',      name: 'International Organization for Migration', donor: 'IOM',               color: 'secondary' },
  { id: 13, code: 'SIDA',     name: 'Swedish International Development Agency', donor: 'Sweden / Sida',    color: 'green'     },
  { id: 14, code: 'QFFD',     name: 'Qatar Fund for Development',               donor: 'Qatar / QFFD',     color: 'amber'     },
];

export const grantByCode = (code) => {
  if (!code) return null;
  return GRANTS.find(g => g.code === code) || null;
};

/* ─── Monthly coverage per facility for 2025 ───────────────
   Index 0 = January … Index 11 = December
   null = no coverage that month
──────────────────────────────────────────────────────────── */
export const COVERAGE_2025 = {
  1:  ['AFD','AFD','AFD','AFD','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','AFD2','AFD2'],
  2:  ['AFD','AFD','AFD','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','AFD2','AFD2'],
  3:  ['AFD','AFD','AFD','AFD','AFD','AFD2','AFD2','AFD2','NDICI','NDICI','NDICI2','NDICI2'],
  4:  ['AFD','AFD','AFD','AFD','AFD','AFD','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2'],
  5:  ['LHF1','LHF1','LHF1','LHF1','LHF1','LHF1','NDICI','NDICI','NDICI','NDICI','LHF 79','LHF 79'],
  6:  ['LHF1','LHF1','LHF1','LHF1','LHF1','LHF1','NDICI','NDICI','NDICI','NDICI','NDICI2','NDICI2'],
  7:  ['BHA','BHA','BHA','BHA','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI2','NDICI2'],
  8:  ['BHA','BHA','BHA','BHA','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','AFD2','AFD2'],
  9:  ['BHA','BHA','BHA','BHA','NDICI','NDICI','NDICI','NDICI','NDICI','LHF 79','LHF 79','LHF 79'],
  10: ['LHF 79','LHF 79','LHF 79','LHF 79','LHF 79','LHF 79','LHF 79','LHF 79','LHF 79',null,null,null],
  11: ['NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI2','NDICI2'],
  12: ['NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI2','NDICI2'],
  13: ['AFD','AFD','AFD','AFD','AFD','AFD2','AFD2','AFD2','NDICI','NDICI','NDICI2','NDICI2'],
  14: ['NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','AFD2','AFD2','AFD2'],
  15: ['NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI2','NDICI2'],
  16: ['NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI2','NDICI2'],
  17: ['NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI2','NDICI2'],
  18: ['LHF3','LHF 011','LHF 011','LHF 011','LHF 011','LHF 011','LHF 011','LHF 011','LHF 011','LHF 011','NDICI2','NDICI2'],
  19: ['LHF 011','LHF 011','LHF 011','LHF 011','LHF 011','LHF 011','LHF 011','LHF 011','LHF 011','LHF 011','AFD2','AFD2'],
  20: ['NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','LHF 78','LHF 78','LHF 78','LHF 78'],
  21: ['NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI2','NDICI2'],
  22: ['NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI2','NDICI2'],
  23: ['NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI2','NDICI2'],
  24: ['AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2',null,null],
  25: [null,null,null,null,null,null,'AFD2','AFD2','AFD2','AFD2','AFD2','AFD2'],
  26: ['LHF26001','LHF26001','LHF26001','LHF26001','LHF26001','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2'],
  27: ['NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','SIDA','SIDA'],
  28: ['NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','SIDA','SIDA'],
  29: [null,null,null,null,null,null,null,null,null,null,null,null],
  30: ['NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI',null,null],
  31: ['NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI',null,null,null],
  32: ['NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI',null,null,null,null],
  33: ['NDICI','NDICI','NDICI','NDICI','NDICI','NDICI',null,null,null,null,null,null],
  34: ['AFD','AFD','AFD','IOM','IOM','IOM',null,null,null,null,null,null],
  35: ['NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI',null,null],
  36: ['NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI',null,null],
  37: ['NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI',null,null],
  38: ['NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI','NDICI',null,null],
  39: ['NDICI','NDICI','NDICI','NDICI',null,null,null,null,null,null,null,null],
  40: ['NDICI','NDICI','NDICI','NDICI',null,null,null,null,null,null,null,null],
};

/* ─── 2026 coverage (from PDF where visible) ──────────────── */
export const COVERAGE_2026 = {
  1:  ['AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2'],
  2:  ['AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2'],
  3:  ['NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2'],
  4:  ['AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2','AFD2'],
  5:  ['LHF 79','LHF 79','LHF 79','LHF 79','LHF 79','LHF 79','LHF 79','LHF 79','NDICI2','NDICI2','NDICI2','NDICI2'],
  6:  ['NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2'],
  7:  ['NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2'],
  8:  ['NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2'],
  9:  ['LHF 79','LHF 79','LHF 79','LHF 79','LHF 79','LHF 79','LHF 79','LHF 79','NDICI2','NDICI2','NDICI2','NDICI2'],
  11: ['NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2'],
  12: ['NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2'],
  13: ['NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2'],
  15: ['NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2'],
  16: ['NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2'],
  17: ['NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2'],
  18: ['NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2'],
  19: ['AFD2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2'],
  20: ['LHF 78','LHF 78','LHF 78','LHF 78','LHF 78','LHF 78','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2'],
  21: ['NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2'],
  22: ['NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2'],
  23: ['NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2'],
  26: ['NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2','NDICI2'],
};

/* ─── Facility definitions ───────────────────────────────── */
const JUNE_2025_IDX = 5; // 0-based

const buildFacility = (id, name, type, district, base, address, coords, notes, updatedBy = 'Operations Team') => {
  const months2025 = COVERAGE_2025[id] || [];
  const currentCode = months2025[JUNE_2025_IDX] || null;
  const mainGrant   = grantByCode(currentCode);
  const status      = mainGrant
    ? 'Active'
    : months2025.some(Boolean) ? 'Inactive' : 'Inactive';

  return {
    id, name, type, area: district, base, address, coordinates: coords,
    status, notes, updatedBy,
    mainGrant,
    secondaryGrants: [],
    lastUpdated: '2025-06-01',
    createdAt:   '2024-01-01',
  };
};

export const FACILITIES = [
  buildFacility(1,  'Qana PHCC',               'PHCC',             'South',        'Saida',   'Qana, South Lebanon',                       '33.2176° N, 35.3028° E', 'Primary healthcare center serving Qana sub-district.'),
  buildFacility(2,  'St Paul PHCC',             'PHCC',             'AKKAR',        'Tripoli', 'AKKAR District, North Lebanon',             '34.5528° N, 36.3130° E', 'AKKAR district PHCC serving northern communities.'),
  buildFacility(3,  'Makhzoumi PHCC',           'PHCC',             'BML',          'Saida',   'Beirut Mount Lebanon District',             '33.8547° N, 35.5442° E', 'BML district PHCC — high beneficiary volume.'),
  buildFacility(4,  'TGH',                      'Teaching Hospital', 'Tripoli',     'Tripoli', 'Tripoli, North Lebanon',                    '34.4332° N, 35.8499° E', 'Teaching General Hospital — referral center for North Lebanon.'),
  buildFacility(5,  'Qabrikha PHCC',            'PHCC',             'South',        'Saida',   'Qabrikha, South Lebanon',                   '33.2740° N, 35.3690° E', 'South Lebanon PHCC.'),
  buildFacility(6,  'Nabatiyeh PHCC',           'PHCC',             'Nabatiyeh',    'Saida',   'Nabatiyeh City, South Lebanon',             '33.3777° N, 35.4836° E', 'Urban PHCC in Nabatiyeh city center.'),
  buildFacility(7,  'RH Saida',                 'Referral Hospital', 'Saida',       'Saida',   'Saida City, South Lebanon',                 '33.5597° N, 35.3732° E', 'Referral hospital for Saida and South Lebanon.'),
  buildFacility(8,  'RH Chebaa',                'Referral Hospital', 'Hasbaya',     'Saida',   'Chebaa, Hasbaya District',                  '33.5659° N, 35.6450° E', 'Referral hospital in the Hasbaya area.'),
  buildFacility(9,  'Maarake PHCC',             'PHCC',             'Nabatiyeh',    'Saida',   'Maarake, Nabatiyeh District',               '33.2953° N, 35.3968° E', 'PHCC covering Maarake and surrounding villages.'),
  buildFacility(10, 'Jbaa PHCC',               'PHCC',             'Nabatiyeh',    'Saida',   'Jbaa, Nabatiyeh District',                  '33.3558° N, 35.4162° E', 'LHF 79 funded PHCC — active through Q3 2025.'),
  buildFacility(11, 'Serepta PHCC',             'PHCC',             'South',        'Saida',   'Serepta, South Lebanon',                    '33.2520° N, 35.2860° E', 'South Lebanon PHCC serving coastal communities.'),
  buildFacility(12, 'Ghazieh PHCC',             'PHCC',             'South',        'Saida',   'Ghazieh, Saida District',                   '33.5204° N, 35.3701° E', 'PHCC north of Saida city.'),
  buildFacility(13, 'Mar Antonios PHCC',        'PHCC',             'BML',          'Saida',   'Beirut Mount Lebanon District',             '33.8730° N, 35.5140° E', 'BML district PHCC.'),
  buildFacility(14, 'Iklim PHCC',               'PHCC',             'Chouf',        'Saida',   'Iklim El Kharroub, Chouf District',         '33.6019° N, 35.4236° E', 'PHCC in Chouf district — transitioning to AFD2 in Q4 2025.'),
  buildFacility(15, 'Baakleen PHCC',            'PHCC',             'Chouf',        'Saida',   'Baakleen, Chouf District',                  '33.6633° N, 35.5450° E', 'Mountain PHCC serving Chouf communities.'),
  buildFacility(16, 'Choueifat PHCC',           'PHCC',             'BML',          'Saida',   'Choueifat, Greater Beirut',                 '33.7880° N, 35.5040° E', 'PHCC serving suburban Beirut population.'),
  buildFacility(17, 'Hariri PHCC Beirut',       'PHCC',             'BML',          'Saida',   'Beirut, Lebanon',                           '33.8938° N, 35.5018° E', 'Urban Beirut PHCC with high catchment area.'),
  buildFacility(18, 'Baalchmay PHCC',           'PHCC',             'Aley',         'Saida',   'Baalchmay, Aley District',                  '33.7858° N, 35.6265° E', 'PHCC transitioning from LHF3 → LHF 011 → NDICI2 in 2025.'),
  buildFacility(19, 'Farouk PHCC',              'PHCC',             'Minnieh',      'Tripoli', 'Minnieh-Danniyeh, North Lebanon',           '34.4890° N, 36.0610° E', 'North Lebanon PHCC transitioning from LHF 011 to AFD2.'),
  buildFacility(20, 'Salemtak PHCC',            'PHCC',             'AKKAR',        'Tripoli', 'AKKAR District, North Lebanon',             '34.5870° N, 36.0090° E', 'PHCC transitioning from NDICI to LHF 78 in Q3 2025.'),
  buildFacility(21, 'Irshad PHCC',              'PHCC',             'AKKAR',        'Tripoli', 'AKKAR District, North Lebanon',             '34.6270° N, 36.1380° E', 'AKKAR district PHCC.'),
  buildFacility(22, 'Fneidek PHCC',             'PHCC',             'AKKAR',        'Tripoli', 'Fneidek, AKKAR District',                   '34.7360° N, 36.0470° E', 'Northern AKKAR PHCC near Syrian border.'),
  buildFacility(23, 'Rahmah PHCC',              'PHCC',             'Tripoli',      'Tripoli', 'Tripoli City, North Lebanon',               '34.4364° N, 35.8497° E', 'Urban PHCC within Tripoli city.'),
  buildFacility(24, 'REMEDY PHCC',              'PHCC',             'AKKAR',        'Tripoli', 'AKKAR District, North Lebanon',             '34.6430° N, 36.0890° E', 'AKKAR PHCC under AFD2 coverage throughout 2025.'),
  buildFacility(25, 'Baalbeck PHCC',            'PHCC',             'Baalbek',      'Tripoli', 'Baalbek City, Baalbek-Hermel Governorate',  '34.0042° N, 36.2118° E', 'Coverage commencing July 2025 under AFD2.'),
  buildFacility(26, 'Qaa PHCC',                 'PHCC',             'Baalbek',      'Tripoli', 'Qaa, Baalbek-Hermel Governorate',           '34.2810° N, 36.5270° E', 'Border area PHCC — transitioning LHF26001 → NDICI2.'),
  buildFacility(27, 'Ghoubeiry PHCC',           'PHCC',             'BML',          'Saida',   'Ghoubeiry, Southern Suburbs Beirut',        '33.8505° N, 35.5215° E', 'High-density suburban Beirut PHCC — transitioning to SIDA in Q4.'),
  buildFacility(28, 'Imam Rida PHCC',           'PHCC',             'BML',          'Saida',   'BML District, Lebanon',                     '33.8650° N, 35.5190° E', 'BML PHCC transitioning to SIDA in Q4 2025.'),
  buildFacility(29, 'Nozha PHCC',               'PHCC',             'Tripoli',      'Tripoli', 'Tripoli City, North Lebanon',               '34.4378° N, 35.8340° E', 'No active coverage in current period. Pending activation.'),
  buildFacility(30, 'Khiam PHCC',               'PHCC',             'Nabatiyeh',    'Saida',   'Khiam, Nabatiyeh District',                 '33.3525° N, 35.5934° E', 'PHCC near Israeli border — coverage active Jan–Oct 2025.'),
  buildFacility(31, 'Barouk PHCC',              'PHCC',             'Chouf',        'Saida',   'Barouk, Chouf District',                    '33.6727° N, 35.6532° E', 'Mountain PHCC — coverage Jan–Sep 2025.'),
  buildFacility(32, 'Miriata PHCC',             'PHCC',             'Tripoli',      'Tripoli', 'Tripoli District, North Lebanon',           '34.4730° N, 35.9240° E', 'PHCC — coverage Jan–Aug 2025.'),
  buildFacility(33, 'Qaser PHCC',               'PHCC',             'Hermel',       'Tripoli', 'Qaser, Hermel District',                    '34.3830° N, 36.4600° E', 'Remote PHCC in Hermel — coverage Jan–Jun 2025.'),
  buildFacility(34, 'Hazmieh PHCC',             'PHCC',             'BML',          'Saida',   'Hazmieh, Greater Beirut',                   '33.8503° N, 35.5578° E', 'Transitioning from AFD to IOM coverage Jan–Jun 2025.'),
  buildFacility(35, 'Khatam Anbiaa PHCC',       'PHCC',             'BML',          'Saida',   'BML District, Lebanon',                     '33.8650° N, 35.5000° E', 'BML PHCC active Jan–Oct 2025 under NDICI.'),
  buildFacility(36, 'Ras Maska PHCC',           'PHCC',             'Tripoli',      'Tripoli', 'Tripoli District, North Lebanon',           '34.4550° N, 35.8700° E', 'Tripoli area PHCC — NDICI coverage Jan–Oct 2025.'),
  buildFacility(37, 'Sidikin PHCC',             'PHCC',             'South',        'Saida',   'Sidikin, South Lebanon',                    '33.4620° N, 35.3260° E', 'South Lebanon PHCC active Jan–Oct 2025.'),
  buildFacility(38, 'Ketermaya PHCC',           'PHCC',             'Chouf',        'Saida',   'Ketermaya, Chouf District',                 '33.6140° N, 35.4880° E', 'Chouf district PHCC under NDICI coverage.'),
  buildFacility(39, 'Zahraa PHCC',              'PHCC',             'Nabatiyeh',    'Saida',   'Zahraa, Nabatiyeh District',                '33.4200° N, 35.4700° E', 'Coverage ended April 2025. Pending new grant assignment.'),
  buildFacility(40, 'Borj Qalaway PHCC',        'PHCC',             'Bint Jbeil',   'Saida',   'Borj Qalaway, Bint Jbeil District',         '33.1215° N, 35.4063° E', 'South Lebanon border PHCC — coverage ended April 2025.'),
];

/* ─── Build full coverage history for a facility ─────────── */
export function buildCoverageHistory(facilityId, updatedBy = 'Operations Team') {
  const months2025 = COVERAGE_2025[facilityId] || Array(12).fill(null);
  const months2026 = COVERAGE_2026[facilityId] || Array(12).fill(null);

  const records = [];

  const push = (year, monthsArr) => {
    monthsArr.forEach((code, idx) => {
      if (!code) return;
      const month = idx + 1;
      const grant = grantByCode(code);
      if (!grant) return;
      const isCurrentMonth = year === 2025 && month === 6;
      const daysInMonth = new Date(year, month, 0).getDate();
      const mm = String(month).padStart(2, '0');
      records.push({
        month, year,
        mainGrant: grant,
        secondaryGrants: [],
        status: isCurrentMonth ? 'Active' : (
          (year === 2025 && month < 6) || year < 2025 ? 'Ended' :
          month === 6 && year === 2025 ? 'Active' : 'Active'
        ),
        periodStart: `${year}-${mm}-01`,
        periodEnd:   `${year}-${mm}-${daysInMonth}`,
        activities:  'Primary healthcare services',
        notes:       isCurrentMonth ? 'Current coverage period — active.' : '',
        updatedBy,
        updatedAt:   `${year}-${mm}-05`,
      });
    });
  };

  push(2025, months2025);
  push(2026, months2026);

  return records.sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month);
}
