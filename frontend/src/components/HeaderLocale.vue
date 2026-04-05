<template>
  <a-dropdown @select="onLocaleChange" popup-container=".locale-btn">
    <a-button class="locale-btn" shape="circle" size="small">
      <template #icon>
        <icon-language />
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
  background: linear-gradient(135deg, rgba(114, 46, 209, 0.1) 0%, rgba(114, 46, 209, 0.05) 100%) !important;
  color: #722ED1 !important;
  width: 34px !important;
  height: 34px !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(114, 46, 209, 0.08);

  &:hover {
    background: linear-gradient(135deg, rgba(114, 46, 209, 0.18) 0%, rgba(114, 46, 209, 0.1) 100%) !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(114, 46, 209, 0.18);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>

<style lang="scss">
body[arco-theme='dark'] {
  .locale-btn {
    background: linear-gradient(135deg, rgba(114, 46, 209, 0.15) 0%, rgba(114, 46, 209, 0.08) 100%) !important;
    color: #B37FEB !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;

    &:hover {
      background: linear-gradient(135deg, rgba(114, 46, 209, 0.28) 0%, rgba(114, 46, 209, 0.15) 100%) !important;
      box-shadow: 0 4px 12px rgba(114, 46, 209, 0.25) !important;
    }
  }
}

@media screen and (max-width: 480px) {
  .locale-btn {
    width: 32px !important;
    height: 32px !important;
  }
}
</style>