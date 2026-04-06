<script setup>
import { computed } from 'vue'

const props = defineProps({
  area: Array,
  selectArea: String
})

const emit = defineEmits(['selectArea'])

const totalCount = computed(() => (props.area?.length ?? 0) + 1)
</script>

<template>
  <div class="area-wrap">
    <div class="area-scroll">
      <!-- 全部 -->
      <div
        class="area-tab"
        :class="selectArea === 'all' ? 'is-active' : ''"
        @click="emit('selectArea', 'all')">
        <span class="tab-inner">
          <span class="tab-globe">🌐</span>
          <span class="tab-text">{{ $t('all-area') }}</span>
        </span>
        <span class="tab-active-bar"></span>
      </div>

      <div class="area-divider"></div>

      <!-- 各地区 -->
      <div
        class="area-tab"
        :class="selectArea === item ? 'is-active' : ''"
        v-for="item in area"
        :key="item"
        @click="emit('selectArea', item)">
        <span class="tab-inner">
          <span :class="`flag-icon flag-icon-${item.replace('UK', 'GB').toLowerCase()}`" class="tab-flag"></span>
          <span class="tab-text">{{ item }}</span>
        </span>
        <span class="tab-active-bar"></span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.area-wrap {
  margin: 2px 20px 6px;
  position: relative;

  // 右侧渐隐遮罩（溢出滚动时提示）
  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 32px;
    background: linear-gradient(to right, transparent, #f0f2f7);
    pointer-events: none;
    border-radius: 0 12px 12px 0;
  }
}

.area-scroll {
  display: flex;
  align-items: center;
  gap: 2px;
  overflow-x: auto;
  padding: 4px 2px 4px;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }
}

.area-divider {
  width: 1px;
  height: 16px;
  background: rgba(0,0,0,0.1);
  margin: 0 4px;
  flex-shrink: 0;
}

.area-tab {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 10px;
  padding: 2px;
  transition: background 0.18s ease;

  &:hover:not(.is-active) {
    background: rgba(22, 93, 255, 0.06);

    .tab-text { color: #165DFF; }
    .tab-globe { filter: grayscale(0); }
  }

  &.is-active {
    background: rgba(22, 93, 255, 0.1);

    .tab-text { color: #165DFF; font-weight: 700; }
    .tab-globe { filter: grayscale(0); }

    .tab-active-bar {
      opacity: 1;
      transform: scaleX(1);
    }

    .tab-flag {
      box-shadow: 0 2px 6px rgba(22, 93, 255, 0.3);
      transform: scale(1.1);
    }
  }

  .tab-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 5px 10px 4px;
  }

  .tab-globe {
    font-size: 22px;
    line-height: 1;
    filter: grayscale(0.2);
    transition: filter 0.18s ease;
  }

  .tab-flag {
    display: block;
    width: 28px !important;
    height: 20px !important;
    border-radius: 4px;
    object-fit: cover;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  }

  .tab-text {
    font-size: 11px;
    font-weight: 500;
    color: #4e5969;
    transition: color 0.18s ease;
    letter-spacing: 0.2px;
    white-space: nowrap;
  }

  .tab-active-bar {
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 20px;
    height: 2px;
    border-radius: 2px;
    background: #165DFF;
    opacity: 0;
    transition: opacity 0.18s ease, transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}
</style>

<style lang="scss">
body[arco-theme='dark'] {
  .area-wrap::after {
    background: linear-gradient(to right, transparent, #0d0d0d);
  }

  .area-divider {
    background: rgba(255,255,255,0.1);
  }

  .area-tab {
    &:hover:not(.is-active) {
      background: rgba(22, 93, 255, 0.1);
      .tab-text { color: #5B8AF0; }
    }

    &.is-active {
      background: rgba(22, 93, 255, 0.15);
      .tab-text { color: #5B8AF0; }
      .tab-active-bar { background: #5B8AF0; }
      .tab-flag { box-shadow: 0 2px 6px rgba(91, 138, 240, 0.35); }
    }

    .tab-text { color: #666; }
  }
}

@media screen and (max-width: 768px) {
  .area-wrap {
    margin: 2px 12px 4px;

    &::after { width: 16px; }
  }

  .area-scroll {
    padding: 3px 2px 3px;
    gap: 1px;
    /* 启用平滑滚动 */
    scroll-behavior: smooth;
    /* 防止横向滚动时触发其他手势 */
    overscroll-behavior-x: contain;
  }

  .area-divider {
    height: 14px;
    margin: 0 3px;
  }

  .area-tab {
    border-radius: 8px;
    padding: 1px;

    .tab-inner {
      padding: 3px 6px 2px;
      gap: 2px;
    }

    .tab-globe {
      font-size: 18px;
    }

    .tab-flag {
      width: 22px !important;
      height: 15px !important;
      border-radius: 3px;
    }

    .tab-text {
      font-size: 10px;
    }

    .tab-active-bar {
      width: 16px;
      height: 2px;
      bottom: 1px;
    }
  }
}

@media screen and (max-width: 480px) {
  .area-wrap {
    margin: 1px 10px 3px;

    &::after { width: 12px; }
  }

  .area-scroll {
    padding: 2px 1px 2px;
    gap: 0px;
  }

  .area-divider {
    height: 12px;
    margin: 0 2px;
  }

  .area-tab {
    border-radius: 6px;

    .tab-inner {
      padding: 2px 5px 1px;
      gap: 1px;
    }

    .tab-globe {
      font-size: 16px;
    }

    .tab-flag {
      width: 20px !important;
      height: 14px !important;
      border-radius: 2px;
    }

    .tab-text {
      font-size: 9px;
    }

    .tab-active-bar {
      width: 14px;
      height: 1.5px;
    }
  }
}
</style>
