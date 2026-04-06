<script setup>
import {formatBandwithBytes, formatBytes} from "../utils/utils.js";
import {inject, computed} from "vue";

const handleChangeType = inject('handleChangeType')

const { stats, type } = defineProps({
  stats: {
    type: Object,
    default: () => ({
      total: 0,
      online: 0,
      offline: 0,
      bandwidth_up: 0,
      bandwidth_down: 0,
    }),
  },
  type: {
    type: String,
    default: "all",
  }
})

// 计算带宽比例用于进度条
const bandwidthRatio = computed(() => {
  const up = stats.bandwidth_up || 0
  const down = stats.bandwidth_down || 0
  const max = Math.max(up, down, 1)
  return {
    up: (up / max) * 100,
    down: (down / max) * 100
  }
})
</script>

<template>
  <div class="hero">
    <a-row :gutter="0">
      <a-col :span="6" :xs="12" :sm="12" :md="6" :lg="6">
        <div class="hero-card all" :class="type === 'all' ? 'is-active' :''" @click="handleChangeType('all')">
          <div class="card-icon-wrap all-icon">
            <icon-layers />
          </div>
          <div class="card-body">
            <div class="title">{{ $t('server-total') }}</div>
            <div class="num">{{stats.total}}<span class="unit">{{ $t('server-unit') }}</span></div>
          </div>
          <div class="card-indicator all-indicator" v-if="type === 'all'"></div>
        </div>
      </a-col>
      <a-col :span="6" :xs="12" :sm="12" :md="6" :lg="6">
        <div class="hero-card online" :class="type === 'online' ? 'is-active' :''" @click="handleChangeType('online')">
          <div class="card-icon-wrap online-icon">
            <icon-check-circle />
          </div>
          <div class="card-body">
            <div class="title">{{ $t('server-online') }}</div>
            <div class="num online-num">{{stats.online}}<span class="unit">{{ $t('server-unit') }}</span></div>
          </div>
          <div class="card-indicator online-indicator" v-if="type === 'online'"></div>
        </div>
      </a-col>
      <a-col :span="6" :xs="12" :sm="12" :md="6" :lg="6">
        <div class="hero-card offline" :class="type === 'offline' ? 'is-active' :''" @click="handleChangeType('offline')">
          <div class="card-icon-wrap offline-icon">
            <icon-close-circle />
          </div>
          <div class="card-body">
            <div class="title">{{ $t('server-offline') }}</div>
            <div class="num offline-num">{{stats.offline}}<span class="unit">{{ $t('server-unit') }}</span></div>
          </div>
          <div class="card-indicator offline-indicator" v-if="type === 'offline'"></div>
        </div>
      </a-col>
      <a-col :span="6" :xs="12" :sm="12" :md="6" :lg="6">
        <div class="hero-card network-card">
          <div class="card-icon-wrap net-icon">
            <icon-wifi />
          </div>
          <div class="card-body network-body">
            <div class="title">{{ $t('network-info') }}</div>
            <div class="network-stats">
              <!-- 上行 -->
              <div class="stat-row">
                <div class="stat-header">
                  <span class="stat-icon up-icon">
                    <icon-arrow-up />
                  </span>
                  <span class="stat-label">{{ $t('traffic-up') }}</span>
                  <span class="stat-value up-value">{{ formatBandwithBytes(stats.bandwidth_up) }}</span>
                </div>
                <div class="stat-bar">
                  <div class="bar-fill up-fill" :style="{ width: bandwidthRatio.up + '%' }"></div>
                </div>
              </div>
              <!-- 下行 -->
              <div class="stat-row">
                <div class="stat-header">
                  <span class="stat-icon down-icon">
                    <icon-arrow-down />
                  </span>
                  <span class="stat-label">{{ $t('traffic-down') }}</span>
                  <span class="stat-value down-value">{{ formatBandwithBytes(stats.bandwidth_down) }}</span>
                </div>
                <div class="stat-bar">
                  <div class="bar-fill down-fill" :style="{ width: bandwidthRatio.down + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped lang="scss">
