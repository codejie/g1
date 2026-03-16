<template>
  <div class="mt-3 bg-green-50 border border-green-100 rounded-lg p-4">
    <div class="space-y-3">
      <div class="flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <div class="text-sm font-medium text-green-800 mb-1">App PRD Report</div>
          <div v-if="result !== undefined" class="flex items-center mb-2">
            <span class="text-xs text-gray-500 mr-2">Result:</span>
            <span class="text-xs font-semibold" :class="result === 0 ? 'text-green-600' : 'text-red-600'">
              {{ result === 0 ? 'Success' : 'Failed' }}
            </span>
          </div>
          <div v-if="message" class="mb-2">
            <div class="text-xs text-gray-500 mb-1">Message:</div>
            <div class="text-sm text-gray-700 bg-white px-2 py-1 rounded border">{{ message }}</div>
          </div>
          <div v-if="name" class="flex items-center">
            <span class="text-xs text-gray-500 mr-2">File:</span>
            <button
              @click="goToSlide21"
              class="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
            >
              {{ name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  result: number
  message?: string
  name?: string
  app_id?: number
  file_id?: number
}>()

const router = useRouter()

const goToSlide21 = () => {
  router.push({
    name: 'workspace-slide21',
    query: {
      result: props.result.toString(),
      message: props.message || '',
      name: props.name || '',
      app_id: props.app_id?.toString() || '',
      file_id: props.file_id?.toString() || ''
    }
  })
}
</script>
