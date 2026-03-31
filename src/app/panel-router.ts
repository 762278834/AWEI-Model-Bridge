import { qs } from "../shared/dom/query";

export type PanelId =
  | "panel-quicksetup"
  | "panel-profile"
  | "panel-modelmap"
  | "panel-test"
  | "panel-apply"
  | "panel-state"
  | "panel-output";

const panelEls = () => Array.from(document.querySelectorAll<HTMLElement>(".panel"));
const navItems = () => Array.from(document.querySelectorAll<HTMLButtonElement>(".nav-item"));

export function switchPanel(panelId: PanelId): void {
  for (const panel of panelEls()) {
    panel.classList.toggle("hidden", panel.id !== panelId);
  }
  for (const nav of navItems()) {
    nav.classList.toggle("active", nav.dataset.target === panelId);
  }
}

export function bindPanelNavigation(): void {
  for (const nav of navItems()) {
    nav.addEventListener("click", () => {
      const target = nav.dataset.target;
      if (!target) {
        return;
      }
      switchPanel(target as PanelId);
    });
  }
  qs<HTMLElement>("#panel-quicksetup");
  switchPanel("panel-quicksetup");
}
