import { switchPanel } from "../../app/panel-router";
import { tauriClient } from "../../shared/api/tauri-client";
import { qs } from "../../shared/dom/query";
import { uiStore } from "../../shared/state/ui-store";
import { outputFeature } from "../output/output";

const profileSelect = () => qs<HTMLSelectElement>("#profile-select");
const fieldsTable = () => qs<HTMLTableSectionElement>("#fields-table");

export async function refreshProfilesState(): Promise<void> {
  const state = await tauriClient.getUiState();
  uiStore.setProfiles(state.profiles);
  uiStore.setActiveProfile(state.active_profile);
  outputFeature.setState(JSON.stringify(state, null, 2));

  const select = profileSelect();
  select.innerHTML = "";
  for (const name of state.profiles) {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    if (name === state.active_profile) {
      opt.selected = true;
    }
    select.appendChild(opt);
  }

  if (state.profiles.length > 0) {
    await loadProfileDetail(select.value);
  } else {
    fieldsTable().innerHTML = "";
  }
}

async function loadProfileDetail(name: string): Promise<void> {
  if (!name) {
    return;
  }
  const detail = await tauriClient.getProfile(name);
  fieldsTable().innerHTML = "";
  for (const [k, v] of Object.entries(detail.values).sort(([a], [b]) => a.localeCompare(b))) {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${k}</td><td>${v}</td>`;
    fieldsTable().appendChild(row);
  }
}

export function bindProfileActions(): void {
  profileSelect().addEventListener("change", () => {
    void loadProfileDetail(profileSelect().value);
  });

  qs<HTMLButtonElement>("#btn-refresh").addEventListener("click", () => {
    void refreshProfilesState();
  });

  qs<HTMLButtonElement>("#btn-use").addEventListener("click", () => {
    const profile = profileSelect().value;
    if (!profile) {
      return;
    }
    void tauriClient.activateProfile(profile).then(async () => {
      outputFeature.setOutput(`已激活 profile: ${profile}`);
      await refreshProfilesState();
      switchPanel("panel-state");
    });
  });

  qs<HTMLButtonElement>("#btn-remove").addEventListener("click", () => {
    const profile = profileSelect().value;
    if (!profile || !window.confirm(`确认删除 ${profile} ?`)) {
      return;
    }
    void tauriClient.removeProfile(profile).then(async () => {
      outputFeature.setOutput(`已删除 profile: ${profile}`);
      await refreshProfilesState();
      switchPanel("panel-state");
    });
  });

  qs<HTMLButtonElement>("#btn-set-field").addEventListener("click", () => {
    const profile = profileSelect().value;
    const key = (qs<HTMLInputElement>("#set-key").value || "").trim();
    const value = (qs<HTMLInputElement>("#set-value").value || "").trim();
    if (!profile || !key) {
      outputFeature.setOutput("请选择 profile 并填写 key");
      return;
    }
    void tauriClient.setField(profile, key, value).then(async () => {
      outputFeature.setOutput(`已保存 ${profile}.${key}`);
      await loadProfileDetail(profile);
    });
  });

  qs<HTMLButtonElement>("#btn-quicksetup").addEventListener("click", () => {
    const baseUrl = (qs<HTMLInputElement>("#qs-base-url").value || "").trim();
    const token = (qs<HTMLInputElement>("#qs-token").value || "").trim();
    if (!baseUrl || !token) {
      outputFeature.setOutput("请填写中转地址和Token");
      return;
    }
    void tauriClient.quicksetupClaudeProxy(baseUrl, token).then(async () => {
      outputFeature.setOutput("已完成 quicksetup（claude_proxy）");
      await refreshProfilesState();
      switchPanel("panel-profile");
    });
  });
}
