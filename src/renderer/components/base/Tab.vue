<template>
  <ul :class="[$style.list, $style[align]]" role="tablist">
    <li
      v-for="item in list"
      :key="item[itemKey]" :class="[$style.listItem, {[$style.active]: modelValue == item[itemKey]}]" tabindex="-1" role="tab"
      :aria-label="item[itemLabel]" ignore-tip :aria-selected="modelValue == item[itemKey]" @click="handleToggle(item[itemKey])"
    >
      <span :class="$style.label">{{ item[itemLabel] }}</span>
    </li>
  </ul>
</template>

<script>

export default {
  props: {
    list: {
      type: Array,
      default() {
        return []
      },
    },
    align: {
      type: String,
      default: 'left',
    },
    itemKey: {
      type: String,
      default: 'id',
    },
    itemLabel: {
      type: String,
      default: 'label',
    },
    modelValue: {
      type: [String, Number],
      default: '',
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const handleToggle = id => {
      if (id == props.modelValue) return
      emit('update:modelValue', id)
      emit('change', id)
    }

    return {
      handleToggle,
    }
  },
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

/* 视觉展示调整：分段 Tab 仿 YesPlayMusic 文字强调，无业务变更 */
.list {
  display: flex;
  flex-flow: row nowrap;
  font-size: 14px;
  gap: 8px;
  padding: 8px 18px;
  align-items: center;

  &.left {
    justify-content: flex-start;
  }
  &.center {
    justify-content: center;
  }
  &.right {
    justify-content: flex-end;
  }
}
.listItem {
  display: block;
  // padding: 5px 15px;
  cursor: pointer;
  transition: color @transition-fast, background-color @transition-fast;
  border-radius: 8px;


  &:hover {
    color: var(--color-primary);
    background-color: transparent;
  }


  &.active {
    color: var(--color-primary);
    cursor: default;
    background-color: transparent;
    font-weight: 700;

    &:hover {
      color: var(--color-primary);
      background-color: transparent;
    }

    >.label {
      &:after {
        // background-color: var(--color-primary);
        opacity: 0;
        transform: translateY(0);
      }
    }
  }
}

.label {
  display: block;
  position: relative;
  padding: 6px 10px;
  font-weight: 500;
  &:after {
    .mixin-after();
    left: 0;
    bottom: 0;
    width: 100%;
    height: 0;
    border-radius: 20px;
    background-color: transparent;
    transform: translateY(-4px);
    opacity: 0;
    background-color: transparent;
    transition: @transition-fast;
    transition-property: transform, opacity;
  }
}
</style>
