// Single source of truth for layouts. Used by the authoring plugin (preview) and by the storefront block (live page).
export const COLS = 4;

export const LAYOUTS = {
  top: { label: 'Banner on top', slots: 1, pattern: [{ slot: 0, span: 4 }, { rest: true }] },
  hero: { label: 'Large feature block', slots: 1, pattern: [{ slot: 0, span: 2, rows: 2 }, { rest: true }] },
  one: { label: 'Single-card feature block', slots: 1, pattern: [{ take: 2 }, { slot: 0, span: 1, block: true }, { rest: true }] },
  two: { label: 'Double-card feature block', slots: 1, pattern: [{ take: 2 }, { slot: 0, span: 2, block: true }, { rest: true }] },
  rows: { label: 'Banner between rows', slots: 2, pattern: [{ take: 4 }, { slot: 0, span: 4 }, { take: 4 }, { slot: 1, span: 4 }, { rest: true }] },
  feat: { label: 'Two featured products', slots: 0, pattern: [{ take: 2, big: true }, { rest: true }] },
};

// Pinned products go first (in the order they were pinned), then everything else in its original order.
export function orderProducts(products, pinned = []) {
  const first = pinned.map((sku) => products.find((p) => p.sku === sku)).filter(Boolean);
  const others = products.filter((p) => !pinned.includes(p.sku));
  return [...first, ...others];
}

// Turns a layout + products into a flat list of cells: { type: 'product' | 'slot', ... }
export function arrange(layoutId, products, pinned = []) {
  const layout = LAYOUTS[layoutId] || LAYOUTS.top;
  const queue = orderProducts(products, pinned);
  const cells = [];
  layout.pattern.forEach((step) => {
    if (step.slot !== undefined) {
      cells.push({ type: 'slot', index: step.slot, span: step.span, rows: step.rows || 1, block: !!step.block });
    } else {
      const count = step.rest ? queue.length : step.take;
      queue.splice(0, count).forEach((product) => cells.push({ type: 'product', product, big: !!step.big }));
    }
  });
  return cells;
}
