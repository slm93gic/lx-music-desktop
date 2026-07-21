<template>
  <!-- 视觉展示调整：仿 YesPlayMusic 居中文字导航，无业务变更 -->
  <div ref="dom_menu" :class="$style.menu">
    <ul ref="dom_list" :class="[$style.list, { [$style.maskLeft]: canScrollLeft, [$style.maskRight]: canScrollRight }]" role="toolbar">
      <li v-for="item in menus" :key="item.to" :class="$style.navItem" role="presentation">
        <router-link :class="[$style.link, {[$style.active]: $route.meta.name == item.name}]" role="tab" :aria-selected="$route.meta.name == item.name" :to="item.to" :aria-label="item.tips">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" :viewBox="item.iconSize" :height="item.size" :width="item.size" space="preserve">
            <use :xlink:href="item.icon" />
          </svg>
          <span :class="$style.label">{{ item.tips }}</span>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { appSetting } from '@renderer/store/setting'
import { useI18n } from '@root/lang'
import { ref, computed } from '@common/utils/vueTools'
import useHorizontalAutoScroll from '@renderer/utils/compositions/useHorizontalAutoScroll'

export default {
  name: 'NavBar',
  setup() {
    const t = useI18n()
    const dom_menu = ref<HTMLElement>()
    const dom_list = ref<HTMLElement | null>(null)
    // 视觉展示调整：图标仅作无障碍备用，顶栏以文字为主，无业务变更
    const iconSize = 14
    const { canScrollLeft, canScrollRight } = useHorizontalAutoScroll(dom_list)

    const menus = computed(() => {
      const size = iconSize
      return [
        {
          to: '/search',
          tips: t('search'),
          icon: '#icon-search-2',
          iconSize: '0 0 425.2 425.2',
          size,
          name: 'Search',
          enable: true,
        },
        {
          to: '/songList/list',
          tips: t('song_list'),
          icon: '#icon-album',
          iconSize: '0 0 425.2 425.2',
          size,
          name: 'SongList',
          enable: true,
        },
        {
          to: '/leaderboard',
          tips: t('leaderboard'),
          icon: '#icon-leaderboard',
          iconSize: '0 0 425.22 425.2',
          size,
          name: 'Leaderboard',
          enable: true,
        },
        {
          to: '/list',
          tips: t('my_list'),
          icon: '#icon-love',
          iconSize: '0 0 444.87 391.18',
          size,
          name: 'List',
          enable: true,
        },
        {
          to: '/download',
          tips: t('download'),
          icon: '#icon-download-2',
          iconSize: '0 0 425.2 425.2',
          size,
          enable: appSetting['download.enable'],
          name: 'Download',
        },
        {
          to: '/setting',
          tips: t('setting'),
          icon: '#icon-setting',
          iconSize: '0 0 493.23 436.47',
          size,
          enable: true,
          name: 'Setting',
        },
      ].filter(m => m.enable)
    })
    return {
      appSetting,
      menus,
      dom_menu,
      dom_list,
      canScrollLeft,
      canScrollRight,
    }
  },
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

/* 视觉展示调整：YesPlayMusic 风格文字导航，无业务变更 */
.menu {
  flex: none;
  justify-self: center;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}
.list {
  -webkit-app-region: no-drag;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 4px;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  min-width: 0;
  -webkit-mask-image: linear-gradient(90deg, #000 0%, #000 100%);
  mask-image: linear-gradient(90deg, #000 0%, #000 100%);

  &::-webkit-scrollbar {
    display: none;
  }

  &.maskRight {
    -webkit-mask-image: linear-gradient(90deg, #000 0%, #000 calc(100% - 28px), transparent 100%);
    mask-image: linear-gradient(90deg, #000 0%, #000 calc(100% - 28px), transparent 100%);
  }
  &.maskLeft {
    -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 28px, #000 100%);
    mask-image: linear-gradient(90deg, transparent 0%, #000 28px, #000 100%);
  }
  &.maskLeft.maskRight {
    -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 28px, #000 calc(100% - 28px), transparent 100%);
    mask-image: linear-gradient(90deg, transparent 0%, #000 28px, #000 calc(100% - 28px), transparent 100%);
  }
}
.navItem {
  position: relative;
  flex: none;
}
.link {
  box-sizing: border-box;
  height: 36px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  border-radius: 8px;
  transition: color @transition-fast, background-color @transition-fast;
  color: rgba(0, 0, 0, 0.48);
  cursor: pointer;
  outline: none;
  text-decoration: none;
  white-space: nowrap;

  /* 视觉展示调整：隐藏图标，保留文字，无业务变更 */
  svg {
    display: none;
  }

  &.active {
    color: var(--color-primary);
    background-color: transparent;
    font-weight: 700;

    &:hover {
      color: var(--color-primary);
      background-color: transparent;
    }
  }

  &:hover:not(.active) {
    color: rgba(0, 0, 0, 0.82);
    background-color: transparent;
  }

  &:active:not(.active) {
    opacity: .7;
  }
}

.label {
  font-size: 15px;
  line-height: 1;
  letter-spacing: 0.02em;
}

</style>
