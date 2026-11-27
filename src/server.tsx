import { renderToString } from "react-dom/server";
import { App } from "./App";
import { ThemeProvider } from "./lib/theme";

export { DOCS, DOCS_SITE, REPO } from "./content/data";
export { FAQ, OPENOMSI_FAQ } from "./content/faq";
export { absolute, url } from "./lib/routes";
export { DESCRIPTION, OG_IMAGE, PAGES, headTags, meta } from "./lib/seo";

export const render = (path: string) =>
  renderToString(
    <ThemeProvider>
      <App route={{ path }} />
    </ThemeProvider>,
  );
