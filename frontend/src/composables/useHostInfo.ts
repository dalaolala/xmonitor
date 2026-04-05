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
    closeDelete
  }
}