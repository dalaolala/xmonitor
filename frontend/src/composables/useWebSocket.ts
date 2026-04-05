import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Message } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'

export interface HostData {
  Host: {
    Name: string
    Platform: string
    PlatformVersion: string
    Arch: string
    CPU: string[]
    MemTotal: number
    SwapTotal: number
    BootTime: number
    Virtualization?: string
  }
  State: {
    CPU: number
    MemUsed: number
    SwapUsed: number
    NetInSpeed: number
    NetOutSpeed: number
    NetInTransfer: number
    NetOutTransfer: number
    Uptime: number
    Load1: number
    Load5: number
    Load15: number
  }
  TimeStamp: number
  status: number
}

export interface ChartData {
  cpu: [number, number][]
  mem: [number, number][]
  net_in: [number, number][]
  net_out: [number, number][]
}

export function useWebSocket() {
  const { t } = useI18n()

  const socketURL = ref('')
  const apiURL = ref('')
  const area = ref<string[]>([])
  const data = ref<HostData[]>([])
  const charts = ref<Record<string, ChartData>>({})

  let socket: WebSocket | null = null
  let nowtime = Math.floor(Date.now() / 1000)

  const fetchConfig = async () => {
    try {
      const res = await axios.get('/config.json')
      socketURL.value = res.data.socket
      apiURL.value = res.data.apiURL
    } catch (e) {
      Message.error(t('get-config-error'))
    }
  }

  const sendPing = () => {
    nowtime = Math.floor(Date.now() / 1000)
    socket?.send('ping')
  }

  const initSocket = async () => {
    await fetchConfig()

    socket = new WebSocket(socketURL.value)

    socket.onmessage = function (event) {
      try {
        const message = event.data
        const res = JSON.parse(message.replace('data: ', ''))
        if (res != null) {
          area.value = Array.from(new Set(res.map((item: any) => item.Host.Name.slice(0, 2))))
        }
        data.value = res.map((host: any) => {
          if (!charts.value[host.Host.Name]) {
            charts.value[host.Host.Name] = {
              cpu: [],
              mem: [],
              net_in: [],
              net_out: []
            }
          }

          if (charts.value[host.Host.Name].cpu.length == 2) {
            charts.value[host.Host.Name].cpu = charts.value[host.Host.Name].cpu.slice(1)
            charts.value[host.Host.Name].mem = charts.value[host.Host.Name].mem.slice(1)
            charts.value[host.Host.Name].net_in = charts.value[host.Host.Name].net_in.slice(1)
            charts.value[host.Host.Name].net_out = charts.value[host.Host.Name].net_out.slice(1)
          }

          charts.value[host.Host.Name].cpu.push([host.TimeStamp * 1000, host.State.CPU])
          charts.value[host.Host.Name].mem.push([host.TimeStamp * 1000, host.State.MemUsed])
          charts.value[host.Host.Name].net_in.push([host.TimeStamp * 1000, host.State.NetOutSpeed])
          charts.value[host.Host.Name].net_out.push([host.TimeStamp * 1000, host.State.NetInSpeed])

          return {
            ...host,
            status: (nowtime - host.TimeStamp <= 10) ? 1 : 0
          }
        })

        setTimeout(() => sendPing(), 1000)

      } catch (error) {
        console.error(t('ws-error'), error)
      }
    }

    socket.onopen = function () {
      sendPing()
    }

    socket.onclose = function () {
      Message.warning(t('ws-error-reconnect'))
      initSocket()
    }
  }

  onMounted(() => {
    initSocket()
  })

  return {
    socketURL,
    apiURL,
    area,
    data,
    charts,
    initSocket,
    sendPing
  }
}