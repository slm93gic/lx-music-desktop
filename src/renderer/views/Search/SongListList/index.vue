<template>
  <div :class="$style.container">
    <SongList ref="listRef" :list-info="listInfo" :visible-source="sourceId == 'all'" @toggle-page="togglePage" />
  </div>
</template>

<script setup lang="ts">
import { watch } from '@common/utils/vueTools'
import { searchText } from '@renderer/store/search/state'
import { useRouter, useRoute } from '@common/utils/vueRouter'
import useList, { type SearchSource } from './useList'
import SongList from '@renderer/views/songList/List/components/SongList.vue'

interface Props {
  sourceId: SearchSource
  page: number
}

const props = defineProps<Props>()
const router = useRouter()
const route = useRoute()

const {
  listRef,
  listInfo,
  search,
} = useList()

watch(() => [props.sourceId, props.page], ([sourceId, page]) => {
  setTimeout(() => {
    search(searchText.value, sourceId as SearchSource, page as number || 1)
  })
})
watch(searchText, (searchText) => {
  setTimeout(() => {
    search(searchText, props.sourceId, props.page)
  })
}, {
  immediate: true,
})

const togglePage = (page: number) => {
  void router.replace({
    path: route.path,
    query: {
      ...route.query,
      page,
    },
  })
  // search(searchText.value, props.sourceId, page)
}


</script>


<style lang="less" module>
/* 视觉展示调整：搜索歌单结果容器留白，无业务变更 */
.container {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  padding: 8px 8px 0;
  box-sizing: border-box;
}

// .list {
//   overflow: hidden;
//   height: 100%;
//   flex: auto;
// }

</style>
