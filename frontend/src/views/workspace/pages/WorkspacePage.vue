<template>
  <div class="p-6">
    <!-- Upper Section -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4">
        {{ t('workspace.new.title') }}
      </h2>
      <div class="flex space-x-2">
        <button
          @click="goToSlide1('web')"
          class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {{ t('workspace.new.webApp') }}
        </button>
        <button
          @click="goToSlide1('ios')"
          class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {{ t('workspace.new.iosApp') }}
        </button>
        <button
          @click="goToSlide1('android')"
          class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {{ t('workspace.new.androidApp') }}
        </button>
        <button
          @click="goToSlide1('mini-program')"
          class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {{ t('workspace.new.miniProgramApp') }}
        </button>
      </div>
    </div>

    <!-- Divider -->
    <div class="border-t border-gray-200 my-6"></div>

    <!-- Lower Section -->
    <div>
      <div class="flex justify-between items-center border-b border-gray-200">
        <div class="flex">
          <button
            @click="activeTab = 'completed'"
            :class="[
              'py-2 px-4 text-sm font-medium',
              activeTab === 'completed'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700',
            ]"
          >
            {{ t('workspace.new.completed') }}
          </button>
          <button
            @click="activeTab = 'in-progress'"
            :class="[
              'py-2 px-4 text-sm font-medium',
              activeTab === 'in-progress'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700',
            ]"
          >
            {{ t('workspace.new.inProgress') }}
          </button>
        </div>
        <div class="flex space-x-2">
          <button
            @click="viewMode = 'list'"
            :class="[
              'px-3 py-1 text-sm rounded-md border',
              viewMode === 'list'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
            ]"
          >
            {{ t('workspace.new.listView') }}
          </button>
          <button
            @click="viewMode = 'card'"
            :class="[
              'px-3 py-1 text-sm rounded-md border',
              viewMode === 'card'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
            ]"
          >
            {{ t('workspace.new.cardView') }}
          </button>
        </div>
      </div>
      <div class="mt-4">
        <div v-if="activeTab === 'completed'">
          <!-- Content for "已完成" tab -->
          <p>{{ t('workspace.new.completedListPlaceholder') }}</p>
        </div>
        <div v-if="activeTab === 'in-progress'">
          <!-- Content for "建造中" tab -->
          <p>{{ t('workspace.new.inProgressListPlaceholder') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

const activeTab = ref<'completed' | 'in-progress'>('completed')
const viewMode = ref<'list' | 'card'>('list')

const goToSlide1 = (appType: string) => {
  router.push({ name: 'workspace-slide1', query: { app_type: appType } })
}
</script>

<style scoped>
/* Add any specific styles for this page here if needed */
</style>
