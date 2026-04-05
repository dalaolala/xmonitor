<script setup>
import moment from 'moment'
import CPU from "@/components/CPU.vue"
import Mem from "@/components/Mem.vue"
import NetIn from "@/components/NetIn.vue"
import NetOut from "@/components/NetOut.vue"
import { formatBytes, formatTimeStamp } from '@/utils/utils'

const props = defineProps({
  item: Object,
  hostInfo: Object,
  charts: Object
})
</script>

<template>
  <div class="detail">
    <!-- 分隔线 -->
    <div class="detail-divider"></div>

    <a-row :gutter="[20, 0]">
      <!-- 左侧：信息列表 -->
      <a-col :span="10" :xs="24" :sm="24" :md="10" :lg="10">
        <div class="detail-info-panel">
          <div class="info-section">
            <div class="info-section-title">{{ $t('basic-info') || '基本信息' }}</div>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="d-label">{{ $t('hostname') }}</span>
                <span class="d-value">{{item.Host.Name}}</span>
              </div>
              <div class="detail-item">
                <span class="d-label">{{ $t('area') }}</span>
                <span class="d-value">
                  <span :class="`flag-icon flag-icon-${item.Host.Name.slice(0, 2).replace('UK', 'GB').toLowerCase()}`"></span>
                  &nbsp;{{item.Host.Name.slice(0, 2).toUpperCase()}}
                </span>
              </div>
              <div class="detail-item">
                <span class="d-label">{{ $t('system') }}</span>
                <span class="d-value">{{item.Host.Platform}} {{item.Host.PlatformVersion}}</span>
              </div>
              <div class="detail-item">
                <span class="d-label">{{ $t('arch') }}</span>
                <span class="d-value">{{item.Host.Arch}}</span>
              </div>
              <div class="detail-item">
                <span class="d-label">{{ $t('virtualization') }}</span>
                <span class="d-value">{{item.Host.Virtualization || '-'}}</span>
              </div>
              <div class="detail-item">
                <span class="d-label">CPU</span>
                <span class="d-value cpu-val">{{item.Host.CPU.join(', ')}}</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <div class="info-section-title">{{ $t('real-time') || '实时状态' }}</div>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="d-label">CPU{{ $t('use') }}</span>
                <span class="d-value">
                  <span class="badge" :class="item.State.CPU >= 90 ? 'badge-danger' : item.State.CPU >= 80 ? 'badge-warn' : 'badge-ok'">
                    {{item.State.CPU.toFixed(2) + '%'}}
                  </span>
                </span>
              </div>
              <div class="detail-item">
                <span class="d-label">{{ $t('memory') }}</span>
                <span class="d-value">
                  <span class="badge" :class="(item.State.MemUsed/item.Host.MemTotal*100) >= 90 ? 'badge-danger' : (item.State.MemUsed/item.Host.MemTotal*100) >= 80 ? 'badge-warn' : 'badge-ok'">
                    {{(item.State.MemUsed / item.Host.MemTotal * 100).toFixed(2) + '%'}}
                  </span>
                  <span class="d-sub">&nbsp;({{formatBytes(item.State.MemUsed)}} / {{formatBytes(item.Host.MemTotal)}})</span>
                </span>
              </div>
              <div class="detail-item">
                <span class="d-label">{{ $t('swap') }}</span>
                <span class="d-value">{{formatBytes(item.State.SwapUsed)}} / {{formatBytes(item.Host.SwapTotal)}}</span>
              </div>
              <div class="detail-item">
                <span class="d-label">{{ $t('network') }}（IN|OUT）</span>
                <span class="d-value">
                  <span class="net-val up">▲ {{formatBytes(item.State.NetOutSpeed)}}/s</span>
                  <span class="net-sep"> / </span>
                  <span class="net-val down">▼ {{formatBytes(item.State.NetInSpeed)}}/s</span>
                </span>
              </div>
              <div class="detail-item">
                <span class="d-label">{{ $t('load') }}(1|5|15)</span>
                <span class="d-value">{{item.State.Load1}} · {{item.State.Load5}} · {{item.State.Load15}}</span>
              </div>
              <div class="detail-item">
                <span class="d-label">{{ $t('bandwidth') }}↑|↓</span>
                <span class="d-value">{{formatBytes(item.State.NetOutTransfer)}} / {{formatBytes(item.State.NetInTransfer)}}</span>
              </div>
              <div class="detail-item">
                <span class="d-label">{{ $t('uptime') }}</span>
                <span class="d-value">{{formatTimeStamp(item.Host.BootTime)}}</span>
              </div>
              <div class="detail-item">
                <span class="d-label">{{ $t('report-time') }}</span>
                <span class="d-value">{{formatTimeStamp(item.TimeStamp)}}</span>
              </div>
            </div>
          </div>

          <div class="info-section" v-if="hostInfo[item.Host.Name] && (hostInfo[item.Host.Name].seller || hostInfo[item.Host.Name].price || hostInfo[item.Host.Name].due_time || hostInfo[item.Host.Name].buy_url)">
            <div class="info-section-title">{{ $t('host-info') || '主机信息' }}</div>
            <div class="detail-grid">
              <div class="detail-item" v-if="hostInfo[item.Host.Name].seller">
                <span class="d-label">{{ $t('isp-name') }}</span>
                <span class="d-value">{{hostInfo[item.Host.Name].seller}}</span>
              </div>
              <div class="detail-item" v-if="hostInfo[item.Host.Name].price">
                <span class="d-label">{{ $t('host-price') }}</span>
                <span class="d-value">{{hostInfo[item.Host.Name].price}}</span>
              </div>
              <div class="detail-item" v-if="hostInfo[item.Host.Name].due_time">
                <span class="d-label">{{ $t('due-time') }}</span>
                <span class="d-value">{{moment(hostInfo[item.Host.Name].due_time).format('YYYY-MM-DD')}}</span>
              </div>
              <div class="detail-item" v-if="hostInfo[item.Host.Name].buy_url">
                <span class="d-label">{{ $t('buy-url') }}</span>
                <span class="d-value">
                  <a class="buy-link" :href="hostInfo[item.Host.Name].buy_url" target="_blank" @click.stop="() => {}">
                    <icon-link />
                    {{hostInfo[item.Host.Name].buy_url}}
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </a-col>

      <!-- 右侧：图表 -->
      <a-col :span="14" :xs="24" :sm="24" :md="14" :lg="14">
        <div class="charts-panel">
          <a-row :gutter="[16, 16]">
            <a-col :span="12" :xs="24" :sm="12" :md="12" :lg="12">
              <div class="chart-card">
                <CPU :data="charts[item.Host.Name].cpu" />
              </div>
            </a-col>
            <a-col :span="12" :xs="24" :sm="12" :md="12" :lg="12">
              <div class="chart-card">
                <Mem :max="item.Host.MemTotal" :data="charts[item.Host.Name].mem" />
              </div>
            </a-col>
            <a-col :span="12" :xs="24" :sm="12" :md="12" :lg="12">
              <div class="chart-card">
                <NetIn :data="charts[item.Host.Name].net_in" />
              </div>
            </a-col>
            <a-col :span="12" :xs="24" :sm="12" :md="12" :lg="12">
              <div class="chart-card">
                <NetOut :data="charts[item.Host.Name].net_out" />
              </div>
            </a-col>
          </a-row>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<style lang="scss" scoped>
