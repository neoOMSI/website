/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "neoOMSI Documentation",
  tagline: "Player, server, and creator guides for neoOMSI.",
  url: "https://docs.neoomsi.com",
  baseUrl: "/",
  favicon: "img/neoomsi.ico",
  organizationName: "neoOMSI",
  projectName: "website",
  trailingSlash: true,
  onBrokenLinks: "throw",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "throw",
      onBrokenMarkdownImages: "throw",
    },
  },
  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.js",
          editUrl: "https://github.com/neoOMSI/website/edit/main/docs-site/",
          lastVersion: "0.3.0",
          versions: {
            current: {
              label: "0.4.0 Nightly",
              path: "next",
              banner: "unreleased",
              badge: true,
            },
            "0.3.0": {
              label: "0.3.0 Stable",
              path: "",
              banner: "none",
              badge: true,
            },
          },
        },
        blog: false,
        pages: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      },
    ],
  ],
  plugins: [
    [
      "@cmfcmf/docusaurus-search-local",
      {
        indexBlog: false,
        language: "en",
        indexDocSidebarParentCategories: 2,
      },
    ],
  ],
  themeConfig: {
    colorMode: {
      defaultMode: "dark",
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: "neoOMSI Docs",
      logo: {
        alt: "neoOMSI",
        src: "img/logo.svg",
      },
      items: [
        { type: "docsVersionDropdown", position: "right" },
        { type: "search", position: "right" },
        {
          href: "https://neoomsi.com/",
          label: "neoOMSI.com",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "neoOMSI",
          items: [
            { label: "Website", href: "https://neoomsi.com/" },
            { label: "Download", href: "https://neoomsi.com/download/" },
            { label: "GitHub", href: "https://github.com/neoOMSI/neoOMSI" },
          ],
        },
        {
          title: "Community",
          items: [
            { label: "Discord", href: "https://discord.gg/neoomsi" },
            { label: "Compatibility", to: "/compatibility/" },
            { label: "Privacy", href: "https://neoomsi.com/privacy/telemetry/" },
          ],
        },
        {
          title: "License",
          items: [
            {
              label: "Documentation license (CC BY-SA 4.0)",
              href: "https://docs.neoomsi.com/LICENSE.txt",
            },
          ],
        },
      ],
      copyright:
        'neoOMSI is independent from the makers of OMSI 2. OMSI 2 is required to play.',
    },
    prism: {
      additionalLanguages: ["bash", "powershell", "json"],
    },
  },
};

module.exports = config;
