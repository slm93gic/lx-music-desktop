<template>
  <!-- 视觉展示调整：侧栏导航已上移至顶栏，此处仅保留占位兼容，无业务变更 -->
  <div :class="[$style.aside, { [$style.fullscreen]: isFullscreen }, $style.hidden]" />
</template>

<script setup>
import { isFullscreen } from '@renderer/store'

</script>


<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

/* 视觉展示调整：隐藏左侧导航栏，无业务变更 */
.aside {
  display: none;
}

.hidden {
  display: none;
}

.fullscreen {
  display: none;
}

</style>
