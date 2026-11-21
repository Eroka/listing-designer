// Fetches products from Adobe Commerce (Catalog Service / Live Search productSearch).
// If the endpoint is missing or the call fails, sample products are returned so the designer still works for demos.

const QUERY = `query ListingDesigner($phrase: String!, $filter: [SearchClauseInput!], $size: Int) {
  productSearch(phrase: $phrase, filter: $filter, page_size: $size) {
    items {
      productView {
        sku name urlKey
        images(roles: ["small_image"]) { url }
        ... on SimpleProductView { price { final { amount { value currency } } } }
        ... on ComplexProductView { priceRange { minimum { final { amount { value currency } } } } }
      }
    }
  }
}`;

const SAMPLE = [
  ['KAH-PRO', 'Kahuna Pro Players', 749], ['GHO-PRO', 'Ghost Pro Players', 699], ['BEA-PRO', 'Beast Pro Players', 649],
  ['STE-PRO', 'Stealth Pro', 599], ['RAP-PRO', 'Rapid Pro', 549], ['RET-PLA', 'Retro Players', 499],
  ['KAH-CLU', 'Kahuna Club', 399], ['GHO-CLU', 'Ghost Club', 379], ['BEA-CLU', 'Beast Club', 349], ['STE-CLU', 'Stealth Club', 329],
].map(([sku, name, price]) => ({ sku, name, urlKey: sku.toLowerCase(), image: '', price, currency: 'AUD', sample: true }));

export function formatPrice(amount, currency, locale) {
  try {
    return new Intl.NumberFormat(locale || 'en-AU', { style: 'currency', currency: currency || 'AUD', maximumFractionDigits: 0 }).format(amount);
  } catch (e) {
    return `${currency || ''} ${Math.round(amount)}`;
  }
}

const sampleFor = (size, region) => SAMPLE.slice(0, size).map((p) => ({ ...p, currency: region.currency || p.currency }));

export async function fetchProducts(settings, regionCode, category, size) {
  const region = settings.regions[regionCode] || Object.values(settings.regions)[0];
  if (!settings.endpoint) return sampleFor(size, region);
  try {
    const headers = { 'Content-Type': 'application/json', ...settings.headers };
    if (region.storeView) headers['Magento-Store-View-Code'] = region.storeView;
    const filter = category ? [{ attribute: 'categoryPath', eq: category }] : [];
    const res = await fetch(settings.endpoint, { method: 'POST', headers, body: JSON.stringify({ query: QUERY, variables: { phrase: '', filter, size } }) });
    const json = await res.json();
    const items = json && json.data && json.data.productSearch && json.data.productSearch.items;
    if (!items || !items.length) throw new Error('No products returned');
    return items.map(({ productView: p }) => {
      const amount = (p.price && p.price.final.amount) || (p.priceRange && p.priceRange.minimum.final.amount) || { value: 0, currency: region.currency };
      return { sku: p.sku, name: p.name, urlKey: p.urlKey, image: (p.images && p.images[0] && p.images[0].url) || '', price: amount.value, currency: amount.currency };
    });
  } catch (e) {
    return sampleFor(size, region);
  }
}
