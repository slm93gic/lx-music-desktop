<template>
  <div :class="$style.container">
    <!-- 视觉展示调整：歌单详情头图对齐 YesPlayMusic 大气布局，无业务变更 -->
    <div :class="$style.songListHeader">
      <div :class="$style.songListHeaderLeft" :style="{ backgroundImage: 'url('+(picUrl || listDetailInfo.info.img)+')' }">
        <!-- <span v-if="listDetailInfo.info.play_count" :class="$style.playNum">{{ listDetailInfo.info.play_count }}</span> -->
      </div>
      <div :class="$style.songListHeaderMiddle">
        <h3 :title="listDetailInfo.info.name">{{ listDetailInfo.info.name }}</h3>
        <div :class="$style.meta">
          <span>{{ $t('song_list') }}</span>
          <span v-if="listDetailInfo.info.author"> · {{ listDetailInfo.info.author }}</span>
          <span v-if="listDetailInfo.info.play_count"> · {{ listDetailInfo.info.play_count }}</span>
          <span v-if="listDetailInfo.total"> · {{ listDetailInfo.total }} 首</span>
        </div>
        <p v-if="listDetailInfo.info.desc" :title="listDetailInfo.info.desc">{{ listDetailInfo.info.desc }}</p>
        <div :class="$style.actions">
          <base-btn
            :class="[$style.headerRightBtn, $style.playBtn]"
            :disabled="!!listDetailInfo.noItemLabel"
            @click="playSongListDetail(listDetailInfo.id, listDetailInfo.source, listDetailInfo.list)"
          >
            {{ $t('list__play') }}
          </base-btn>
          <base-btn
            outline
            :class="[$style.headerRightBtn, $style.secondaryBtn]"
            :disabled="!!listDetailInfo.noItemLabel"
            @click="addSongListDetail(listDetailInfo.id, listDetailInfo.source, listDetailInfo.info.name)"
          >
            {{ $t('list__collect') }}
          </base-btn>
          <base-btn
            outline
            :class="[$style.headerRightBtn, $style.secondaryBtn]"
            @click="handleBack"
          >
            {{ $t('back') }}
          </base-btn>
        </div>
      </div>
    </div>
    <div :class="$style.list">
      <material-online-list
        ref="listRef"
        :page="listDetailInfo.page"
        :limit="listDetailInfo.limit"
        :total="listDetailInfo.total"
        :list="listDetailInfo.list"
        :no-item="listDetailInfo.noItemLabel"
        @play-list="handlePlayList"
        @toggle-page="togglePage"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { ref, watch } from '@common/utils/vueTools'
import { listDetailInfo } from '@renderer/store/songList/state'
import { setVisibleListDetail } from '@renderer/store/songList/action'
import { useRouter } from '@common/utils/vueRouter'
import { addSongListDetail, playSongListDetail } from './action'
import useList from './useList'
import useKeyBack from './useKeyBack'


const source = ref<LX.OnlineSource>('kw')
const id = ref<string>('')
const page = ref<number>(1)
const picUrl = ref<string>('')
const refresh = ref<boolean>(false)


interface Query {
  source?: string
  id?: string
  page?: string
  picUrl?: string
  refresh?: 'true'
  fromName?: string
}

const verifyQueryParams = async function(this: any, to: { query: Query, path: string }, from: any, next: (route?: { path: string, query: Query }) => void) {
  let _source = to.query.source
  let _id = to.query.id
  let _page: string | undefined = to.query.page
  let _picUrl: string | undefined = to.query.picUrl
  let _refresh: 'true' | undefined = to.query.refresh

  if (_source == null || _id == null) {
    if (listDetailInfo.key) {
      _source = listDetailInfo.source
      _id = listDetailInfo.id
      _page = listDetailInfo.page.toString()
      _picUrl = listDetailInfo.info.img
    } else {
      setVisibleListDetail(false)
      next({ path: '/songList/list', query: {} })
      return
    }

    next({
      path: to.path,
      query: { ...to.query, source: _source, id: _id, page: _page, picUrl: _picUrl, refresh: _refresh },
    })
    return
  }
  next()
  setVisibleListDetail(true)
  source.value = _source as LX.OnlineSource
  id.value = _id
  page.value = _page ? parseInt(_page) : 1
  picUrl.value = _picUrl ?? ''
  refresh.value = _refresh ? _refresh == 'true' : false
  if (to.query.fromName) window.lx.songListInfo.fromName = to.query.fromName
}


