// The "recipe" is what the plugin writes into the page and what the block reads back.
// It is a normal Edge Delivery block table: one row per setting, key in the first cell and value in the second.

export function toRows(cfg) {
  return [
    ['layout', cfg.layout],
    ['category', cfg.category],
    ['pinned', (cfg.pinned || []).join(', ')],
    ['banner-1', cfg.banners && cfg.banners[0]],
    ['banner-2', cfg.banners && cfg.banners[1]],
    ['page-size', cfg.pageSize],
  ].filter(([, v]) => v !== undefined && v !== null && v !== '');
}

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// HTML the plugin sends to the document editor.
export function toBlockHtml(cfg) {
  const rows = toRows(cfg).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('');
  return `<table><tbody><tr><td colspan="2">listing-designer</td></tr>${rows}</tbody></table>`;
}

// Reads the block's rendered rows back into a config object (used by the storefront block).
export function fromBlock(block) {
  const map = {};
  [...block.children].forEach((row) => {
    const cells = [...row.children].map((c) => c.textContent.trim());
    if (cells[0]) map[cells[0].toLowerCase()] = cells[1] || '';
  });
  return {
    layout: map.layout || 'top',
    category: map.category || '',
    pinned: (map.pinned || '').split(',').map((v) => v.trim()).filter(Boolean),
    banners: [map['banner-1'], map['banner-2']].map((v) => v || null),
    pageSize: Number(map['page-size']) || 0,
  };
}
