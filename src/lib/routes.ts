import { DOCS, DOCS_SITE, SITE } from "../content/data";

export const BASE = import.meta.env.BASE_URL;

export const url = (path: string) => BASE + path.replace(/^\//, "");

export const absolute = (path: string) => SITE + path.replace(/^\//, "");

export const docPath = (file: string) => {
  const doc = DOCS.find((d) => d.file === file);
  return `${DOCS_SITE}${doc?.path ?? `/${file.toLowerCase()}/`}`;
};

export interface Route {
  path: string;
  anchor?: string;
}

export function parse(pathname: string, hash = ""): Route {
  const rest = pathname.startsWith(BASE)
    ? pathname.slice(BASE.length)
    : pathname.replace(/^\//, "");
  return {
    path: `/${rest}`.replace(/\/+$/, "") || "/",
    anchor: decodeURIComponent(hash.replace(/^#/, "")) || undefined,
  };
}

// Older website links used hash-based routes such as #/issues/123.
export function legacy(hash: string) {
  if (!hash.startsWith("#/")) return null;
  const path = hash.slice(2).split("#")[0];
  return url(path ? `${path}${path.startsWith("issues/") ? "" : "/"}` : "");
}

export function navigate(href: string) {
  history.pushState(null, "", href);
  window.dispatchEvent(new Event("navigate"));
}
