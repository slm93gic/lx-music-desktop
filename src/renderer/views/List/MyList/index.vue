<template>
  <div ref="dom_lists" :class="$style.lists">
    <div :class="$style.listHeader">
      <h2 :class="$style.listsTitle">{{ $t('my_list') }}</h2>
      <div :class="$style.headerBtns">
        <button :class="$style.listsAdd" :aria-label="$t('lists__new_list_btn')" @click="isShowNewList = true">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="70%" viewBox="0 0 24 24" space="preserve">
            <use xlink:href="#icon-list-add" />
          </svg>
        </button>
        <button :class="$style.listsAdd" :aria-label="$t('list_update_modal__title')" @click="isShowListUpdateModal = true">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" style="transform: rotate(45deg);" height="70%" viewBox="0 0 24 24" space="preserve">
            <use xlink:href="#icon-refresh" />
          </svg>
        </button>
      </div>
    </div>
    <ul
      ref="dom_lists_list"
      class="scroll"
      :class="[$style.listsContent, { [$style.sortable]: isModDown, [$style.maskLeft]: canScrollLeft, [$style.maskRight]: canScrollRight }]"
    >
      <li
        class="default-list" :class="[$style.listsItem, {[$style.active]: defaultList.id == listId}, {[$style.clicked]: rightClickItemIndex == -2}, {[$style.fetching]: fetchingListStatus[defaultList.id]}]"
        :aria-label="$t(defaultList.name)" :aria-selected="defaultList.id == listId"
        @contextmenu="handleListsItemRigthClick($event, -2)" @click="handleListToggle(defaultList.id)"
      >
        <!-- <div v-if="defaultList.id == listId" :class="$style.activeIcon">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="40%" viewBox="0 0 451.846 451.847" space="preserve">
            <use xlink:href="#icon-right" />
          </svg>
        </div> -->
        <span :class="$style.listsLabel">
          <transition name="list-active">
            <svg-icon v-if="defaultList.id == listId" name="angle-right-solid" :class="$style.activeIcon" />
          </transition>
          {{ $t(defaultList.name) }}
        </span>
      </li>
      <li
        class="default-list" :class="[$style.listsItem, {[$style.active]: loveList.id == listId}, {[$style.clicked]: rightClickItemIndex == -1}, {[$style.fetching]: fetchingListStatus[loveList.id]}]"
        :aria-label="$t(loveList.name)" :aria-selected="loveList.id == listId"
        @contextmenu="handleListsItemRigthClick($event, -1)" @click="handleListToggle(loveList.id)"
      >
        <span :class="$style.listsLabel">
          <transition name="list-active">
            <svg-icon v-if="loveList.id == listId" name="angle-right-solid" :class="$style.activeIcon" />
          </transition>
          {{ $t(loveList.name) }}
        </span>
      </li>
      <li
        v-for="(item, index) in userLists"
        :key="item.id" class="user-list"
        :class="[$style.listsItem, {[$style.active]: item.id == listId}, {[$style.clicked]: rightClickItemIndex == index}, {[$style.fetching]: fetchingListStatus[item.id]}]"
        :data-index="index" :aria-label="item.name" :aria-selected="defaultList.id == listId" @contextmenu="handleListsItemRigthClick($event, index)"
      >
        <span :class="$style.listsLabel" @click="handleListToggle(item.id, index + 2)">
          <transition name="list-active">
            <svg-icon v-if="item.id == listId" name="angle-right-solid" :class="$style.activeIcon" />
          </transition>
          {{ item.name }}
        </span>
        <base-input
          :class="$style.listsInput" type="text" :value="item.name"
          :placeholder="item.name" @keyup.enter="handleSaveListName(index, $event)" @blur="handleSaveListName(index, $event)"
        />
      </li>
      <transition enter-active-class="animated-fast slideInLeft" leave-active-class="animated-fast fadeOut" @after-leave="isNewListLeave = false" @after-enter="$refs.dom_listsNewInput.focus()">
        <li v-if="isShowNewList" :class="[$style.listsItem, $style.listsNew, {[$style.newLeave]: isNewListLeave}]">
          <base-input
            ref="dom_listsNewInput" :class="$style.listsInput" type="text" :placeholder="$t('lists__new_list_input')"
            @keyup.enter="handleCreateList" @blur="handleCreateList"
          />
        </li>
      </transition>
    </ul>
    <base-menu v-model="isShowMenu" :menus="menus" :xy="menuLocation" item-name="name" @menu-click="handleMenuClick" />
    <DuplicateMusicModal v-model:visible="isShowDuplicateMusicModal" :list-info="duplicateListInfo" />
    <ListSortModal v-model:visible="isShowListSortModal" :list-info="sortListInfo" />
    <ListUpdateModal v-model:visible="isShowListUpdateModal" />
  </div>
