export const navigationTemplate = () => `
<aside class="rail">
  <div class="rail-logo">A</div>
  <div class="rail-dot active"></div>
  <div class="rail-dot"></div>
  <div class="rail-dot"></div>
</aside>

<aside class="sidebar">
  <div class="brand">AWEI</div>
  <div class="subtitle">Claude Code Model Bridge</div>

  <div class="profile-box">
    <label class="label">当前 Profile</label>
    <select id="profile-select"></select>
    <div class="row mt">
      <button type="button" id="btn-refresh">刷新</button>
      <button type="button" id="btn-use">设为当前</button>
    </div>
  </div>

  <nav class="nav">
    <button type="button" class="nav-item active" data-target="panel-quicksetup">快速配置</button>
    <button type="button" class="nav-item" data-target="panel-profile">Profile 管理</button>
    <button type="button" class="nav-item" data-target="panel-modelmap">模型映射</button>
    <button type="button" class="nav-item" data-target="panel-test">连通性测试</button>
    <button type="button" class="nav-item" data-target="panel-apply">应用 Claude 设置</button>
    <button type="button" class="nav-item" data-target="panel-state">状态</button>
    <button type="button" class="nav-item" data-target="panel-output">输出</button>
  </nav>
</aside>`;
