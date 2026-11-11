# neoOMSI documentation site

This is the public documentation site at `docs.neoomsi.com`. Content is English Markdown; Docusaurus builds stable 0.2.3 by default and the 0.3.0 release candidate docs under `/0.3.0/` and the current 0.4.0 development docs under `/next/`. Search is generated locally at build time and does not send queries to a third party.

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

Edit the current development docs in `docs/`. The stable 0.2.3 snapshot is stored in `versioned_docs/version-0.2.3/` and the 0.3.0 release candidate snapshot in `versioned_docs/version-0.3.0/`; fixes that also apply to 0.3.0 must be made in both `docs/` and that snapshot. When 0.3.0 is final, set `lastVersion` to `0.3.0` and relabel it as stable. For a new stable release, prepare and review the docs against that release's source tag first, then create its snapshot with `npm run version:docs -- <version>` and update the `lastVersion` and version labels in `docusaurus.config.js`.

## Deployment

The website repository's GitHub Actions workflow builds and validates this app on pull requests, then deploys this Worker before the main website on pushes to `main`. The custom domain is configured in Wrangler; deploying it creates or updates the Cloudflare Worker and its DNS mapping.
