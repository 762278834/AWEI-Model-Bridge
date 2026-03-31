export const modelMappingPanelTemplate = () => `
<section class="panel card hidden" id="panel-modelmap">
  <h2>模型映射</h2>
  <div class="grid3">
    <select id="map-tier">
      <option value="opus">opus</option>
      <option value="sonnet" selected>sonnet</option>
      <option value="haiku">haiku</option>
    </select>
    <input id="map-model" placeholder="目标模型名" />
    <button type="button" id="btn-map-set">设置映射</button>
  </div>
</section>`;
