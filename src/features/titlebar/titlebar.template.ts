export const titlebarTemplate = () => `
<header id="window-titlebar">
  <div id="window-title-drag" class="window-title" data-tauri-drag-region>
    AWEI · Model Bridge
  </div>
  <div class="window-controls">
    <button type="button" class="win-btn" id="btn-theme-toggle" title="切换主题">🌙</button>
    <button type="button" class="win-btn" id="btn-win-minimize" title="最小化">－</button>
    <button type="button" class="win-btn" id="btn-win-maximize" title="最大化/还原">□</button>
    <button type="button" class="win-btn win-close" id="btn-win-close" title="关闭">✕</button>
  </div>
</header>`;
