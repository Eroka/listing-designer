# Listing designer

A reusable listing page designer for Experience Workspace (formerly Document Authoring) and Adobe Commerce storefronts on Edge Delivery Services.

Authors open it from the Library while editing a category page, pick a layout, place banners, pin products and select **Insert layout**. The page then holds a small `listing-designer` block that draws the product grid on the live storefront.

## How it works

    Author in Experience Workspace
        opens Library > Listing designer      (tools/listing-designer, runs once, shared by every site)
        reads that site's settings sheets      (listing-designer-settings, listing-designer-banners)
        inserts a "recipe" block into the page (see docs/recipe-format.md)
    Shopper visits the storefront
        the listing-designer block reads the recipe, fetches products from Commerce, and draws the layout
        (blocks/listing-designer, copied into each storefront project)

Everything specific to a project lives in the two settings sheets. The code never changes between environments.

## What is in this repository

| Path | Purpose |
|---|---|
| `tools/listing-designer/` | The authoring plugin (the screen authors use). Deploy this repo once as its own Edge Delivery site. |
| `blocks/listing-designer/` | The storefront block. Copy this folder into each storefront project. |
| `blocks/listing-designer/layouts.js` | The layouts. Add a new layout here and both the plugin and the block pick it up. |
| `blocks/listing-designer/lib/` | Settings loader and Commerce product fetch, shared by the plugin and the block. |
| `settings/` | Sample settings and banners sheets to copy from. |
| `docs/` | Recipe format and the checklist for adding a new environment. |

## First-time setup (central plugin)

1. Create the GitHub repository from these files and install the Adobe Code Sync app on it.
2. Open `https://main--listing-designer--YOUR-ORG.aem.live/tools/listing-designer/listing-designer.html` to confirm it loads.
3. Follow `docs/new-environment-checklist.md` for each environment you want to use it in.

## Local development

    npm install -g @adobe/aem-cli
    aem up

Then register the plugin with `ref` set to `local` and open a page with `?ref=local`, for example `https://da.live/edit?ref=local#/ORG/SITE/path`.

## Versioning

Environments should point at a tagged version of the plugin, for example a `v1` branch, not `main`. Fixes then reach every environment when you choose to move them up. Record changes in `CHANGELOG.md`.

## Known limits

- Trade pricing in the preview is an estimate (`trade-preview-discount`). Real account pricing needs a signed-in company account on the storefront.
- The preview fetches products with the public Catalog Service endpoint. Anything that needs a customer token isn't shown in the designer.
- Confirm the SDK action that inserts a formatted block into the page. The plugin tries `sendHTML` first and falls back to `sendText`, then to copying the recipe.
- Settings sheets are read from the environment's `aem.page` (preview) address, so publish changes to them in preview before expecting the plugin to see them.
- 
