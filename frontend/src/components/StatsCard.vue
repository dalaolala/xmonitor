<script setup>
import {formatBandwithBytes, formatBytes} from "../utils/utils.js";
import {inject} from "vue";

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

</script>

<template>

  <div class="hero">
    <a-row :gutter="12">
      <a-col :span="6" :xs="24" :sm="24" :md="6" :lg="6" :sl="6">
        <div class="hero-card all" :class="type === 'all' ? 'is-active' :''" @click="handleChangeType('all')">
          <div class="title">{{ $t('server-total') }}</div>
          <div class="value">
            <div class="status" style="background: #165DFF;"></div>
            <span class="num">{{stats.total}} {{ $t('server-unit') }}</span>
          </div>
        </div>
      </a-col>
      <a-col :span="6" :xs="24" :sm="24" :md="6" :lg="6" :sl="6">
        <div class="hero-card online" :class="type === 'online' ? 'is-active' :''" @click="handleChangeType('online')">
          <div class="title">{{ $t('server-online') }}</div>
          <div class="value">
            <div class="status" style="background: #00B42A;"></div>
            <span class="num">{{stats.online}} {{ $t('server-unit') }}</span>
          </div>
        </div>
      </a-col>
      <a-col :span="6" :xs="24" :sm="24" :md="6" :lg="6" :sl="6">
        <div class="hero-card offline" :class="type === 'offline' ? 'is-active' :''" @click="handleChangeType('offline')">
          <div class="title">{{ $t('server-offline') }}</div>
          <div class="value">
            <div class="status" style="background: #F53F3F;"></div>
            <span class="num">{{stats.offline}} {{ $t('server-unit') }}</span>
          </div>
        </div>
      </a-col>
      <a-col :span="6" :xs="24" :sm="24" :md="6" :lg="6" :sl="6">
        <div class="hero-card">
          <div class="title">{{ $t('network-info') }}</div>
          <div class="value" style="display: block;">
            <div class="network-row">
              <span class="label">{{ $t('traffic-info') }}</span>
              <icon-arrow-up class="icon-up" />
              <span class="up-val">{{formatBytes(stats.traffic_up)}}</span>
              <icon-arrow-down class="icon-down" />
              <span class="down-val">{{formatBytes(stats.traffic_down)}}</span>
            </div>
            <div class="network-row">
              <span class="label">{{ $t('bandwidth-info') }}</span>
              <icon-up-circle class="icon-up" />
              <span class="up-val">{{formatBandwithBytes(stats.bandwidth_up)}}</span>
              <icon-down-circle class="icon-down" />
              <span class="down-val">{{formatBandwithBytes(stats.bandwidth_down)}}</span>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped lang="scss">
.hero {
  margin: 12px 20px;
  
  // 修复 arco-row gutter 导致的负 margin 对齐问题
  :deep(.arco-row) {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  
  :deep(.arco-col) {
    padding-left: 6px !important;
    padding-right: 6px !important;
  }
  
  :deep(.arco-col:first-child) {
    padding-left: 0 !important;
  }
  
  :deep(.arco-col:last-child) {
    padding-right: 0 !important;
  }

  .hero-card {
    margin-bottom: 8px;
    padding: 12px 16px;
    border: none;
    border-radius: 10px;
    background: #ffffff;
    min-height: 56px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    cursor: pointer;
    transition: all 0.2s ease;

    &.is-active,
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      
      &.all {
        background: linear-gradient(135deg, rgba(22,93,255,0.08) 0%, rgba(22,93,255,0.04) 100%);
      }

      &.online {
        background: linear-gradient(135deg, rgba(0,180,42,0.08) 0%, rgba(0,180,42,0.04) 100%);
      }

      &.offline {
        background: linear-gradient(135deg, rgba(245,63,63,0.08) 0%, rgba(245,63,63,0.04) 100%);
      }
    }

    .title {
      margin-top: 0;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 6px;
      color: #86909c;
    }

    .value {
      display: flex;
      align-items: center;
      .status {
        margin-right: 6px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #333333;
      }

      .num {
        font-size: 18px;
        font-weight: 700;
        color: #1d2129;
      }
      
      .network-row {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
        font-size: 13px;
        
        .label {
          color: #86909c;
          margin-right: 4px;
        }
        
        .icon-up {
          font-size: 12px;
          color: #FF7D00;
          margin-right: 2px;
        }
        
        .icon-down {
          font-size: 12px;
          color: #722ED1;
          margin-right: 2px;
          margin-left: 8px;
        }
        
        .up-val {
          color: #FF7D00;
          font-weight: 500;
        }
        
        .down-val {
          color: #722ED1;
          font-weight: 500;
        }
      }
    }
  }
}

body[arco-theme='dark'] {
  .hero-card {
    border: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    background-color: #1a1a1a;
    color: #ffffff;
    
    &:hover, &.is-active {
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      
      &.all {
        background: linear-gradient(135deg, rgba(22,93,255,0.15) 0%, rgba(22,93,255,0.08) 100%);
      }

      &.online {
        background: linear-gradient(135deg, rgba(0,180,42,0.15) 0%, rgba(0,180,42,0.08) 100%);
      }

      &.offline {
        background: linear-gradient(135deg, rgba(245,63,63,0.15) 0%, rgba(245,63,63,0.08) 100%);
      }
    }
    
    .title {
      color: #5c5c5c;
    }
    
    .value .num {
      color: #ffffff;
    }
    
    .value .network-row .label {
      color: #5c5c5c;
    }
  }
}

@media screen and (max-width: 768px) {
  .hero {
    margin: 8px 16px;
    
    :deep(.arco-col) {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
    
    .hero-card {
      padding: 10px 14px;
      min-height: 48px;
      margin-bottom: 6px;
      
      .title {
        font-size: 12px;
        margin-bottom: 4px;
      }
      
      .value .num {
        font-size: 16px;
      }
      
      .value .network-row {
        font-size: 12px;
      }
    }
  }
}
</style>