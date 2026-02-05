<template>
  <div class="flex justify-center items-center h-full">
    <div class="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-center mb-6">{{ $t('user_profile_title') }}</h2>
      <form @submit.prevent="handleUpdateProfile">
        <div class="mb-4">
          <label for="name" class="block text-gray-700 text-sm font-bold mb-2">{{ $t('name') }}:</label>
          <input
            type="text"
            id="name"
            v-model="name"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div class="mb-4">
          <label for="email" class="block text-gray-700 text-sm font-bold mb-2">{{ $t('email') }}:</label>
          <input
            type="email"
            id="email"
            v-model="email"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            disabled
          />
          <p class="text-xs text-gray-500 mt-1">{{ $t('email_cannot_change') }}</p>
        </div>
        <div v-if="authStore.error" class="text-red-500 text-xs italic mb-4">
          {{ authStore.error }}
        </div>
        <div v-if="successMessage" class="text-green-500 text-xs italic mb-4">
          {{ successMessage }}
        </div>
        <div class="flex items-center justify-between">
          <button
            type="submit"
            :disabled="loading"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            :class="{ 'opacity-50 cursor-not-allowed': loading }"
          >
            <span v-if="loading">Updating...</span>
            <span v-else>{{ $t('update_profile') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import api from '../../services/api';
import { type UpdateUserRequest, type UpdateUserResponse, type User } from '../../types/user';
import { useI18n } from 'vue-i18n'; // Import useI18n

const authStore = useAuthStore();
const { t } = useI18n(); // Access translation function

const name = ref(authStore.currentUser?.name || '');
const email = ref(authStore.currentUser?.email || '');
const loading = ref(false);
const successMessage = ref('');

onMounted(() => {
  if (!authStore.currentUser) {
    // Optionally fetch user data if not in store (e.g., on page refresh)
    // For simplicity, we assume currentUser is always available after login
    // Or redirect to login if not authenticated
    // router.push('/login');
  }
});

const handleUpdateProfile = async () => {
  loading.value = true;
  successMessage.value = '';
  authStore.error = null;

  if (!authStore.currentUser?.id) {
    authStore.error = t('user_id_not_found_error'); // Use i18n
    loading.value = false;
    return;
  }

  const payload: UpdateUserRequest = {
    id: authStore.currentUser.id,
    name: name.value,
    // email: email.value // Email cannot be changed, so don't send it in payload
  };

  try {
    const response = await api.post<UpdateUserResponse>('/user/update', payload);
    if (response.data.data?.user) {
      // Update store with new user data (excluding password)
      const updatedUser: User = { ...response.data.data.user, password: undefined };
      authStore.setAuth(authStore.token!, updatedUser); // Re-set auth to update user object in store
      successMessage.value = t('profile_updated_success'); // Use i18n
    }
  } catch (err: any) {
    authStore.error = err.response?.data?.error?.message || t('failed_to_update_profile_error'); // Use i18n
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Scoped styles for User Profile page */
</style>
