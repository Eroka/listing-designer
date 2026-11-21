# Adding the Listing designer to a new environment

About 15 minutes. You need edit access to the site's GitHub repository and its Experience Workspace settings.

## 1. Add the storefront block (once per project)
Copy the `blocks/listing-designer/` folder into the project's `blocks/` folder, then commit and push:

    git add blocks/listing-designer
    git commit -m "Add listing-designer block"
    git push

If you maintain a starter template, add the folder there so every new project already has it.

## 2. Create the settings sheet
In Experience Workspace, create a sheet named `listing-designer-settings` in the site root with two columns, `key` and `value`. Use `settings/listing-designer-settings.sample.csv` as the starting point, then **Preview** and **Publish** it.

## 3. Create the banners sheet
Create a sheet named `listing-designer-banners` with the columns `id`, `title`, `image`, `link`, `tone`. Use `settings/listing-designer-banners.sample.csv`. Preview and publish it.

## 4. Register the plugin
Open the site's settings (cog icon in the breadcrumb), go to the **library** tab and add one row:

| title | path | icon | ref |
|---|---|---|---|
| Listing designer | https://main--listing-designer--YOUR-ORG.aem.live/tools/listing-designer/listing-designer.html | PNG icon URL | |

To try a new version first, add the row with `ref` set to a branch name or `local`, test, then clear it.

## 5. Check it
1. Open a category page in Experience Workspace and choose **Library**.
2. Open **Listing designer** and choose a layout.
3. Select **Insert layout**. A `listing-designer` block appears in the page.
4. Preview the page and confirm the grid and banners appear.

## If something looks wrong
- **Sample products show instead of real ones:** the settings sheet isn't published, or `commerce-endpoint` is blank.
- **Plugin says context is undefined:** switch off browser extensions that change headers (ModHeader, Requestly).
- **Products fail to load:** the Commerce endpoint must allow requests from the plugin's address. Add it to the allowed origins.
- **No banners listed:** the banners sheet isn't published, or `banners-path` in settings points to the wrong place.
