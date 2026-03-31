export const profilePanelTemplate = () => `
<section class="panel card hidden" id="panel-profile">
  <h2>Profile 管理</h2>
  <div class="row">
    <button type="button" id="btn-remove" class="danger">删除当前 Profile</button>
  </div>

  <div class="grid2 mt">
    <input id="set-key" placeholder="字段名，如 ANTHROPIC_BASE_URL" />
    <input id="set-value" placeholder="字段值" />
  </div>
  <button type="button" id="btn-set-field">保存字段</button>

  <table>
    <thead>
      <tr><th>Key</th><th>Value</th></tr>
    </thead>
    <tbody id="fields-table"></tbody>
  </table>
</section>`;
