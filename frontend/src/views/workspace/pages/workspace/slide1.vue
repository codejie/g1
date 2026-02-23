<template>
  <div class="h-full flex flex-col">
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

    <div class="flex" style="height: calc(100vh - 150px)">
      <!-- Left Panel (Chat) -->
      <div class="flex-1 flex flex-col min-w-0">
        <ChatPanel
          ref="chatPanelRef"
          :disabled="isInitializing"
          @send="handleChatSend"
        />
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
            <button
              v-if="isPanelOpen"
              @click="clearSseMessages"
              class="ml-auto text-sm text-red-500 hover:text-red-700 font-medium"
            >
              清空列表
            </button>
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
                <div v-if="msg.data">
                  <span class="text-xs font-semibold text-purple-600">Data:</span>
                  <pre class="text-xs mt-1 p-2 bg-gray-50 rounded overflow-x-auto">{{ formatData(msg.data) }}</pre>
                </div>
                <ResultWithFile
                  v-if="msg.event === 'result_with_file'"
                  :name="msg.data?.data.name || 'Unknown'"
                  :path="msg.data?.data.path || ''"
                />
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
import ResultWithFile from '@/views/workspace/components/ResultWithFile.vue'
import ChatPanel from '@/views/workspace/components/ChatPanel.vue'
import { formatData, formatTime } from '@/views/workspace/utils'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const appType = ref('')
const isPanelOpen = ref(true)
const sessionId = ref<number | null>(null)
const isInitializing = ref(true)
let abortController: AbortController | null = null

const chatPanelRef = ref<InstanceType<typeof ChatPanel> | null>(null)

interface SSEMessage {
  event: string
  data?: any
  timestamp: string
}

const sseMessages = ref<SSEMessage[]>([])

const clearSseMessages = () => {
  sseMessages.value = []
}

onMounted(async () => {
  if (typeof route.query.app_type === 'string') {
    appType.value = route.query.app_type
  }

  try {
    isInitializing.value = true
    const session = await ocService.createSession({ 
      type: 1,
      title: 'Coding Session'
    })
    sessionId.value = session.session_id

    await initSSE(session.session_id)

    const appTypeValue = parseInt(appType.value)
    const updateResponse = await ocService.updateSession({
      session_id: session.session_id,
      app_type: isNaN(appTypeValue) ? 0 : (appTypeValue as any)
    })
    
    if (updateResponse.items && updateResponse.items.length > 0) {
      const aiResponseText = updateResponse.items
        .map((item: any) => `${item.type || '<>'}: ${item.content || '[]'}`)
        .join('\n')
      
      chatPanelRef.value?.addMessage('ai', aiResponseText)
    }
  } catch (error) {
    console.error('Failed to initialize OC session:', error)
  } finally {
    isInitializing.value = false
  }
})

const initSSE = async (id: number) => {
  const sseUrl = ocService.getSSEUrl({ session_id: id })
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

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  if (reader) {
    let lineBuffer = ''

    const processStream = async () => {
      try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          lineBuffer += decoder.decode(value, { stream: true })
          const lines = lineBuffer.split('\n\n')
          lineBuffer = lines.pop() || ''

          for (const line of lines) {
            try {
              const trimmedLine = line.trim()
              if (!trimmedLine) continue
              const parsed = JSON.parse(trimmedLine)
              console.log('SSE event:', parsed)
              // Pass event and data to ChatPanel component
              if (parsed.event === 'oc_session_message') {
                chatPanelRef.value?.handleSSEEvent(parsed.event, parsed.data)
                // if (parsed.data.type === 'message.part.updated' &&  parsed.data.properties.part.type === 'tool') {
                //   sseMessages.value.push({
                //     event: parsed.event || 'unknown',
                //     data: parsed.data || {},
                //     timestamp: formatTime()
                //   })                  
                // }
              } else {
                sseMessages.value.push({
                  event: parsed.event || 'unknown',
                  data: parsed.data || {},
                  timestamp: formatTime()
                })
              }
            } catch (e) {
              console.warn('Failed to parse SSE data JSON:', e, line)
            }
          }
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('SSE stream processing error:', error)
        }
      } finally {
        if (reader) reader.releaseLock()
      }
    }

    processStream()
  }
}

onUnmounted(() => {
  if (abortController) {
    abortController.abort()
    abortController = null
  }
})

const goBack = () => {
  router.push({ name: 'workspace' })
}

/**
 * Handles message sending from ChatPanel
 */
const handleChatSend = async (message: string) => {
  if (sessionId.value !== null) {
    try {
      const response = await ocService.sendSessionMessage({
        session_id: sessionId.value,
        type: 'text',
        content: message,
      })

      if (response.items && response.items.length > 0) {
        const aiResponseText = response.items
          .map((item: any) => `${item.type || '<>'}: ${item.content || '[]'}`)
          .join('\n')

        chatPanelRef.value?.addMessage('ai', aiResponseText)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      chatPanelRef.value?.addMessage('ai', 'Error: Failed to get response from AI.')
    }
  }
}
</script>

<style scoped>
</style>