<script setup>
defineProps({
  visible: Boolean,
  editHostName: String,
  duetime: [Number, String],
  buy_url: String,
  seller: String,
  price: String,
  authSecret: String
})

const emit = defineEmits([
  'update:visible', 
  'update:duetime', 
  'update:buy_url', 
  'update:seller', 
  'update:price',
  'update:authSecret',
  'edit',
  'close'
])

const handleClose = () => {
  emit('close')
}

const handleEdit = () => {
  emit('edit')
}
</script>

<template>
  <a-modal :visible="visible" @update:visible="emit('update:visible', $event)" :footer="false" :hide-title="true" width="360px" @cancel="handleClose">
    <div class="akile-modal-title">
      <span>{{$t('edit-host-title')}}</span>
      <a-button @click="handleClose">
        <template #icon>
          <icon-close/>
        </template>
      </a-button>
    </div>
    <div class="akile-modal-content">
      <a-date-picker 
        :model-value="duetime"
        @update:model-value="emit('update:duetime', $event)"
        :placeholder="$t('due-time-placeholder')" 
        style="margin-bottom: 10px;width: 100%;"></a-date-picker>
      <a-input 
        :model-value="seller"
        @update:model-value="emit('update:seller', $event)"
        :placeholder="$t('isp-placeholder')" 
        style="margin-bottom: 10px;"></a-input>
      <a-input 
        :model-value="price"
        @update:model-value="emit('update:price', $event)"
        :placeholder="$t('price-placeholder')" 
        style="margin-bottom: 10px;"></a-input>
      <a-input 
        :model-value="buy_url"
        @update:model-value="emit('update:buy_url', $event)"
        :placeholder="$t('buy-url-placeholder')" 
        style="margin-bottom: 10px;"></a-input>
      <a-input-password 
        :model-value="authSecret"
        @update:model-value="emit('update:authSecret', $event)"
        :placeholder="$t('auth-placeholder')"></a-input-password>
    </div>
    <div class="akile-modal-action">
      <a-button type="primary" :long="true" @click="handleEdit">{{$t('edit-host-btn')}}</a-button>
    </div>
  </a-modal>
</template>

<style lang="scss" scoped>
.akile-modal-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
}

.akile-modal-content {
  margin-bottom: 16px;
}
</style>