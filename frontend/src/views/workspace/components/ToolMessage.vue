<template>
  <div class="px-4 py-2 bg-yellow-50 text-yellow-700 text-xs font-medium shadow border-t border-b border-yellow-200 w-full flex items-center justify-between group">
    <div class="truncate mr-4">
      <template v-if="part?.tool === 'question' && part?.state?.status === 'running' && part?.state?.input?.questions?.[0]?.question">
        {{ part.state.input.questions[0].question }}
      </template>
      <template v-else>
        tool - {{ part?.tool }}
      </template>
    </div>
    <button 
      @click="$emit('close')" 
      class="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200 p-1 rounded transition-colors focus:outline-none flex-shrink-0"
      title="Close tool message"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'

const props = defineProps<{
  part: any
}>()

const emit = defineEmits<{
  (e: 'update-disabled', value: boolean): void
  (e: 'close'): void
}>()

watch(() => props.part, (newPart) => {
  if (newPart && newPart.state && newPart.state.status === 'running') {
    if (newPart.tool === 'question') {
      emit('update-disabled', false)
    } else {
      emit('update-disabled', true)
    }
  } else {
    emit('update-disabled', false)
  }
}, { immediate: true, deep: true })
</script>

<style scoped>
</style>
