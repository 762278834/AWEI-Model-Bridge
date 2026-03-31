export const testingPanelTemplate = () => `
<section class="panel card hidden" id="panel-test">
  <h2>连通性测试</h2>
  <div class="grid3">
    <input id="test-model" placeholder="模型（留空用默认映射）" />
    <input id="test-timeout" value="20" placeholder="超时秒" />
    <button type="button" id="btn-test">测试</button>
  </div>
</section>`;
