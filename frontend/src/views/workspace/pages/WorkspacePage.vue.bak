<template>
  <div class="h-full flex flex-col p-6 bg-gray-50">
    <!-- Top Section - Input and Create App (or Chat) -->
    <div
      :class="[
        'flex-shrink-0 transition-all duration-300 ease-in-out',
        showChat
          ? 'order-last p-4 border-t border-gray-200'
          : 'order-first p-6 mb-6',
      ]"
    >
      <template v-if="!showChat">
        <h2 class="text-xl font-bold text-gray-900 mb-4">
          {{ t('workspace.create_app_title') }}
        </h2>
        <textarea
          v-model="appDescription"
          rows="5"
          class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          :placeholder="t('workspace.app_description_placeholder')"
        ></textarea>
        <div class="flex justify-end">
          <button
            @click="handleCreateApp"
            class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {{ t('workspace.create_app_button') }}
          </button>
        </div>
      </template>
      <template v-else>
        <!-- Chat Interaction Area -->
        <div class="flex flex-col flex-1">
          <div class="flex-1 overflow-y-auto mb-4">
            <div
              v-for="(message, index) in chatMessages"
              :key="index"
              class="mb-2"
            >
              <div
                :class="[
                  'p-2 rounded-lg',
                  message.sender === 'user'
                    ? 'bg-blue-200 text-right ml-auto'
                    : 'bg-gray-200 text-left mr-auto',
                ]"
                style="max-width: 80%"
              >
                <strong>{{ message.sender === 'user' ? 'You' : 'AI' }}:</strong>
                {{ message.text }}
              </div>
            </div>
          </div>
          <div class="flex">
            <textarea
              v-model="userChatMessage"
              rows="1"
              class="flex-1 p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :placeholder="t('workspace.chat_input_placeholder')"
            ></textarea>
            <button
              @click="sendChatMessage"
              class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {{ t('workspace.send_chat_button') }}
            </button>
          </div>
          <div class="flex justify-end space-x-2 mt-4">
            <button
              @click="cancelChat"
              class="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-400"
            >
              {{ t('workspace.cancel_chat_button') }}
            </button>
            <button
              @click="finishChat"
              class="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700"
            >
              {{ t('workspace.finish_chat_button') }}
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Main Content Area - App List -->
    <div :class="['flex-1 flex flex-col p-6', { hidden: showChat }]">
      <h2 class="text-xl font-bold text-gray-900 mb-4">
        {{ t('workspace.app_list_title') }}
      </h2>

      <!-- View Toggle -->
      <div class="flex justify-end mb-4">
        <button
          @click="viewMode = 'list'"
          :class="[
            'px-4 py-2 rounded-l-md border border-gray-300',
            viewMode === 'list'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
        >
          {{ t('workspace.list_view') }}
        </button>
        <button
          @click="viewMode = 'card'"
          :class="[
            'px-4 py-2 rounded-r-md border border-gray-300',
            viewMode === 'card'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
        >
          {{ t('workspace.card_view') }}
        </button>
      </div>

      <!-- Application List / Card View -->
      <div v-if="viewMode === 'list'" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {{ t('workspace.app_name') }}
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {{ t('workspace.created_time') }}
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {{ t('workspace.description') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="app in paginatedApps" :key="app.id">
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
              >
                {{ app.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ new Date(app.created_at).toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ app.description }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="app in paginatedApps"
          :key="app.id"
          class="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center"
        >
          <div
            class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3"
          >
            <svg
              class="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-1">
            {{ app.name }}
          </h3>
          <p class="text-sm text-gray-600 mb-2">{{ app.description }}</p>
          <p class="text-xs text-gray-500">
            {{ t('workspace.created_on') }}:
            {{ new Date(app.created_at).toLocaleDateString() }}
          </p>
        </div>
      </div>

      <!-- Pagination -->
      <div
        class="flex justify-center items-center mt-6 space-x-2"
        v-if="totalPages > 1"
      >
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          {{ t('workspace.previous') }}
        </button>
        <span class="text-gray-700"
          >{{ t('workspace.page') }} {{ currentPage }} / {{ totalPages }}</span
        >
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          {{ t('workspace.next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ocService from '../../../services/oc'

const { t } = useI18n()

interface App {
  id: number
  name: string
  description: string
  created_at: string
}

interface ChatMessage {
  sender: 'user' | 'ai'
  text: string
}

const appDescription = ref('')
const showChat = ref(false)
const sessionId = ref<number | null>(null)
const chatMessages = ref<ChatMessage[]>([])
const userChatMessage = ref('')
const viewMode = ref<'list' | 'card'>('list') // 'list' or 'card'
const currentPage = ref(1)
const itemsPerPage = 6

const mockApps = ref<App[]>([
  {
    id: 1,
    name: 'E-commerce Store',
    description: 'An online store for selling products.',
    created_at: '2023-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Task Management App',
    description: 'A tool to manage tasks and projects.',
    created_at: '2023-02-20T11:30:00Z',
  },
  {
    id: 3,
    name: 'Blog Platform',
    description: 'A platform for publishing articles and blogs.',
    created_at: '2023-03-01T14:45:00Z',
  },
  {
    id: 4,
    name: 'Social Media Feed',
    description: 'Displays updates from various social media.',
    created_at: '2023-04-10T09:15:00Z',
  },
  {
    id: 5,
    name: 'Weather Forecast App',
    description: 'Provides real-time weather information.',
    created_at: '2023-05-05T16:00:00Z',
  },
  {
    id: 6,
    name: 'Recipe Finder',
    description: 'Helps users find recipes based on ingredients.',
    created_at: '2023-06-22T13:00:00Z',
  },
  {
    id: 7,
    name: 'Fitness Tracker',
    description: 'Monitors workouts and health metrics.',
    created_at: '2023-07-18T08:00:00Z',
  },
  {
    id: 8,
    name: 'Language Learning App',
    description: 'Assists in learning new languages.',
    created_at: '2023-08-25T17:00:00Z',
  },
])

const totalPages = computed(() =>
  Math.ceil(mockApps.value.length / itemsPerPage),
)

const paginatedApps = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return mockApps.value.slice(start, end)
})

const handleCreateApp = async () => {
  if (appDescription.value.trim()) {
    try {
      const response = await ocService.createSession({
        title: 'app_web',
        extra: { description: appDescription.value },
      })
      sessionId.value = response.session_id
      showChat.value = true
      chatMessages.value.push({ sender: 'user', text: appDescription.value })
      // Simulate AI response
      setTimeout(() => {
        chatMessages.value.push({
          sender: 'ai',
          text: t('workspace.ai_initial_response'),
        })
      }, 1000)
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }
}

const sendChatMessage = async () => {
  if (userChatMessage.value.trim() && sessionId.value !== null) {
    const userMsg = userChatMessage.value
    chatMessages.value.push({ sender: 'user', text: userMsg })
    userChatMessage.value = ''

    try {
      const response = await ocService.sendSessionMessage({
        session_id: sessionId.value,
        type: 'text',
        content: userMsg,
      })

      // Convert response data to string as requested
      const aiResponseText = response.items
        .map((item: any) => `${item.type || '<>'}: ${item.content || '[]'}`)
        .join('\n')

      chatMessages.value.push({
        sender: 'ai',
        text: aiResponseText,
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      chatMessages.value.push({
        sender: 'ai',
        text: 'Error: Failed to get response from AI.',
      })
    }
  }
}

const cancelChat = () => {
  showChat.value = false
  appDescription.value = '' // Clear description
  chatMessages.value = [] // Clear chat
  userChatMessage.value = '' // Clear current chat message
}

const finishChat = () => {
  showChat.value = false
  appDescription.value = '' // Clear description
  chatMessages.value = [] // Clear chat
  userChatMessage.value = '' // Clear current chat message

  // Simulate adding a new app
  const newApp: App = {
    id: mockApps.value.length + 1,
    name: `New App ${mockApps.value.length + 1}`,
    description: t('workspace.new_app_description'),
    created_at: new Date().toISOString(),
  }
  mockApps.value.unshift(newApp) // Add to the beginning
  currentPage.value = 1 // Go to first page to see new app
}
</script>

<style scoped>
/* Add any specific styles for this page here if needed */
</style>
