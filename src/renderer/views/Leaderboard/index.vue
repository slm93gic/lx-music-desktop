<template>
  <div :class="$style.leaderboard">
    <div :class="$style.lists">
      <div :class="$style.listsSelect">
        <base-selection :model-value="source" :class="$style.select" :list="sourceList" item-key="id" item-name="name" @update:model-value="handleToggleSource" />
      </div>
      <BoardList ref="boardListRef" :board-id="boardId" :source="source" @show-menu="$refs.musicListRef?.hideMenu()" />
    </div>
    <div :class="$style.list">
      <MusicList ref="musicListRef" :source="source" :board-id="boardId" @show-menu="$refs.boardListRef?.hideMenu()" />
    </div>
  </div>
</template>

<script>
import { computed, ref } from '@common/utils/vueTools'
import { getLeaderboardSetting, setLeaderboardSetting } from '@renderer/utils/data'
import BoardList from './BoardList/index.vue'
import MusicList from './MusicList/index.vue'
import { sources } from '@renderer/store/leaderboard/state'
import { sourceNames } from '@renderer/store'
import { useRoute, useRouter } from '@common/utils/vueRouter'


const source = ref('')
const boardId = ref(null)

const verifyQueryParams = async function(to, from, next) {
  let _source = to.query.source
  let _boardId = to.query.boardId

  if (_source == null) {
    const setting = await getLeaderboardSetting()
    if (_source == null) {
      _source = setting.source
      _boardId = setting.boardId
    }
    next({
      path: to.path,
      query: { ...to.query, source: _source, boardId: _boardId },
    })
    return
  }
  next()
  source.value = _source
  boardId.value = _boardId
  void setLeaderboardSetting({ source: _source, boardId: _boardId })
}


export default {
  components: {
    BoardList,
    MusicList,
  },
  beforeRouteEnter: verifyQueryParams,
  beforeRouteUpdate: verifyQueryParams,
  setup() {
    const musicListRef = ref(null)
    const boardListRef = ref(null)
    const sourceList = computed(() => {
      return sources.map(s => ({ id: s, name: sourceNames.value[s] }))
    })
    const router = useRouter()
    const route = useRoute()
    const handleToggleSource = (id) => {
      void router.replace({
        path: route.path,
        query: {
          source: id,
        },
      })
    }

    return {
      source,
      boardId,
      sourceList,
      handleToggleSource,
      musicListRef,
      boardListRef,
    }
  },
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

/* 视觉展示调整：排行榜左侧导航改为顶部横向，无业务变更 */
.leaderboard {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  min-height: 0;
  background-color: transparent;
}
.header {
  flex: none;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;

}
.tab {
  flex: auto;
}
.select {
  flex: none;
  width: auto;
  min-width: 110px;
}
.content {
  flex: auto;
  display: flex;
  overflow: hidden;
  flex-flow: column nowrap;
}

.lists {
  flex: none;
  width: 100%;
  max-width: none;
  min-width: 0;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 10px;
  padding: 10px 16px 8px;
  border-right: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background-color: transparent;
  box-sizing: border-box;
}
.listsHeader {
  position: relative;
}

.listsSelect {
  font-size: 13px;
  margin-bottom: 0;
  padding: 0;
  border-bottom: none;
  flex: none;
  width: 120px;
  min-width: 100px;

  &:hover {
    :global(.icon) {
      opacity: 1;
    }
  }

  >:global(.content) {
    display: block;
    width: 100%;
  }
  :global(.label-content) {
    background-color: rgba(0, 0, 0, 0.04) !important;
    line-height: 34px;
    height: 34px;
    border-radius: 999px;
    padding: 0 12px;
    transition: background-color @transition-fast;
    &:hover {
      background-color: rgba(0, 0, 0, 0.06) !important;
    }
  }
  :global(.label) {
    color: rgba(0, 0, 0, 0.78) !important;
    font-weight: 600;
  }
  :global(.icon) {
    opacity: .55;
    transition: opacity .3s ease;
    color: var(--color-primary);
  }

  :global(.selection-list) {
    max-height: 500px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    li {
      // background-color: var(--color-main-background);
      line-height: 38px;
      font-size: 13px;
      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }
      &:active {
        background-color: var(--color-primary-alpha-900);
        color: var(--color-primary);
      }
    }
  }
  // line-height: 38px;
  // padding: 0 10px;
}

.list {
  position: relative;
  overflow: hidden;
  height: 100%;
  flex: auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-flow: column nowrap;
  padding: 0 4px;
  // .noItem {

  // }
}

</style>
