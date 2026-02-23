<template>
  <div class="h-full flex flex-col overflow-hidden transition-all duration-300">
    <!-- Header Area -->
    <div 
      class="border-b border-gray-200 flex items-center h-[73px]"
      :class="isCollapsed ? 'justify-center p-0' : 'justify-between px-6 py-4'"
    >
      <h1 v-if="!isCollapsed" class="text-xl font-bold text-gray-900 truncate">{{ t('menu.title') }}</h1>
      <button 
        @click="$emit('update:isCollapsed', !isCollapsed)" 
        class="p-2 rounded-md hover:bg-gray-100 text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="isCollapsed ? '' : '-mr-2'"
        :title="isCollapsed ? t('menu.expand') || 'Expand' : t('menu.collapse') || 'Collapse'"
      >
        <svg v-if="!isCollapsed" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Menu Items -->
    <nav class="flex-1 px-3 py-4 overflow-y-auto">
      <ul class="space-y-2">
        <li v-for="item in menuItems" :key="item.path">
          <router-link
            :to="item.path"
            class="flex items-center rounded-lg transition-colors group relative h-12"
            :class="[
              isActive(item.path)
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100',
              isCollapsed ? 'justify-center w-full' : 'px-4'
            ]"
            :title="isCollapsed ? t(item.key) : ''"
          >
            <span v-if="isCollapsed" class="font-bold text-lg leading-none">
              {{ t(item.key).charAt(0).toUpperCase() }}
            </span>
            <span v-else class="truncate font-medium">{{ t(item.key) }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  isCollapsed: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isCollapsed', value: boolean): void
}>()

const route = useRoute()
const { t } = useI18n()

interface MenuItem {
  path: string
  key: string // i18n key
}

const menuItems: MenuItem[] = [
  { path: '/workspace', key: 'menu.workspace' },
  { path: '/deployments', key: 'menu.deployments' },
  { path: '/monetization', key: 'menu.monetization' },
]

const isActive = (path: string) => {
  return route.path === path
}
</script>
