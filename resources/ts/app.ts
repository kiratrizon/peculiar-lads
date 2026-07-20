// @ts-nocheck //

import "../css/app.css";

// Centralized theme handling. app.ts is loaded by every layout, so a single
// implementation here drives the `<select class="theme-select">` on the guest,
// login and dashboard shells. Themes are applied via `html[data-theme=...]`
// (see resources/css/dark.css) and persisted to localStorage. The attribute
// lives on <html> (not <body>) because a tiny inline script in <head> - see
// the layouts - sets it synchronously before first paint to avoid a flash of
// the default theme; that script runs before <body> even exists.

const THEMES = ["dark-abyss", "lightning-blaze", "icy-moon", "heatwave"];
const DEFAULT_THEME = "dark-abyss";
const STORAGE_KEY = "pecu:theme";

// Each theme has a matching tab icon in public/assets.
const THEME_ICONS = {
  "dark-abyss": "/assets/peculiarlads-icon-dark.png",
  "lightning-blaze": "/assets/peculiarlads-icon-light.png",
  "icy-moon": "/assets/peculiarlads-icon-ice.png",
  heatwave: "/assets/peculiarlads-icon-fire.png",
};

function normalizeTheme(theme: string | null): string {
  return theme && THEMES.includes(theme) ? theme : DEFAULT_THEME;
}

// Swap the favicon (tab icon) to match the active theme.
function updateFavicon(theme: string): void {
  const href = THEME_ICONS[theme];
  if (!href) return;
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "icon");
    link.setAttribute("type", "image/png");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

function applyTheme(theme: string): void {
  const normalized = normalizeTheme(theme);
  document.documentElement.setAttribute("data-theme", normalized);
  localStorage.setItem(STORAGE_KEY, normalized);
  updateFavicon(normalized);
  // Swap any on-page brand icons (<img class="theme-icon">) to match the theme.
  const iconHref = THEME_ICONS[normalized];
  if (iconHref) {
    document.querySelectorAll(".theme-icon").forEach((img) => {
      img.setAttribute("src", iconHref);
    });
  }
  // Keep every theme picker on the page in sync (in case more than one exists).
  document.querySelectorAll(".theme-select").forEach((select) => {
    if (select.value !== normalized) {
      select.value = normalized;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const current = normalizeTheme(localStorage.getItem(STORAGE_KEY));
  applyTheme(current);

  document.querySelectorAll(".theme-select").forEach((select) => {
    select.value = current;
    select.addEventListener("change", (event) => {
      localStorage.setItem(STORAGE_KEY, normalizeTheme(event.target.value));
      globalThis.location.reload();
    });
  });
});
