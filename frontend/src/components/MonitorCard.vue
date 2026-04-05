<script setup>
import { computed } from 'vue'
import { formatBytes, formatTimeStamp, formatUptime, calculateRemainingDays } from '@/utils/utils'
import MonitorCardDetail from '@/components/MonitorCardDetail.vue'

const props = defineProps({
  item: Object,
  hostInfo: Object,
  charts: Object,
  selectHost: String
})

const emit = defineEmits(['selectHost', 'showEdit', 'showDelete', 'dragStart'])

const progressStatus = (value) => {
  if (value < 80) {
    return 'success'
  } else if (value < 90) {
    return 'warning'
  } else {
    return 'danger'
  }
}

// 负载状态判断（基于 CPU 核心数估算，默认以 4 核为基准）
const loadStatus = (load) => {
  const cpuCores = props.item.Host.CPU ? props.item.Host.CPU.length : 4
  const loadPerCore = load / cpuCores
  if (loadPerCore < 0.7) return 'low'
  if (loadPerCore < 1.5) return 'medium'
  return 'high'
}

const cpuPercent = computed(() => props.item.State.CPU)
const memPercent = computed(() => props.item.State.MemUsed / props.item.Host.MemTotal * 100)
const isActive = computed(() => props.selectHost === props.item.Host.Name)

// 网络速度百分比（基于 100MB/s 基准带宽）
const NET_BASE_SPEED = 100 * 1024 * 1024 // 100MB/s
const netOutPercent = computed(() => (props.item.State.NetOutSpeed / NET_BASE_SPEED) * 100)
const netInPercent = computed(() => (props.item.State.NetInSpeed / NET_BASE_SPEED) * 100)

const getDueDays = computed(() => {
  if (!props.hostInfo[props.item.Host.Name]) return null
  return calculateRemainingDays(props.hostInfo[props.item.Host.Name].due_time)
})

const getDueDaysClass = computed(() => {
  const days = getDueDays.value
  if (days === null || days === '-' || typeof days !== 'number') return ''
  if (days <= 7) return 'due-danger'
  if (days <= 30) return 'due-warn'
  return ''
})
</script>

