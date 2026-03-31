import { switchPanel } from "../../app/panel-router";
import { tauriClient } from "../../shared/api/tauri-client";
import { qs } from "../../shared/dom/query";
import { outputFeature } from "../output/output";

export function bindModelMappingActions(getProfile: () => string): void {
  qs<HTMLButtonElement>("#btn-map-set").addEventListener("click", () => {
    const profile = getProfile();
    const tier = (qs<HTMLSelectElement>("#map-tier").value || "").trim();
    const model = (qs<HTMLInputElement>("#map-model").value || "").trim();
    if (!profile || !tier || !model) {
      outputFeature.setOutput("请填写 tier 和 model");
      return;
    }
    void tauriClient.modelMapSet(profile, tier, model).then(() => {
      outputFeature.setOutput(`已更新映射: ${profile} ${tier} -> ${model}`);
      switchPanel("panel-output");
    });
  });
}
