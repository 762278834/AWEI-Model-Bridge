use reqwest::blocking::Client;
use reqwest::header::{HeaderMap, HeaderValue, CONTENT_TYPE};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::Duration;
use tauri::Window;

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
struct ConfigFile {
    profiles: BTreeMap<String, BTreeMap<String, String>>,
}

#[derive(Debug, Serialize)]
struct UiState {
    profiles: Vec<String>,
    active_profile: Option<String>,
    config_path: String,
    state_path: String,
}

#[derive(Debug, Serialize)]
struct ProfileDetail {
    name: String,
    values: BTreeMap<String, String>,
}

#[derive(Debug, Serialize)]
struct ModelMap {
    opus: Option<String>,
    sonnet: Option<String>,
    haiku: Option<String>,
}

#[derive(Debug, Serialize)]
struct TestResult {
    ok: bool,
    http_status: Option<u16>,
    reason: String,
    suggestion: String,
    raw: String,
}

fn app_dir() -> Result<PathBuf, String> {
    let base = dirs::data_local_dir()
        .or_else(dirs::home_dir)
        .ok_or_else(|| "无法定位本地数据目录".to_string())?;
    let dir = base.join("llm-switcher-tauri");
    fs::create_dir_all(&dir).map_err(|e| format!("创建数据目录失败: {e}"))?;
    Ok(dir)
}

fn config_path() -> Result<PathBuf, String> {
    Ok(app_dir()?.join("profiles.json"))
}

fn state_path() -> Result<PathBuf, String> {
    Ok(app_dir()?.join("state.json"))
}

fn read_json(path: &Path) -> Result<Value, String> {
    let text =
        fs::read_to_string(path).map_err(|e| format!("读取文件失败 {}: {e}", path.display()))?;
    serde_json::from_str::<Value>(&text)
        .map_err(|e| format!("JSON 解析失败 {}: {e}", path.display()))
}

fn load_config() -> Result<ConfigFile, String> {
    let path = config_path()?;
    if !path.exists() {
        let cfg = ConfigFile::default();
        save_config(&cfg)?;
        return Ok(cfg);
    }
    let val = read_json(&path)?;
    serde_json::from_value::<ConfigFile>(val).map_err(|e| format!("配置格式错误: {e}"))
}

fn save_config(cfg: &ConfigFile) -> Result<(), String> {
    let path = config_path()?;
    let text = serde_json::to_string_pretty(cfg).map_err(|e| format!("序列化配置失败: {e}"))?;
    fs::write(&path, format!("{text}\n"))
        .map_err(|e| format!("写入配置失败 {}: {e}", path.display()))
}

fn active_profile() -> Result<Option<String>, String> {
    let path = state_path()?;
    if !path.exists() {
        return Ok(None);
    }
    let v = read_json(&path)?;
    Ok(v.get("active_profile")
        .and_then(|x| x.as_str())
        .map(|s| s.to_string()))
}

fn save_active_profile(profile: &str) -> Result<(), String> {
    let path = state_path()?;
    let data = json!({"active_profile": profile});
    let text = serde_json::to_string_pretty(&data).map_err(|e| format!("状态序列化失败: {e}"))?;
    fs::write(&path, format!("{text}\n")).map_err(|e| format!("写入状态失败: {e}"))
}

fn classify_error(http: Option<u16>, message: &str) -> (String, String) {
    let msg = message.to_lowercase();
    if msg.contains("no available claude accounts support") {
        return (
            "中转服务当前无可用 Claude 账号/容量，无法分配模型。".into(),
            "稍后重试，或切换可用账号池。".into(),
        );
    }
    if msg.contains("invalid api key") || msg.contains("api key not found") || http == Some(401) {
        return (
            "鉴权失败（API Key/Token 无效或未生效）。".into(),
            "更新 Token 后重试。".into(),
        );
    }
    if msg.contains("not_found_error") || msg.contains("model:") || http == Some(404) {
        return (
            "模型不可用或路由不匹配。".into(),
            "调整模型映射后重试。".into(),
        );
    }
    if msg.contains("forbidden") || http == Some(403) {
        return (
            "请求被拒绝（权限/策略限制）。".into(),
            "检查账号权限与中转策略。".into(),
        );
    }
    (
        format!(
            "未分类错误: {}",
            message.chars().take(180).collect::<String>()
        ),
        "查看原始响应并修正配置。".into(),
    )
}

fn pick_model(profile: &BTreeMap<String, String>, override_model: Option<String>) -> String {
    if let Some(m) = override_model {
        if !m.is_empty() {
            return m;
        }
    }
    profile
        .get("ANTHROPIC_DEFAULT_SONNET_MODEL")
        .cloned()
        .or_else(|| profile.get("ANTHROPIC_DEFAULT_OPUS_MODEL").cloned())
        .or_else(|| profile.get("ANTHROPIC_DEFAULT_HAIKU_MODEL").cloned())
        .unwrap_or_else(|| "claude-3-5-sonnet-20241022".to_string())
}

