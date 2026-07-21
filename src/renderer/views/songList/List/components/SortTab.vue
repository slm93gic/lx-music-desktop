<template>
  <base-tab :model-value="sortId" :class="$style.tab" :list="list" item-label="name" @change="handleToggle" />
</template>

<script setup>
import { watch, shallowReactive } from '@common/utils/vueTools'
import { sortList } from '@renderer/store/songList/state'
import { useRouter, useRoute } from '@common/utils/vueRouter'

const props = defineProps({
  source: {
    type: String,
    required: true,
  },
  tagId: {
    type: String,
    required: true,
  },
  sortId: {
    type: String,
    default: '',
  },
})

const router = useRouter()
const route = useRoute()

const list = shallowReactive([])


const handleToggle = (id) => {
  void router.replace({
    path: route.path,
    query: {
      source: props.source,
      tagId: props.tagId,
      sortId: id,
    },
  })
}
watch(() => props.source, async(source) => {
  // const source = (await getLeaderboardSetting()).source as LX.OnlineSource
  if (!source) return
  let _list = sortList[source] ?? []
  list.splice(0, list.length, ..._list)
  if (!props.sortId && list.length) handleToggle(list[0].id)
  // console.log(list)
}, {
  immediate: true,
})
</script>


<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

/* 视觉展示调整：排序筛选胶囊化，无业务变更 */
.tagList {
  font-size: 13px;
  position: relative;

  &.active {
    .label {
      .icon {
        svg{
          transform: rotate(180deg);
        }
      }
    }
    .list {
      opacity: 1;
      transform: scaleY(1);
    }
  }
}

.label {
  padding: 8px 14px;
  transition: background-color @transition-normal, color @transition-normal;
  box-sizing: border-box;
  text-align: center;
  color: rgba(0, 0, 0, 0.7);
  cursor: pointer;
  border-radius: 999px;
  font-weight: 500;

  display: flex;

  span {
    flex: auto;
  }
  .icon {
    flex: none;
    margin-left: 7px;
    line-height: 0;
    svg {
      width: .9em;
      transition: transform .2s ease;
      transform: rotate(0);
    }
  }

  &:hover {
    background-color: var(--color-primary-alpha-900);
    color: var(--color-primary);
  }
  &:active {
    color: var(--color-primary);
  }
}

.list {
  position: absolute;
  top: 100%;
  width: 200px;
  left: 0;
  margin-top: 8px;
  border-radius: @radius-border;
  background-color: var(--color-content-background);
  opacity: 0;
  transform: scaleY(0);
  overflow-y: auto;
  transform-origin: 0 0 0;
  max-height: 250px;
  transition: .25s ease;
  transition-property: transform, opacity;
  z-index: 10;
  padding: 8px;
  box-sizing: border-box;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, .1));

  li {
    cursor: pointer;
    padding: 8px 14px;
    text-align: center;
    outline: none;
    transition: background-color @transition-normal, color @transition-normal;
    background-color: transparent;
    box-sizing: border-box;
    border-radius: 999px;
    color: rgba(0, 0, 0, 0.7);

    &:hover {
      background-color: var(--color-primary-alpha-900);
      color: var(--color-primary);
    }
    &:active {
      background-color: var(--color-primary-alpha-800);
    }
  }
}

.type {
  padding-top: 10px;
  padding-bottom: 4px;
  color: rgba(0, 0, 0, 0.4);
}

.tag {
  display: inline-block;
  margin: 4px;
  background-color: rgba(0, 0, 0, 0.04);
  padding: 7px 12px;
  border-radius: 999px;
  transition: background-color @transition-normal, color @transition-normal;
  cursor: pointer;
  &:hover {
    background-color: var(--color-primary-alpha-900);
    color: var(--color-primary);
  }
  &:active {
    background-color: var(--color-primary-alpha-800);
  }
}


</style>
