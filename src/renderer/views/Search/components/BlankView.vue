<template>
  <transition enter-active-class="animated-fast fadeIn" leave-active-class="animated-fast fadeOut">
    <div v-show="props.visible" :class="$style.noitem">
      <div v-if="appSetting['search.isShowHotSearch'] || (appSetting['search.isShowHistorySearch'] && historyList.length)" class="scroll" :class="$style.noitemListContainer">
        <dl v-if="appSetting['search.isShowHotSearch']" :class="[$style.noitemList, $style.noitemHotSearchList]">
          <dt :class="$style.noitemListTitle">{{ $t('search__hot_search') }}</dt>
          <dd v-for="(item, index) in hotSearchList" :key="index" :class="$style.noitemListItem" @click="handleSearch(item)">{{ item }}</dd>
        </dl>
        <dl v-if="appSetting['search.isShowHistorySearch'] && historyList.length" :class="$style.noitemList">
          <dt :class="$style.noitemListTitle">
            <span>{{ $t('history_search') }}</span><span :class="$style.historyClearBtn" :aria-label="$t('history_clear')" @click="clearHistoryList">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 512 512" space="preserve">
                <use xlink:href="#icon-eraser" />
              </svg></span>
          </dt>
          <dd v-for="(item, index) in historyList" :key="index + item" :class="$style.noitemListItem" :aria-label="$t('history_remove')" @contextmenu="removeHistoryWord(index)" @click="handleSearch(item)">{{ item }}</dd>
        </dl>
      </div>
      <div v-else :class="$style.noitem_label">
        <p>{{ $t('search__welcome') }}</p>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { watch, shallowRef } from '@common/utils/vueTools'
import { historyList } from '@renderer/store/search/state'
import { getHistoryList, removeHistoryWord, clearHistoryList } from '@renderer/store/search/action'
import { getList } from '@renderer/store/hotSearch'
import { appSetting } from '@renderer/store/setting'
import { useRouter } from '@common/utils/vueRouter'

const props = defineProps({
  visible: Boolean,
  source: {
    type: String,
    required: true,
  },
})

const hotSearchList = shallowRef([])

if (appSetting['search.isShowHotSearch']) {
  watch(() => props.visible, (visible) => {
    if (!visible) return
    void getList(props.source).then(list => {
      hotSearchList.value = list
    })
  }, {
    immediate: true,
  })

  watch(() => props.source, (source) => {
    if (!props.visible) return
    void getList(source).then(list => {
      if (source != props.source) return
      hotSearchList.value = list
    })
  })
}

if (appSetting['search.isShowHistorySearch']) {
  void getHistoryList()
}

const router = useRouter()
const handleSearch = (text) => {
  void router.replace({
    path: '/search',
    query: {
      text,
    },
  })
}

</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

/* 视觉展示调整：搜索空状态与热搜标签，无业务变更 */
.noitem {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-flow: column nowrap;
  // justify-content: center;
}
.noitemListContainer {
  padding: 4% 24px 24px;
  // margin-top: -20px;
  min-height: 250px;
  max-height: 94.7%;
}
.noitemList {
  +.noitemList {
    margin-top: 20px;
  }
}
.noitemHotSearchList {
  min-height: 106px;
}
.noitemListTitle {
  color: rgba(0, 0, 0, 0.55);
  padding: 6px 8px 12px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.noitemListItem {
  display: inline-block;
  margin: 4px 5px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(0, 0, 0, 0.035) 100%);
  padding: 8px 14px;
  border-radius: 999px;
  transition: background-color @transition-fast, color @transition-fast, box-shadow @transition-fast;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.72);
  .mixin-ellipsis-1();
  max-width: 160px;
  font-size: 13px;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
  &:hover {
    background: linear-gradient(135deg, rgba(51, 94, 234, 0.1) 0%, rgba(51, 94, 234, 0.06) 100%);
    color: var(--color-primary);
    box-shadow: inset 0 0 0 1px rgba(51, 94, 234, 0.12);
  }
  &:active {
    background-color: var(--color-primary-alpha-800);
  }
}
.historyClearBtn {
  padding: 0 5px;
  margin-left: 5px;
  color: var(--color-font-label);
  cursor: pointer;
  transition: @transition-normal;
  transition-property: color, opacity;
  opacity: .3;
  &:hover {
    color: var(--color-primary);
    opacity: .85;
  }
  &:active {
    color: var(--color-primary);
    opacity: 1;
  }
  svg {
    vertical-align: middle;
    width: 15px;
  }
}

.noitem_label {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  p {
    font-size: 20px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.28);
    text-align: center;
  }
}
</style>
