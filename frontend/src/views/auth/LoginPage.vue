<template>
  <div class="flex justify-center items-center h-full">
    <div class="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-center mb-6">
        {{ $t('login_page_title') }}
      </h2>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="email" class="block text-gray-700 text-sm font-bold mb-2"
            >{{ $t('email') }}:</label
          >
          <input
            type="email"
            id="email"
            v-model="email"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div class="mb-6">
          <label
            for="password"
            class="block text-gray-700 text-sm font-bold mb-2"
            >{{ $t('password') }}:</label
          >
          <input
            type="password"
            id="password"
            v-model="password"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div v-if="authStore.error" class="text-red-500 text-xs italic mb-4">
          {{ authStore.error }}
        </div>
        <div class="flex items-center justify-between">
          <button
            type="submit"
            :disabled="authStore.loading"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            :class="{ 'opacity-50 cursor-not-allowed': authStore.loading }"
          >
            <span v-if="authStore.loading">Logging In...</span>
            <span v-else>{{ $t('sign_in') }}</span>
          </button>
          <router-link
            to="/register"
            class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
          >
            {{ $t('dont_have_account') }}
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  await authStore.login({ email: email.value, password: password.value })
}
</script>

<style scoped>
/* Scoped styles for Login page */
</style>
