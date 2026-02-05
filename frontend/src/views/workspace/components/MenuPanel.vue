<template>
  <div class="h-full flex flex-col">
    <div class="p-6 border-b border-gray-200">
      <h1 class="text-xl font-bold text-gray-900">{{ t('menu.title') }}</h1>
    </div>
    <nav class="flex-1 p-4">
      <ul class="space-y-1">
        <li v-for="item in menuItems" :key="item.path">
          <router-link
            :to="item.path"
            class="flex items-center px-4 py-3 rounded-lg transition-colors"
            :class="
              isActive(item.path)
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            "
          >
            <span>{{ t(item.key) }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

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
