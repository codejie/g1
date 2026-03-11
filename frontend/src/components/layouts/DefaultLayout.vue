<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <header class="bg-blue-600 text-white p-4 shadow-md">
      <nav class="px-4 flex justify-between items-center">
        <router-link to="/" class="text-2xl font-bold">{{
          $t('app_title')
        }}</router-link>
        <div class="flex items-center">
          <!-- Language Switcher -->
          <select
            v-model="locale"
            class="mr-4 p-1 rounded bg-blue-700 text-white"
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>

          <template v-if="authStore.isAuthenticated">
            <span class="mr-4">{{
              $t('welcome_message', {
                name: authStore.currentUser?.username || 'User',
              })
            }}</span>
            <button @click="authStore.logout()" class="hover:underline">
              {{ $t('logout') }}
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="mr-4 hover:underline">{{
              $t('login')
            }}</router-link>
            <router-link to="/register" class="hover:underline">{{
              $t('register')
            }}</router-link>
          </template>
        </div>
      </nav>
    </header>
    <main class="flex-grow">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const { locale } = useI18n()
</script>

<style scoped>
/* Add any specific styles for the layout here */
</style>
