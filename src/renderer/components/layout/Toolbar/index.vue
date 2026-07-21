<template>
  <!-- 视觉展示调整：顶栏仿 YesPlayMusic 左 Logo / 中导航 / 右搜索，无业务变更 -->
  <div :class="[$style.toolbar, { [$style.fullscreen]: isFullscreen }]">
    <div :class="$style.left">
      <ControlBtns v-if="appSetting['common.controlBtnPosition'] == 'left'" />
      <div :class="$style.logo">LX</div>
    </div>
    <NavBar />
    <div :class="$style.right">
      <div :class="$style.searchWrap">
        <SearchInput />
      </div>
      <ControlBtns v-if="appSetting['common.controlBtnPosition'] != 'left'" />
    </div>
  </div>
</template>

<script setup>
import { isFullscreen } from '@renderer/store'
import { appSetting } from '@renderer/store/setting'
import ControlBtns from './ControlBtns.vue'
import SearchInput from './SearchInput.vue'
import NavBar from '../Aside/NavBar.vue'

</script>


<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

/* 视觉展示调整：YesPlayMusic 风格三栏顶栏，无业务变更 */
.toolbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  height: @height-toolbar;
  align-items: center;
  padding: 0 16px;
  column-gap: 12px;
  -webkit-app-region: drag;
  z-index: 2;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  background: @gradient-toolbar;
  backdrop-filter: blur(20px);

  &.fullscreen {
    -webkit-app-region: no-drag;
    .logo {
      display: none;
    }
  }
}

.left {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-self: start;
  min-width: 0;
}

.logo {
  box-sizing: border-box;
  padding: 0 8px;
  color: var(--color-primary);
  flex: none;
  font-weight: 800;
  letter-spacing: 0.06em;
  font-size: 15px;
  -webkit-app-region: no-drag;
}

.right {
  display: flex;
  align-items: center;
  justify-self: end;
  gap: 8px;
  min-width: 0;
}

.searchWrap {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  -webkit-app-region: no-drag;
}

</style>
