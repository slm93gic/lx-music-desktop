<template>
  <div :class="$style.main">
    <div
      ref="dom_toc_ref"
      class="scroll"
      :class="[$style.toc, { [$style.maskLeft]: canScrollLeft, [$style.maskRight]: canScrollRight }]"
    >
      <ul :class="$style.tocList" role="toolbar">
        <li v-for="h2 in tocList" :key="h2.id" :class="$style.tocListItem" role="presentation">
          <h2
            :class="[$style.tocH2, {[$style.active]: avtiveComponentName == h2.id }]"
            role="tab" :aria-selected="avtiveComponentName == h2.id"
            :aria-label="h2.title" ignore-tip @click="toggleTab(h2.id)"
          >
            <transition name="list-active">
              <svg-icon v-if="avtiveComponentName == h2.id" name="angle-right-solid" :class="$style.activeIcon" />
            </transition>
            {{ h2.title }}
          </h2>
          <!-- <ul v-if="h2.children.length" :class="$style.tocList">
            <li v-for="h3 in h2.children" :key="h3.id" :class="$style.tocSubListItem">
              <h3 :class="[$style.tocH3, toc.activeId == h3.id ? $style.active : null]" :aria-label="h3.title">
                <a :href="'#' + h3.id" @click.stop="toc.activeId = h3.id">{{ h3.title }}</a>
              </h3>
            </li>
          </ul> -->
        </li>
      </ul>
    </div>
    <div ref="dom_content_ref" class="scroll" :class="$style.setting">
      <dl>
        <component :is="avtiveComponentName" />
        <!-- <SettingBasic />
        <SettingPlay />
        <SettingPlayDetail />
        <SettingDesktopLyric />
        <SettingSearch />
        <SettingList />
        <SettingDownload />
        <SettingSync />
        <SettingHotKey />
        <SettingNetwork />
        <SettingOdc />
        <SettingBackup />
        <SettingOther />
        <SettingUpdate />
        <SettingAbout /> -->
      </dl>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick } from '@common/utils/vueTools'
// import { currentStting } from './setting'
import { useI18n } from '@renderer/plugins/i18n'
import { useRoute } from '@common/utils/vueRouter'
import useHorizontalAutoScroll from '@renderer/utils/compositions/useHorizontalAutoScroll'

import SettingBasic from './components/SettingBasic.vue'
import SettingPlay from './components/SettingPlay.vue'
import SettingPlayDetail from './components/SettingPlayDetail.vue'
import SettingDesktopLyric from './components/SettingDesktopLyric.vue'
import SettingSearch from './components/SettingSearch.vue'
import SettingList from './components/SettingList.vue'
import SettingDownload from './components/SettingDownload.vue'
import SettingSync from './components/SettingSync/index.vue'
import SettingOpenAPI from './components/SettingOpenAPI.vue'
import SettingHotKey from './components/SettingHotKey.vue'
import SettingNetwork from './components/SettingNetwork.vue'
import SettingOdc from './components/SettingOdc.vue'
import SettingBackup from './components/SettingBackup.vue'
import SettingOther from './components/SettingOther.vue'
import SettingUpdate from './components/SettingUpdate.vue'
import SettingAbout from './components/SettingAbout.vue'

