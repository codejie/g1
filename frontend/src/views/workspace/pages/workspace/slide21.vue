<template>
  <div class="h-full flex flex-col">
    <div class="flex-shrink-0 flex justify-between items-center p-4 border-b">
      <div>
        <h1 class="text-2xl font-bold">Slide 21 Page</h1>
      </div>
      <button
        @click="goBack"
        class="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300"
      >
        {{ t('workspace.new.back', '返回') }}
      </button>
    </div>

    <div v-if="result !== 0" class="flex-1 flex items-center justify-center bg-gray-50">
      <div class="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
        <div class="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 class="text-xl font-bold text-red-700">Failed</h2>
        </div>
        <p v-if="message" class="text-gray-700">{{ message }}</p>
      </div>
    </div>

    <div v-else class="flex-1 flex flex-col min-h-0">
      <div class="flex-shrink-0 flex justify-between items-center p-4 border-b bg-white">
        <div class="flex-1">
          <span class="text-lg font-semibold text-gray-700">{{ name || 'Unknown File' }}</span>
        </div>
        <button
          @click="handleGetInfo"
          :disabled="isLoadingInfo"
          class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {{ isLoadingInfo ? 'Loading...' : 'Get File Info' }}
        </button>
      </div>

      <div class="flex-1 p-4 bg-gray-50 overflow-hidden flex flex-col min-h-0">
        <div class="flex-1 bg-white rounded-lg shadow-md border overflow-hidden flex flex-col min-h-0">
          <textarea
            v-model="fileContent"
            placeholder="File content will appear here..."
            class="flex-1 w-full p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>
      </div>

      <div class="flex-shrink-0 flex justify-end space-x-4 p-4 border-t bg-white">
        <button
          @click="handleUploadFileInfo"
          class="px-6 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition"
        >
          Upload File Info
        </button>
        <button
          @click="handleNext"
          class="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"
        >
          Generate App
        </button>
      </div>
    </div>

    <div v-if="showInfoDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showInfoDialog = false">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" @click.stop>
        <div class="flex justify-between items-center p-4 border-b">
          <h3 class="text-lg font-bold text-gray-800">File Info</h3>
          <button @click="showInfoDialog = false" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-4 overflow-y-auto max-h-[60vh]">
          <pre class="text-sm text-gray-800 whitespace-pre-wrap">{{ JSON.stringify(infoResult, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import filesService from '@/services/files'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const result = ref<number>(0)
const message = ref('')
const name = ref('')
const app_id = ref<number>()
const file_id = ref<number>()

const isLoadingInfo = ref(false)
const infoResult = ref<any>(null)
const showInfoDialog = ref(false)
const fileContent = ref('')

onMounted(async () => {
  if (typeof route.query.result === 'string') {
    result.value = parseInt(route.query.result) || 0
  }
  if (typeof route.query.message === 'string') {
    message.value = route.query.message
  }
  if (typeof route.query.name === 'string') {
    name.value = route.query.name
  }
  if (typeof route.query.app_id === 'string') {
    app_id.value = parseInt(route.query.app_id)
  }
  if (typeof route.query.file_id === 'string') {
    file_id.value = parseInt(route.query.file_id)
  }

  if (result.value === 0 && file_id.value) {
    await loadFileContent()
  }
})

const loadFileContent = async () => {
  if (!file_id.value) return
  try {
    const blob = await filesService.download({ id: file_id.value })
    const text = await blob.text()
    fileContent.value = text
  } catch (error) {
    console.error('loadFileContent failed:', error)
    fileContent.value = 'Failed to load file content'
  }
}

const goBack = () => {
  router.back()
}

const handleGetInfo = async () => {
  if (!file_id.value) return
  try {
    isLoadingInfo.value = true
    infoResult.value = await filesService.getFileInfo({ id: file_id.value })
    showInfoDialog.value = true
  } catch (error) {
    console.error('getFileInfo failed:', error)
    alert('获取信息失败')
  } finally {
    isLoadingInfo.value = false
  }
}

const handleUploadFileInfo = async () => {
  if (!file_id.value) return
  try {
    await filesService.upload({ id: file_id.value, content: fileContent.value })
    alert('上传成功')
  } catch (error) {
    console.error('upload failed:', error)
    alert('上传失败')
  }
}

const handleNext = () => {
  console.log(app_id.value)
  router.push({
    name: 'workspace-slide3',
    query: { app_id: app_id.value || 1 }
  })
}
</script>

<style scoped>
</style>
