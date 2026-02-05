<template>
  <div class="flex justify-center items-center h-full">
    <div class="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-center mb-6">
        {{ $t('register_page_title') }}
      </h2>
      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label
            for="username"
            class="block text-gray-700 text-sm font-bold mb-2"
            >{{ $t('username') }}:</label
          >
          <input
            type="text"
            id="username"
            v-model="username"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
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
            class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            :class="{ 'opacity-50 cursor-not-allowed': authStore.loading }"
          >
            <span v-if="authStore.loading">Registering...</span>
            <span v-else>{{ $t('register_button') }}</span>
          </button>
          <router-link
            to="/login"
            class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
          >
            {{ $t('already_have_account') }}
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import userService from '../../services/user'

const authStore = useAuthStore()
const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')

const handleRegister = async () => {
  authStore.setLoading(true)
  authStore.setError(null)
  try {
    await userService.register({
      username: username.value,
      email: email.value,
      password: password.value,
    })
    router.push('/login')
  } catch (err: any) {
    authStore.setError(err.message || 'Registration failed')
    console.error('Register error:', err)
  } finally {
    authStore.setLoading(false)
  }
}
</script>

<style scoped>
/* Scoped styles for Register page */
</style>
