<template>
  <div class="h-full flex flex-col">
    <!-- Top Bar -->
    <div class="flex-shrink-0 flex justify-between items-center p-4 border-b">
      <div>
        <h1 class="text-2xl font-bold">Slide 1 Page</h1>
        <p v-if="appType" class="text-sm text-gray-500">
          App Type Received: {{ appType }}
        </p>
      </div>
      <button
        @click="goBack"
        class="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300"
      >
        {{ t('workspace.new.back', '返回') }}
      </button>
    </div>

    <!-- Main Content -->
    <div class="flex" style="height: calc(100vh - 150px)">
      <!-- Left Panel (Chat) -->
      <div class="flex-1 flex flex-col min-w-0">
        <div class="flex-grow p-4 overflow-y-auto">
          <div
            v-for="(message, index) in chatMessages"
            :key="index"
            class="mb-2"
          >
            <div
              :class="[
                'p-2 rounded-lg inline-block whitespace-pre-wrap',
                message.sender === 'user' ? 'bg-blue-200' : 'bg-gray-200',
              ]"
              style="max-width: 80%"
              :style="{
                float: message.sender === 'user' ? 'right' : 'left',
                clear: 'both'
              }"
            >
              <strong>{{ message.sender === 'user' ? 'You' : 'AI' }}:</strong>
              {{ message.text }}
            </div>
          </div>
        </div>
        <div class="flex-shrink-0 p-4 border-t">
          <div class="flex items-center">
            <textarea
              v-model="userChatMessage"
              rows="1"
              class="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :placeholder="
                t('workspace.chat_input_placeholder', '输入您的消息...')
              "
              @keydown.enter.prevent="sendMessage"
              :disabled="isInitializing"
            ></textarea>
            <button
              @click="sendMessage"
              class="ml-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isInitializing || !userChatMessage.trim()"
            >
              {{ t('workspace.send_chat_button', '发送') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Right Panel (Sliding) -->
      <div
        class="transition-all duration-300 ease-in-out bg-gray-50 border-l"
        :class="isPanelOpen ? 'w-96' : 'w-16'"
      >
        <div class="h-full flex flex-col">
          <div class="flex-shrink-0 flex items-center p-4 border-b">
            <button @click="isPanelOpen = !isPanelOpen" class="p-2 -ml-2 mr-2">
              <svg
                v-if="isPanelOpen"
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h2 v-if="isPanelOpen" class="text-xl font-bold">记录信息</h2>
          </div>
          <div v-if="isPanelOpen" class="flex-grow p-4 overflow-y-auto">
            <h3 class="text-lg font-semibold mb-3">消息记录</h3>
            <div v-if="sseMessages.length === 0" class="text-gray-500 text-sm">
              暂无消息
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="(msg, index) in sseMessages"
                :key="index"
                class="bg-white p-3 rounded-lg shadow-sm border border-gray-200"
              >
                <div class="mb-2">
                  <span class="text-xs font-semibold text-blue-600">事件类型:</span>
                  <span class="text-sm ml-2">{{ msg.event }}</span>
                </div>
                <div v-if="msg.type" class="mb-2">
                  <span class="text-xs font-semibold text-green-600">Type:</span>
                  <span class="text-sm ml-2">{{ msg.type }}</span>
                </div>
                <div v-if="msg.data">
                  <span class="text-xs font-semibold text-purple-600">Data:</span>
                  <pre class="text-xs mt-1 p-2 bg-gray-50 rounded overflow-x-auto">{{ formatData(msg.data) }}</pre>
                </div>
                <div class="text-xs text-gray-400 mt-2">{{ msg.timestamp }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ocService from '@/services/oc'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const appType = ref('')
const isPanelOpen = ref(true)
const userChatMessage = ref('')
const sessionId = ref<number | null>(null)
const isInitializing = ref(true)
let abortController: AbortController | null = null

interface ChatMessage {
  sender: 'user' | 'ai'
  text: string
}

interface SSEMessage {
  event: string
  type?: string
  data?: any
  timestamp: string
}

const chatMessages = ref<ChatMessage[]>([])
const sseMessages = ref<SSEMessage[]>([])

onMounted(async () => {
  if (typeof route.query.app_type === 'string') {
    appType.value = route.query.app_type
  }

  try {
    isInitializing.value = true
    // 1. Create Session (type 1 for coding)
    const session = await ocService.createSession({ 
      type: 1,
      title: 'Coding Session'
    })
    sessionId.value = session.session_id

    // 2. Establish SSE Connection using fetch with Authorization header
    const sseUrl = ocService.getSSEUrl({ 
      session_id: session.session_id
    })
    
    abortController = new AbortController()
    
    const response = await fetch(sseUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'text/event-stream'
      },
      signal: abortController.signal
    })

    if (!response.ok) {
      throw new Error(`SSE connection failed: ${response.status}`)
    }

    // Process SSE stream
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (reader) {
      let currentEvent = ''
      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('event: ')) {
                currentEvent = line.slice(7).trim()
              } else if (line.startsWith('data: ')) {
                const data = line.slice(6)
                try {
                  const parsed = JSON.parse(data)
                  console.log('Received SSE message:', parsed)
                  
                  // Add to SSE messages panel
                  sseMessages.value.push({
                    event: currentEvent || 'message',
                    type: parsed.type,
                    data: parsed.data,
                    timestamp: new Date().toLocaleTimeString('zh-CN')
                  })
                  
                  currentEvent = '' // Reset for next message
                } catch (e) {
                  console.warn('Failed to parse SSE data:', e)
                }
              }
            }
          }
        } catch (error: any) {
          if (error.name !== 'AbortError') {
            console.error('SSE stream error:', error)
          }
        }
      }

      processStream()
    }

    // 3. Update Session with app_type (Commented out as requested)
    const appTypeValue = parseInt(appType.value)
    const updateResponse = await ocService.updateSession({
      session_id: session.session_id,
      app_type: isNaN(appTypeValue) ? 0 : (appTypeValue as any)
    })
    
    // Process items from updateSession response
    if (updateResponse.items && updateResponse.items.length > 0) {
      const aiResponseText = updateResponse.items
        .map((item: any) => `${item.type || '<>'}:  ${item.content || '[]'}`)
        .join('\n')
      
      chatMessages.value.push({
        sender: 'ai',
        text: aiResponseText,
      })
    }
    
    console.log('OC Session initialized:', session.session_id)
  } catch (error) {
    console.error('Failed to initialize OC session:', error)
  } finally {
    isInitializing.value = false
  }
})

onUnmounted(() => {
  if (abortController) {
    abortController.abort()
    abortController = null
  }
})

const goBack = () => {
  router.push({ name: 'workspace' })
}

const formatData = (data: any): string => {
  if (typeof data === 'string') {
    return data
  }
  return JSON.stringify(data, null, 2)
}

const sendMessage = async () => {
  if (userChatMessage.value.trim() && sessionId.value !== null && !isInitializing.value) {
    const userMsg = userChatMessage.value
    chatMessages.value.push({ sender: 'user', text: userMsg })
    userChatMessage.value = ''

    try {
      const response = await ocService.sendSessionMessage({
        session_id: sessionId.value,
        type: 'text',
        content: userMsg,
      })

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
</script>

<style scoped>
/* No custom transition styles needed anymore as we use width transition */
</style>
