# neoOMSI Website

Source code and documentation pages for [neoomsi.com](https://neoomsi.com/).

## Overview

The site is built with React 19, Vite, Tailwind CSS, and TypeScript. All static pages are prerendered at build time for optimal performance and SEO, and served globally through Cloudflare Workers.

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

Documentation content is licensed under [Creative Commons Attribution-ShareAlike 4.0](docs/LICENSE).
Brand assets and logos are subject to the project [trademark guidelines](https://github.com/neoOMSI/neoOMSI/blob/main/TRADEMARKS.md).