fn settings_path(scope: &str, project_dir: Option<String>) -> Result<PathBuf, String> {
    match scope {
        "user" => Ok(dirs::home_dir()
            .ok_or_else(|| "无法定位用户目录".to_string())?
            .join(".claude")
            .join("settings.json")),
        "project" => {
            let base = project_dir
                .map(PathBuf::from)
                .unwrap_or(std::env::current_dir().map_err(|e| e.to_string())?);
            Ok(base.join(".claude").join("settings.json"))
        }
        "local" => {
            let base = project_dir
                .map(PathBuf::from)
                .unwrap_or(std::env::current_dir().map_err(|e| e.to_string())?);
            Ok(base.join(".claude").join("settings.local.json"))
        }
        _ => Err("scope 仅支持 user/project/local".into()),
    }
}

#[tauri::command]
fn get_ui_state() -> Result<UiState, String> {
    let cfg = load_config()?;
    let mut names = cfg.profiles.keys().cloned().collect::<Vec<_>>();
    names.sort();
    Ok(UiState {
        profiles: names,
        active_profile: active_profile()?,
        config_path: config_path()?.display().to_string(),
        state_path: state_path()?.display().to_string(),
    })
}

#[tauri::command]
fn get_profile(name: String) -> Result<ProfileDetail, String> {
    let cfg = load_config()?;
    let values = cfg
        .profiles
        .get(&name)
        .cloned()
        .ok_or_else(|| format!("profile 不存在: {name}"))?;
    Ok(ProfileDetail { name, values })
}

#[tauri::command]
fn set_field(profile: String, key: String, value: String) -> Result<(), String> {
    let mut cfg = load_config()?;
    cfg.profiles.entry(profile).or_default().insert(key, value);
    save_config(&cfg)
}

#[tauri::command]
fn remove_profile(profile: String) -> Result<(), String> {
    let mut cfg = load_config()?;
    if cfg.profiles.remove(&profile).is_none() {
        return Err(format!("profile 不存在: {profile}"));
    }
    save_config(&cfg)
}

#[tauri::command]
fn use_profile(profile: String) -> Result<(), String> {
    let cfg = load_config()?;
    if !cfg.profiles.contains_key(&profile) {
        return Err(format!("profile 不存在: {profile}"));
    }
    save_active_profile(&profile)
}

#[tauri::command]
fn quicksetup_claude_proxy(base_url: String, token: String) -> Result<(), String> {
    let mut cfg = load_config()?;
    let p = cfg.profiles.entry("claude_proxy".into()).or_default();
    p.insert(
        "ANTHROPIC_BASE_URL".into(),
        base_url.trim_end_matches('/').to_string(),
    );
    p.insert("ANTHROPIC_AUTH_TOKEN".into(), token.clone());
    p.insert("ANTHROPIC_API_KEY".into(), token);
    p.insert("ANTHROPIC_VERSION".into(), "2023-06-01".into());
    p.entry("ANTHROPIC_DEFAULT_OPUS_MODEL".into())
        .or_insert_with(|| "claude-opus-4-1-20250805".into());
    p.entry("ANTHROPIC_DEFAULT_SONNET_MODEL".into())
        .or_insert_with(|| "claude-3-5-sonnet-20241022".into());
    p.entry("ANTHROPIC_DEFAULT_HAIKU_MODEL".into())
        .or_insert_with(|| "claude-3-5-haiku-20241022".into());
    save_config(&cfg)
}

#[tauri::command]
fn model_map_show(profile: String) -> Result<ModelMap, String> {
    let cfg = load_config()?;
    let p = cfg
        .profiles
        .get(&profile)
        .ok_or_else(|| format!("profile 不存在: {profile}"))?;
    Ok(ModelMap {
        opus: p.get("ANTHROPIC_DEFAULT_OPUS_MODEL").cloned(),
        sonnet: p.get("ANTHROPIC_DEFAULT_SONNET_MODEL").cloned(),
        haiku: p.get("ANTHROPIC_DEFAULT_HAIKU_MODEL").cloned(),
    })
}

#[tauri::command]
fn model_map_set(profile: String, tier: String, model: String) -> Result<(), String> {
    let mut cfg = load_config()?;
    let p = cfg.profiles.entry(profile).or_default();
    let key = match tier.as_str() {
        "opus" => "ANTHROPIC_DEFAULT_OPUS_MODEL",
        "sonnet" => "ANTHROPIC_DEFAULT_SONNET_MODEL",
        "haiku" => "ANTHROPIC_DEFAULT_HAIKU_MODEL",
        _ => return Err("tier 仅支持 opus/sonnet/haiku".into()),
    };
    p.insert(key.into(), model);
    save_config(&cfg)
}

