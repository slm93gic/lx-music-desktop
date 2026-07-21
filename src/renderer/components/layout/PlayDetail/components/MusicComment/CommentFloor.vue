<template lang="pug">
div(:class="$style.container")
  ul
    li(v-for="item in comments" :key="item.id" :class="$style.listItem")
      div(:class="$style.content")
        div(:class="$style.left")
          img( :class="$style.avatar" :src="item.avatar || commentDefImg" @error="handleUserImg")
        div(:class="$style.right")
          div(:class="$style.info")
            div(:class="$style.baseInfo")
              div.select(:class="$style.name") {{ item.userName }}
              div(:class="$style.metaInfo")
                time(v-if="item.timeStr" :class="$style.label") {{ timeFormat(item.timeStr) }}
                div(v-if="item.location" :class="$style.label") {{ $t('comment__location', { location: item.location }) }}
            div(v-if="item.likedCount != null" :class="$style.likes")
              svg(:class="$style.likesIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" space="preserve")
                use(xlink:href="#icon-thumbs-up")
              | {{ item.likedCount }}
          p.select(:class="$style.comment_text") {{ item.text }}
          div(v-if="item.images?.length" :class="$style.comment_images")
            img(v-for="(url, index) in item.images" :key="index" :src="url" loading="lazy" decoding="async")
      comment-floor(v-if="item.reply && item.reply.length" :class="$style.reply_floor" :comments="item.reply")
</template>

<script>
import commentDefImg from '@renderer/assets/images/defaultUser.jpg'

export default {
  name: 'CommentFloor',
  props: {
    comments: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      commentDefImg,
    }
  },
  methods: {
    timeFormat(time) {
      return time
      // return formatTime(new Date(time), true)
    },
    handleUserImg(event) {
      event.target.src = this.commentDefImg
    },
  },
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

/* 视觉展示调整：评论楼层字号与圆角，无业务变更 */
@padding: 16px;

// .container {

// }

.listItem {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.content {
  padding: 14px 0;
  font-size: 13px;
  color: var(--color-font);
  display: flex;
}
.left {
  flex: none;
}
.avatar {
  width: 40px;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, .08);
}
.right {
  flex: auto;
  min-width: 0;
  margin-left: 12px;
}

.info {
  display: flex;
  flex-flow: row nowrap;
  gap: 12px;
  width: 100%;
  height: 40px;
  line-height: 1.35;
  color: rgba(0, 0, 0, 0.45);
}
.baseInfo {
  height: 100%;
  flex: auto;
  display: flex;
  min-width: 0;
  flex-flow: column nowrap;
  justify-content: space-evenly;
}
.metaInfo {
  display: flex;
  flex-flow: row nowrap;
  min-width: 0;
  gap: 10px;
  overflow: hidden;
}
.name {
  flex: 0 1 auto;
  min-width: 0;
  .mixin-ellipsis-1();
  color: rgba(0, 0, 0, 0.75);
  font-weight: 500;
}
.label {
  flex: none;
  font-size: 13px;
  // margin-left: 5px;
}
.likes {
  flex: none;
  font-size: 12px;
  text-align: right;
  padding-top: 3px;
  align-self: flex-start;
}
.likesIcon {
  width: 12px;
  height: 12px;
  margin-right: 3px;
  color: var(--color-primary-alpha-500);
}
.comment_text {
  text-align: justify;
  font-size: 14px;
  line-height: 1.55;
  word-break: break-all;
  overflow-wrap: break-word;
  white-space: pre-wrap;
}
.comment_images {
  display: flex;
  flex-flow: row wrap;
  gap: 6px;
  margin-top: 6px;

  img {
    max-width: 240px;
    border-radius: 8px;
  }
}

.reply_floor {
  padding: 0 0 0 @padding;
  margin-left: @padding * 2;
  border-radius: @radius-border;
  &:last-child {
    margin-bottom: 12px;
  }
  .listItem:last-child {
    border-bottom: none;
  }
  .right {
    margin-right: 10px;
  }

  background-color: rgba(0, 0, 0, 0.025);
}


</style>
