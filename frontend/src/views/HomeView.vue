<template>
  <div class="h-screen flex overflow-hidden bg-gray-50">
    <div class="w-[300px] flex-shrink-0 border-r border-gray-200 bg-white">
      <MenuPanel />
    </div>
    <div class="flex-1 overflow-hidden">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import MenuPanel from './workspace/components/MenuPanel.vue'
</script>