#[tauri::command]
fn test_profile(
    profile: String,
    model: Option<String>,
    timeout_secs: Option<u64>,
) -> Result<TestResult, String> {
    let cfg = load_config()?;
    let p = cfg
        .profiles
        .get(&profile)
        .ok_or_else(|| format!("profile 不存在: {profile}"))?;
    let base = p
        .get("ANTHROPIC_BASE_URL")
        .ok_or_else(|| "缺少 ANTHROPIC_BASE_URL".to_string())?
        .trim_end_matches('/')
        .to_string();
    let token = p
        .get("ANTHROPIC_AUTH_TOKEN")
        .or_else(|| p.get("ANTHROPIC_API_KEY"))
        .ok_or_else(|| "缺少 ANTHROPIC_AUTH_TOKEN/API_KEY".to_string())?
        .to_string();

    let mut headers = HeaderMap::new();
    headers.insert(
        "x-api-key",
        HeaderValue::from_str(&token).map_err(|e| e.to_string())?,
    );
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    if let Some(v) = p.get("ANTHROPIC_VERSION") {
        headers.insert(
            "anthropic-version",
            HeaderValue::from_str(v).map_err(|e| e.to_string())?,
        );
    }

    let client = Client::builder()
        .timeout(Duration::from_secs(timeout_secs.unwrap_or(20)))
        .default_headers(headers)
        .build()
        .map_err(|e| format!("创建 HTTP 客户端失败: {e}"))?;

    let selected = pick_model(p, model);
    let url = format!("{base}/v1/messages");
    let payload = json!({
        "model": selected,
        "max_tokens": 32,
        "stream": false,
        "messages": [{"role": "user", "content": "ping"}]
    });

    let resp = client.post(url).json(&payload).send();
    match resp {
        Ok(r) => {
            let status = r.status().as_u16();
            let raw = r.text().unwrap_or_default();
            if (200..300).contains(&status) {
                Ok(TestResult {
                    ok: true,
                    http_status: Some(status),
                    reason: String::new(),
                    suggestion: String::new(),
                    raw,
                })
            } else {
                let (reason, suggestion) = classify_error(Some(status), &raw);
                Ok(TestResult {
                    ok: false,
                    http_status: Some(status),
                    reason,
                    suggestion,
                    raw,
                })
            }
        }
        Err(e) => {
            let msg = e.to_string();
            let (reason, suggestion) = classify_error(None, &msg);
            Ok(TestResult {
                ok: false,
                http_status: None,
                reason,
                suggestion,
                raw: msg,
            })
        }
    }
}

#[tauri::command]
fn apply_claude_settings(
    profile: String,
    scope: String,
    project_dir: Option<String>,
) -> Result<String, String> {
    let cfg = load_config()?;
    let p = cfg
        .profiles
        .get(&profile)
        .ok_or_else(|| format!("profile 不存在: {profile}"))?;
    let target = settings_path(&scope, project_dir)?;
    if let Some(parent) = target.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("创建目录失败: {e}"))?;
    }

    let mut root = if target.exists() {
        read_json(&target)?
    } else {
        json!({})
    };
    if !root.is_object() {
        root = json!({});
    }
    let env = root.get("env").cloned().unwrap_or_else(|| json!({}));
    let mut env_obj = env.as_object().cloned().unwrap_or_default();
    for (k, v) in p {
        if k.starts_with("ANTHROPIC_") || k == "API_TIMEOUT_MS" || k.starts_with("CLAUDE_CODE_") {
            env_obj.insert(k.clone(), Value::String(v.clone()));
        }
    }
    if let Some(obj) = root.as_object_mut() {
        obj.insert("env".into(), Value::Object(env_obj));
    }

    let text = serde_json::to_string_pretty(&root).map_err(|e| format!("序列化失败: {e}"))?;
    fs::write(&target, format!("{text}\n")).map_err(|e| format!("写入失败: {e}"))?;
    Ok(target.display().to_string())
}

#[tauri::command]
fn window_minimize(window: Window) -> Result<(), String> {
    window.minimize().map_err(|e| format!("最小化失败: {e}"))
}

#[tauri::command]
fn window_toggle_maximize(window: Window) -> Result<bool, String> {
    let maximized = window
        .is_maximized()
        .map_err(|e| format!("读取窗口状态失败: {e}"))?;
    if maximized {
        window
            .unmaximize()
            .map_err(|e| format!("还原窗口失败: {e}"))?;
        Ok(false)
    } else {
        window.maximize().map_err(|e| format!("最大化失败: {e}"))?;
        Ok(true)
    }
}

#[tauri::command]
fn window_close(window: Window) -> Result<(), String> {
    window.close().map_err(|e| format!("关闭窗口失败: {e}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_ui_state,
            get_profile,
            set_field,
            remove_profile,
            use_profile,
            quicksetup_claude_proxy,
            model_map_show,
            model_map_set,
            test_profile,
            apply_claude_settings,
            window_minimize,
            window_toggle_maximize,
            window_close,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