<template>
  <div
    class="monitor-item"
    :class="isActive ? 'is-active' : ''"
    :data-host="item.Host.Name"
    @click="emit('selectHost', item.Host.Name)"
    @mousedown="(e) => emit('dragStart', e, item.Host.Name)"
    @touchstart="(e) => emit('dragStart', e, item.Host.Name)">

    <!-- 左侧状态条 -->
    <div class="status-bar" :class="item.status ? 'status-bar-online' : 'status-bar-offline'"></div>

    <!-- 标签行：水平排列 -->
    <div class="row-labels">
      <div class="label-item">{{item.Host.Name}}</div>
      <div class="label-item">{{ $t('system') }}</div>
      <div class="label-item">CPU</div>
      <div class="label-item">{{ $t('memory') }}</div>
      <div class="label-item">{{ $t('network') }}</div>
      <div class="label-item">{{ $t('load') }}</div>
      <div class="label-item">{{ $t('due-time-only') }}</div>
      <div class="label-item">{{ $t('report-time') }}</div>
    </div>

    <!-- 内容行：水平排列 -->
    <div class="row-values">
      <!-- 主机状态 -->
      <div class="value-item name">
        <div class="status-row" :class="item.status ? 'online' : 'offline'">
          <span class="status-dot"></span>
          <span class="status-text">{{item.status ? $t('online') : $t('offline')}}</span>
          <span class="uptime-text">{{formatUptime(item.State.Uptime)}}</span>
        </div>
      </div>

      <!-- 系统 -->
      <div class="value-item platform">
        <span class="platform-val">{{item.Host.Platform && item.Host.Platform.toLowerCase().includes('windows') ? 'Windows' : `${item.Host.Platform || ''} ${item.Host.PlatformVersion || ''}`}}</span>
      </div>

      <!-- CPU -->
      <div class="value-item cpu-col">
        <div class="cpu-gauge">
          <div class="gauge-ring" :class="progressStatus(cpuPercent)">
            <svg viewBox="0 0 36 36" class="gauge-svg">
              <path class="gauge-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <path class="gauge-fill" :class="progressStatus(cpuPercent)" :stroke-dasharray="`${cpuPercent}, 100`" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            </svg>
            <span class="gauge-value" :class="progressStatus(cpuPercent)">{{cpuPercent.toFixed(0)}}%</span>
          </div>
        </div>
      </div>

      <!-- 内存 -->
      <div class="value-item mem-col">
        <div class="mem-gauge">
          <div class="gauge-ring" :class="progressStatus(memPercent)">
            <svg viewBox="0 0 36 36" class="gauge-svg">
              <path class="gauge-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <path class="gauge-fill" :class="progressStatus(memPercent)" :stroke-dasharray="`${memPercent}, 100`" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            </svg>
            <span class="gauge-value" :class="progressStatus(memPercent)">{{memPercent.toFixed(0)}}%</span>
          </div>
        </div>
      </div>

      <!-- 网络 -->
      <div class="value-item network">
        <div class="net-gauge">
          <div class="net-row up">
            <div class="net-icon-wrap">
              <icon-arrow-up />
            </div>
            <div class="net-bar-wrap">
              <div class="net-bar" :style="{ width: Math.min(netOutPercent, 100) + '%' }"></div>
            </div>
            <span class="net-speed">{{formatBytes(item.State.NetOutSpeed)}}/s</span>
          </div>
          <div class="net-row down">
            <div class="net-icon-wrap">
              <icon-arrow-down />
            </div>
            <div class="net-bar-wrap">
              <div class="net-bar" :style="{ width: Math.min(netInPercent, 100) + '%' }"></div>
            </div>
            <span class="net-speed">{{formatBytes(item.State.NetInSpeed)}}/s</span>
          </div>
        </div>
      </div>

      <!-- 负载 -->
      <div class="value-item load">
        <div class="load-display">
          <div class="load-bar" :class="loadStatus(item.State.Load1)">
            <span class="load-num">{{item.State.Load1}}</span>
          </div>
          <div class="load-bar" :class="loadStatus(item.State.Load5)">
            <span class="load-num">{{item.State.Load5}}</span>
          </div>
          <div class="load-bar" :class="loadStatus(item.State.Load15)">
            <span class="load-num">{{item.State.Load15}}</span>
          </div>
        </div>
      </div>

      <!-- 到期 -->
      <div class="value-item due">
        <span class="due-val" :class="getDueDaysClass">
          <template v-if="getDueDays !== null">
            <template v-if="getDueDays === '-'">-</template>
            <template v-else>{{getDueDays}}{{ $t('days') }}</template>
          </template>
          <template v-else>-</template>
        </span>
      </div>

      <!-- 上报时间 -->
      <div class="value-item report">
        <span class="report-val">{{formatTimeStamp(item.TimeStamp)}}</span>
      </div>
    </div>

    <!-- 详情区域 -->
    <MonitorCardDetail
      v-if="isActive"
      :item="item"
      :hostInfo="hostInfo"
      :charts="charts" />

    <!-- 操作按钮（悬浮，不占位） -->
    <div class="action-btns" @click.stop>
      <div class="edit-btn" @click.stop="emit('showEdit', item.Host.Name)">
        <icon-edit />
      </div>
      <div class="delete-btn" @click.stop="emit('showDelete', item.Host.Name)">
        <icon-delete />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.monitor-item {
  position: relative;
  margin-bottom: 6px;
  padding: 14px 20px 14px 28px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03);
  cursor: grab;
  transition: all 0.2s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-style: preserve-3d;
  perspective: 800px;
  will-change: transform;
  user-select: none;
  touch-action: none;
  backface-visibility: hidden;
  overflow: hidden;

  &.is-active {
    background: #f6f9ff;
    box-shadow: 0 3px 14px rgba(22, 93, 255, 0.1), 0 1px 4px rgba(22, 93, 255, 0.08);

    .action-btns { display: none !important; }
    .status-bar { width: 4px; }
  }

  &:hover:not(.is-active) {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);

    .action-btns { display: flex; }
  }

  /* 左侧状态条 */
  .status-bar {
    position: absolute;
    left: 0;
    top: 8px;
    bottom: 8px;
    width: 3px;
    border-radius: 0 3px 3px 0;
    transition: width 0.2s ease;

    &.status-bar-online { background: linear-gradient(180deg, #54D474, #00B42A); }
    &.status-bar-offline { background: linear-gradient(180deg, #FF7070, #F53F3F); }
  }

  /* 标签行：水平排列 */
  .row-labels {
    display: flex;
    align-items: center;
    width: 100%;
    padding-right: 70px;
    margin-bottom: 4px;
  }

  .label-item {
    flex: 1 1 0;
    min-width: 0;
    font-size: 12px;
    color: #86909c;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }

  /* 内容行：水平排列 */
  .row-values {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 36px;
    padding-right: 70px;
  }

  .value-item {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 4px;
  }

  /* 主机状态 */
  .name {
    .status-row {
      display: flex;
      align-items: center;
      gap: 4px;

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #F53F3F;
        flex-shrink: 0;
      }

      .status-text {
        font-size: 11px;
        color: #F53F3F;
        font-weight: 500;
        white-space: nowrap;
      }

      .uptime-text {
        font-size: 11px;
        color: #86909c;
        white-space: nowrap;
      }

      &.online {
        .status-dot {
          background: #00B42A;
          box-shadow: 0 0 0 2px rgba(0, 180, 42, 0.2);
          animation: pulse-dot 2s infinite;
        }
        .status-text { color: #00B42A; }
      }
    }
  }

  /* 系统 */
  .platform {
    .platform-val {
      font-size: 12px;
      font-weight: 500;
      color: #1d2129;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  /* CPU gauge 样式 */
  .cpu-col {
    min-width: 0;

    .cpu-gauge {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    .gauge-ring {
      position: relative;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .gauge-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .gauge-bg {
      fill: none;
      stroke: #e5e6eb;
      stroke-width: 3;
    }

    .gauge-fill {
      fill: none;
      stroke-width: 3;
      stroke-linecap: round;
      transition: stroke-dasharray 0.3s ease, stroke 0.3s ease;

      &.success { stroke: #00B42A; }
      &.warning { stroke: #FF7D00; }
      &.danger  { stroke: #F53F3F; }
    }

    .gauge-value {
      position: absolute;
      font-size: 9px;
      font-weight: 700;
      color: #1d2129;

      &.success { color: #00B42A; }
      &.warning { color: #FF7D00; }
      &.danger  { color: #F53F3F; }
    }
  }

  /* 内存 gauge 样式 */
  .mem-col {
    min-width: 0;

    .mem-gauge {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    .gauge-ring {
      position: relative;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .gauge-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .gauge-bg {
      fill: none;
      stroke: #e5e6eb;
      stroke-width: 3;
    }

    .gauge-fill {
      fill: none;
      stroke-width: 3;
      stroke-linecap: round;
      transition: stroke-dasharray 0.3s ease, stroke 0.3s ease;

      &.success { stroke: #00B42A; }
      &.warning { stroke: #FF7D00; }
      &.danger  { stroke: #F53F3F; }
    }

    .gauge-value {
      position: absolute;
      font-size: 9px;
      font-weight: 700;
      color: #1d2129;

      &.success { color: #00B42A; }
      &.warning { color: #FF7D00; }
      &.danger  { color: #F53F3F; }
    }
  }

  /* 网络列 */
  .network {
    min-width: 0;

    .net-gauge {
      display: flex;
      flex-direction: column;
      gap: 3px;
      justify-content: center;
    }

    .net-row {
      display: flex;
      align-items: center;
      gap: 4px;

      .net-icon-wrap {
        width: 14px;
        height: 14px;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .arco-icon {
          font-size: 10px;
        }
      }

      .net-bar-wrap {
        flex: 1;
        height: 4px;
        background: #e5e6eb;
        border-radius: 2px;
        overflow: hidden;
        min-width: 20px;

        .net-bar {
          height: 100%;
          border-radius: 2px;
          transition: width 0.3s ease;
        }
      }

      .net-speed {
        font-size: 10px;
        font-weight: 600;
        white-space: nowrap;
        min-width: 50px;
        text-align: right;
      }

      &.up {
        .net-icon-wrap {
          background: rgba(255, 125, 0, 0.12);
          color: #FF7D00;
        }
        .net-bar { background: linear-gradient(90deg, #FF7D00, #FFB74D); }
        .net-speed { color: #FF7D00; }
      }

      &.down {
        .net-icon-wrap {
          background: rgba(114, 46, 209, 0.12);
          color: #722ED1;
        }
        .net-bar { background: linear-gradient(90deg, #722ED1, #B39DDB); }
        .net-speed { color: #722ED1; }
      }
    }
  }

  /* 负载列 */
  .load {
    min-width: 0;

    .load-display {
      display: flex;
      flex-direction: row;
      gap: 4px;
      justify-content: center;
      align-items: center;
    }

    .load-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3px 5px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      transition: all 0.3s ease;
      min-width: 28px;

      .load-num {
        white-space: nowrap;
      }

      &.low {
        background: rgba(0, 180, 42, 0.1);
        color: #00B42A;
      }

      &.medium {
        background: rgba(255, 125, 0, 0.1);
        color: #FF7D00;
      }

      &.high {
        background: rgba(245, 63, 63, 0.1);
        color: #F53F3F;
      }
    }
  }

  /* 到期列 */
  .due {
    min-width: 0;
  }

  /* 到期列 */
  .due {
    min-width: 0;

    .due-val {
      font-size: 12px;
      font-weight: 600;
      color: #4e5969;
      white-space: nowrap;

      &.due-warn { color: #FF7D00; }
      &.due-danger { color: #F53F3F; }
    }
  }

  /* 上报时间列 */
  .report {
    min-width: 0;

    .report-val {
      font-size: 12px;
      font-weight: 500;
      color: #4e5969;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  /* 操作按钮区域 */
  .action-btns {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    display: none;
    align-items: center;
    gap: 6px;
    z-index: 3;
  }

  .edit-btn,
  .delete-btn {
    cursor: pointer;
    border-radius: 8px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease-in-out;

    .arco-icon {
      font-size: 14px;
    }
  }

  .edit-btn {
    background: rgba(22, 93, 255, 0.08);
    &:hover { background: rgba(22, 93, 255, 0.16); }
    .arco-icon { color: #165DFF; }
  }

  .delete-btn {
    background: rgba(245, 63, 63, 0.08);
    &:hover { background: rgba(245, 63, 63, 0.15); }
    .arco-icon { color: #F53F3F; }
  }
}

@keyframes pulse-dot {
  0%   { box-shadow: 0 0 0 0   rgba(0, 180, 42, 0.35); }
  70%  { box-shadow: 0 0 0 5px rgba(0, 180, 42, 0); }
  100% { box-shadow: 0 0 0 0   rgba(0, 180, 42, 0); }
}
</style>

<style lang="scss">
body[arco-theme='dark'] {
  .monitor-card {
    .monitor-item {
      background-color: #1c1c1c;
      box-shadow: 0 1px 3px rgba(0,0,0,0.25);
      color: #e5e5e5;

      &:hover:not(.is-active) {
        background-color: #222222;
        box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      }

      &.is-active {
        background: #1a2040;
        box-shadow: 0 3px 14px rgba(22, 93, 255, 0.18);
      }

      .row-labels .label-item { color: #777; }

      .name .host-title .host-name { color: #f0f0f0; }
      .name .uptime-text { color: #777; }

      .platform .platform-val { color: #888; }

      .col .col-label { color: #666; }
      .col .col-value { color: #e0e0e0; }
      .col .col-value.success { color: #54D474; }
      .col .col-value.warning { color: #FFB74D; }
      .col .col-value.danger  { color: #FF7070; }

      /* CPU gauge 暗色 */
      .cpu-col .gauge-bg { stroke: #333; }
      .cpu-col .gauge-fill.success { stroke: #54D474; }
      .cpu-col .gauge-fill.warning { stroke: #FFB74D; }
      .cpu-col .gauge-fill.danger  { stroke: #FF7070; }
      .cpu-col .gauge-value { color: #e0e0e0; }
      .cpu-col .gauge-value.success { color: #54D474; }
      .cpu-col .gauge-value.warning { color: #FFB74D; }
      .cpu-col .gauge-value.danger  { color: #FF7070; }

      /* 内存 gauge 暗色 */
      .mem-col .gauge-bg { stroke: #333; }
      .mem-col .gauge-fill.success { stroke: #54D474; }
      .mem-col .gauge-fill.warning { stroke: #FFB74D; }
      .mem-col .gauge-fill.danger  { stroke: #FF7070; }
      .mem-col .gauge-value { color: #e0e0e0; }
      .mem-col .gauge-value.success { color: #54D474; }
      .mem-col .gauge-value.warning { color: #FFB74D; }
      .mem-col .gauge-value.danger  { color: #FF7070; }

      /* 负载暗色 */
      .load .load-bar.low { background: rgba(84, 212, 116, 0.12); color: #54D474; }
      .load .load-bar.medium { background: rgba(255, 184, 77, 0.12); color: #FFB74D; }
      .load .load-bar.high { background: rgba(255, 112, 112, 0.12); color: #FF7070; }

      /* 网络 gauge 暗色 */
      .network .net-row.up .net-icon-wrap { background: rgba(255, 184, 77, 0.15); color: #FFB74D; }
      .network .net-row.up .net-bar { background: linear-gradient(90deg, #FFB74D, #FFD699); }
      .network .net-row.up .net-speed { color: #FFB74D; }
      .network .net-row.down .net-icon-wrap { background: rgba(179, 157, 219, 0.15); color: #B39DDB; }
      .network .net-row.down .net-bar { background: linear-gradient(90deg, #B39DDB, #D4C4E8); }
      .network .net-row.down .net-speed { color: #B39DDB; }
      .network .net-bar-wrap { background: #333; }

      .due .due-val { color: #a0a0a0; }
      .due .due-val.due-warn { color: #FFB74D; }
      .due .due-val.due-danger { color: #FF7070; }
      .report .report-val { color: #888; }

      .detail {
        border-color: #2a2a2a;
      }
    }
  }
}

@media screen and (max-width: 1100px) {
  .monitor-item {
    .load, .due { display: none !important; }
  }
}

@media screen and (max-width: 900px) {
  .monitor-item {
    .platform { display: none !important; }
  }
}

@media screen and (max-width: 768px) {
  .monitor-item {
    padding: 8px 12px 8px 20px !important;

    .name { flex: 1.8 !important; }
    .network { display: none !important; }
    .report { display: none !important; }
  }
}
</style>
