<template>
  <div class="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
    <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ app.name }}</h3>
    <p v-if="app.version" class="text-sm text-gray-500 mb-1">
      <span class="font-medium">Version:</span> {{ app.version }}
    </p>
    <p v-if="app.description" class="text-sm text-gray-600 line-clamp-2">{{ app.description }}</p>
    <div class="mt-3 flex items-center justify-between">
      <span
        class="text-xs px-2 py-1 rounded-full"
        :class="app.status === 1 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
      >
        {{ app.status === 1 ? 'Completed' : 'In Progress' }}
      </span>
      <span class="text-xs text-gray-400">
        {{ formatDate(app.created) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AppsModelType } from '@/types/apps'

const props = defineProps<{
  app: AppsModelType
}>()

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
