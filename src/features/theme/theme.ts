import { qs } from "../../shared/dom/query";

const THEME_KEY = "awei_theme";

function applyTheme(theme: "dark" | "light") {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = qs<HTMLButtonElement>("#btn-theme-toggle");
  btn.textContent = theme === "dark" ? "☀" : "🌙";
  btn.title = theme === "dark" ? "切换为亮色" : "切换为暗黑";
}

export const themeFeature = {
  init() {
    const saved = (localStorage.getItem(THEME_KEY) as "dark" | "light" | null) ?? "dark";
    applyTheme(saved);
    qs<HTMLButtonElement>("#btn-theme-toggle").addEventListener("click", () => {
      const current =
        document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  },
};
