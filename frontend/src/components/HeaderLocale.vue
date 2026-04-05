<template>
  <a-dropdown @select="onLocaleChange" popup-container=".locale-btn">
    <a-button class="locale-btn" :shape="'round'">
      <template #icon>
        <icon-language style="font-size: 18px;" />
      </template>
    </a-button>
    <template #content>
      <a-doption value="zh">
        <icon-check :class="locale == 'zh'?'':'is-hide'" />
        简体中文
      </a-doption>
      <a-doption value="en">
        <icon-check :class="locale == 'en'?'':'is-hide'" />
        English
      </a-doption>
      <a-doption value="ja">
        <icon-check :class="locale == 'ja'?'':'is-hide'" />
        にほんご
      </a-doption>
      <a-doption value="ko">
        <icon-check :class="locale == 'ko'?'':'is-hide'" />
        한국어
      </a-doption>
      <a-doption value="de">
        <icon-check :class="locale == 'de'?'':'is-hide'" />
        Deutsch
      </a-doption>
    </template>
  </a-dropdown>
</template>

<script setup>
import {useI18n} from "vue-i18n";
import {onMounted} from "vue";

const { locale, availableLocales } = useI18n()

const onLocaleChange = (val) => {
  locale.value = val
  window.localStorage.setItem('locale', val)
}

const fetchData = () => {
  if (window.localStorage.getItem('locale')) {
    locale.value = window.localStorage.getItem('locale')
  } else {
    const lang = navigator.language || navigator.userLanguage
    const browserLocale = lang.substr(0, 2)

    if (availableLocales.includes(browserLocale)) {
      locale.value = browserLocale
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.is-hide {
  opacity: 0;
}

.locale-btn {
  border: none !important;
  background-color: transparent !important;
  color: #666 !important;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(0,0,0,0.05) !important;
  }
}

body[arco-theme='dark'] {
  .locale-btn {
    border: none!important;
    background-color: transparent!important;
    color: #aaa!important;
    
    &:hover {
      background-color: rgba(255,255,255,0.08) !important;
    }
  }
}
</style>