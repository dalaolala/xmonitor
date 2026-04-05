<script setup>
const props = defineProps({
  visible: Boolean,
  authSecret: String
})

const emit = defineEmits(['update:visible', 'update:authSecret', 'export', 'close'])
</script>

<template>
  <a-modal
    :visible="visible"
    :title="$t('export-data')"
    :width="400"
    @cancel="emit('close')"
    @ok="emit('export')">
    <a-form :model="{}" layout="vertical">
      <a-form-item :label="$t('auth-secret')">
        <a-input-password
          :model-value="authSecret"
          @update:model-value="(v) => emit('update:authSecret', v)"
          :placeholder="$t('auth-secret-placeholder')" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>