.hero {
  margin: 8px 20px 12px;

  :deep(.arco-row) {
    margin-left: 0 !important;
    margin-right: 0 !important;
    display: flex !important;
    flex-wrap: wrap !important;
  }

  :deep(.arco-col) {
    padding-left: 0 !important;
    padding-right: 0 !important;
    display: flex !important;
  }

  :deep(.arco-col:last-child) .hero-card {
    margin-right: 0;
  }

  .hero-card {
    position: relative;
    margin-bottom: 8px;
    margin-right: 12px;
    padding: 14px 16px;
    border-radius: 12px;
    background: #ffffff;
    height: 72px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 12px;
    overflow: hidden;
    flex: 1;
    width: 100%;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 0.25s ease;
      border-radius: 12px;
    }

    &.all::before {
      background: linear-gradient(135deg, rgba(22,93,255,0.06) 0%, rgba(22,93,255,0.02) 100%);
    }
    &.online::before {
      background: linear-gradient(135deg, rgba(0,180,42,0.06) 0%, rgba(0,180,42,0.02) 100%);
    }
    &.offline::before {
      background: linear-gradient(135deg, rgba(245,63,63,0.06) 0%, rgba(245,63,63,0.02) 100%);
    }

    &.is-active::before,
    &:hover::before {
      opacity: 1;
    }

    &.is-active,
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.09);
    }

    &.network-card {
      cursor: default;
      height: 72px;
      padding: 10px 14px;
      &:hover {
        transform: none;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
      }
      &::before { display: none; }
    }
  }

  .card-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    border-radius: 0 0 12px 12px;

    &.all-indicator { background: linear-gradient(90deg, #165DFF, #5B8AF0); }
    &.online-indicator { background: linear-gradient(90deg, #00B42A, #54D474); }
    &.offline-indicator { background: linear-gradient(90deg, #F53F3F, #FF7070); }
  }

  .card-icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 18px;
    position: relative;
    z-index: 1;

    &.all-icon {
      background: linear-gradient(135deg, rgba(22,93,255,0.12), rgba(22,93,255,0.06));
      color: #165DFF;
    }
    &.online-icon {
      background: linear-gradient(135deg, rgba(0,180,42,0.12), rgba(0,180,42,0.06));
      color: #00B42A;
    }
    &.offline-icon {
      background: linear-gradient(135deg, rgba(245,63,63,0.12), rgba(245,63,63,0.06));
      color: #F53F3F;
    }
    &.net-icon {
      background: linear-gradient(135deg, rgba(114,46,209,0.12), rgba(114,46,209,0.06));
      color: #722ED1;
    }
  }

  .card-body {
    position: relative;
    z-index: 1;
    min-width: 0;

    .title {
      font-size: 13px;
      font-weight: 500;
      color: #4e5969;
      margin-bottom: 4px;
      white-space: nowrap;
    }

    .num {
      font-size: 22px;
      font-weight: 700;
      color: #1d2129;
      line-height: 1;

      &.online-num { color: #00B42A; }
      &.offline-num { color: #F53F3F; }

      .unit {
        font-size: 13px;
        font-weight: 500;
        color: #4e5969;
        margin-left: 3px;
      }
    }
  }

  .network-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .title {
      margin-bottom: 6px;
    }
  }

  .network-stats {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-header {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .stat-icon {
    width: 14px;
    height: 14px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    flex-shrink: 0;

    &.up-icon {
      background: rgba(255, 125, 0, 0.15);
      color: #FF7D00;
    }
    &.down-icon {
      background: rgba(114, 46, 209, 0.15);
      color: #722ED1;
    }
  }

  .stat-label {
    font-size: 11px;
    color: #4e5969;
    flex: 1;
  }

  .stat-value {
    font-size: 12px;
    font-weight: 600;

    &.up-value { color: #FF7D00; }
    &.down-value { color: #722ED1; }
  }

  .stat-bar {
    height: 3px;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 2px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s ease;

    &.up-fill {
      background: linear-gradient(90deg, #FF7D00, #FFB84D);
    }
    &.down-fill {
      background: linear-gradient(90deg, #722ED1, #A45BD4);
    }
  }
}
</style>

<style lang="scss">
body[arco-theme='dark'] {
  .hero {
    .hero-card {
      background-color: #1a1a1a;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);

      &.all::before {
        background: linear-gradient(135deg, rgba(22,93,255,0.15) 0%, rgba(22,93,255,0.05) 100%);
      }
      &.online::before {
        background: linear-gradient(135deg, rgba(0,180,42,0.15) 0%, rgba(0,180,42,0.05) 100%);
      }
      &.offline::before {
        background: linear-gradient(135deg, rgba(245,63,63,0.15) 0%, rgba(245,63,63,0.05) 100%);
      }

      &.is-active,
      &:hover {
        box-shadow: 0 6px 20px rgba(0,0,0,0.4);
      }

      .card-icon-wrap {
        &.all-icon { background: linear-gradient(135deg, rgba(22,93,255,0.2), rgba(22,93,255,0.08)); }
        &.online-icon { background: linear-gradient(135deg, rgba(0,180,42,0.2), rgba(0,180,42,0.08)); }
        &.offline-icon { background: linear-gradient(135deg, rgba(245,63,63,0.2), rgba(245,63,63,0.08)); }
        &.net-icon { background: linear-gradient(135deg, rgba(114,46,209,0.2), rgba(114,46,209,0.08)); }
      }

      .card-body {
        .title { color: #888; }
        .num { color: #f0f0f0; }
        .num.online-num { color: #54D474; }
        .num.offline-num { color: #FF7070; }
        .num .unit { color: #888; }
      }

      .stat-label { color: #888; }
      .stat-bar { background: rgba(255,255,255,0.06); }
    }
  }
}

@media screen and (max-width: 768px) {
  .hero {
    margin: 8px 12px;

    .arco-col:nth-child(2n) .hero-card {
      margin-right: 0;
    }

    .hero-card {
      padding: 10px 12px;
      height: 58px;
      gap: 8px;
      margin-right: 8px;
      border-radius: 10px;

      .card-icon-wrap {
        width: 32px;
        height: 32px;
        font-size: 15px;
        border-radius: 8px;
      }

      .card-body {
        .title { font-size: 12px; margin-bottom: 2px; }
        .num { font-size: 18px; }
        .unit { font-size: 11px; }
      }

      &.network-card {
        height: 58px;
        padding: 8px 10px;

        .card-icon-wrap {
          width: 28px;
          height: 28px;
          font-size: 13px;
        }

        .network-body {
          .title { font-size: 11px; margin-bottom: 4px; }
        }

        .network-stats { gap: 3px; }

        .stat-header { gap: 3px; }

        .stat-icon {
          width: 12px;
          height: 12px;
          font-size: 9px;
        }

        .stat-label { font-size: 10px; }
        .stat-value { font-size: 11px; }
        .stat-bar { height: 2px; }
      }
    }
  }
}

/* 超小屏幕优化 */
@media screen and (max-width: 480px) {
  .hero {
    margin: 6px 10px;

    .arco-col:nth-child(2n) .hero-card {
      margin-right: 0;
    }

    .hero-card {
      padding: 8px 10px;
      height: 52px;
      gap: 6px;
      margin-right: 6px;
      border-radius: 8px;

      .card-icon-wrap {
        width: 28px;
        height: 28px;
        font-size: 13px;
        border-radius: 7px;
      }

      .card-body {
        .title { font-size: 11px; margin-bottom: 1px; }
        .num { font-size: 16px; }
        .unit { font-size: 10px; }
      }

      &.network-card {
        height: 52px;
        padding: 6px 8px;

        .card-icon-wrap {
          width: 24px;
          height: 24px;
          font-size: 11px;
        }

        .network-body {
          .title { font-size: 10px; margin-bottom: 3px; }
        }

        .stat-icon {
          width: 10px;
          height: 10px;
          font-size: 8px;
        }

        .stat-label { font-size: 9px; }
        .stat-value { font-size: 10px; }
      }
    }
  }
}
</style>