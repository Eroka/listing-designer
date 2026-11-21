import DA_SDK from 'https://da.live/nx/utils/sdk.js';
import { LAYOUTS, arrange } from '../../blocks/listing-designer/layouts.js';
import { toBlockHtml } from '../../blocks/listing-designer/recipe.js';
import { loadSettings, loadBanners } from '../../blocks/listing-designer/lib/settings.js';
import { fetchProducts, formatPrice } from '../../blocks/listing-designer/lib/commerce.js';

const app = document.getElementById('app');
const state = { layout: 'top', region: '', aud: '', slots: [null, null], pinned: [], category: '', products: [], settings: null, banners: [], actions: null, note: '' };

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const slotCount = () => LAYOUTS[state.layout].slots;

function price(p) {
  const region = state.settings.regions[state.region];
  const trade = state.aud !== state.settings.audiences[0];
  const amount = p.price * (trade ? 1 - state.settings.tradeDiscount : 1);
  return `${formatPrice(amount, p.currency, region.locale)}${trade ? ' <small>est. account price</small>' : ''}`;
}

function cardHtml(c) {
  const p = c.product;
  const pinned = state.pinned.includes(p.sku);
  return `<div class="card${c.big ? ' big' : ''}" style="grid-column: span ${c.big ? 2 : 1}">
    <button type="button" class="pin" data-pin="${esc(p.sku)}" aria-pressed="${pinned}">${pinned ? 'Pinned' : 'Pin'}</button>
    <div class="pic">${p.image ? `<img src="${esc(p.image)}" alt="">` : ''}</div>
    <h4>${esc(p.name)}</h4><div class="price">${price(p)}</div></div>`;
}

function slotHtml(c) {
  const b = state.banners.find((x) => x.id === state.slots[c.index]);
  const style = `grid-column: span ${c.span};${c.rows > 1 ? ` grid-row: span ${c.rows};` : ''}`;
  const cls = `slot${c.block ? ' blk' : ''}`;
  if (b) return `<div class="${cls} filled tone-${esc(b.tone)}" style="${style}"><span>${esc(b.title)}</span><button type="button" class="rm" data-rm="${c.index}">Remove</button></div>`;
  return `<div class="${cls}" style="${style}"><div><b>Banner slot ${c.index + 1}</b><br>Choose a banner above to place it here.</div></div>`;
}

function render() {
  const s = state.settings;
  const used = state.slots.slice(0, slotCount());
  const cells = arrange(state.layout, state.products, state.pinned);
  const filled = used.filter(Boolean).length;
  app.style.setProperty('--primary', s.brand.primary);
  app.style.setProperty('--accent', s.brand.accent);
  app.innerHTML = `
    <section>
      <h2>Category</h2>
      <div class="row"><input id="cat" type="text" value="${esc(state.category)}" placeholder="for example cricket-bats/senior" aria-label="Category path">
      <button type="button" class="btn" id="load">Load products</button></div>
      <p class="hint">${esc(state.note)}</p>
    </section>
    <section>
      <h2>Layout</h2>
      <div class="opts">${s.layouts.filter((id) => LAYOUTS[id]).map((id) => `<button type="button" class="opt" data-layout="${id}" aria-pressed="${state.layout === id}">${esc(LAYOUTS[id].label)}</button>`).join('')}</div>
    </section>
    <section>
      <h2>Banners</h2>
      <p class="hint">${slotCount() ? 'Choose a banner to place it in the next empty slot.' : 'This layout has no banner slots.'}</p>
      <div class="banners">${state.banners.map((b) => `<button type="button" class="ban tone-${esc(b.tone)}" data-ban="${esc(b.id)}" aria-pressed="${used.includes(b.id)}" ${slotCount() ? '' : 'disabled'}>${esc(b.title)}<small>${used.includes(b.id) ? 'Placed' : 'Place'}</small></button>`).join('')}</div>
    </section>
    <section class="preview">
      <div class="tools">
        <span class="seg" aria-label="Region">${Object.keys(s.regions).map((r) => `<button type="button" data-region="${r}" aria-pressed="${state.region === r}">${r}</button>`).join('')}</span>
        <span class="seg" aria-label="Shopper">${s.audiences.map((a) => `<button type="button" data-aud="${esc(a)}" aria-pressed="${state.aud === a}">${esc(a)}</button>`).join('')}</span>
      </div>
      <div class="grid">${cells.map((c) => (c.type === 'slot' ? slotHtml(c) : cardHtml(c))).join('')}</div>
      <p class="hint">${state.products.some((p) => p.sample) ? 'Showing sample products. Add the Commerce endpoint to the settings sheet to see real ones. ' : ''}${filled} of ${slotCount()} banner slots filled, ${state.pinned.length} pinned.</p>
    </section>
    <footer class="foot"><button type="button" class="btn" id="copy">Copy recipe</button><button type="button" class="btn pri" id="insert">Insert layout</button></footer>
    <div class="toast" id="toast" role="status"></div>`;
}

