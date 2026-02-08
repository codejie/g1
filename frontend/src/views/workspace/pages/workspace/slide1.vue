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
                'p-2 rounded-lg inline-block',
                message.sender === 'user' ? 'bg-blue-200' : 'bg-gray-200',
              ]"
              style="max-width: 80%"
              :style="{
                marginLeft: message.sender === 'user' ? 'auto' : '0',
                marginRight: message.sender === 'user' ? '0' : 'auto',
              }"
            >
              <strong>{{ message.sender === 'user' ? 'You' : 'AI' }}:</strong>
              {{ message.text }}
            </div>
          </div>
        </div>
        <div class="flex-shrink-0 p-4 border-t">
          <div class="flex">
            <textarea
              v-model="userChatMessage"
              rows="1"
              class="flex-1 p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :placeholder="
                t('workspace.chat_input_placeholder', '输入您的消息...')
              "
              @keydown.enter.prevent="sendMessage"
            ></textarea>
            <button
              @click="sendMessage"
              class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-r-md hover:bg-blue-700"
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
            <p>这里是一些记录信息...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const appType = ref('')
const isPanelOpen = ref(true)
const userChatMessage = ref('')

interface ChatMessage {
  sender: 'user' | 'ai'
  text: string
}

const chatMessages = ref<ChatMessage[]>([
  { sender: 'ai', text: 'Hello! How can I help you build your app today?' },
  { sender: 'user', text: 'I want to build a social media app.' },
])

onMounted(() => {
  if (typeof route.query.app_type === 'string') {
    appType.value = route.query.app_type
  }
})

const goBack = () => {
  router.push({ name: 'workspace' })
}

const sendMessage = () => {
  if (userChatMessage.value.trim()) {
    chatMessages.value.push({ sender: 'user', text: userChatMessage.value })
    userChatMessage.value = ''
    // Simulate AI response
    setTimeout(() => {
      chatMessages.value.push({
        sender: 'ai',
        text: 'That sounds interesting! Tell me more.',
      })
    }, 1000)
  }
}
</script>

<style scoped>
/* No custom transition styles needed anymore as we use width transition */
</style>
