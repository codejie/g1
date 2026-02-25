<template>
  <div class="flex flex-col h-full min-w-0 bg-white relative">
    <!-- 消息展示区域 -->
    <div class="flex-grow p-4 overflow-y-auto" ref="messagesContainer">
      <div
        v-for="(message, index) in chatMessages"
        :key="index"
        class="mb-4"
      >
        <div
          :class="[
            'p-3 rounded-lg inline-block whitespace-pre-wrap shadow-sm border',
            message.sender === 'user' 
              ? 'bg-blue-50 border-blue-100 float-right clear-both' 
              : 'bg-gray-50 border-gray-100 float-left clear-both',
          ]"
          style="max-width: 85%"
        >
          <div class="flex items-center mb-1">
            <span class="text-xs font-bold mr-2 uppercase tracking-wider" :class="message.sender === 'user' ? 'text-blue-600' : 'text-gray-600'">
              {{ message.sender === 'user' ? t('workspace.chat_sender_user', 'You') : t('workspace.chat_sender_ai', 'AI') }}
            </span>
            <span v-if="message.type && message.type !== 'assistant' && message.type !== 'text'" 
                  class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                  :class="getTypeStyle(message.type)">
              {{ message.type }}
            </span>
          </div>
          <div class="text-sm leading-relaxed text-gray-800">
            {{ message.text }}
          </div>
        </div>
      </div>
      <div v-if="chatMessages.length === 0" class="h-full flex items-center justify-center text-gray-400 text-sm">
        {{ t('workspace.no_messages', '暂无消息') }}
      </div>
    </div>

    <!-- 浮动的 tool 消息 -->
    <div v-if="activeToolPart" class="absolute bottom-[84px] left-0 w-full z-10 transition-all duration-300">
      <ToolMessage :part="activeToolPart" @update-disabled="(val: boolean) => disabled = val" @close="activeToolPart = null" />
    </div>

    <!-- 消息发送区域 -->
    <div class="flex-shrink-0 p-4 border-t bg-gray-50">
      <div class="flex items-center bg-white rounded-lg border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
        <textarea
          v-model="userInput"
          rows="1"
          class="flex-1 p-3 bg-transparent border-none focus:outline-none resize-none"
          :placeholder="placeholder || t('workspace.chat_input_placeholder', '输入您的消息...')"
          @keydown.enter.prevent="handleSend"
          :disabled="disabled"
        ></textarea>
        <button
          @click="handleSend"
          class="m-1 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :disabled="disabled || !userInput.trim()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ToolMessage from './ToolMessage.vue'

const { t } = useI18n()

type MessageType = 'text' | 'assistant' | 'reasoning' | 'tool' | 'stream'

interface ChatMessage {
  sender: 'user' | 'ai'
  text: string
  type?: MessageType
  id?: string
}

const props = defineProps<{
  // disabled?: boolean
  placeholder?: string
  initialMessages?: ChatMessage[]
}>()

const emit = defineEmits<{
  (e: 'send', message: string): void
  (e: 'reply', message: string, data: any): void
}>()

const chatMessages = ref<ChatMessage[]>(props.initialMessages || [])
const userInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const disabled = ref(false)
const activeToolPart = ref<any>(null)
const pendingToolQuestionData = ref<any>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(() => chatMessages.value.length, scrollToBottom, { deep: true })

const handleSend = () => {
  if (userInput.value.trim() && !disabled.value) {
    const msg = userInput.value.trim()
    chatMessages.value.push({ sender: 'user', text: msg, type: 'text' })
    userInput.value = ''
    activeToolPart.value = null
    
    if (pendingToolQuestionData.value) {
      emit('reply', msg, pendingToolQuestionData.value)
      pendingToolQuestionData.value = null
    } else {
      emit('send', msg)
    }
    
    scrollToBottom()
  }
}

const getTypeStyle = (type: MessageType) => {
  switch (type) {
    case 'reasoning': return 'bg-purple-100 text-purple-700 border border-purple-200'
    case 'tool': return 'bg-amber-100 text-amber-700 border border-amber-200'
    case 'stream': return 'bg-green-100 text-green-700 border border-green-200'
    default: return 'bg-gray-100 text-gray-700 border border-gray-200'
  }
}

const handleSSEEvent = (event: string, data: any) => {
  // console.log('ChatPanel [SSE] Event:', event, data)
  
  if (event === 'oc_session_message') {
    const type = data.type
    const properties = data.properties || {}
    
    if (type === 'message.part.updated') {
      const part = properties.part || {}
      const partType = part.type
      if (partType === 'text' || partType === 'assistant' || partType === 'reasoning') {
        // activeToolPart.value = null
        disabled.value = false
        // 寻找最近的一个 stream
        let lastStreamMsgIndex = -1;
        let lastStreamMsg: ChatMessage | null = null;
        for (let i = chatMessages.value.length - 1; i >= 0; i--) {
          if (chatMessages.value[i].type === 'stream') {
            lastStreamMsg = chatMessages.value[i];
            lastStreamMsgIndex = i;
            break;
          }
        }

        if (lastStreamMsg && lastStreamMsg.text === part.text) {
          lastStreamMsg.type = partType;
        } else {
          if (lastStreamMsgIndex !== -1) {
            chatMessages.value.splice(lastStreamMsgIndex, 1);
          }
          if (part.text && part.text.length > 0) {
            chatMessages.value.push({ sender: 'ai', text: part.text, type: partType });
          }        
        }


      } else if (partType === 'tool') {
        activeToolPart.value = part;
      } else if (partType === 'step-start') {
        // 消息开始
      } else if (partType === 'step-finish') {
        // 消息结束
        activeToolPart.value = null;
      }
    } else if (type === 'message.part.delta') {
      // activeToolPart.value = null;
      disabled.value = false;
      const delta = properties.delta || ''
      // For stream, append to the last message if it's an AI message or create a new one
      const lastMsg = chatMessages.value[chatMessages.value.length - 1]
      if (lastMsg && lastMsg.type === 'stream') {
        lastMsg.text += delta
      } else {
        chatMessages.value.push({ sender: 'ai', text: delta, type: 'stream' })
      }
    } else if (type === 'session.status') {
      console.log('Session status updated:', properties.status)
      if (properties.status.type === 'busy') {
        disabled.value = true
      } else if (properties.status.type === 'idle') {
        disabled.value = false
      }
    } else if (type === 'session.idle') {
      disabled.value = false
    }
  } else if (event === 'oc_session_message_question') {
    console.log('ChatPanel [SSE] Question Event:', event, data)
    if (data && data.type === 'question.asked') {
      pendingToolQuestionData.value = data
    }
  }
  
  scrollToBottom()
}

const addMessage = (sender: 'user' | 'ai', text: string, type: MessageType = 'assistant') => {
  chatMessages.value.push({ sender, text, type })
  scrollToBottom()
}

const clearMessages = () => {
  chatMessages.value = []
}

defineExpose({
  handleSSEEvent,
  addMessage,
  clearMessages,
  chatMessages
})
</script>

<style scoped>
/* Ensure float clearance for message bubbles */
.clear-both {
  clear: both;
}
</style>