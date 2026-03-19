<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="flex-shrink-0 flex justify-between items-center p-4 border-b">
      <div>
        <h1 class="text-2xl font-bold">Slide 4 Page</h1>
      </div>
      <button
        @click="goBack"
        class="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300"
      >
        Finished
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
          @click="handleDownload"
          :disabled="isDownloading"
          class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {{ isDownloading ? 'Downloading...' : 'Download' }}
        </button>
      </div>

      <div class="flex-1 p-4 bg-gray-50 overflow-auto">
        <div class="bg-white rounded-lg shadow-md border p-4">
          <h3 class="text-lg font-semibold mb-3">File Information</h3>
          <div v-if="fileInfo">
            <div class="space-y-2 text-sm">
              <div class="flex">
                <span class="w-24 text-gray-500">ID:</span>
                <span class="text-gray-800">{{ fileInfo.id }}</span>
              </div>
              <div class="flex">
                <span class="w-24 text-gray-500">Type:</span>
                <span class="text-gray-800">{{ fileInfo.type }}</span>
              </div>
              <div class="flex">
                <span class="w-24 text-gray-500">Path:</span>
                <span class="text-gray-800">{{ fileInfo.path }}</span>
              </div>
              <div class="flex">
                <span class="w-24 text-gray-500">Name:</span>
                <span class="text-gray-800">{{ fileInfo.name }}</span>
              </div>
              <div class="flex">
                <span class="w-24 text-gray-500">Status:</span>
                <span class="text-gray-800">{{ fileInfo.status }}</span>
              </div>
              <div class="flex">
                <span class="w-24 text-gray-500">Created:</span>
                <span class="text-gray-800">{{ formatDate(fileInfo.created) }}</span>
              </div>
              <div class="flex">
                <span class="w-24 text-gray-500">Updated:</span>
                <span class="text-gray-800">{{ formatDate(fileInfo.updated) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500">
            Loading file information...
          </div>
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
import type { FilesModelType } from '@/types/files'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const result = ref<number>(0)
const message = ref('')
const name = ref('')
const app_id = ref<number>()
const file_id = ref<number>()

const isDownloading = ref(false)
const fileInfo = ref<FilesModelType | null>(null)

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

  if (file_id.value) {
    await loadFileInfo()
  }
})

const loadFileInfo = async () => {
  if (!file_id.value) return
  try {
    fileInfo.value = await filesService.getFileInfo({ id: file_id.value })
  } catch (error) {
    console.error('getFileInfo failed:', error)
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString()
}

const handleDownload = async () => {
  if (!file_id.value || !name.value) return
  try {
    isDownloading.value = true
    const blob = await filesService.download({ id: file_id.value })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name.value
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('download failed:', error)
    alert('下载失败')
  } finally {
    isDownloading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'workspace' })
}
</script>

<style scoped>
</style>