</template>

<script>
import { openUrl } from '@common/utils/electron'

import musicSdk from '@renderer/utils/musicSdk'
import DuplicateMusicModal from './components/DuplicateMusicModal.vue'
import ListSortModal from './components/ListSortModal.vue'
import ListUpdateModal from './components/ListUpdateModal.vue'

import { defaultList, loveList, userLists, fetchingListStatus } from '@renderer/store/list/state'
import { removeUserList } from '@renderer/store/list/action'

import { ref, watch } from '@common/utils/vueTools'
import { useRouter } from '@common/utils/vueRouter'
import { LIST_IDS } from '@common/constants'

import { dialog } from '@renderer/plugins/Dialog'

import { saveListPrevSelectId } from '@renderer/utils/data'

import { useI18n } from '@renderer/plugins/i18n'


import useShare from './useShare'
import useMenu from './useMenu'
import useListUpdate from './useListUpdate'
import useSort from './useSort'
import useDarg from './useDarg'
import useEditList from './useEditList'
import useListScroll from './useListScroll'
import useDuplicate from './useDuplicate'
import useHorizontalAutoScroll from '@renderer/utils/compositions/useHorizontalAutoScroll'

export default {
  name: 'MyLists',
  components: {
    DuplicateMusicModal,
    ListSortModal,
    ListUpdateModal,
  },
  props: {
    listId: {
      type: String,
      required: true,
    },
  },
  emits: ['show-menu'],
  setup(props, { emit }) {
    const router = useRouter()
    const t = useI18n()

    const dom_lists_list = ref(null)
    const rightClickItemIndex = ref(-10)
    const { canScrollLeft, canScrollRight } = useHorizontalAutoScroll(dom_lists_list)

    const { handleImportList, handleExportList } = useShare()
    const { isShowListUpdateModal, handleUpdateSourceList } = useListUpdate()
    const { isShowListSortModal, sortListInfo, handleSortList } = useSort()
    const { isShowDuplicateMusicModal, duplicateListInfo, handleDuplicateList } = useDuplicate()
    const { handleRename, handleSaveListName, isShowNewList, isNewListLeave, handleCreateList } = useEditList({ dom_lists_list })
    useListScroll({ dom_lists_list })

    const handleOpenSourceDetailPage = async(listInfo) => {
      const { source, sourceListId } = listInfo
      if (!sourceListId) return
      let url
      if (/board__/.test(sourceListId)) {
        const id = sourceListId.replace(/board__/, '')
        url = musicSdk[source].leaderboard.getDetailPageUrl(id)
      } else if (musicSdk[source]?.songList?.getDetailPageUrl) {
        url = await musicSdk[source].songList.getDetailPageUrl(sourceListId)
      }
      if (!url) return
      void openUrl(url)
    }

    const handleRemove = (listInfo) => {
      void dialog.confirm({
        message: t('lists__remove_tip', { name: listInfo.name }),
        confirmButtonText: t('lists__remove_tip_button'),
      }).then(isRemove => {
        if (!isRemove) return
        void removeUserList([listInfo.id])
        if (props.listId == listInfo.id) {
          handleListToggle(LIST_IDS.DEFAULT)
        }
      })
    }

    const {
      menus,
      menuLocation,
      isShowMenu,
      showMenu,
      menuClick,
    } = useMenu({
      emit,

      handleImportList,
      handleExportList,
      handleUpdateSourceList,
      handleOpenSourceDetailPage,
      handleSortList,
      handleDuplicateList,
      handleRename,
      handleRemove,
    })

    const handleListsItemRigthClick = (event, index) => {
      rightClickItemIndex.value = index
      showMenu(event, index)
    }

    const handleListToggle = (id) => {
      if (id == props.listId) return
      router.replace({
        path: '/list',
        query: { id },
      }).catch(_ => _)
    }

    const handleMenuClick = (action) => {
      if (rightClickItemIndex.value < -2) return
      let index = rightClickItemIndex.value
      rightClickItemIndex.value = -10
      menuClick(action, index)
    }

    const { isModDown } = useDarg({ dom_lists_list, handleMenuClick, handleSaveListName })


    watch(() => props.listId, (listId) => {
      saveListPrevSelectId(listId)
    })

    watch(() => userLists, (lists) => {
      if (lists.some(l => l.id == props.listId)) return
      void router.replace({
        path: '/list',
        query: {
          id: defaultList.id,
        },
      })
    })

    return {
      rightClickItemIndex,
      defaultList,
      loveList,
      userLists,
      fetchingListStatus,
      dom_lists_list,
      isShowListUpdateModal,
      isShowListSortModal,
      sortListInfo,
      isShowDuplicateMusicModal,
      duplicateListInfo,
      handleSaveListName,
      isShowNewList,
      isNewListLeave,
      handleCreateList,
      handleListsItemRigthClick,
      isShowMenu,
      handleMenuClick,
      menus,
      menuLocation,
      handleListToggle,
      isModDown,
      canScrollLeft,
      canScrollRight,
      hideMenu: handleMenuClick,
    }
  },
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

/* 视觉展示调整：我的列表侧栏改为顶部横向导航，无业务变更 */
@lists-item-height: 34px;
.lists {
  flex: none;
  width: 100%;
  max-width: none;
  min-width: 0;
  display: flex;
  flex-flow: column nowrap;
  background-color: transparent;
  border-right: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 8px 16px 10px;
  box-sizing: border-box;
}
.listHeader {
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  border-bottom: none;
  margin-bottom: 6px;
  padding: 0 0 4px;
  &:hover {
    .listsAdd {
      opacity: 1;
    }
  }
}
.listsTitle {
  flex: auto;
  font-size: 15px;
  font-weight: 700;
  line-height: 34px;
  padding: 0 4px;
  letter-spacing: 0.01em;
  color: rgba(0, 0, 0, 0.82);
  .mixin-ellipsis-1();
}
.headerBtns {
  flex: none;
  display: flex;
  align-items: center;
  gap: 2px;
}
.listsAdd {
  // position: absolute;
  // right: 0;
  margin-top: 0;
  background: none;
  height: 28px;
  width: 28px;
  border: none;
  outline: none;
  border-radius: 8px;
  cursor: pointer;
  opacity: .25;
  transition: opacity @transition-normal, background-color @transition-fast;
  color: rgba(0, 0, 0, 0.55);
  svg {
    vertical-align: bottom;
  }
  &:active {
    opacity: .7 !important;
  }
  &:hover {
    opacity: .85 !important;
    background-color: rgba(0, 0, 0, 0.05);
  }
}
.listsContent {
  flex: none;
  min-width: 0;
  min-height: 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 6px;
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
  // border-right: 1px solid rgba(0, 0, 0, 0.12);

  &.sortable {
    * {
      -webkit-user-drag: element;
    }

    .listsItem {
      &:hover, &.active, &.selected, &.clicked {
        background-color: transparent !important;
      }

      &.dragingItem {
        background-color: rgba(0, 0, 0, 0.06) !important;
      }
    }
  }
}
.listsItem {
  position: relative;
  flex: none;
  transition: @transition-fast;
  transition-property: color, background-color, opacity, font-weight;
  background-color: transparent;
  border-radius: 999px;
  margin: 0;
  &:not(.active) {
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
      cursor: pointer;
    }
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
  &.fetching {
    opacity: .5;
  }
  &.editing {
    padding: 0 12px;
    min-width: 120px;
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
  height: @lists-item-height;
  padding: 0 14px;
  font-size: 13px;
  line-height: @lists-item-height;
  white-space: nowrap;
  max-width: 160px;
  .mixin-ellipsis-1();
}
.listsInput {
  width: 100%;
  height: @lists-item-height;
  // border: none;
  padding: 0;
  // padding-bottom: 1px;
  line-height: @lists-item-height;
  background: none !important;
  border-radius: 0;
  // outline: none;
  font-size: 13px;
  display: none;
  // font-family: inherit;
}

.listsNew {
  padding: 0 12px;
  min-width: 140px;
  background-color: rgba(0, 0, 0, 0.04) !important;
  .listsInput {
    display: block;
  }
}
.newLeave {
  margin-top: 0;
  margin-left: -140px;
  z-index: -1;
}


</style>
