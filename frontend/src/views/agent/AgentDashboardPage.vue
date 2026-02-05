<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">{{ $t('agent_dashboard_title') }}</h1>

    <!-- Filter and Sort Controls -->
    <div class="bg-white p-4 rounded-lg shadow-md mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label
            for="filterTitle"
            class="block text-gray-700 text-sm font-bold mb-2"
            >{{ $t('filter_by_title') }}:</label
          >
          <input
            type="text"
            id="filterTitle"
            v-model="filterTitle"
            @input="applyFilters"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            :placeholder="$t('search_by_title')"
          />
        </div>
        <div>
          <label for="sortBy" class="block text-gray-700 text-sm font-bold mb-2"
            >{{ $t('sort_by') }}:</label
          >
          <select
            id="sortBy"
            v-model="sortBy"
            @change="applyFilters"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="created">{{ $t('created_date') }}</option>
            <option value="title">{{ $t('title') }}</option>
            <option value="updated">{{ $t('updated_date') }}</option>
          </select>
        </div>
        <div>
          <label
            for="sortOrder"
            class="block text-gray-700 text-sm font-bold mb-2"
            >{{ $t('order') }}:</label
          >
          <select
            id="sortOrder"
            v-model="sortOrder"
            @change="applyFilters"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="DESC">{{ $t('descending') }}</option>
            <option value="ASC">{{ $t('ascending') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Session List -->
    <div v-if="loading" class="text-center text-gray-600">
      {{ $t('loading_sessions') }}
    </div>
    <div v-else-if="authStore.error" class="text-red-500 text-center">
      {{ authStore.error }}
    </div>
    <div v-else-if="sessions.length === 0" class="text-center text-gray-600">
      {{ $t('no_sessions_found') }}
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="bg-white p-4 rounded-lg shadow-md"
      >
        <h3 class="text-xl font-semibold mb-2">
          {{ session.title || $t('untitled_session') }}
        </h3>
        <p class="text-gray-600 text-sm">ID: {{ session.id }}</p>
        <p class="text-gray-600 text-sm">
          {{ $t('directory') }}: {{ session.directory }}
        </p>
        <p class="text-gray-600 text-sm">
          {{ $t('created') }}: {{ new Date(session.created).toLocaleString() }}
        </p>
        <p class="text-gray-600 text-sm">
          {{ $t('updated') }}: {{ new Date(session.updated).toLocaleString() }}
        </p>
        <router-link
          :to="`/agents/${session.id}`"
          class="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {{ $t('view_details') }}
        </router-link>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div
      class="flex justify-center items-center mt-6 space-x-2"
      v-if="pageInfo.total > 0"
    >
      <button
        @click="goToPage(pageInfo.page - 1)"
        :disabled="pageInfo.page === 1"
        class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {{ $t('previous') }}
      </button>
      <span class="text-gray-700">{{
        $t('page_of', {
          page: pageInfo.page,
          totalPages: Math.ceil(pageInfo.total / pageInfo.size),
        })
      }}</span>
      <button
        @click="goToPage(pageInfo.page + 1)"
        :disabled="pageInfo.page * pageInfo.size >= pageInfo.total"
        class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {{ $t('next') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'
import {
  type GetSessionsRequest,
  type GetSessionsResponse,
  type Session,
} from '../../types/agent'
import { type PageInfo, type Sort } from '../../types/common'
import { useI18n } from 'vue-i18n' // Import useI18n

const authStore = useAuthStore()
const { t } = useI18n() // Access translation function

const sessions = ref<Session[]>([])
const loading = ref(false)
const page = ref(1)
const size = ref(10)
const pageInfo = ref<PageInfo>({ page: 1, size: 10, total: 0 })

const filterTitle = ref('')
const sortBy = ref('created')
const sortOrder = ref('DESC')

const fetchSessions = async () => {
  loading.value = true
  authStore.error = null

  const payload: GetSessionsRequest = {
    page_info: {
      page: page.value,
      size: size.value,
      sort: [{ field: sortBy.value, order: sortOrder.value as Sort['order'] }],
      filter: filterTitle.value ? { title: filterTitle.value } : undefined,
    },
  }

  try {
    const response = await api.post<GetSessionsResponse>(
      '/agent/session/list',
      payload,
    )
    if (response.data.data) {
      sessions.value = response.data.data.items
      pageInfo.value = response.data.data.page_info
    }
  } catch (err: any) {
    authStore.error =
      err.response?.data?.error?.message || t('failed_to_fetch_sessions_error')
    sessions.value = []
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  page.value = 1
  fetchSessions()
}

const goToPage = (newPage: number) => {
  if (
    newPage >= 1 &&
    newPage <= Math.ceil(pageInfo.value.total / pageInfo.value.size)
  ) {
    page.value = newPage
    fetchSessions()
  }
}

onMounted(() => {
  fetchSessions()
})
</script>

<style scoped>
/* Scoped styles for AgentDashboardPage */
</style>
