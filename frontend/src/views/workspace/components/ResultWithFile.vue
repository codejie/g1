<template>
  <div class="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span class="text-sm font-medium text-blue-800">{{ name }}</span>
      </div>
      <button
        @click="goToSlide2"
        class="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors"
      >
        {{ name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  name: string
  path: string
}>()

const router = useRouter()

const goToSlide2 = () => {
  router.push({
    name: 'workspace-slide2',
    query: {
      name: props.name,
      path: props.path
    }
  })
}
</script>
