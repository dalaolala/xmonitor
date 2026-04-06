<script setup>
import HeaderLocale from "@/components/HeaderLocale.vue"

defineProps({
  dark: Boolean
})

const emit = defineEmits(['changeDark', 'exportDB', 'importDB'])
</script>

<template>
  <div class="header">
    <div class="header-inner">
      <a class="logo" href="#">
        <div class="logo-icon-wrap">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </div>
        <div class="logo-text">
          <span class="logo-title">X Monitor</span>
          <small class="logo-subtitle">{{ $t('title') }}</small>
        </div>
      </a>
      <div class="header-actions">
        <a-button class="action-btn" size="small" @click="emit('exportDB')">
          <template #icon><icon-download /></template>
          <span class="btn-text">{{ $t('export') }}</span>
        </a-button>
        <a-button class="action-btn" size="small" @click="emit('importDB')">
          <template #icon><icon-upload /></template>
          <span class="btn-text">{{ $t('import') }}</span>
        </a-button>
        <HeaderLocale />
        <a-button class="theme-btn" shape="circle" @click="emit('changeDark')" size="small">
          <template #icon>
            <icon-sun-fill v-if="!dark" />
            <icon-moon-fill v-else />
          </template>
        </a-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  margin: 0 0 8px;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 4px 12px rgba(0, 0, 0, 0.03);
    z-index: -1;
  }
}

.header-inner {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn {
  border: none !important;
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.08) 0%, rgba(22, 93, 255, 0.04) 100%) !important;
  color: #165DFF !important;
  border-radius: 10px !important;
  font-size: 13px;
  font-weight: 500;
  padding: 0 14px !important;
  height: 34px !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(22, 93, 255, 0.08);

  &:hover {
    background: linear-gradient(135deg, rgba(22, 93, 255, 0.15) 0%, rgba(22, 93, 255, 0.08) 100%) !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  .btn-text {
    margin-left: 2px;
  }
}

.theme-btn {
  border: none !important;
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%) !important;
  color: #FF9800 !important;
  width: 34px !important;
  height: 34px !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(255, 152, 0, 0.08);

  &:hover {
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 152, 0, 0.1) 100%) !important;
    transform: translateY(-1px) rotate(15deg);
    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);
  }

  &:active {
    transform: translateY(0) rotate(0deg);
  }
}

.logo {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);

    .logo-icon-wrap {
      transform: rotate(-5deg) scale(1.05);
    }
  }

  .logo-icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, #165DFF 0%, #0EA5E9 50%, #06B6D4 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      0 4px 16px rgba(22, 93, 255, 0.35),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
    flex-shrink: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s ease;
    }

    &:hover::before {
      left: 100%;
    }

    .logo-icon {
      width: 20px;
      height: 20px;
      color: #ffffff !important;
      stroke: #ffffff;
      stroke-width: 2.5;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
    }
  }

  .logo-text {
    display: flex;
    flex-direction: column;
    line-height: 1.25;

    .logo-title {
      font-size: 16px;
      font-weight: 700;
      background: linear-gradient(135deg, #1d2129 0%, #4e5969 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.3px;
    }

    .logo-subtitle {
      font-size: 11px;
      font-weight: 500;
      color: #86909c;
      margin-top: 1px;
      letter-spacing: 0.2px;
    }
  }
}
</style>

<style lang="scss">
body[arco-theme='dark'] {
  .header {
    &::before {
      background: linear-gradient(180deg, rgba(20, 20, 20, 0.95) 0%, rgba(15, 15, 15, 0.9) 100%) !important;
      border-bottom-color: rgba(255, 255, 255, 0.06) !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    }
  }

  .logo {
    .logo-text {
      .logo-title {
        background: linear-gradient(135deg, #f0f0f0 0%, #c0c0c0 100%) !important;
        -webkit-background-clip: text !important;
        background-clip: text !important;
      }
      .logo-subtitle {
        color: #5c5c5c !important;
      }
    }

    .logo-icon-wrap {
      box-shadow:
        0 4px 20px rgba(22, 93, 255, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.05) inset !important;
    }
  }

  .action-btn {
    background: linear-gradient(135deg, rgba(22, 93, 255, 0.12) 0%, rgba(22, 93, 255, 0.06) 100%) !important;
    color: #5B8AF0 !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;

    &:hover {
      background: linear-gradient(135deg, rgba(22, 93, 255, 0.22) 0%, rgba(22, 93, 255, 0.12) 100%) !important;
      box-shadow: 0 4px 12px rgba(22, 93, 255, 0.2) !important;
    }
  }

  .theme-btn {
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 152, 0, 0.08) 100%) !important;
    color: #FFB74D !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;

    &:hover {
      background: linear-gradient(135deg, rgba(255, 152, 0, 0.28) 0%, rgba(255, 152, 0, 0.15) 100%) !important;
      box-shadow: 0 4px 12px rgba(255, 152, 0, 0.25) !important;
    }
  }
}

@media screen and (max-width: 768px) {
  .header {
    padding: 0 12px;
    height: 52px;

    .header-actions {
      gap: 4px;
    }

    .action-btn {
      padding: 0 8px !important;
      height: 36px !important;
      border-radius: 8px !important;

      .btn-text {
        display: none;
      }

      .arco-icon {
        font-size: 16px;
      }
    }

    .theme-btn {
      width: 36px !important;
      height: 36px !important;

      .arco-icon {
        font-size: 16px;
      }
    }
  }

  .logo {
    gap: 8px;

    .logo-icon-wrap {
      width: 32px;
      height: 32px;
      border-radius: 8px;

      .logo-icon {
        width: 16px;
        height: 16px;
      }
    }

    .logo-text {
      .logo-title {
        font-size: 14px;
      }

      .logo-subtitle {
        font-size: 10px;
      }
    }
  }
}

@media screen and (max-width: 480px) {
  .header {
    padding: 0 10px;
    height: 48px;

    .header-actions {
      gap: 3px;
    }

    .action-btn {
      padding: 0 6px !important;
      height: 34px !important;
      border-radius: 7px !important;

      .arco-icon {
        font-size: 15px;
      }
    }

    .theme-btn {
      width: 34px !important;
      height: 34px !important;

      .arco-icon {
        font-size: 15px;
      }
    }
  }

  .logo {
    gap: 6px;

    .logo-icon-wrap {
      width: 28px;
      height: 28px;
      border-radius: 7px;

      .logo-icon {
        width: 14px;
        height: 14px;
      }
    }

    .logo-text {
      .logo-title {
        font-size: 13px;
      }

      .logo-subtitle {
        display: none;
      }
    }
  }
}
</style>
