<template>
  <ul
    ref="dom_lists_list"
    class="scroll"
    :class="[$style.listsContent, { [$style.maskLeft]: canScrollLeft, [$style.maskRight]: canScrollRight }]"
  >
    <li
      v-for="(item, index) in list"
      :key="item.id" :class="[$style.listsItem, { [$style.active]: item.id == boardId }, { [$style.clicked]: rightClickItemIndex == index }]"
      :aria-label="item.name" @click="handleToggleList(item.id)" @contextmenu="handleRigthClick($event, index)"
    >
      <span :class="$style.listsLabel">
        <transition name="list-active">
          <svg-icon v-if="item.id == boardId" name="angle-right-solid" :class="$style.activeIcon" />
        </transition>
        {{ item.name }}
      </span>
    </li>
  </ul>
  <base-menu
    v-model="isShowMenu"
    :menus="menus"
    :xy="menuLocation"
    item-name="name"
    @menu-click="handleMenuClick"
  />
</template>

<script setup>
import { watch, shallowReactive, ref, nextTick } from '@common/utils/vueTools'
import { getBoardsList, setBoard } from '@renderer/store/leaderboard/action'
import { boards } from '@renderer/store/leaderboard/state'
import useMenu from './useMenu'
import { useRouter, useRoute } from '@common/utils/vueRouter'
import useHorizontalAutoScroll from '@renderer/utils/compositions/useHorizontalAutoScroll'

const props = defineProps({
  source: {
    type: String,
    required: true,
  },
  boardId: {
    type: [String, undefined],
    default: undefined,
  },
})

const emit = defineEmits(['show-menu'])

const router = useRouter()
const route = useRoute()

const list = shallowReactive([])
const rightClickItemIndex = ref(-1)
const dom_lists_list = ref(null)
const { canScrollLeft, canScrollRight, updateOverflow } = useHorizontalAutoScroll(dom_lists_list)

const handleToggleList = (id) => {
  void router.replace({
    path: route.path,
    query: {
      source: props.source,
      boardId: id,
    },
  })
}

const {
  menus,
  menuLocation,
  isShowMenu,
  showMenu,
  menuClick,
} = useMenu({ emit, list })

const handleRigthClick = (event, index) => {
  rightClickItemIndex.value = index
  showMenu(event, index)
}
const handleMenuClick = (action) => {
  if (rightClickItemIndex.value < 0) return
  let index = rightClickItemIndex.value
  rightClickItemIndex.value = -1
  menuClick(action, index, props.source)
}


watch(() => props.source, async(source) => {
  // const source = (await getLeaderboardSetting()).source as LX.OnlineSource
  let boardList = boards[source]
  if (boardList == null) setBoard(boardList = await getBoardsList(source), source)
  list.splice(0, list.length, ...boardList.list)
  if (!props.boardId && boardList.list.length) handleToggleList(boardList.list[0].id)
  void nextTick(() => { updateOverflow() })
}, {
  immediate: true,
})

defineExpose({ hideMenu: handleMenuClick })

</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

/* 视觉展示调整：排行榜榜单导航改为顶部横向胶囊，无业务变更 */
.listsContent {
  flex: auto;
  min-width: 0;
  min-height: 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 4px;
  scrollbar-width: none;
  -webkit-mask-image: linear-gradient(90deg, #000 0%, #000 100%);
  mask-image: linear-gradient(90deg, #000 0%, #000 100%);
  transition: mask-image @transition-fast, -webkit-mask-image @transition-fast;

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
.listsItem {
  position: relative;
  flex: none;
  transition: @transition-fast;
  transition-property: color, background-color, font-weight;
  background-color: transparent;
  border-radius: 999px;
  margin: 0;
  &:hover:not(.active) {
    background-color: rgba(0, 0, 0, 0.04);
    cursor: pointer;
  }
  &.active {
    // background-color:
    color: var(--color-primary);
    background-color: var(--color-primary-alpha-900);
    font-weight: 600;
  }
  &.selected {
    background-color: var(--color-primary-alpha-900);
  }
  &.clicked {
    background-color: rgba(0, 0, 0, 0.05);
  }
  &.editing {
    padding: 0 10px;
    background-color: rgba(0, 0, 0, 0.04);
    .listsLabel {
      display: none;
    }
    .listsInput {
      display: block;
    }
  }
}
.activeIcon {
  display: none;
}
.listsLabel {
  display: block;
  height: 100%;
  padding: 0 14px;
  font-size: 13px;
  line-height: 34px;
  white-space: nowrap;
  .mixin-ellipsis-1();
}


</style>

