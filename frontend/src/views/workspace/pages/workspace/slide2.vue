<template>
  <div class="h-full flex flex-col">
    <!-- Top Bar -->
    <div class="flex-shrink-0 flex justify-between items-center p-4 border-b">
      <div>
        <h1 class="text-2xl font-bold">Slide 2 Page</h1>
        <div class="mt-2 space-y-1">
          <p v-if="name" class="text-sm text-gray-700">
            <span class="font-semibold text-blue-600">File Name:</span> {{ name }}
          </p>
          <p v-if="path" class="text-sm text-gray-700">
            <span class="font-semibold text-purple-600">File Path:</span> {{ path }}
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

    <!-- Main Content -->
    <div class="flex-1 p-6 bg-gray-50 overflow-y-auto">
      <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <h2 class="text-xl font-bold mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          文件详情
        </h2>
        <div class="space-y-4">
          <div class="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div class="text-sm font-medium text-gray-500">文件名</div>
            <div class="col-span-2 text-sm text-gray-900">{{ name || 'N/A' }}</div>
          </div>
          <div class="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div class="text-sm font-medium text-gray-500">文件路径</div>
            <div class="col-span-2 text-sm text-gray-900 break-all">{{ path || 'N/A' }}</div>
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

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const name = ref('')
const path = ref('')

onMounted(() => {
  if (typeof route.query.name === 'string') {
    name.value = route.query.name
  }
  if (typeof route.query.path === 'string') {
    path.value = route.query.path
  }
})

const goBack = () => {
  router.back()
}
</script>

<style scoped>
</style>