export default {
  beforeRouteEnter: verifyQueryParams,
  beforeRouteUpdate: verifyQueryParams,
  setup() {
    const router = useRouter()

    const {
      listRef,
      listDetailInfo,
      getListData,
      handlePlayList,
    } = useList()


    const togglePage = (page: number) => {
      void getListData(source.value, id.value, page, refresh.value)
    }

    const handleBack = () => {
      setVisibleListDetail(false)
      if (window.lx.songListInfo.fromName) void router.replace({ name: window.lx.songListInfo.fromName })
      else router.back()
    }

    useKeyBack(handleBack)

    watch([source, id, page, refresh], async([_source, _id, _page, _refresh]) => {
      if (!_source || !_id) return router.replace({ path: '/songList/list' })
      // console.log(_source, _id, _page, _refresh, picUrl.value)
      // source.value = _source
      // id.value = _id
      // refresh.value = _refresh
      // page.value = _page ?? 1
      void getListData(_source, _id, _page, _refresh)
    }, {
      immediate: true,
    })

    return {
      source,
      id,
      page,
      picUrl,
      listDetailInfo,
      listRef,
      togglePage,
      addSongListDetail,
      playSongListDetail,
      handlePlayList,
      handleBack,
    }
  },
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

/* 视觉展示调整：歌单详情头图对齐 YesPlayMusic（大封面/大标题/按钮在下），无业务变更 */
.container {
  // position: absolute;
  // left: 0;
  // top: 0;
  // width: 100%;
  // height: 100%;
  display: flex;
  flex-flow: column nowrap;
  padding-top: 12px;
}

.songListHeader {
  flex: none;
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
  min-height: 180px;
  padding: 20px 28px 24px;
  gap: 24px;
  margin: 0 16px 8px;
  border-radius: 18px;
  background: @gradient-detail-header;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  position: relative;
  overflow: hidden;

  &:after {
    content: '';
    position: absolute;
    right: -40px;
    top: -60px;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(51, 94, 234, 0.12) 0%, transparent 70%);
    pointer-events: none;
  }
}
.songListHeaderLeft {
  flex: none;
  width: 180px;
  height: 180px;
  aspect-ratio: 1 / 1;
  position: relative;
  z-index: 1;
  overflow: hidden;
  border-radius: 16px;
  background-position: center;
  background-size: cover;
  background-color: rgba(0, 0, 0, 0.04);
  opacity: 1;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.06);
}
.playNum {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px 8px;
  background-color: rgba(0, 0, 0, 0.4);
  color: #fff;
  font-size: 12px;
  text-align: right;
  .mixin-ellipsis-1();
}

.songListHeaderMiddle {
  flex: auto;
  padding: 4px 0 2px;
  min-width: 0;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-end;
  position: relative;
  z-index: 1;

  h3 {
    .mixin-ellipsis-2();
    line-height: 1.25;
    padding-bottom: 8px;
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: rgba(0, 0, 0, 0.9);
  }
  p {
    .mixin-ellipsis(2);
    font-size: 13px;
    line-height: 1.55;
    color: rgba(0, 0, 0, 0.45);
    margin: 0 0 16px;
    max-width: 720px;
  }
}

.meta {
  font-size: 13px;
  line-height: 1.4;
  color: rgba(0, 0, 0, 0.5);
  margin-bottom: 10px;
  .mixin-ellipsis-1();
}

.actions {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.headerRightBtn {
  border-radius: 999px !important;
  padding: 0 20px !important;
  height: 36px;
  line-height: 36px;
  font-weight: 600;
  font-size: 14px;
}

.playBtn {
  background: @gradient-primary-btn !important;
  color: #fff !important;
  min-width: 96px;
  box-shadow: 0 6px 16px rgba(51, 94, 234, 0.28);

  &:hover {
    filter: brightness(1.04);
  }
  &:active {
    filter: brightness(0.96);
  }
}

.secondaryBtn {
  background-color: transparent !important;
  color: rgba(0, 0, 0, 0.72) !important;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);

  &:hover {
    background-color: rgba(0, 0, 0, 0.04) !important;
    color: rgba(0, 0, 0, 0.88) !important;
  }
  &:active {
    background-color: rgba(0, 0, 0, 0.07) !important;
  }
}

.list {
  position: relative;
  width: 100%;
  min-height: 0;
  flex: auto;
  height: 100%;
}
</style>

