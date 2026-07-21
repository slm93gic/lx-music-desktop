<template>
  <!-- 视觉展示调整：底栏布局仿 YesPlayMusic（左信息/中控制/右工具/底细进度），无业务变更 -->
  <div :class="$style.player">
    <div :class="$style.left">
      <div :class="$style.picContent" :aria-label="$t('player__pic_tip')" @contextmenu="handleToMusicLocation" @click="showPlayerDetail">
        <img v-if="musicInfo.pic" :src="musicInfo.pic" decoding="async" @error="imgError">
        <div v-else :class="$style.emptyPic">L<span>X</span></div>
      </div>
      <div :class="$style.infoContent">
        <div :class="$style.title" :aria-label="title + $t('copy_tip')" @click="handleCopy(title)">
          {{ title }}
        </div>
        <div :class="$style.status">{{ statusText }}</div>
      </div>
    </div>
    <div :class="$style.playBtnContent">
      <div :class="$style.playBtn" :aria-label="$t('player__prev')" @click="playPrev()">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 1024 1024" space="preserve">
          <use xlink:href="#icon-prevMusic" />
        </svg>
      </div>
      <div :class="[$style.playBtn, $style.playMain]" :aria-label="isPlay ? $t('player__pause') : $t('player__play')" @click="togglePlay">
        <svg v-if="isPlay" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 1024 1024" space="preserve">
          <use xlink:href="#icon-pause" />
        </svg>
        <svg v-else version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 1024 1024" space="preserve">
          <use xlink:href="#icon-play" />
        </svg>
      </div>
      <div :class="$style.playBtn" :aria-label="$t('player__next')" @click="playNext()">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 1024 1024" space="preserve">
          <use xlink:href="#icon-nextMusic" />
        </svg>
      </div>
    </div>
    <div :class="$style.right">
      <control-btns />
    </div>
    <div v-if="!isShowPlayerDetail" :class="$style.bottomProgress">
      <common-progress-bar
        :class-name="$style.progressBar"
        :progress="progress"
        :handle-transition-end="handleTransitionEnd"
        :is-active-transition="isActiveTransition"
      />
    </div>
  </div>
</template>

<script>
import { computed } from '@common/utils/vueTools'
import { useRouter } from '@common/utils/vueRouter'
import { clipboardWriteText } from '@common/utils/electron'
import ControlBtns from './ControlBtns.vue'
import usePlayProgress from '@renderer/utils/compositions/usePlayProgress'
// import { lyric } from '@renderer/core/share/lyric'
import {
  statusText,
  musicInfo,
  isShowPlayerDetail,
  isPlay,
  playInfo,
  playMusicInfo,
} from '@renderer/store/player/state'
import {
  setMusicInfo,
  setShowPlayerDetail,
} from '@renderer/store/player/action'
import { appSetting } from '@renderer/store/setting'
import { togglePlay, playNext, playPrev } from '@renderer/core/player'
import { LIST_IDS } from '@common/constants'
import { formatMusicName } from '@renderer/utils'

export default {
  name: 'CorePlayBar',
  components: {
    ControlBtns,
  },
  setup() {
    const router = useRouter()

    const {
      nowPlayTimeStr,
      maxPlayTimeStr,
      progress,
      isActiveTransition,
      handleTransitionEnd,
    } = usePlayProgress()

    const showPlayerDetail = () => {
      if (!playMusicInfo.musicInfo) return
      setShowPlayerDetail(true)
    }
    const handleCopy = (text) => {
      clipboardWriteText(text)
    }

    const imgError = () => {
      // console.log(e)
      setMusicInfo({ pic: null })
    }

    const handleToMusicLocation = () => {
      const listId = playMusicInfo.listId
      if (!listId || listId == LIST_IDS.DOWNLOAD || !playMusicInfo.musicInfo) return
      if (playInfo.playIndex == -1) return
      void router.push({
        path: '/list',
        query: {
          id: listId,
          scrollIndex: playInfo.playIndex,
        },
      })
    }

    const title = computed(() => {
      return musicInfo.name
        ? formatMusicName(appSetting['download.fileName'], musicInfo.name, musicInfo.singer)
        : ''
    })

    // onBeforeUnmount(() => {
    // window.eventHub.emit(eventPlayerNames.setTogglePlay)
    // })

    return {
      musicInfo,
      nowPlayTimeStr,
      maxPlayTimeStr,
      progress,
      isActiveTransition,
      handleTransitionEnd,
      handleCopy,
      imgError,
      statusText,
      title,
      showPlayerDetail,
      isPlay,
      togglePlay,
      playNext,
      playPrev,
      handleToMusicLocation,
      isShowPlayerDetail,
    }
  },
}
</script>


<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

/* 视觉展示调整：YesPlayMusic 三区底栏 + 底部细进度，无业务变更 */
.player {
  position: relative;
  height: @height-player;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  contain: strict;
  padding: 10px 18px 14px;
  z-index: 2;
  * {
    box-sizing: border-box;
  }

  &:before {
    .mixin-after();
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: @gradient-player;
    opacity: 1;
    z-index: -1;
    backdrop-filter: blur(20px);
  }
}

.left {
  display: flex;
  align-items: center;
  min-width: 0;
  max-width: 360px;
  justify-self: start;
}

.right {
  display: flex;
  align-items: center;
  justify-self: end;
}

.picContent {
  height: 46px;
  width: 46px;
  flex: none;
  opacity: 1;
  transition: opacity @transition-fast, transform @transition-fast;
  display: flex;
  justify-content: center;
  cursor: pointer;

  &:hover {
    opacity: .9;
  }

  img {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-width: 100%;
    max-height: 100%;
    border-radius: 8px;
    object-fit: cover;
  }

  .emptyPic {
    background-color: rgba(0, 0, 0, 0.04);
    border-radius: 8px;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(0, 0, 0, 0.25);
    user-select: none;
    font-size: 14px;
    font-family: Consolas, "Courier New", monospace;

    span {
      padding-left: 2px;
    }
  }
}

.infoContent {
  padding: 0 12px;
  flex: auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: flex-start;
  font-size: 13px;
  color: var(--color-font);
  min-width: 0;
  line-height: 1.4;
}

.title {
  max-width: 100%;
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
  .mixin-ellipsis-1();
}
.status {
  padding-top: 2px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.42);
  .mixin-ellipsis-1();
  max-width: 100%;
}

.playBtnContent {
  height: 100%;
  flex: none;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  gap: 22px;
  justify-self: center;
}

.playBtn {
  flex: none;
  height: 22px;
  width: 22px;
  transition: @transition-fast;
  transition-property: color, opacity, transform;
  color: rgba(0, 0, 0, 0.72);
  opacity: 1;
  cursor: pointer;

  svg {
    fill: currentColor;
    filter: none;
  }
  &:hover {
    opacity: 0.75;
    transform: scale(1.08);
  }
  &:active {
    opacity: 0.6;
    transform: scale(0.96);
  }
}

.playMain {
  height: 28px;
  width: 28px;
  color: rgba(0, 0, 0, 0.88);
}

.bottomProgress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  padding: 0;
  z-index: 3;
}

.progressBar {
  height: 100%;
  border-radius: 0 !important;
}

</style>
