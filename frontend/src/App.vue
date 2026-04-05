<script setup lang="ts">
import { computed, onMounted, provide, ref, watch } from "vue"
import AppHeader from "@/components/AppHeader.vue"
import AreaTabs from "@/components/AreaTabs.vue"
import StatsCard from "@/components/StatsCard.vue"
import MonitorCard from "@/components/MonitorCard.vue"
import DeleteHostModal from "@/components/DeleteHostModal.vue"
import EditHostModal from "@/components/EditHostModal.vue"
import AppFooter from "@/components/AppFooter.vue"
import { useWebSocket } from "@/composables/useWebSocket"
import { useTheme } from "@/composables/useTheme"
import { useDrag } from "@/composables/useDrag"
import { useHostInfo } from "@/composables/useHostInfo"

// WebSocket 数据
const { area, data, charts, apiURL } = useWebSocket()

// 主题
const { dark, handleChangeDark } = useTheme()

// 拖拽
const { handleDragStart } = useDrag()

// 主机信息管理
const {
  hostInfo,
  fetchHostInfo,
  editHostName,
  duetime,
  buy_url,
  seller,
  price,
  authSecret,
  editVisible,
  showEdit,
  editHost,
  closeEdit,
  deleteHostName,
  deleteVisible,
  showDelete,
  deleteHost,
  closeDelete
} = useHostInfo(apiURL)

// 当 apiURL 变化时重新获取主机信息
watch(apiURL, (newVal) => {
  if (newVal) {
    fetchHostInfo()
  }
})

// 区域选择
const selectArea = ref('all')

// 类型筛选
const type = ref('all')

// 主机选择
const selectHost = ref('')

// 计算属性：按区域筛选
const host = computed(() => {
  if (selectArea.value === 'all') {
    return data.value
  }
  return data.value.filter(item => item.Host.Name.slice(0, 2) === selectArea.value)
})

// 计算属性：按类型筛选
const hosts = computed(() => {
  if (type.value === 'all') {
    return host.value
  } else if (type.value === 'online') {
    return host.value.filter(item => item.status)
  } else {
    return host.value.filter(item => !item.status)
  }
})

// 统计数据
const stats = computed(() => {
  const online = host.value.filter(item => item.status)
  let bandwidth_up = 0
  let bandwidth_down = 0
  let traffic_up = 0
  let traffic_down = 0

  host.value.forEach((item) => {
    bandwidth_up += item.State.NetOutSpeed
    bandwidth_down += item.State.NetInSpeed
    traffic_up += item.State.NetOutTransfer
    traffic_down += item.State.NetInTransfer
  })

  return {
    total: host.value.length,
    online: online.length,
    offline: host.value.length - online.length,
    bandwidth_up: bandwidth_up,
    bandwidth_down: bandwidth_down,
    traffic_up: traffic_up,
    traffic_down: traffic_down
  }
})

// 区域选择处理
const handleSelectArea = (areaName: string) => {
  selectArea.value = areaName
}

// 主机选择处理
const handleSelectHost = (hostName: string) => {
  if (selectHost.value === hostName) {
    selectHost.value = ''
    return
  }
  selectHost.value = hostName
}

// 类型切换处理
const handleChangeType = (value: string) => {
  type.value = value
}

// provide 给子组件
provide('handleChangeType', handleChangeType)

// 初始化
onMounted(async () => {
  await fetchHostInfo()
})
</script>

<template>
  <div class="max-container">
    <!-- Header -->
    <AppHeader :dark="dark" @changeDark="handleChangeDark" />
    
    <!-- 区域标签 -->
    <AreaTabs :area="area" :selectArea="selectArea" @selectArea="handleSelectArea" />
    
    <!-- 统计卡片 -->
    <StatsCard :type="type" :stats="stats" @handleChangeType="handleChangeType" />
    
    <!-- 监控卡片列表 -->
    <div class="monitor-card">
      <MonitorCard 
        v-for="(item, index) in hosts"
        :key="index"
        :item="item"
        :hostInfo="hostInfo"
        :charts="charts"
        :selectHost="selectHost"
        @selectHost="handleSelectHost"
        @showEdit="showEdit"
        @showDelete="showDelete"
        @dragStart="handleDragStart" />
    </div>
    
    <!-- 删除弹窗 -->
    <DeleteHostModal 
      :visible="deleteVisible"
      :authSecret="authSecret"
      :deleteHostName="deleteHostName"
      @update:visible="(v) => deleteVisible = v"
      @update:authSecret="(v) => authSecret = v"
      @delete="deleteHost"
      @close="closeDelete" />
    
    <!-- 编辑弹窗 -->
    <EditHostModal 
      :visible="editVisible"
      :editHostName="editHostName"
      :duetime="duetime"
      :buy_url="buy_url"
      :seller="seller"
      :price="price"
      :authSecret="authSecret"
      @update:visible="(v) => editVisible = v"
      @update:duetime="(v) => duetime = v"
      @update:buy_url="(v) => buy_url = v"
      @update:seller="(v) => seller = v"
      @update:price="(v) => price = v"
      @update:authSecret="(v) => authSecret = v"
      @edit="editHost"
      @close="closeEdit" />
    
    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<style lang="scss">
body {
  margin: 0;
  background-color: #f5f7fa;
  font-family: Inter,-apple-system,BlinkMacSystemFont,Roboto,PingFang SC,Noto Sans CJK,WenQuanYi Micro Hei,Microsoft YaHei;
}

a {
  text-decoration: none;
}

.max-container {
  margin: 0 auto;
  width: 100%;
  max-width: 1440px;
}

.arco-dropdown {
  padding: 4px!important;
  border-radius: 8px!important;
  .arco-dropdown-option {
    border-radius: 4px !important;
    padding: 6px 10px;
    line-height: 13px;
    font-size: 13px;
  }
}

.monitor-card {
  position: relative;
  margin: 0 auto;
  padding: 0 20px 20px;
}

body[arco-theme='dark'] {
  background-color: #0d0d0d;

  .arco-dropdown {
    background-color: #1a1a1a!important;
    border: 1px solid #2a2a2a!important;
  }

  .arco-modal {
    background-color: #1a1a1a;
    border: 1px solid #2a2a2a;
  }
}

@media screen and (max-width: 768px) {
  .monitor-card {
    padding: 0 16px 16px;
  }
}

@media screen and (max-width: 1920px) {
  .max-container {
    max-width: 1440px;
  }
}

@media screen and (max-width: 1280px) {
  .max-container {
    max-width: 1140px;
  }
}

@media screen and (max-width: 992px) {
  .max-container {
    max-width: 960px;
  }
}

@media screen and (max-width: 768px) {
  .max-container {
    max-width: 720px;
  }
}

@media screen and (max-width: 576px) {
  .max-container {
    max-width: 100%;
    padding: 0 8px;
  }
}
</style>