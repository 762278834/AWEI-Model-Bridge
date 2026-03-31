import { switchPanel } from "../../app/panel-router";
import { tauriClient } from "../../shared/api/tauri-client";
import { qs } from "../../shared/dom/query";
import { outputFeature } from "../output/output";

export function bindTestingActions(getProfile: () => string): void {
  qs<HTMLButtonElement>("#btn-test").addEventListener("click", () => {
    const profile = getProfile();
    const model = (qs<HTMLInputElement>("#test-model").value || "").trim() || null;
    const timeoutRaw = (qs<HTMLInputElement>("#test-timeout").value || "20").trim();
    const timeoutSecs = Number.parseInt(timeoutRaw, 10) || 20;
    if (!profile) {
      outputFeature.setOutput("请先选择 profile");
      return;
    }
    void tauriClient.testProfile(profile, model, timeoutSecs).then((result) => {
      outputFeature.setOutput(JSON.stringify(result, null, 2));
      switchPanel("panel-output");
    });
  });
}
