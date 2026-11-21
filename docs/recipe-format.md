# Recipe format

The designer writes a normal Edge Delivery block into the page. The first row is the block name. Every other row is one setting: the key in the first cell, the value in the second.

| listing-designer | |
|---|---|
| layout | two |
| category | cricket-bats/senior |
| pinned | KAH-PRO, GHO-PRO |
| banner-1 | personalise |
| page-size | 12 |

| Key | Meaning | Example |
|---|---|---|
| layout | One of: top, hero, one, two, rows, feat | two |
| category | Category path to list products from. Blank uses `category-default` from the settings sheet | cricket-bats/senior |
| pinned | SKUs to show first, in order, separated by commas | KAH-PRO, GHO-PRO |
| banner-1, banner-2 | Banner ids from the banners sheet. Banner 2 is only used by the `rows` layout | personalise |
| page-size | How many products to load. Blank uses `page-size` from the settings sheet | 12 |

An empty banner slot is not shown to shoppers.
