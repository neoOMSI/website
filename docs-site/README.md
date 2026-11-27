# neoOMSI documentation site

This is the public documentation site at `docs.neoomsi.com`. Content is English Markdown; Docusaurus serves the 0.3.0 stable docs at `/` and the 0.4.0 development docs under `/next/`. Older 0.2.3 and 0.3.0 docs URLs redirect to the stable guide. Search is generated locally at build time and does not send queries to a third party.

## Local development

Use Node.js 24 and npm:

```sh
npm ci
npm start
```

Build and preview the complete static site, including local search:

```sh
npm run build
npm run serve
```

Edit the current development docs in `docs/`. The stable 0.3.0 snapshot lives in `versioned_docs/version-0.3.0/`. Apply fixes that also affect 0.3.0 in both `docs/` and the stable snapshot. For a new stable release, prepare and review the docs against that release's source tag first, then create its snapshot with `npm run version:docs -- <version>` and update the `lastVersion` and version labels in `docusaurus.config.js`.

## Deployment

The website repository's GitHub Actions workflow builds and validates this app on pull requests, then deploys this Worker before the main website on pushes to `main`. The custom domain is configured in Wrangler; deploying it creates or updates the Cloudflare Worker and its DNS mapping.
