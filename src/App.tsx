import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCallback, useEffect, useMemo, useState } from "react";
import { tauriClient } from "./shared/api/tauri-client";
import type { ProfileDetail, TestResult, UiState } from "./types";

type PanelId =
  | "panel-profile"
  | "panel-modelmap"
  | "panel-test"
  | "panel-apply"
  | "panel-state"
  | "panel-output";

type ProviderMode = "official-glm" | "official-claude" | "custom-relay";

const OFFICIAL_URLS: Record<Exclude<ProviderMode, "custom-relay">, string> = {
  "official-glm": "https://open.bigmodel.cn/api/anthropic",
  "official-claude": "https://api.anthropic.com",
};

const appWindow = getCurrentWindow();

export function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activePanel, setActivePanel] = useState<PanelId>("panel-profile");
  const [uiState, setUiState] = useState<UiState | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [profileDetail, setProfileDetail] = useState<ProfileDetail | null>(null);
  const [output, setOutput] = useState<string>("就绪：请选择 profile 并操作。");

  const [relayBaseUrl, setRelayBaseUrl] = useState<string>("");
  const [relayToken, setRelayToken] = useState<string>("");
  const [providerMode, setProviderMode] = useState<ProviderMode>("custom-relay");
  const [mapTier, setMapTier] = useState<"opus" | "sonnet" | "haiku">("sonnet");
  const [mapModel, setMapModel] = useState<string>("");
  const [testModel, setTestModel] = useState<string>("");
  const [testTimeout, setTestTimeout] = useState<string>("20");
  const [applyScope, setApplyScope] = useState<"local" | "project" | "user">("local");
  const [applyProjectDir, setApplyProjectDir] = useState<string>("");

  const stateJson = useMemo(() => (uiState ? JSON.stringify(uiState, null, 2) : "{}"), [uiState]);

  const refreshState = useCallback(async () => {
    const state = await tauriClient.getUiState();
    setUiState(state);
    const nextProfile = state.active_profile ?? state.profiles[0] ?? "";
    setSelectedProfile(nextProfile);
    if (nextProfile) {
      const detail = await tauriClient.getProfile(nextProfile);
      setProfileDetail(detail);
    } else {
      setProfileDetail(null);
    }
  }, []);

  const loadProfile = useCallback(async (name: string) => {
    setSelectedProfile(name);
    if (!name) {
      setProfileDetail(null);
      return;
    }
    const detail = await tauriClient.getProfile(name);
    setProfileDetail(detail);
    const baseUrl = detail.values.ANTHROPIC_BASE_URL ?? "";
    setRelayBaseUrl(baseUrl);
    setRelayToken(detail.values.ANTHROPIC_AUTH_TOKEN ?? detail.values.ANTHROPIC_API_KEY ?? "");

    if (baseUrl === OFFICIAL_URLS["official-glm"]) {
      setProviderMode("official-glm");
    } else if (baseUrl === OFFICIAL_URLS["official-claude"]) {
      setProviderMode("official-claude");
    } else {
      setProviderMode("custom-relay");
    }
  }, []);

  useEffect(() => {
    const saved = (localStorage.getItem("awei_theme") as "dark" | "light" | null) ?? "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);

    const titlebarEl = document.getElementById("window-titlebar");
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (e.button === 0 && !target?.closest(".window-controls")) {
        void appWindow.startDragging();
      }
    };
    const onDoubleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest(".window-controls")) {
        void tauriClient.windowToggleMaximize();
      }
    };
    titlebarEl?.addEventListener("mousedown", onMouseDown);
    titlebarEl?.addEventListener("dblclick", onDoubleClick);

    void refreshState().catch((err) => {
      setOutput(`初始化失败: ${String(err)}`);
      setActivePanel("panel-output");
    });

    return () => {
      titlebarEl?.removeEventListener("mousedown", onMouseDown);
      titlebarEl?.removeEventListener("dblclick", onDoubleClick);
    };
  }, [refreshState]);

  async function onSaveRelayConfig() {
    if (!selectedProfile) {
      setOutput("请先选择 profile");
      return;
    }
    if (!relayToken.trim()) {
      setOutput("请填写 Key");
      return;
    }

    const baseUrl =
      providerMode === "custom-relay" ? relayBaseUrl.trim() : OFFICIAL_URLS[providerMode];
    if (!baseUrl) {
      setOutput("当前是自定义中转模式，请填写中转地址");
      return;
    }

    await tauriClient.setField(selectedProfile, "ANTHROPIC_BASE_URL", baseUrl);
    await tauriClient.setField(selectedProfile, "ANTHROPIC_AUTH_TOKEN", relayToken.trim());
    await tauriClient.setField(selectedProfile, "ANTHROPIC_API_KEY", relayToken.trim());

    if (providerMode === "official-claude") {
      await tauriClient.setField(selectedProfile, "ANTHROPIC_VERSION", "2023-06-01");
    }

    await loadProfile(selectedProfile);
    setOutput(`已保存 ${selectedProfile} 的连接配置（${providerMode}）`);
  }

  async function onActivateProfile() {
    if (!selectedProfile) return;
    await tauriClient.activateProfile(selectedProfile);
    await refreshState();
    setOutput(`已激活 profile: ${selectedProfile}`);
    setActivePanel("panel-state");
  }

  async function onRemoveProfile() {
    if (!selectedProfile || !window.confirm(`确认删除 ${selectedProfile} ?`)) return;
    await tauriClient.removeProfile(selectedProfile);
    await refreshState();
    setOutput(`已删除 profile: ${selectedProfile}`);
    setActivePanel("panel-state");
  }

  async function onModelMapSet() {
    if (!selectedProfile || !mapModel.trim()) {
      setOutput("请填写 tier 和 model");
      return;
    }
    await tauriClient.modelMapSet(selectedProfile, mapTier, mapModel.trim());
    await loadProfile(selectedProfile);
    setOutput(`已更新映射: ${selectedProfile} ${mapTier} -> ${mapModel.trim()}`);
    setActivePanel("panel-output");
  }

  async function onTestProfile() {
    if (!selectedProfile) {
      setOutput("请先选择 profile");
      return;
    }
    const timeoutSecs = Number.parseInt(testTimeout, 10) || 20;
    const result: TestResult = await tauriClient.testProfile(
      selectedProfile,
      testModel.trim() || null,
      timeoutSecs,
    );
    setOutput(JSON.stringify(result, null, 2));
    setActivePanel("panel-output");
  }

  async function onApplySettings() {
    if (!selectedProfile) {
      setOutput("请先选择 profile");
      return;
    }
    const target = await tauriClient.applyClaudeSettings(
      selectedProfile,
      applyScope,
      applyProjectDir.trim() || null,
    );
    setOutput(`已写入: ${target}`);
    setActivePanel("panel-output");
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("awei_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  const profileValues = profileDetail ? Object.entries(profileDetail.values).sort(([a], [b]) => a.localeCompare(b)) : [];

  return (
    <>
      <header id="window-titlebar" data-tauri-drag-region>
        <div id="window-title-drag" className="window-title" data-tauri-drag-region>
          AWEI · Model Bridge
        </div>
        <div className="window-controls">
          <button type="button" className="win-btn" id="btn-theme-toggle" title="切换主题" onClick={toggleTheme}>
            {theme === "dark" ? "☀" : "🌙"}
          </button>
          <button type="button" className="win-btn" title="最小化" onClick={() => void tauriClient.windowMinimize()}>
            －
          </button>
          <button type="button" className="win-btn" title="最大化/还原" onClick={() => void tauriClient.windowToggleMaximize()}>
            □
          </button>
          <button type="button" className="win-btn win-close" title="关闭" onClick={() => void tauriClient.windowClose()}>
            ✕
          </button>
        </div>
      </header>

      <main className="layout">
        <aside className="rail">
          <div className="rail-logo">A</div>
          <div className="rail-dot active"></div>
          <div className="rail-dot"></div>
          <div className="rail-dot"></div>
        </aside>

        <aside className="sidebar">
          <div className="brand">AWEI</div>
          <div className="subtitle">Claude Code Model Bridge</div>

          <div className="profile-box">
            <label className="label" htmlFor="profile-select">当前 Profile</label>
            <select
              id="profile-select"
              value={selectedProfile}
              disabled={(uiState?.profiles.length ?? 0) <= 1}
              onChange={(e) => void loadProfile(e.target.value)}
              title={selectedProfile || "当前无 profile"}
            >
              {(uiState?.profiles ?? []).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <div className="profile-meta" title={selectedProfile || ""}>
              {selectedProfile ? `当前：${selectedProfile}` : "当前：无 profile"}
            </div>
            {(uiState?.profiles.length ?? 0) <= 1 && (
              <div className="profile-tip">仅 1 个 profile，暂无可切换项。</div>
            )}
            <div className="row mt">
              <button type="button" onClick={() => void refreshState()}>刷新</button>
              <button type="button" onClick={() => void onActivateProfile()}>设为当前</button>
            </div>
          </div>

          <nav className="nav">
            {[
              ["panel-profile", "Profile 管理"],
              ["panel-modelmap", "模型映射"],
              ["panel-test", "连通性测试"],
              ["panel-apply", "应用 Claude 设置"],
              ["panel-state", "状态"],
              ["panel-output", "输出"],
            ].map(([id, title]) => (
              <button
                key={id}
                type="button"
                className={`nav-item ${activePanel === id ? "active" : ""}`}
                onClick={() => setActivePanel(id as PanelId)}
              >
                {title}
              </button>
            ))}
          </nav>
        </aside>

        <section className="content">
          <header className="topbar">
            <div className="title-drag">
              <h1>AWEI · Model Bridge</h1>
              <div className="top-actions">跨模型映射与环境切换工作台</div>
            </div>
          </header>

          {activePanel === "panel-profile" && (
            <section className="panel card" id="panel-profile">
              <h2>Profile 管理</h2>
              <div className="row">
                <button type="button" className="danger" onClick={() => void onRemoveProfile()}>删除当前 Profile</button>
              </div>
              <div className="grid2 mt">
                <select
                  value={providerMode}
                  onChange={(e) => setProviderMode(e.target.value as ProviderMode)}
                >
                  <option value="official-glm">智谱（固定地址）</option>
                  <option value="official-claude">Claude（固定地址）</option>
                  <option value="custom-relay">自定义中转（手动地址）</option>
                </select>
                <input
                  value={relayToken}
                  onChange={(e) => setRelayToken(e.target.value)}
                  placeholder="中转 Key / Token"
                />
              </div>
              {providerMode === "custom-relay" ? (
                <div className="grid2 mt">
                  <input
                    value={relayBaseUrl}
                    onChange={(e) => setRelayBaseUrl(e.target.value)}
                    placeholder="中转地址，例如 http://13.228.77.232:3000/api"
                  />
                  <input value={relayBaseUrl} disabled placeholder="当前中转地址" title={relayBaseUrl} />
                </div>
              ) : (
                <div className="profile-tip mt">
                  固定地址：
                  {providerMode === "official-glm"
                    ? OFFICIAL_URLS["official-glm"]
                    : OFFICIAL_URLS["official-claude"]}
                </div>
              )}
              <button type="button" onClick={() => void onSaveRelayConfig()}>保存中转配置</button>
              <table>
                <thead><tr><th>Key</th><th>Value</th></tr></thead>
                <tbody>
                  {profileValues.map(([k, v]) => (
                    <tr key={k}><td>{k}</td><td>{v}</td></tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {activePanel === "panel-modelmap" && (
            <section className="panel card" id="panel-modelmap">
              <h2>模型映射</h2>
              <div className="grid3">
                <select value={mapTier} onChange={(e) => setMapTier(e.target.value as "opus" | "sonnet" | "haiku")}>
                  <option value="opus">opus</option>
                  <option value="sonnet">sonnet</option>
                  <option value="haiku">haiku</option>
                </select>
                <input value={mapModel} onChange={(e) => setMapModel(e.target.value)} placeholder="目标模型名" />
                <button type="button" onClick={() => void onModelMapSet()}>设置映射</button>
              </div>
            </section>
          )}

          {activePanel === "panel-test" && (
            <section className="panel card" id="panel-test">
              <h2>连通性测试</h2>
              <div className="grid3">
                <input value={testModel} onChange={(e) => setTestModel(e.target.value)} placeholder="模型（留空用默认映射）" />
                <input value={testTimeout} onChange={(e) => setTestTimeout(e.target.value)} placeholder="超时秒" />
                <button type="button" onClick={() => void onTestProfile()}>测试</button>
              </div>
            </section>
          )}

          {activePanel === "panel-apply" && (
            <section className="panel card" id="panel-apply">
              <h2>应用到 Claude 配置文件</h2>
              <div className="grid3">
                <select value={applyScope} onChange={(e) => setApplyScope(e.target.value as "local" | "project" | "user")}>
                  <option value="local">local（推荐）</option>
                  <option value="project">project</option>
                  <option value="user">user</option>
                </select>
                <input value={applyProjectDir} onChange={(e) => setApplyProjectDir(e.target.value)} placeholder="project/local 可填项目目录（可留空）" />
                <button type="button" onClick={() => void onApplySettings()}>写入 settings</button>
              </div>
            </section>
          )}

          {activePanel === "panel-state" && (
            <section className="panel card" id="panel-state">
              <h2>状态</h2>
              <pre>{stateJson}</pre>
            </section>
          )}

          {activePanel === "panel-output" && (
            <section className="panel card" id="panel-output">
              <h2>输出</h2>
              <pre>{output}</pre>
            </section>
          )}
        </section>
      </main>
    </>
  );
}
