import { switchPanel } from "../../app/panel-router";
import { tauriClient } from "../../shared/api/tauri-client";
import { qs } from "../../shared/dom/query";
import { outputFeature } from "../output/output";

export function bindApplySettingsActions(getProfile: () => string): void {
  qs<HTMLButtonElement>("#btn-apply").addEventListener("click", () => {
    const profile = getProfile();
    const scope = (qs<HTMLSelectElement>("#apply-scope").value || "local").trim();
    const projectDirText = (qs<HTMLInputElement>("#apply-project-dir").value || "").trim();
    const projectDir = projectDirText.length > 0 ? projectDirText : null;
    if (!profile) {
      outputFeature.setOutput("请先选择 profile");
      return;
    }
    void tauriClient.applyClaudeSettings(profile, scope, projectDir).then((target) => {
      outputFeature.setOutput(`已写入: ${target}`);
      switchPanel("panel-output");
    });
  });
}
