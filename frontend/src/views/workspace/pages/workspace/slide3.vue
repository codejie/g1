<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="flex-shrink-0 flex justify-between items-center p-4 border-b">
      <div>
        <h1 class="text-2xl font-bold">Slide 3 Page</h1>
      </div>
      <button
        @click="goBack"
        class="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300"
      >
        {{ t('workspace.new.back', '返回') }}
      </button>
    </div>

    <div class="flex-1 flex min-h-0">
      <!-- Left Panel (Chat) -->
      <div class="flex-1 flex flex-col min-w-0">
        <ChatPanel
          ref="chatPanelRef"
          :disabled="isInitializing"
          @send="handleChatSend"
          @reply="handleQuestionReply"
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
          <div v-if="isPanelOpen" class="flex-grow p-4 overflow-y-auto" ref="sseMessagesContainerRef">
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
                <AppGenReport
                  v-if="msg.event === 'app_gen_report'"
                  :result="msg.data?.data?.result ?? 0"
                  :message="msg.data?.data?.message"
                  :name="msg.data?.data?.name"
                  :app_id="msg.data?.data?.app_id"
                  :file_id="msg.data?.data?.file_id"
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
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ocService from '@/services/oc'
import { useAuthStore } from '@/stores/auth'
import ResultWithFile from '@/views/workspace/components/ResultWithFile.vue'
import AppPrdReport from '@/views/workspace/components/AppPrdReport.vue'
import AppGenReport from '@/views/workspace/components/AppGenReport.vue'
import ChatPanel from '@/views/workspace/components/ChatPanel.vue'
import { formatData, formatTime } from '@/views/workspace/utils'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const isPanelOpen = ref(true)
const appId = ref<number | null>(null)
const sessionId = ref<number | null>(null)
const isInitializing = ref(true)
let abortController: AbortController | null = null

const chatPanelRef = ref<InstanceType<typeof ChatPanel> | null>(null)

interface SSEMessage {
  event: string
  data?: any
  timestamp: string
}

const sseMessagesContainerRef = ref<HTMLElement | null>(null)

const sseMessages = ref<SSEMessage[]>([])

const scrollToBottomSSE = async () => {
  await nextTick()
  if (sseMessagesContainerRef.value) {
    sseMessagesContainerRef.value.scrollTop = sseMessagesContainerRef.value.scrollHeight
  }
}

watch(() => sseMessages.value.length, scrollToBottomSSE, { deep: true })

const clearSseMessages = () => {
  sseMessages.value = []
}

onMounted(async () => {
  if (typeof route.query.app_id === 'string') {
    appId.value = parseInt(route.query.app_id) || null
  }

  try {
    isInitializing.value = true
    const session = await ocService.createSession({
      type: 1,
      title: 'Coding Session'
    })
    sessionId.value = session?.id

    await initSSE(session?.id)

    const updateResponse = await ocService.skillActive({
      session_id: session?.id,
      skill_type: 3,
      extra: {
        app_id: appId.value || 1
      }
    })
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
              if (parsed.event === 'oc_session_message' || parsed.event === 'oc_session_message_question') {
                chatPanelRef.value?.handleSSEEvent(parsed.event, parsed.data)
              } else {
                if (parsed.event.startsWith('server.')) {
                  continue
                }
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
  router.back()
}

const handleChatSend = async (message: string) => {
  if (sessionId.value !== null) {
    try {
      const response = await ocService.sendSessionMessage({
        session_id: sessionId.value,
        message_type: 'text',
        message_content: message
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      chatPanelRef.value?.addMessage('ai', 'Error: Failed to get response from AI.')
    }
  }
}

const handleQuestionReply = async (message: string, data: any) => {
  console.log('handleQuestionReply', message, data)
  if (sessionId.value !== null) {
    try {
      console.log('handleQuestionReply', message, data)
      const response = await ocService.questionReply({
        session_id: sessionId.value,
        question_id: data?.properties?.id || '',
        message_id: data?.properties?.message_id,
        call_id: data?.properties?.call_id,
        result: 'reply',
        message_type: 'text',
        message_content: message
      })
      console.log('handleQuestionReply response:', response)
    } catch (error) {
      console.error('Failed to reply question:', error)
      chatPanelRef.value?.addMessage('ai', 'Error: Failed to send question reply.')
    }
  } else {
    console.error('Session not found')
  }
}
</script>

<style scoped>
</style>