import { ref, onMounted } from 'vue'

export function useTheme() {
  const theme = window.localStorage.getItem('theme') || 'light'
  const dark = ref(theme !== 'light')

  const handleChangeDark = () => {
    dark.value = !dark.value

    if (dark.value) {
      window.localStorage.setItem('theme', 'dark')
      document.body.setAttribute('arco-theme', 'dark')
    } else {
      window.localStorage.setItem('theme', 'light')
      document.body.removeAttribute('arco-theme')
    }
  }

  onMounted(() => {
    if (dark.value) {
      document.body.setAttribute('arco-theme', 'dark')
    }
  })

  return {
    dark,
    handleChangeDark
  }
}