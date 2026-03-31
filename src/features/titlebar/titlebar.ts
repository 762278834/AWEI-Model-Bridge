import { getCurrentWindow } from "@tauri-apps/api/window";
import { tauriClient } from "../../shared/api/tauri-client";
import { qs } from "../../shared/dom/query";

export function bindTitlebarControls(): void {
  const appWindow = getCurrentWindow();
  qs<HTMLButtonElement>("#btn-win-minimize").addEventListener("click", () => {
    void tauriClient.windowMinimize();
  });
  qs<HTMLButtonElement>("#btn-win-maximize").addEventListener("click", () => {
    void tauriClient.windowToggleMaximize();
  });
  qs<HTMLButtonElement>("#btn-win-close").addEventListener("click", () => {
    void tauriClient.windowClose();
  });
  qs<HTMLElement>("#window-title-drag").addEventListener("mousedown", (e: MouseEvent) => {
    if (e.button === 0) {
      void appWindow.startDragging();
    }
  });
  qs<HTMLElement>("#window-title-drag").addEventListener("dblclick", () => {
    void tauriClient.windowToggleMaximize();
  });
}
