<template>
  <div :class="$style.container">
    <div v-show="!props.listInfo.noItemLabel" ref="dom_list_ref" :class="$style.listContent" class="scroll">
      <ul :class="$style.songGrid">
        <li v-for="item in props.listInfo.list" :key="item.id" :class="$style.item" @click="toDetail(item)">
          <div :class="$style.image">
            <img :class="$style.img" loading="lazy" decoding="async" :src="item.img">
          </div>
          <div :class="$style.desc">
            <h4>{{ item.name }}</h4>
            <div>
              <p :class="$style.author">{{ item.author }}</p>
              <p v-if="item.time" :class="$style.time">{{ item.time }}</p>
              <div :class="$style.songlist_info">
                <span v-if="item.total != null"><svg-icon name="music" />{{ item.total }}</span>
                <span v-if="item.play_count != null"><svg-icon name="headphones" />{{ item.play_count }}</span>
                <span v-if="visibleSource">{{ item.source }}</span>
              </div>
            </div>
          </div>
        </li>
        <!-- 视觉展示调整：末行占位对齐，无业务变更 -->
        <li v-for="(i, index) in 6" :key="'pad-' + index" :class="$style.item" style="margin-bottom: 0; height: 0; overflow: hidden; opacity: 0; pointer-events: none;" />
      </ul>
      <div :class="$style.pagination">
        <material-pagination :count="props.listInfo.total" :limit="props.listInfo.limit" :page="props.listInfo.page" @btn-click="togglePage" />
      </div>
    </div>
    <transition enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
      <div v-show="props.listInfo.noItemLabel" :class="$style.noitem">
        <p v-text="props.listInfo.noItemLabel" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from '@common/utils/vueTools'
import type { ListInfo, ListInfoItem } from '@renderer/store/songList/state'
import { useRoute, useRouter } from '@common/utils/vueRouter'


const props = withDefaults(defineProps<{
  listInfo: ListInfo
  visibleSource?: boolean
}>(), {
  visibleSource: false,
})

const router = useRouter()
const route = useRoute()

const dom_list_ref = ref<HTMLElement | null>(null)

const emit = defineEmits(['toggle-page'])


const togglePage = (page: number) => {
  emit('toggle-page', page)
}

const toDetail = (info: ListInfoItem) => {
  void router.push({
    path: '/songList/detail',
    query: {
      source: info.source,
      id: info.id,
      picUrl: info.img,
      fromName: route.name as string,
    },
  })
}

defineExpose({
  scrollTo(top: number) {
    dom_list_ref.value?.scrollTo({
      top,
      // behavior: 'smooth',
    })
  },
  getScrollTop() {
    return dom_list_ref.value?.scrollTop ?? 0
  },
})


</script>


<style lang="less" module>
@import '@renderer/assets/styles/layout.less';
/* 视觉展示调整：恢复稳定布局 + 大气封面卡片，无业务变更 */
.container {
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  position: relative;
}

.listContent {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: block;
  font-size: 14px;
  box-sizing: border-box;
  padding: 16px 20px 0;
}

.songGrid {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-content: flex-start;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  box-sizing: border-box;
}

.item {
  /* 视觉展示调整：一行 5 个歌单卡片，无业务变更 */
  width: 18.5%;
  max-width: none;
  box-sizing: border-box;
  display: flex;
  flex-flow: column nowrap;
  margin-bottom: 24px;
  cursor: pointer;
  transition: opacity @transition-normal;

  &:hover {
    opacity: .92;

    .image {
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);
    }

    h4 {
      color: var(--color-primary);
    }
  }
}

.image {
  flex: none;
  width: 100%;
  display: flex;
  background-position: center;
  background-size: cover;
  border-radius: 12px;
  overflow: hidden;
  opacity: 1;
  aspect-ratio: 1 / 1;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  background-color: rgba(0, 0, 0, 0.04);
  transition: box-shadow @transition-fast;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    background: @gradient-card-shine;
    opacity: 0.55;
    pointer-events: none;
  }
}

.img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.desc {
  flex: auto;
  padding: 10px 2px 0;
  overflow: hidden;
  min-width: 0;

  h4 {
    font-size: 14px;
    font-weight: 600;
    text-align: left;
    line-height: 1.35;
    color: rgba(0, 0, 0, 0.88);
    transition: color @transition-fast;
    .mixin-ellipsis-2();
  }
}

.songlist_info {
  display: flex;
  flex-flow: row nowrap;
  gap: 10px;
  margin-top: 6px;
  font-size: 12px;
  .mixin-ellipsis-1();
  text-align: left;
  line-height: 1.2;
  color: rgba(0, 0, 0, 0.38);

  svg {
    margin-right: 2px;
  }
}

.author {
  margin-top: 5px;
  font-size: 13px;
  .mixin-ellipsis-1();
  text-align: left;
  line-height: 1.3;
  color: rgba(0, 0, 0, 0.45);
}

.time {
  margin-top: 2px;
  font-size: 12px;
  .mixin-ellipsis-1();
  text-align: left;
  line-height: 1.3;
  color: rgba(0, 0, 0, 0.35);
}

.pagination {
  text-align: center;
  padding: 20px 0 28px;
}

.noitem {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;

  p {
    font-size: 18px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.28);
  }
}

</style>
