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
        <div v-if="isLoadingApps" class="text-center py-8">
          <p class="text-gray-500">Loading applications...</p>
        </div>
        <div v-else>
          <div v-if="activeTab === 'completed'">
            <div v-if="filteredApps.length === 0" class="text-center py-8">
              <p class="text-gray-500">{{ t('workspace.new.completedListPlaceholder') }}</p>
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AppCard
                v-for="app in filteredApps"
                :key="app.id"
                :app="app"
              />
            </div>
          </div>
          <div v-if="activeTab === 'in-progress'">
            <div v-if="filteredApps.length === 0" class="text-center py-8">
              <p class="text-gray-500">{{ t('workspace.new.inProgressListPlaceholder') }}</p>
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AppCard
                v-for="app in filteredApps"
                :key="app.id"
                :app="app"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create App Dialog -->
    <div v-if="showCreateDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showCreateDialog = false">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full" @click.stop>
        <div class="flex justify-between items-center p-4 border-b">
          <h3 class="text-lg font-bold text-gray-800">Create App</h3>
          <button @click="showCreateDialog = false" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">App Name</label>
              <input
                v-model="createForm.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter app name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Version</label>
              <input
                v-model="createForm.version"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter version (optional)"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="createForm.description"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Enter description (optional)"
              ></textarea>
            </div>
          </div>
        </div>
        <div class="flex justify-end space-x-2 p-4 border-t">
          <button
            @click="showCreateDialog = false"
            class="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            @click="handleCreateApp"
            :disabled="!createForm.name || isCreating"
            class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {{ isCreating ? 'Creating...' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import appsService from '@/services/apps'
import type { AppsModelType } from '@/types/apps'
import AppCard from '@/views/workspace/components/AppCard.vue'

const { t } = useI18n()
const router = useRouter()

const activeTab = ref<'completed' | 'in-progress'>('completed')
const viewMode = ref<'list' | 'card'>('list')

const showCreateDialog = ref(false)
const isCreating = ref(false)
const currentAppType = ref('')
const createForm = ref({
  name: '',
  version: '',
  description: ''
})

const apps = ref<AppsModelType[]>([])
const isLoadingApps = ref(false)

const filteredApps = computed(() => {
  if (activeTab.value === 'completed') {
    return apps.value.filter(app => app.status === 1)
  } else {
    return apps.value.filter(app => app.status === 0)
  }
})

const loadApps = async () => {
  try {
    isLoadingApps.value = true
    apps.value = await appsService.getList()
  } catch (error) {
    console.error('Failed to load apps:', error)
  } finally {
    isLoadingApps.value = false
  }
}

onMounted(() => {
  loadApps()
})

const appTypeMap: Record<string, number> = {
  'web': 1,
  'ios': 2,
  'android': 3,
  'mini-program': 4
}

const goToSlide1 = (appType: string) => {
  currentAppType.value = appType
  createForm.value = {
    name: '',
    version: '',
    description: ''
  }
  showCreateDialog.value = true
}

const handleCreateApp = async () => {
  if (!createForm.value.name) return

  try {
    isCreating.value = true
    const appTypeNum = appTypeMap[currentAppType.value] || 1
    const app = await appsService.create({
      app_type: appTypeNum,
      name: createForm.value.name,
      version: createForm.value.version || undefined,
      description: createForm.value.description || undefined
    })

    showCreateDialog.value = false
    await loadApps()
    router.push({
      name: 'workspace-slide1',
      query: {
        app_type: appTypeNum,
        app_id: app.id
      }
    })
  } catch (error) {
    console.error('Failed to create app:', error)
    alert('Failed to create app')
  } finally {
    isCreating.value = false
  }
}
</script>

<style scoped>
/* Add any specific styles for this page here if needed */
</style>
