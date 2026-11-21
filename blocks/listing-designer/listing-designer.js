import { arrange, LAYOUTS, COLS } from './layouts.js';
import { fromBlock } from './recipe.js';
import { loadSettings, loadBanners } from './lib/settings.js';
import { fetchProducts, formatPrice } from './lib/commerce.js';

// Picks the region whose locale matches the page language (for example en-AU). Falls back to the default region.
function pickRegion(settings) {
  const lang = (document.documentElement.lang || '').toLowerCase();
  const hit = Object.entries(settings.regions).find(([, r]) => (r.locale || '').toLowerCase() === lang);
  return hit ? hit[0] : settings.defaultRegion;
}

function productCard(product, big, settings, region) {
  const a = document.createElement('a');
  a.className = `ld-card${big ? ' ld-big' : ''}`;
  a.href = settings.productUrl.replace('{urlKey}', product.urlKey).replace('{sku}', product.sku);
  if (big) a.classList.add('ld-span-2');
  const pic = document.createElement('div');
  pic.className = 'ld-pic';
  if (product.image) {
    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name;
    img.loading = 'lazy';
    pic.append(img);
  }
  const name = document.createElement('h3');
  name.textContent = product.name;
  const price = document.createElement('p');
  price.textContent = formatPrice(product.price, product.currency, region.locale);
  a.append(pic, name, price);
  return a;
}

function bannerCell(cell, banner) {
  const el = document.createElement(banner && banner.link ? 'a' : 'div');
  el.className = `ld-slot ld-tone-${(banner && banner.tone) || 'navy'}${cell.block ? ' ld-blk' : ''}`;
  el.classList.add(`ld-span-${cell.span}`);
  if (cell.rows > 1) el.classList.add('ld-rows-2');
  if (banner && banner.link) el.href = banner.link;
  if (banner && banner.image) el.style.backgroundImage = `url("${banner.image}")`;
  const t = document.createElement('span');
  t.textContent = banner ? banner.title : '';
  el.append(t);
  return el;
}

export default async function decorate(block) {
  const cfg = fromBlock(block);
  const settings = await loadSettings();
  const [banners] = await Promise.all([loadBanners(settings)]);
  const region = settings.regions[pickRegion(settings)];
  const size = cfg.pageSize || settings.pageSize;
  const products = await fetchProducts(settings, pickRegion(settings), cfg.category || settings.categoryDefault, size);

  block.textContent = '';
  block.style.setProperty('--ld-primary', settings.brand.primary);
  block.style.setProperty('--ld-accent', settings.brand.accent);
  block.style.setProperty('--ld-cols', COLS);
  if (!LAYOUTS[cfg.layout]) cfg.layout = 'top';

  const grid = document.createElement('div');
  grid.className = 'ld-grid';
  arrange(cfg.layout, products, cfg.pinned).forEach((cell) => {
    if (cell.type === 'product') {
      grid.append(productCard(cell.product, cell.big, settings, region));
    } else {
      const banner = banners.find((b) => b.id === cfg.banners[cell.index]);
      if (banner) grid.append(bannerCell(cell, banner)); // an empty slot is simply not shown to shoppers
    }
  });
  block.append(grid);
}
