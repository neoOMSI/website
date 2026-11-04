# neoOMSI Website

Source for [neoomsi.com](https://neoomsi.com/) and its public guides at
[docs.neoomsi.com](https://docs.neoomsi.com/).

## Overview

The main site is built with React 19, Vite, Tailwind CSS, and TypeScript. Its static
pages are prerendered and served through Cloudflare Workers. The versioned docs site
uses Docusaurus and is in [docs-site](docs-site/README.md).

## Local development

### Prerequisites

- Node.js 24 or newer
- npm 10 or newer

### Setup

Install dependencies:

```sh
npm install
```

Start the Vite development server:

```sh
npm run dev
```

Build and prerender static pages:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

## Deployment

Deployments trigger automatically on pushes to the `main` branch via GitHub Actions, publishing to Cloudflare Workers.

Manual deployment:

```sh
npx wrangler login
npm run deploy
```

## License

Documentation content is licensed under [Creative Commons Attribution-ShareAlike 4.0](docs-site/static/LICENSE.txt).
Brand assets and logos are subject to the project [trademark guidelines](https://github.com/neoOMSI/neoOMSI/blob/main/TRADEMARKS.md).
