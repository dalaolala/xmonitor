<script setup>
import { ref } from 'vue'

const props = defineProps({
  visible: Boolean,
  authSecret: String
})

const emit = defineEmits(['update:visible', 'update:authSecret', 'import', 'close'])

const fileList = ref([])
const importFile = ref(null)

const handleBeforeUpload = (file) => {
  importFile.value = file
  fileList.value = [{
    uid: file.uid || '-1',
    name: file.name,
    status: 'done'
  }]
  return false
}

const handleImport = () => {
  if (!importFile.value) {
    return
  }
  emit('import', importFile.value)
  fileList.value = []
  importFile.value = null
}

const handleClose = () => {
  fileList.value = []
  importFile.value = null
  emit('close')
}
</script>

<template>
  <a-modal
    :visible="visible"
    :title="$t('import-data')"
    :width="400"
    @cancel="handleClose"
    @ok="handleImport">
    <a-form :model="{}" layout="vertical">
      <a-form-item :label="$t('auth-secret')">
        <a-input-password
          :model-value="authSecret"
          @update:model-value="(v) => emit('update:authSecret', v)"
          :placeholder="$t('auth-secret-placeholder')" />
      </a-form-item>
      <a-form-item :label="$t('select-file')">
        <a-upload
          :file-list="fileList"
          :auto-upload="false"
          accept=".json"
          :limit="1"
          @before-upload="handleBeforeUpload">
          <template #upload-button>
            <a-button>
              <icon-upload />
              {{ $t('select-json-file') }}
            </a-button>
          </template>
        </a-upload>
      </a-form-item>
    </a-form>
  </a-modal>
</template>