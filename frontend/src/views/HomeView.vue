<template>
  <div class="h-screen flex overflow-hidden bg-gray-50">
    <div 
      class="flex-shrink-0 border-r border-gray-200 bg-white transition-all duration-300"
      :class="isCollapsed ? 'w-[80px]' : 'w-[300px]'"
    >
      <MenuPanel :is-collapsed="isCollapsed" @update:is-collapsed="isCollapsed = $event" />
    </div>
    <div class="flex-1 overflow-hidden">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MenuPanel from './workspace/components/MenuPanel.vue'

const isCollapsed = ref(false)
</script>
