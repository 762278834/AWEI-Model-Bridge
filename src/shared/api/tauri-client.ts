import { invoke } from "@tauri-apps/api/core";
import type { ProfileDetail, TestResult, UiState } from "../../types";

export const tauriClient = {
  getUiState: () => invoke<UiState>("get_ui_state"),
  getProfile: (name: string) => invoke<ProfileDetail>("get_profile", { name }),
  setField: (profile: string, key: string, value: string) =>
    invoke("set_field", { profile, key, value }),
  removeProfile: (profile: string) => invoke("remove_profile", { profile }),
  activateProfile: (profile: string) => invoke("use_profile", { profile }),
  quicksetupClaudeProxy: (baseUrl: string, token: string) =>
    invoke("quicksetup_claude_proxy", { baseUrl, token }),
  modelMapSet: (profile: string, tier: string, model: string) =>
    invoke("model_map_set", { profile, tier, model }),
  testProfile: (profile: string, model: string | null, timeoutSecs: number) =>
    invoke<TestResult>("test_profile", { profile, model, timeoutSecs }),
  applyClaudeSettings: (profile: string, scope: string, projectDir: string | null) =>
    invoke<string>("apply_claude_settings", { profile, scope, projectDir }),
  windowMinimize: () => invoke("window_minimize"),
  windowToggleMaximize: () => invoke<boolean>("window_toggle_maximize"),
  windowClose: () => invoke("window_close"),
};