.detail {
  width: 100%;
  display: block;
  margin-top: 8px;

  .detail-divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(22, 93, 255, 0.15), transparent);
    margin: 12px 0 16px;
  }

  .detail-info-panel {
    padding-right: 8px;
  }

  .info-section {
    margin-bottom: 16px;

    &:last-child { margin-bottom: 0; }
  }

  .info-section-title {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #4e5969;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid #f0f2f5;
  }

  .detail-grid {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .detail-item {
    display: flex;
    align-items: baseline;
    gap: 0;
    line-height: 1.5;

    .d-label {
      width: 32%;
      font-size: 12px;
      color: #4e5969;
      flex-shrink: 0;
    }

    .d-value {
      flex: 1;
      font-size: 13px;
      font-weight: 500;
      color: #1d2129;
      word-break: break-all;

      &.cpu-val {
        font-size: 11.5px;
        font-weight: 400;
        color: #4e5969;
      }
    }

    .d-sub {
      font-size: 12px;
      font-weight: 400;
      color: #4e5969;
    }
  }

  .badge {
    display: inline-block;
    padding: 0 6px;
    border-radius: 20px;
    font-size: 11.5px;
    font-weight: 600;
    line-height: 1.6;

    &.badge-ok {
      background: rgba(0,180,42,0.1);
      color: #00B42A;
    }
    &.badge-warn {
      background: rgba(255,125,0,0.1);
      color: #FF7D00;
    }
    &.badge-danger {
      background: rgba(245,63,63,0.1);
      color: #F53F3F;
    }
  }

  .net-val {
    font-weight: 500;
    &.up { color: #FF7D00; }
    &.down { color: #722ED1; }
  }
  .net-sep { color: #adb5bd; }

  .buy-link {
    color: #165DFF;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;

    &:hover { text-decoration: underline; }
  }

  .charts-panel {
    padding-left: 4px;
  }

  .chart-card {
    background: rgba(0,0,0,0.02);
    border-radius: 10px;
    padding: 10px 10px 6px;
    border: 1px solid rgba(0,0,0,0.04);
  }
}
</style>

<style lang="scss">
body[arco-theme='dark'] {
  .detail {
    .detail-divider {
      background: linear-gradient(90deg, transparent, rgba(91, 138, 240, 0.2), transparent);
    }

    .info-section-title {
      color: #888;
      border-bottom-color: #2a2a2a;
    }

    .detail-item {
      .d-label { color: #888; }
      .d-value { color: #e0e0e0; }
      .d-value.cpu-val { color: #a0a0a0; }
      .d-sub { color: #888; }
    }

    .net-val {
      &.up { color: #FFB74D; }
      &.down { color: #B39DDB; }
    }

    .chart-card {
      background: rgba(255,255,255,0.03);
      border-color: rgba(255,255,255,0.06);
    }

    .buy-link { color: #5B8AF0; }
  }
}

@media screen and (max-width: 768px) {
  .detail {
    .detail-item {
      .d-label { width: 30%; }
    }

    .charts-panel { padding-left: 0; }
  }
}
</style>
