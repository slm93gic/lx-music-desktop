<template>
  <div :class="$style.wrap">
    <SongList ref="list_ref" :list-info="listInfo" @toggle-page="togglePage" />
  </div>
</template>

<script setup lang="ts">
import { watch, ref, nextTick } from '@common/utils/vueTools'
import { listInfo } from '@renderer/store/songList/state'
import { getAndSetList } from '@renderer/store/songList/action'
import { useRouter, useRoute, onBeforeRouteLeave } from '@common/utils/vueRouter'
import SongList from './components/SongList.vue'


const props = defineProps<{
  source: LX.OnlineSource
  tagId: string
  sortId?: string
  page: number
}>()


const list_ref = ref<any>(null)

const router = useRouter()
const route = useRoute()

const getListData = async(source: LX.OnlineSource, tabId: string, sortId: string, page: number) => {
  // console.log(source, tabId, sortId, page)
  await getAndSetList(source, tabId, sortId, page).then(() => {
    if (listInfo.key == window.lx.songListInfo.songlistKey && window.lx.songListInfo.songlistPosition) {
      void nextTick(() => {
        list_ref.value?.scrollTo(window.lx.songListInfo.songlistPosition)
      })
    } else if (list_ref.value) {
      window.lx.songListInfo.songlistKey = null
      void nextTick(() => {
        list_ref.value.scrollTo(0)
      })
    }
  })
}

const togglePage = (page: number) => {
  void router.replace({
    path: route.path,
    query: {
      ...route.query,
      sortId: props.sortId ?? '',
      page,
    },
  })
  // getListData(props.source, props.tagId, props.sortId ?? '', page)
}

watch(() => [props.source, props.tagId, props.sortId, props.page], ([source, tagId, sortId, page]) => {
  // const source = (await getLeaderboardSetting()).source as LX.OnlineSource
  // console.log(source, tagId, sortId)
  if (!source || !sortId) return
  // console.log(source, tagId, sortId, page)
  void getListData(source as LX.OnlineSource, tagId as string, sortId as string, page as number)
}, {
  immediate: true,
})

onBeforeRouteLeave(() => {
  window.lx.songListInfo.songlistKey = listInfo.key
  if (list_ref.value) window.lx.songListInfo.songlistPosition = list_ref.value.getScrollTop()
})

</script>


<style lang="less" module>
/* 视觉展示调整：保证歌单列表有明确高度容器，无业务变更 */
.wrap {
  height: 100%;
  min-height: 0;
  position: relative;
  overflow: hidden;
}
</style>
