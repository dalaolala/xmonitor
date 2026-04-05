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
    <a-row>
      <a-col :span="10" :xs="24" :sm="24" :md="10" :lg="10" :sl="10">
        <div class="detail-item-list">
          <div class="detail-item">
            <div class="name">{{ $t('hostname') }}</div>
            <div class="value">{{item.Host.Name}}</div>
          </div>
          <div class="detail-item">
            <div class="name">{{ $t('area') }}</div>
            <div class="value">
              <span :class="`flag-icon flag-icon-${item.Host.Name.slice(0, 2).replace('UK', 'GB').toLowerCase()}`"></span>
              {{item.Host.Name.slice(0, 2).toUpperCase()}}
            </div>
          </div>
          <div class="detail-item">
            <div class="name">{{ $t('system') }}</div>
            <div class="value">{{item.Host.Platform}} {{item.Host.PlatformVersion}}</div>
          </div>
          <div class="detail-item">
            <div class="name">{{ $t('arch') }}</div>
            <div class="value">{{item.Host.Arch}}</div>
          </div>
          <div class="detail-item">
            <div class="name">{{ $t('virtualization') }}</div>
            <div class="value">{{item.Host.Virtualization || '-'}}</div>
          </div>
          <div class="detail-item">
            <div class="name">CPU</div>
            <div class="value">{{item.Host.CPU.join(',')}}</div>
          </div>
          <div class="detail-item">
            <div class="name">CPU{{ $t('use') }}</div>
            <div class="value">{{item.State.CPU.toFixed(2) + '%'}}</div>
          </div>
          <div class="detail-item">
            <div class="name">{{ $t('memory') }}</div>
            <div class="value">{{(item.State.MemUsed / item.Host.MemTotal * 100).toFixed(2) + '%'}} ({{formatBytes(item.State.MemUsed)}} / {{formatBytes(item.Host.MemTotal)}})</div>
          </div>
          <div class="detail-item">
            <div class="name">{{ $t('swap') }}</div>
            <div class="value">{{formatBytes(item.State.SwapUsed)}} / {{formatBytes(item.Host.SwapTotal)}}</div>
          </div>
          <div class="detail-item">
            <div class="name">{{ $t('network') }}（IN|OUT）</div>
            <div class="value">{{`${formatBytes(item.State.NetInSpeed)}/s | ${formatBytes(item.State.NetOutSpeed)}/s`}}</div>
          </div>
          <div class="detail-item">
            <div class="name">{{ $t('load') }}(1|5|15)</div>
            <div class="value">{{`${item.State.Load1} | ${item.State.Load5} | ${item.State.Load15}`}}</div>
          </div>
          <div class="detail-item">
            <div class="name">{{ $t('bandwidth') }}↑|↓</div>
            <div class="value">{{formatBytes(item.State.NetOutTransfer)}} | {{formatBytes(item.State.NetInTransfer)}}</div>
          </div>
          <div class="detail-item">
            <div class="name">{{ $t('uptime') }}</div>
            <div class="value">{{formatTimeStamp(item.Host.BootTime)}}</div>
          </div>
          <div class="detail-item">
            <div class="name">{{ $t('report-time') }}</div>
            <div class="value">{{formatTimeStamp(item.TimeStamp)}}</div>
          </div>
          <div class="detail-item" v-if="hostInfo[item.Host.Name] && hostInfo[item.Host.Name].seller">
            <div class="name">{{ $t('isp-name') }}</div>
            <div class="value">{{hostInfo[item.Host.Name].seller}}</div>
          </div>
          <div class="detail-item" v-if="hostInfo[item.Host.Name] && hostInfo[item.Host.Name].price">
            <div class="name">{{ $t('host-price') }}</div>
            <div class="value">{{hostInfo[item.Host.Name].price}}</div>
          </div>
          <div class="detail-item" v-if="hostInfo[item.Host.Name] && hostInfo[item.Host.Name].due_time">
            <div class="name">{{ $t('due-time') }}</div>
            <div class="value">{{moment(hostInfo[item.Host.Name].due_time).format('YYYY-MM-DD')}}</div>
          </div>
          <div class="detail-item" v-if="hostInfo[item.Host.Name] && hostInfo[item.Host.Name].buy_url">
            <div class="name">{{ $t('buy-url') }}</div>
            <div class="value">
              <a style="color: #0077ff" :href="hostInfo[item.Host.Name].buy_url" target="_blank" @click.stop="() => {}">{{hostInfo[item.Host.Name].buy_url}}</a>
            </div>
          </div>
        </div>
      </a-col>
      <a-col :span="14" :xs="24" :sm="24" :md="14" :lg="14" :sl="14">
        <a-row :gutter="20">
          <a-col :span="12" :xs="24" :sm="24" :md="12" :lg="12" :sl="12">
            <CPU style="margin-bottom: 20px;" :data="charts[item.Host.Name].cpu" />
          </a-col>
          <a-col :span="12" :xs="24" :sm="24" :md="12" :lg="12" :sl="12">
            <Mem :max="item.Host.MemTotal" style="margin-bottom: 20px;" :data="charts[item.Host.Name].mem" />
          </a-col>
          <a-col :span="12" :xs="24" :sm="24" :md="12" :lg="12" :sl="12">
            <NetIn :data="charts[item.Host.Name].net_in" />
          </a-col>
          <a-col :span="12" :xs="24" :sm="24" :md="12" :lg="12" :sl="12">
            <NetOut :data="charts[item.Host.Name].net_out" />
          </a-col>
        </a-row>
      </a-col>
    </a-row>
  </div>
</template>

<style lang="scss" scoped>
.detail {
  width: 100%;
  display: none;

  .detail-item-list {
    margin-bottom: 16px;
  }

  .detail-item {
    .name {
      width: 30%;
      font-size: 12px;
      color: #86909c;
      margin-bottom: 4px;
      display: inline-block;
      vertical-align: top;
    }

    .value {
      width: 70%;
      font-size: 12px;
      font-weight: 500;
      display: inline-block;
      vertical-align: top;
      color: #1d2129;
    }
  }
}
</style>

<style lang="scss">
@media screen and (max-width: 768px) {
  .detail {
    .detail-item {
      .name {
        width: 25%!important;
      }
      .value {
        width: 75%!important;
      }
    }
  }
}
</style>