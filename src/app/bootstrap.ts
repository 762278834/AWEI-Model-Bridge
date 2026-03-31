import { bindApplySettingsActions } from "../features/apply-settings/apply-settings";
import { bindModelMappingActions } from "../features/model-mapping/model-mapping";
import { outputFeature } from "../features/output/output";
import { bindProfileActions, refreshProfilesState } from "../features/profiles/profiles";
import { bindTestingActions } from "../features/testing/testing";
import { themeFeature } from "../features/theme/theme";
import { bindTitlebarControls } from "../features/titlebar/titlebar";
import { qs } from "../shared/dom/query";
import { createAppLayout } from "./layout.html";
import { bindPanelNavigation, switchPanel } from "./panel-router";

export async function bootApp(): Promise<void> {
  qs<HTMLElement>("#app").innerHTML = createAppLayout();

  themeFeature.init();
  bindTitlebarControls();
  bindPanelNavigation();
  bindProfileActions();

  const currentProfile = () => (qs<HTMLSelectElement>("#profile-select").value || "").trim();
  bindModelMappingActions(currentProfile);
  bindTestingActions(currentProfile);
  bindApplySettingsActions(currentProfile);

  try {
    await refreshProfilesState();
    outputFeature.setOutput("就绪：请选择 profile 并操作。");
    switchPanel("panel-quicksetup");
  } catch (err) {
    outputFeature.setOutput(`初始化失败: ${String(err)}`);
    switchPanel("panel-output");
  }
}