function toast(text) {
  const el = document.getElementById('toast');
  el.textContent = text;
  el.classList.add('on');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('on'), 2200);
}

async function loadProducts() {
  state.note = 'Loading products...';
  render();
  state.products = await fetchProducts(state.settings, state.region, state.category, state.settings.pageSize);
  state.note = state.products.some((p) => p.sample) ? 'Using sample products.' : `${state.products.length} products loaded.`;
  render();
}

function recipe() {
  return toBlockHtml({ layout: state.layout, category: state.category, pinned: state.pinned, banners: state.slots.slice(0, slotCount()), pageSize: state.settings.pageSize });
}

app.addEventListener('click', async (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.layout) state.layout = t.dataset.layout;
  else if (t.dataset.region) { state.region = t.dataset.region; await loadProducts(); return; }
  else if (t.dataset.aud) state.aud = t.dataset.aud;
  else if (t.dataset.pin) {
    state.pinned = state.pinned.includes(t.dataset.pin) ? state.pinned.filter((x) => x !== t.dataset.pin) : [...state.pinned, t.dataset.pin];
  } else if (t.dataset.rm !== undefined) state.slots[+t.dataset.rm] = null;
  else if (t.dataset.ban) {
    const n = slotCount();
    const at = state.slots.indexOf(t.dataset.ban);
    if (at > -1 && at < n) state.slots[at] = null;
    else if (n) {
      let k = state.slots.slice(0, n).findIndex((v) => v === null);
      if (k === -1) k = 0;
      state.slots[k] = t.dataset.ban;
    }
  } else if (t.id === 'load') { state.category = document.getElementById('cat').value.trim(); await loadProducts(); return; }
  else if (t.id === 'insert') {
    const html = recipe();
    const { actions } = state;
    if (actions && typeof actions.sendHTML === 'function') actions.sendHTML(html);
    else if (actions && typeof actions.sendText === 'function') actions.sendText(html);
    else { await navigator.clipboard.writeText(html); toast('Recipe copied. Paste it into your page.'); return; }
    if (actions && typeof actions.closeLibrary === 'function') actions.closeLibrary();
    return;
  } else if (t.id === 'copy') {
    try { await navigator.clipboard.writeText(recipe()); toast('Recipe copied'); } catch (err) { toast('Could not copy. Select the layout and try again.'); }
    return;
  } else return;
  render();
});

(async function init() {
  let sdk = {};
  try { sdk = await DA_SDK; } catch (e) { sdk = {}; }
  const { context = {}, actions = null } = sdk;
  state.actions = actions;
  const base = context.org && context.repo ? `https://main--${context.repo}--${context.org}.aem.page` : '';
  state.settings = await loadSettings(base);
  state.banners = await loadBanners(state.settings, base);
  state.region = state.settings.defaultRegion;
  state.aud = state.settings.audiences[0];
  state.category = state.settings.categoryDefault;
  state.layout = state.settings.layouts[0] || 'top';
  await loadProducts();
}());
