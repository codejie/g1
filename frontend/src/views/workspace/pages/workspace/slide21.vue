<template>
  <div class="h-full flex flex-col">
    <div class="flex-shrink-0 flex justify-between items-center p-4 border-b">
      <div>
        <h1 class="text-2xl font-bold">App PRD Report Detail</h1>
        <div class="mt-2 space-y-1">
          <p v-if="name" class="text-sm text-gray-700">
            <span class="font-semibold text-blue-600">File Name:</span> {{ name }}
          </p>
          <p v-if="result !== undefined" class="text-sm text-gray-700">
            <span class="font-semibold text-green-600">Result:</span> 
            <span :class="result === 0 ? 'text-green-700' : 'text-red-700'">
              {{ result === 0 ? 'Success' : 'Failed' }}
            </span>
          </p>
        </div>
      </div>
      <button
        @click="goBack"
        class="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300"
      >
        {{ t('workspace.new.back', '返回') }}
      </button>
    </div>

    <div class="flex-1 p-6 bg-gray-50 overflow-y-auto">
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <h2 class="text-xl font-bold mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            PRD Report 信息
          </h2>
          <div class="space-y-4">
            <div class="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div class="text-sm font-medium text-gray-500">Result</div>
              <div class="col-span-2 text-sm font-bold" :class="result === 0 ? 'text-green-600' : 'text-red-600'">
                {{ result === 0 ? 'Success' : 'Failed' }}
              </div>
            </div>
            <div v-if="message" class="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div class="text-sm font-medium text-gray-500">Message</div>
              <div class="col-span-2 text-sm text-gray-900 break-all">{{ message }}</div>
            </div>
            <div v-if="name" class="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div class="text-sm font-medium text-gray-500">File Name</div>
              <div class="col-span-2 text-sm text-gray-900">{{ name }}</div>
            </div>
            <div v-if="app_id" class="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div class="text-sm font-medium text-gray-500">App ID</div>
              <div class="col-span-2 text-sm text-gray-900">{{ app_id }}</div>
            </div>
            <div v-if="file_id" class="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div class="text-sm font-medium text-gray-500">File ID</div>
              <div class="col-span-2 text-sm text-gray-900">{{ file_id }}</div>
            </div>
          </div>
        </div>

        <div v-if="file_id" class="bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <h2 class="text-xl font-bold mb-4 flex items-center text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            文件操作
          </h2>
          <div class="space-y-4">
            <div class="flex space-x-4">
              <button
                @click="handleGetInfo"
                class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
              >
                Get File Info
              </button>
              <button
                @click="handleDownload"
                class="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"
              >
                Download File
              </button>
            </div>
            <div v-if="infoResult" class="mt-4 p-4 bg-gray-100 rounded-lg overflow-x-auto">
              <h3 class="text-sm font-bold mb-2">Info Result:</h3>
              <pre class="text-xs text-gray-800">{{ JSON.stringify(infoResult, null, 2) }}</pre>
            </div>
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

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const result = ref<number>(0)
const message = ref('')
const name = ref('')
const app_id = ref<number>()
const file_id = ref<number>()

const infoResult = ref<any>(null)

onMounted(() => {
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
})

const goBack = () => {
  router.back()
}

const handleGetInfo = async () => {
  if (!file_id.value) return
  try {
    infoResult.value = await filesService.getFileInfo({ id: file_id.value })
  } catch (error) {
    console.error('getFileInfo failed:', error)
    alert('获取信息失败')
  }
}

const handleDownload = async () => {
  if (!file_id.value) return
  try {
    const filename = name.value || 'downloaded-file'
    await filesService.downloadAndSave({ id: file_id.value }, filename)
  } catch (error) {
    console.error('download failed:', error)
    alert('下载失败')
  }
}
</script>

<style scoped>
</style>
