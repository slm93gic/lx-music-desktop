import { type Ref, onMounted, onBeforeUnmount, ref, nextTick, watch } from '@common/utils/vueTools'

/**
 * 视觉展示调整：横向胶囊导航过长时隐藏溢出，鼠标靠近边缘自动滚动露出后续项，无业务变更
 */
export default (domRef: Ref<HTMLElement | null | undefined>, options?: {
  edgeSize?: number
  speed?: number
}) => {
  const edgeSize = options?.edgeSize ?? 64
  const speed = options?.speed ?? 10
  const canScrollLeft = ref(false)
  const canScrollRight = ref(false)

  let raf = 0
  let dir = 0
  let unobserve: (() => void) | null = null
  let boundEl: HTMLElement | null = null

  const updateOverflow = () => {
    const el = domRef.value
    if (!el) {
      canScrollLeft.value = false
      canScrollRight.value = false
      return
    }
    const max = el.scrollWidth - el.clientWidth
    canScrollLeft.value = el.scrollLeft > 2
    canScrollRight.value = max > 2 && el.scrollLeft < max - 2
  }

  const stop = () => {
    dir = 0
    if (raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }

  const tick = () => {
    const el = domRef.value
    if (!el || !dir) {
      raf = 0
      return
    }
    const max = el.scrollWidth - el.clientWidth
    el.scrollLeft += dir * speed
    updateOverflow()
    if ((dir < 0 && el.scrollLeft <= 0) || (dir > 0 && el.scrollLeft >= max - 1)) {
      stop()
      return
    }
    raf = requestAnimationFrame(tick)
  }

  const start = (nextDir: number) => {
    if (dir === nextDir && raf) return
    dir = nextDir
    if (!raf) raf = requestAnimationFrame(tick)
  }

  const onMove = (e: MouseEvent) => {
    const el = domRef.value
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    if (max <= 1) {
      stop()
      updateOverflow()
      return
    }
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    if (x >= rect.width - edgeSize && el.scrollLeft < max - 1) start(1)
    else if (x <= edgeSize && el.scrollLeft > 0) start(-1)
    else stop()
  }

  const onLeave = () => { stop() }
  const onScroll = () => { updateOverflow() }

  const unbind = (el: HTMLElement) => {
    el.removeEventListener('mousemove', onMove)
    el.removeEventListener('mouseleave', onLeave)
    el.removeEventListener('scroll', onScroll)
    unobserve?.()
    unobserve = null
    stop()
    if (boundEl === el) boundEl = null
  }

  const bind = (el: HTMLElement) => {
    if (boundEl === el) {
      updateOverflow()
      return
    }
    if (boundEl) unbind(boundEl)
    boundEl = el
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(() => { updateOverflow() })
    ro.observe(el)
    unobserve = () => { ro.disconnect() }
    updateOverflow()
  }

  const tryBind = () => {
    void nextTick(() => {
      if (domRef.value) bind(domRef.value)
    })
  }

  onMounted(tryBind)
  watch(domRef, tryBind)

  onBeforeUnmount(() => {
    if (boundEl) unbind(boundEl)
  })

  return {
    canScrollLeft,
    canScrollRight,
    updateOverflow,
  }
}
