<script setup>
import HeaderLocale from "@/components/HeaderLocale.vue"

defineProps({
  dark: Boolean
})

const emit = defineEmits(['changeDark'])
</script>

<template>
  <div class="header">
    <a class="logo" href="#">
      <svg class="arco-icon" viewBox="0 0 48 48" fill="currentColor">
        <path data-v-2ee6cb6b="" fill-rule="evenodd" clip-rule="evenodd" d="M42.919 11.923L25 1.577a2 2 0 00-2 0L5.081 11.923a2 2 0 00-1 1.732v20.69a2 2 0 001 1.732L23 46.423a2 2 0 002 0l17.919-10.346a2 2 0 001-1.732v-20.69a2 2 0 00-1-1.732zM30.556 9.525L38.5 14 24 23l-13.808-8.668L17.5 10l6.5 4 6.556-4.475zM22 40.441V26.286L8 17.358v7.928l8 5.464v6.227l6 3.464zm10-3.464l-6 3.464V26.286l14-8.928v8.928l-8 5.464v5.227z" fill="currentColor"></path>
      </svg>
      <span>X Monitor</span>
      <small style="font-weight: 400;opacity: .8"> ｜ {{ $t('title') }}</small>
    </a>
    <a-space>
      <HeaderLocale />
      <a-button class="theme-btn" :shape="'round'" @click="emit('changeDark')">
        <template #icon>
          <icon-sun-fill v-if="!dark" />
          <icon-moon-fill v-else />
        </template>
      </a-button>
    </a-space>
  </div>
</template>

<style lang="scss" scoped>
.header {
  margin: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .theme-btn {
    border: none!important;
    background-color: transparent!important;
    color: #666!important;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: rgba(0,0,0,0.05)!important;
    }
  }
}

.logo {
  margin-top: 0;
  margin-bottom: 0;
  position: relative;
  cursor: pointer;
  line-height: 40px;
  height: 40px;
  font-size: 15px;
  font-weight: 700;
  color: #1d2129;
  display: flex;
  align-items: center;

  .arco-icon {
    margin-right: 8px;
    height: 24px;
    width: 24px;
    color: rgb(22,93,255)!important;
  }
  
  small {
    font-weight: 400;
    opacity: .6;
  }
}
</style>

<style lang="scss">
body[arco-theme='dark'] {
  .header {
    .logo {
      span,
      small {
        color: #ffffff;
      }
    }

    .theme-btn {
      border: none!important;
      background-color: transparent!important;
      color: #aaa!important;
      
      &:hover {
        background-color: rgba(255,255,255,0.08)!important;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .header {
    margin: 12px 16px;
  }
}
</style>