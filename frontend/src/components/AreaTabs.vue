<script setup>
defineProps({
  area: Array,
  selectArea: String
})

const emit = defineEmits(['selectArea'])
</script>

<template>
  <div class="area-tabs">
    <div 
      class="area-tab-item" 
      :class="selectArea === 'all' ? 'is-active' : ''" 
      @click="emit('selectArea', 'all')">
      {{$t('all-area')}}
    </div>
    <div 
      class="area-tab-item" 
      :class="selectArea === item ? 'is-active' : ''" 
      v-for="(item, index) in area" 
      :key="item" 
      @click="emit('selectArea', item)">
      <span :class="`flag-icon flag-icon-${item.replace('UK', 'GB').toLowerCase()}`" style="margin-right: 3px;"></span> {{item}}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.area-tabs {
  margin: 12px 20px;

  .area-tab-item {
    margin-bottom: 8px;
    margin-right: 8px;
    padding: 5px 10px;
    border-radius: 20px;
    cursor: pointer;
    border: none;
    background: rgba(0,0,0,0.04);
    display: inline-block;
    font-size: 13px;
    transition: all 0.2s ease;

    .flag-icon {
      border-radius: 2px;
      margin-top: -2px;
    }

    &.is-active {
      background: linear-gradient(135deg, #165DFF 0%, #0E4DCC 100%);
      color: #fff;
    }
    
    &:hover:not(.is-active) {
      background: rgba(0,0,0,0.08);
    }
  }
}
</style>

<style lang="scss">
body[arco-theme='dark'] {
  .area-tabs {
    .area-tab-item {
      border: none;
      background: rgba(255,255,255,0.06);
      color: #ffffff;

      &.is-active {
        background: linear-gradient(135deg, #165DFF 0%, #0E4DCC 100%);
        color: #fff;
      }
      
      &:hover:not(.is-active) {
        background: rgba(255,255,255,0.1);
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .area-tabs {
    margin: 8px 16px;
  }
}
</style>