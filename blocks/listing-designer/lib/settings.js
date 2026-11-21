// Reads the environment's settings sheet. Nothing project-specific is hard-coded in the plugin or block.
// In the authoring plugin, pass base = 'https://main--SITE--ORG.aem.page'. In the storefront block, leave it empty (same origin).

export const DEFAULTS = {
  endpoint: '',
  headers: {},
  regions: { AU: { storeView: '', currency: 'AUD', locale: 'en-AU' } },
  defaultRegion: 'AU',
  audiences: ['Consumer', 'Trade account'],
  tradeDiscount: 0.18, // preview only: real trade pricing needs a signed-in company account
  layouts: ['top', 'hero', 'one', 'two', 'rows', 'feat'],
  bannersPath: '/listing-designer-banners.json',
  productUrl: '/products/{urlKey}/{sku}',
  categoryDefault: '',
  pageSize: 12,
  brand: { primary: '#0d2147', accent: '#b3182c' },
};

const HEADER_KEYS = {
  'commerce-environment-id': 'Magento-Environment-Id',
  'commerce-website-code': 'Magento-Website-Code',
  'commerce-store-code': 'Magento-Store-Code',
  'commerce-api-key': 'x-api-key',
};

// Works for single-sheet and multi-sheet published JSON.
export function sheetRows(json) {
  if (!json) return [];
  if (Array.isArray(json.data)) return json.data;
  const first = json[':names'] && json[':names'][0];
  return first && json[first] && json[first].data ? json[first].data : [];
}

async function getSheet(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    return sheetRows(await res.json());
  } catch (e) {
    return [];
  }
}

export async function loadSettings(base = '') {
  const rows = await getSheet(`${base}/listing-designer-settings.json`);
  const s = JSON.parse(JSON.stringify(DEFAULTS));
  s.loaded = rows.length > 0;
  let regionsReset = false;
  rows.forEach(({ key, value }) => {
    if (!key || value === undefined || value === '') return;
    if (key === 'commerce-endpoint') s.endpoint = value;
    else if (HEADER_KEYS[key]) s.headers[HEADER_KEYS[key]] = value;
    else if (key.startsWith('region.')) {
      // region.AU = store-view-code | currency | locale
      if (!regionsReset) { s.regions = {}; regionsReset = true; }
      const [storeView, currency, locale] = value.split('|').map((v) => v.trim());
      s.regions[key.slice(7)] = { storeView, currency, locale };
    } else if (key === 'default-region') s.defaultRegion = value;
    else if (key === 'audiences') s.audiences = value.split(';').map((v) => v.trim());
    else if (key === 'trade-preview-discount') s.tradeDiscount = Number(value);
    else if (key === 'layouts') s.layouts = value.split(';').map((v) => v.trim());
    else if (key === 'banners-path') s.bannersPath = value;
    else if (key === 'product-url') s.productUrl = value;
    else if (key === 'category-default') s.categoryDefault = value;
    else if (key === 'page-size') s.pageSize = Number(value);
    else if (key === 'brand-primary') s.brand.primary = value;
    else if (key === 'brand-accent') s.brand.accent = value;
  });
  if (!s.regions[s.defaultRegion]) s.defaultRegion = Object.keys(s.regions)[0];
  return s;
}

const SAMPLE_BANNERS = [
  { id: 'campaign', title: 'New season', image: '', link: '', tone: 'navy' },
  { id: 'personalise', title: 'Personalise your product', image: '', link: '', tone: 'accent' },
  { id: 'teams', title: 'Team orders', image: '', link: '', tone: 'green' },
  { id: 'offer', title: 'Free shipping offer', image: '', link: '', tone: 'gold' },
];

export async function loadBanners(settings, base = '') {
  const rows = await getSheet(`${base}${settings.bannersPath}`);
  const list = rows.filter((r) => r.id).map((r) => ({ id: r.id, title: r.title || r.id, image: r.image || '', link: r.link || '', tone: r.tone || 'navy' }));
  return list.length ? list : SAMPLE_BANNERS;
}
