import { ref, type Ref, unref } from 'vue'
import axios from 'axios'
import { Message } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'

export interface HostInfo {
  name: string
  due_time: number
  buy_url: string
  seller: string
  price: string
}

export function useHostInfo(apiURL: Ref<string> | string) {
  const { t } = useI18n()

  const hostInfo = ref<Record<string, HostInfo>>({})

  const fetchHostInfo = async () => {
    const url = unref(apiURL)
    if (!url) return
    try {
      const res = await axios.get(url + '/info')
      res.data.forEach((item: HostInfo) => {
        hostInfo.value[item.name] = item
      })
    } catch (e) {
      // 静默失败
    }
  }

  const editHostName = ref('')
  const duetime = ref(0)
  const buy_url = ref('')
  const seller = ref('')
  const price = ref('')
  const authSecret = ref('')
  const editVisible = ref(false)

  const showEdit = (name: string) => {
    if (!hostInfo.value[name]) {
      editHostName.value = name
      duetime.value = 0
      buy_url.value = ''
      seller.value = ''
      price.value = ''
      editVisible.value = true
      authSecret.value = window.localStorage.getItem('auth_secret') || ''
      return
    }

    editHostName.value = name
    duetime.value = hostInfo.value[name].due_time
    buy_url.value = hostInfo.value[name].buy_url
    seller.value = hostInfo.value[name].seller
    price.value = hostInfo.value[name].price
    editVisible.value = true
    authSecret.value = window.localStorage.getItem('auth_secret') || ''
  }

  const editHost = async () => {
    const url = unref(apiURL)
    try {
      await axios.post(url + '/info', {
        'name': editHostName.value,
        'due_time': new Date(duetime.value).getTime(),
        'buy_url': buy_url.value,
        'seller': seller.value,
        'auth_secret': authSecret.value,
        'price': price.value
      })

      window.localStorage.setItem('auth_secret', authSecret.value)

      Message.success(t('edit-success'))

      fetchHostInfo()

      editVisible.value = false
    } catch (e) {
      Message.error(t('edit-fail'))
    }
  }

  const closeEdit = () => {
    editVisible.value = false
  }

  const deleteHostName = ref('')
  const deleteVisible = ref(false)

  const showDelete = (name: string) => {
    authSecret.value = window.localStorage.getItem('auth_secret') || ''
    deleteHostName.value = name
    deleteVisible.value = true
  }

  const deleteHost = async () => {
    const url = unref(apiURL)
    try {
      await axios.post(url + '/delete', {
        'auth_secret': authSecret.value,
        'name': deleteHostName.value
      })

      window.localStorage.setItem('auth_secret', authSecret.value)

      Message.success(t('remove-success'))

      deleteVisible.value = false
    } catch (e) {
      Message.error(t('remove-fail'))
    }
  }

  const closeDelete = () => {
    deleteVisible.value = false
  }

  // 导出数据库
  const exportVisible = ref(false)

  const showExport = () => {
    exportVisible.value = true
    authSecret.value = window.localStorage.getItem('auth_secret') || ''
  }

  const exportDB = async () => {
    const url = unref(apiURL)
    if (!authSecret.value) {
      Message.error(t('need-auth-secret'))
      return
    }
    try {
      const res = await axios.get(url + '/export?token=' + authSecret.value, {
        responseType: 'blob'
      })

      // 检查响应状态
      if (res.status !== 200) {
        Message.error(t('export-fail'))
        return
      }

      // 检查是否是错误响应（JSON错误消息通常较小）
      const blob = res.data
      if (blob.type === 'application/json' && blob.size < 200) {
        const text = await blob.text()
        try {
          const data = JSON.parse(text)
          if (data && data.message === 'auth failed') {
            Message.error(t('export-fail'))
            return
          }
        } catch {
          // 解析失败，继续下载
        }
      }

      const downloadBlob = new Blob([blob], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(downloadBlob)
      link.download = 'ak_monitor_export.json'
      link.click()
      URL.revokeObjectURL(link.href)
      window.localStorage.setItem('auth_secret', authSecret.value)
      Message.success(t('export-success'))
      exportVisible.value = false
    } catch (e: any) {
      console.error('Export error:', e)
      if (e.response && e.response.status === 401) {
        Message.error(t('export-fail'))
      } else {
        Message.error(t('export-fail'))
      }
    }
  }

  const closeExport = () => {
    exportVisible.value = false
  }

  // 导入数据库
  const importVisible = ref(false)

  const showImport = () => {
    importVisible.value = true
    authSecret.value = window.localStorage.getItem('auth_secret') || ''
  }

  const importDB = async (file: File) => {
    const url = unref(apiURL)
    if (!file) {
      Message.error(t('need-file'))
      return
    }
    try {
      const text = await file.text()
      const hosts = JSON.parse(text)
      await axios.post(url + '/import', {
        'auth_secret': authSecret.value,
        'hosts': hosts
      })
      window.localStorage.setItem('auth_secret', authSecret.value)
      Message.success(t('import-success'))
      importVisible.value = false
      fetchHostInfo()
    } catch (e) {
      Message.error(t('import-fail'))
    }
  }

  const closeImport = () => {
    importVisible.value = false
  }

  return {
    hostInfo,
    fetchHostInfo,
    // 编辑相关
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
    // 删除相关
    deleteHostName,
    deleteVisible,
    showDelete,
    deleteHost,
    closeDelete,
    // 导入导出相关
    exportVisible,
    showExport,
    exportDB,
    closeExport,
    importVisible,
    showImport,
    importDB,
    closeImport
  }
}