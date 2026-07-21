<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <div :class="$style.left">
        <tag-list :source="source" :tag-id="tagId" :sort-id="sortId" />
        <sort-tab :source="source" :tag-id="tagId" :sort-id="sortId" />
      </div>
      <base-btn :class="$style.btn" outline min @click="visibleOpenSongListModal = true">{{ $t('songlist__import_input_show_btn') }}</base-btn>
      <base-selection :model-value="source" :class="$style.select" :list="sourceList" item-key="id" item-name="name" @update:model-value="handleToggleSource" />
    </div>
    <div :class="$style.main">
      <list-view :source="source" :tag-id="tagId" :sort-id="sortId" :page="page" />
    </div>
    <open-list-modal v-model="visibleOpenSongListModal" :source-list="sourceList" />
  </div>
</template>

<script lang="ts">
import { computed, ref } from '@common/utils/vueTools'
import { getSongListSetting, setSongListSetting } from '@renderer/utils/data'
import TagList from './components/TagList.vue'
import SortTab from './components/SortTab.vue'
import OpenListModal from './components/OpenListModal.vue'
import ListView from './ListView.vue'
import { sources, listInfo, isVisibleListDetail } from '@renderer/store/songList/state'
import { sourceNames } from '@renderer/store'
import { useRoute, useRouter } from '@common/utils/vueRouter'

const source = ref<LX.OnlineSource>('kw')
const tagId = ref<string>('')
const sortId = ref<string>('')
const page = ref<number>(1)


interface Query {
  source?: string
  tagId?: string
  sortId?: string
  page?: string
}

const verifyQueryParams = async function(this: any, to: { query: Query, path: string }, from: any, next: (route?: { path: string, query: Query }) => void) {
  let _source = to.query.source
  let _tagId = to.query.tagId
  let _sortId = to.query.sortId
  let _page: string | undefined = to.query.page

  if (isVisibleListDetail.value) {
    next({ path: '/songList/detail', query: {} })
    return
  } else if (_source == null) {
    if (listInfo.key) {
      _source = listInfo.source
      _tagId = listInfo.tagId
      _sortId = listInfo.sortId
      _page = listInfo.page.toString()
    } else {
      const setting = await getSongListSetting()
      _source = setting.source
      _tagId = setting.tagId
      _sortId = setting.sortId
      _page = '1'
    }

    next({
      path: to.path,
      query: { ...to.query, source: _source, tagId: _tagId, sortId: _sortId, page: _page },
    })
    return
  }
  next()
  source.value = _source as LX.OnlineSource
  tagId.value = _tagId ?? ''
  sortId.value = _sortId ?? ''
  page.value = _page ? parseInt(_page) : 1
  void setSongListSetting({ source: _source, tagId: _tagId, sortId: _sortId })
}


export default {
  components: {
    TagList,
    SortTab,
    ListView,
    OpenListModal,
  },
  beforeRouteEnter: verifyQueryParams,
  beforeRouteUpdate: verifyQueryParams,
  setup() {
    const visibleOpenSongListModal = ref(false)

    const sourceList = computed(() => {
      return sources.map(s => ({ id: s, name: sourceNames.value[s] }))
    })
    const router = useRouter()
    const route = useRoute()
    const handleToggleSource = (id: LX.OnlineSource) => {
      if (id == source.value) return
      void router.replace({
        path: route.path,
        query: {
          source: id,
          tagId: '',
        },
      })
    }

    return {
      source,
      tagId,
      sortId,
      page,
      sourceList,
      handleToggleSource,
      visibleOpenSongListModal,
    }
  },
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

/* 视觉展示调整：歌单页顶栏留白，无业务变更 */
.container {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  padding-top: 4px;
  min-height: 0;
}
.header {
  flex: none;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  // padding-right: 5px;
  // box-sizing: border-box;
  padding: 6px 16px 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}
.left {
  flex: auto;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

/* 视觉展示调整：列表区占满剩余高度，避免空白塌陷，无业务变更 */
.main {
  flex: auto;
  min-height: 0;
  position: relative;
  overflow: hidden;
}

.btn {
  color: rgba(0, 0, 0, 0.55);
  transition: color @transition-fast;
  background: none !important;
  border-radius: 999px;
  &:hover {
    color: var(--color-primary);
  }
}


.select {
  font-size: 12px;
  width: auto;
  flex: none;
  padding: 0 5px;

  &:hover {
    :global(.icon) {
      opacity: 1;
    }
  }


  :global {
    .label-content {
      background-color: transparent !important;
      transition: color @transition-fast;
      color: var(--color-font);
      // line-height: 38px;
      // height: 38px;
      border-radius: 0;
      &:hover {
        // background: none !important;
        color: var(--color-primary-font-hover);
        .icon {
          opacity: 1;
          // color: var(--color-primary-font-hover);
        }
      }
    }
    // .label {
    //   color: var(--color-font) !important;
    // }
    .icon {
      svg {
        width: .8em;
      }
      // opacity: .6;
      // transition: color @transition-fast;
      // color: var(--color-font-label);
    }

    .selection-list {
      max-height: 500px;
      box-shadow: 0 1px 4px 0 rgba(0,0,0,.2);
      li {
        // background-color: var(--color-main-background);
        text-align: center;
        line-height: 38px;
        font-size: 13px;
        &:hover {
          background-color: var(--color-button-background-hover);
        }
        &:active {
          background-color: var(--color-button-background-active);
        }
      }
    }
  }
}

</style>
