import { applySettingsPanelTemplate } from "../features/apply-settings/apply-settings.template";
import { modelMappingPanelTemplate } from "../features/model-mapping/model-mapping.template";
import { navigationTemplate } from "../features/navigation/navigation.template";
import { outputPanelTemplate, statePanelTemplate } from "../features/output/output.template";
import { profilePanelTemplate } from "../features/profiles/profiles.template";
import { quicksetupPanelTemplate } from "../features/profiles/quicksetup.template";
import { testingPanelTemplate } from "../features/testing/testing.template";
import { titlebarTemplate } from "../features/titlebar/titlebar.template";

export const createAppLayout = () => `${titlebarTemplate()}
<main class="layout">
  ${navigationTemplate()}
  <section class="content">
    <header class="topbar">
      <div class="title-drag">
        <h1>AWEI · Model Bridge</h1>
        <div class="top-actions">跨模型映射与环境切换工作台</div>
      </div>
    </header>
    ${quicksetupPanelTemplate()}
    ${profilePanelTemplate()}
    ${modelMappingPanelTemplate()}
    ${testingPanelTemplate()}
    ${applySettingsPanelTemplate()}
    ${statePanelTemplate()}
    ${outputPanelTemplate()}
  </section>
</main>`;
