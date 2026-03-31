export const quicksetupPanelTemplate = () => `
<section class="panel card" id="panel-quicksetup">
  <h2>快速配置（claude_proxy）</h2>
  <div class="grid2">
    <input id="qs-base-url" placeholder="中转地址，例如 http://13.228.77.232:3000/api" />
    <input id="qs-token" placeholder="中转Token" />
  </div>
  <button type="button" id="btn-quicksetup">一键写入 claude_proxy</button>
</section>`;