export default {
  name: 'Setting',
  components: {
    SettingBasic,
    SettingPlay,
    SettingPlayDetail,
    SettingDesktopLyric,
    SettingSearch,
    SettingList,
    SettingDownload,
    SettingSync,
    SettingOpenAPI,
    SettingHotKey,
    SettingNetwork,
    SettingOdc,
    SettingBackup,
    SettingOther,
    SettingUpdate,
    SettingAbout,
  },
  setup() {
    const t = useI18n()
    const route = useRoute()

    const dom_content_ref = ref(null)
    const dom_toc_ref = ref(null)
    const { canScrollLeft, canScrollRight } = useHorizontalAutoScroll(dom_toc_ref)

    const tocList = computed(() => {
      return [
        { id: 'SettingBasic', title: t('setting__basic') },
        { id: 'SettingPlay', title: t('setting__play') },
        { id: 'SettingPlayDetail', title: t('setting__play_detail') },
        { id: 'SettingDesktopLyric', title: t('setting__desktop_lyric') },
        { id: 'SettingSearch', title: t('setting__search') },
        { id: 'SettingList', title: t('setting__list') },
        { id: 'SettingDownload', title: t('setting__download') },
        { id: 'SettingHotKey', title: t('setting__hot_key') },
        { id: 'SettingSync', title: t('setting__sync') },
        { id: 'SettingOpenAPI', title: t('setting__open_api') },
        { id: 'SettingNetwork', title: t('setting__network') },
        { id: 'SettingOdc', title: t('setting__odc') },
        { id: 'SettingBackup', title: t('setting__backup') },
        { id: 'SettingOther', title: t('setting__other') },
        { id: 'SettingUpdate', title: t('setting__update') },
        { id: 'SettingAbout', title: t('setting__about') },
      ]
    })

    const avtiveComponentName = ref(route.query.name && tocList.value.some(t => t.id == route.query.name)
      ? route.query.name
      : tocList.value[0].id)

    const toggleTab = id => {
      avtiveComponentName.value = id
      void nextTick(() => {
        dom_content_ref.value?.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      })
    }

    return {
      tocList,
      avtiveComponentName,
      dom_content_ref,
      dom_toc_ref,
      canScrollLeft,
      canScrollRight,
      toggleTab,
    }
  },
  // mounted() {
  //   this.initTOC()
  // },
  // methods: {
  //   initTOC() {
  //     const list = this.$refs.dom_setting_list.children
  //     const toc = []
  //     let prevTitle
  //     for (const item of list) {
  //       if (item.tagName == 'DT') {
  //         prevTitle = {
  //           title: item.innerText.replace(/[（(].+?[)）]/, ''),
  //           id: item.getAttribute('id'),
  //           dom: item,
  //           children: [],
  //         }
  //         toc.push(prevTitle)
  //         continue
  //       }
  //       const h3 = item.querySelector('h3')
  //       if (h3) {
  //         prevTitle.children.push({
  //           title: h3.innerText.replace(/[（(].+?[)）]/, ''),
  //           id: h3.getAttribute('id'),
  //           dom: h3,
  //         })
  //       }
  //     }
  //     console.log(toc)
  //     this.toc.list = toc
  //   },
  //   handleListScroll(event) {
  //     // console.log(event.target.scrollTop)
  //   },
  // },
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

/* 视觉展示调整：设置页左侧导航改为顶部横向胶囊，无业务变更 */
.main {
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  min-height: 0;
  border-top: none;
  background-color: transparent;
}

.toc {
  flex: none;
  width: 100%;
  max-width: none;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 10px 16px 8px;
  box-sizing: border-box;
  border-right: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  scrollbar-width: none;
  -webkit-mask-image: linear-gradient(90deg, #000 0%, #000 100%);
  mask-image: linear-gradient(90deg, #000 0%, #000 100%);

  &::-webkit-scrollbar {
    display: none;
  }

  &.maskRight {
    -webkit-mask-image: linear-gradient(90deg, #000 0%, #000 calc(100% - 36px), transparent 100%);
    mask-image: linear-gradient(90deg, #000 0%, #000 calc(100% - 36px), transparent 100%);
  }
  &.maskLeft {
    -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 36px, #000 100%);
    mask-image: linear-gradient(90deg, transparent 0%, #000 36px, #000 100%);
  }
  &.maskLeft.maskRight {
    -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 36px, #000 calc(100% - 36px), transparent 100%);
    mask-image: linear-gradient(90deg, transparent 0%, #000 36px, #000 calc(100% - 36px), transparent 100%);
  }
}

.tocList {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 6px;
}

.tocListItem {
  margin: 0;
  flex: none;
}

.tocH2 {
  line-height: 34px;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.72);
  padding: 0 14px;
  margin: 0;
  border-radius: 999px;
  transition: @transition-fast;
  transition-property: background-color, color, font-weight;

  &:not(.active) {
    cursor: pointer;
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
      color: rgba(0, 0, 0, 0.88);
    }
  }
  &.active {
    color: var(--color-primary);
    background-color: var(--color-primary-alpha-900);
    font-weight: 600;
  }
}
.activeIcon {
  display: none;
}
// .tocH3 {
//   font-size: 13px;
//   opacity: .8;
// }

// .tocList {
//   .tocList {
//     // padding-left: 15px;
//   }
// }
// .tocSubListItem {
//   padding-top: 10px;
// }

.setting {
  /* 视觉展示调整：设置内容区加大字阶与段间距，无业务变更 */
  padding: 16px 28px 28px;
  font-size: 14px;
  box-sizing: border-box;
  overflow-y: auto;
  height: 100%;
  position: relative;
  width: 100%;
  min-width: 0;
  flex: auto;

  :global {
    dt {
      border-left: 3px solid var(--color-primary);
      padding: 8px 14px;
      margin: 24px 0 12px;
      border-radius: 0 10px 10px 0;
      font-weight: 600;
      font-size: 15px;
      background-color: rgba(0, 0, 0, 0.025);

      + dd h3 {
        margin-top: 0;
      }
    }

    dd {
      // margin-left: 15px;
      // font-size: 13px;
      > div {
        padding: 0 16px;
      }

    }
    h3 {
      font-size: 13px;
      font-weight: 600;
      margin: 28px 0 14px;
      color: rgba(0, 0, 0, 0.5);
    }
    .p {
      padding: 6px 0;
      line-height: 1.55;
      .btn {
        + .btn {
          margin-left: 10px;
        }
      }
    }

    .help-btn {
      padding: 0;
      margin: 0 0.4em;
      border: none;
      background: none;
      color: var(--color-primary);
      cursor: pointer;
      transition: opacity 0.2s ease;
      &:hover {
        opacity: 0.7;
      }
    }
    .help-icon {
      margin: 0 0.4em;
    }
  }
}

// .btn-content {
//   display: inline-block;
//   transition: @transition-theme;
//   transition-property: opacity, transform;
//   opacity: 1;
//   transform: scale(1);

//   &.hide {
//     opacity: 0;
//     transform: scale(0);
//   }
// }


// :global(dt):target, :global(h3):target {
//   animation: highlight 1s ease;
// }

// @keyframes highlight {
//   from { background: yellow; }
//   to { background: transparent; }
// }

</style>

