<script setup>
defineProps({
  visible: Boolean,
  authSecret: String,
  deleteHostName: String
})

const emit = defineEmits(['update:visible', 'update:authSecret', 'delete', 'close'])

const handleClose = () => {
  emit('close')
}

const handleDelete = () => {
  emit('delete')
}
</script>

<template>
  <a-modal :visible="visible" @update:visible="emit('update:visible', $event)" :footer="false" :hide-title="true" width="360px" @cancel="handleClose">
    <div class="akile-modal-title">
      <span>{{$t('remove-host-title')}}</span>
      <a-button @click="handleClose">
        <template #icon>
          <icon-close/>
        </template>
      </a-button>
    </div>
    <div class="akile-modal-content">
      <a-input-password 
        :model-value="authSecret"
        @update:model-value="emit('update:authSecret', $event)"
        :placeholder="$t('auth-placeholder')"></a-input-password>
      <div class="tips">{{$t('remove-host-tip')}}</div>
    </div>
    <div class="akile-modal-action">
      <a-button type="primary" status="danger" :long="true" @click="handleDelete">{{$t('remove-host-btn')}}</a-button>
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
  .tips {
    font-size: 12px;
    color: #86909c;
    margin-top: 8px;
  }
}
</style>