export const applySettingsPanelTemplate = () => `
<section class="panel card hidden" id="panel-apply">
  <h2>应用到 Claude 配置文件</h2>
  <div class="grid3">
    <select id="apply-scope">
      <option value="local" selected>local（推荐）</option>
      <option value="project">project</option>
      <option value="user">user</option>
    </select>
    <input id="apply-project-dir" placeholder="project/local 可填项目目录（可留空）" />
    <button type="button" id="btn-apply">写入 settings</button>
  </div>
</section>`;
