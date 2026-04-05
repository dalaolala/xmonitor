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

const isActive = computed(() => props.selectHost === props.item.Host.Name)
</script>

<template>
  <div 
    class="monitor-item" 
    :class="isActive ? 'is-active' : ''"
    :data-host="item.Host.Name"
    @click="emit('selectHost', item.Host.Name)"
    @mousedown="(e) => emit('dragStart', e, item.Host.Name)"
    @touchstart="(e) => emit('dragStart', e, item.Host.Name)">
    <div class="name">
      <div class="title">
        <span :class="`flag-icon flag-icon-${item.Host.Name.slice(0, 2).replace('UK', 'GB').toLowerCase()}`"></span>
        {{item.Host.Name}}
      </div>
      <div class="status" :class="item.status ? 'online' : 'offline'">
        <span>{{item.status ? $t('online') : $t('offline')}}</span>
        <span style="margin-left: 6px;">{{formatUptime(item.State.Uptime)}}</span>
      </div>
    </div>
    <div class="platform">
      <div class="monitor-item-title">{{ $t('system') }}</div>
      <div class="monitor-item-value">{{item.Host.Platform && item.Host.Platform.toLowerCase().includes('windows') ? 'Windows' : `${item.Host.Platform || ''} ${item.Host.PlatformVersion || ''}`}}</div>
    </div>
    <div class="cpu">
      <div class="monitor-item-title">CPU</div>
      <div class="monitor-item-value">{{item.State.CPU.toFixed(2) + '%'}}</div>
      <a-progress class="monitor-item-progress" :status="progressStatus(item.State.CPU)" :percent="item.State.CPU/100" :show-text="false" style="width: 60px" />
    </div>
    <div class="mem">
      <div class="monitor-item-title">{{ $t('memory') }}</div>
      <div class="monitor-item-value">{{(item.State.MemUsed / item.Host.MemTotal * 100).toFixed(2) + '%'}}</div>
      <a-progress class="monitor-item-progress" :status="progressStatus(item.State.MemUsed / item.Host.MemTotal * 100)" :percent="item.State.MemUsed / item.Host.MemTotal" :show-text="false" style="width: 60px" />
    </div>
    <div class="network">
      <div class="monitor-item-title">{{ $t('network') }} (IN|OUT)</div>
      <div class="monitor-item-value">{{`${formatBytes(item.State.NetInSpeed)}/s | ${formatBytes(item.State.NetOutSpeed)}/s`}}</div>
    </div>
    <div class="average">
      <div class="monitor-item-title">{{ $t('load') }} (1|5|15)</div>
      <div class="monitor-item-value">{{`${item.State.Load1} | ${item.State.Load5} | ${item.State.Load15}`}}</div>
    </div>
    <div class="uptime" style="width: 120px;">
      <div class="monitor-item-title">{{ $t('due-time-only') }}</div>
      <div class="monitor-item-value">{{hostInfo[item.Host.Name] ? calculateRemainingDays(hostInfo[item.Host.Name].due_time) : '-'}}</div>
    </div>
    <div class="uptime">
      <div class="monitor-item-title">{{ $t('report-time') }}</div>
      <div class="monitor-item-value">{{formatTimeStamp(item.TimeStamp)}}</div>
    </div>
    
    <!-- 详情区域 -->
    <MonitorCardDetail 
      v-if="isActive"
      :item="item"
      :hostInfo="hostInfo"
      :charts="charts" />
    
    <div class="edit-btn" @click.stop="emit('showEdit', item.Host.Name)">
      <icon-edit />
    </div>
    <div class="delete-btn" @click.stop="emit('showDelete', item.Host.Name)">
      <icon-delete />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.monitor-item {
  position: relative;
  margin-bottom: 8px;
  padding: 14px 32px;
  border-radius: 12px;
  border: none;
  display: block;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  cursor: grab;
  transition: all 0.2s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease, border-radius 0.4s ease, border 0.4s ease;
  transform-style: preserve-3d;
  perspective: 800px;
  perspective-origin: 50% 50%;
  will-change: transform, box-shadow, border-radius, border;
  user-select: none;
  touch-action: none;
  backface-visibility: hidden;

  &.is-active {
    background: #f8faff;
    box-shadow: 0 2px 8px rgba(22,93,255,0.12);

    .delete-btn,
    .edit-btn {
      display: none!important;
    }

    &>.detail {
      margin-top: 12px;
      border-top: 1px solid #eef2f7;
      padding-top: 12px;
      display: block;
    }
  }

  &:hover:not(.is-active) {
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    transform: translateY(-1px);

    .delete-btn,
    .edit-btn {
      display: flex;
    }
  }

  .edit-btn {
    right: 52px!important;
    background: rgba(22, 93, 255, 0.08)!important;

    &:hover {
      background: rgba(22, 93, 255, 0.15)!important;
    }

    .arco-icon {
      color: #165DFF!important;
    }
  }

  .delete-btn,
  .edit-btn {
    position: absolute;
    right: 12px;
    top: calc(50% - 14px);
    cursor: pointer;
    background: rgba(245, 63, 63, 0.08);
    border-radius: 8px;
    width: 28px;
    height: 28px;
    display: none;
    align-items: center;
    justify-content: center;
    transition: .15s background-color ease-in-out;

    &:hover {
      background: rgba(245, 63, 63, 0.15);
    }

    .arco-icon {
      color: #F53F3F;
      font-size: 14px;
    }
  }

  .flag-icon {
    margin-right: 4px;
    border-radius: 2px;
  }

  .monitor-item-title {
    margin-bottom: 2px;
    font-size: 11px;
    opacity: .5;
    font-weight: 400;
  }

  .monitor-item-value {
    font-weight: 600;
    font-size: 13px;
  }

  .monitor-item-progress {
    margin-top: 3px;
    height: 3px;
    display: block;
  }

  .name {
    display: inline-block;
    vertical-align: middle;
    width: 180px;

    .title {
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      font-weight: 600;
      font-size: 14px;
    }

    .status {
      display: flex;
      align-items: center;
      &::before {
        margin-right: 8px;
        position: relative;
        display: block;
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #F53F3F;
      }

      &.online {
        &::before {
          background-color: #00B42A;
        }
      }

      span {
        font-size: 12px;
        opacity: .5;
      }
    }
  }

  .platform {
    display: inline-block;
    vertical-align: top;
    width: 140px;
  }

  .cpu {
    display: inline-block;
    vertical-align: top;
    width: 120px;
  }

  .mem {
    display: inline-block;
    vertical-align: top;
    width: 120px;
  }

  .average {
    display: inline-block;
    vertical-align: top;
    width: 180px;
  }

  .network {
    display: inline-block;
    vertical-align: top;
    width: 180px;
  }

  .uptime {
    display: inline-block;
    vertical-align: middle;
    width: 120px;
    white-space: nowrap;
  }
}
</style>

<style lang="scss">
body[arco-theme='dark'] {
  .monitor-card {
    .monitor-item {
      border: none;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      background-color: #1a1a1a;
      color: #ffffff;

      &:hover:not(.is-active) {
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        background-color: #222;
      }
      
      &.is-active {
        background: #1e2230;
      }

      .detail {
        border-color: #2a2a2a;
        .detail-item-list {
          .detail-item {
            .name {
              color: #5c5c5c;
            }
            .value {
              color: #e5e5e5;
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .monitor-item {
    padding: 12px 16px;
    
    &>div {
      margin-bottom: 8px;
    }
  }
}
</style>