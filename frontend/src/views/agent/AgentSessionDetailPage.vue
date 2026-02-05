<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">Session Details: {{ session?.title || 'Loading...' }}</h1>

    <div v-if="loading" class="text-center text-gray-600">Loading session...</div>
    <div v-else-if="authStore.error" class="text-red-500 text-center">{{ authStore.error }}</div>
    <div v-else-if="!session" class="text-center text-gray-600">Session not found.</div>
    <div v-else class="bg-white p-8 rounded-lg shadow-md">
      <form @submit.prevent="handleUpdateSession">
        <div class="mb-4">
          <label for="sessionId" class="block text-gray-700 text-sm font-bold mb-2">Session ID:</label>
          <input
            type="text"
            id="sessionId"
            :value="session.id"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
            disabled
          />
        </div>
        <div class="mb-4">
          <label for="sessionTitle" class="block text-gray-700 text-sm font-bold mb-2">Title:</label>
          <input
            type="text"
            id="sessionTitle"
            v-model="session.title"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div class="mb-4">
          <label for="sessionParentId" class="block text-gray-700 text-sm font-bold mb-2">Parent ID:</label>
          <input
            type="text"
            id="sessionParentId"
            v-model="session.parentId"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div class="mb-4">
          <label for="sessionDirectory" class="block text-gray-700 text-sm font-bold mb-2">Directory:</label>
          <input
            type="text"
            id="sessionDirectory"
            v-model="session.directory"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div class="mb-6">
          <p class="text-gray-700 text-sm font-bold mb-2">Created:</p>
          <p class="text-gray-700">{{ new Date(session.created).toLocaleString() }}</p>
        </div>
        <div class="mb-6">
          <p class="text-gray-700 text-sm font-bold mb-2">Last Updated:</p>
          <p class="text-gray-700">{{ new Date(session.updated).toLocaleString() }}</p>
        </div>

        <div v-if="successMessage" class="text-green-500 text-xs italic mb-4">
          {{ successMessage }}
        </div>
        <div v-if="authStore.error" class="text-red-500 text-xs italic mb-4">
          {{ authStore.error }}
        </div>

        <div class="flex items-center justify-between">
          <button
            type="submit"
            :disabled="loading"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            :class="{ 'opacity-50 cursor-not-allowed': loading }"
          >
            <span v-if="loading">Updating...</span>
            <span v-else>Update Session</span>
          </button>
          <button
            @click="handleDeleteSession"
            :disabled="loading"
            type="button"
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            :class="{ 'opacity-50 cursor-not-allowed': loading }"
          >
            Delete Session
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import api from '../../services/api';
import {
  type GetSessionRequest, type GetSessionResponse,
  type UpdateSessionRequest, type UpdateSessionResponse,
  type DeleteSessionRequest, type DeleteSessionResponse,
  type Session
} from '../../types/agent';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const session = ref<Session | null>(null);
const loading = ref(false);
const successMessage = ref('');
const sessionId = ref(route.params.id as string);

const fetchSessionDetails = async (id: string) => {
  loading.value = true;
  authStore.error = null;
  successMessage.value = '';

  const payload: GetSessionRequest = { id };

  try {
    const response = await api.post<GetSessionResponse>('/agent/session/get', payload);
    if (response.data.data?.session) {
      session.value = response.data.data.session;
    } else {
      throw new Error('Session not found'); // Or handle gracefully
    }
  } catch (err: any) {
    authStore.error = err.response?.data?.error?.message || 'Failed to fetch session details';
    session.value = null; // Clear session if fetch fails
  } finally {
    loading.value = false;
  }
};

const handleUpdateSession = async () => {
  loading.value = true;
  authStore.error = null;
  successMessage.value = '';

  if (!session.value?.id) {
    authStore.error = 'Session ID not found.';
    loading.value = false;
    return;
  }

  const payload: UpdateSessionRequest = {
    id: session.value.id,
    title: session.value.title,
    parentId: session.value.parentId,
    directory: session.value.directory,
  };

  try {
    const response = await api.post<UpdateSessionResponse>('/agent/session/update', payload);
    if (response.data.data?.session) {
      session.value = response.data.data.session; // Update local session data
      successMessage.value = 'Session updated successfully!';
    }
  } catch (err: any) {
    authStore.error = err.response?.data?.error?.message || 'Failed to update session';
  } finally {
    loading.value = false;
  }
};

const handleDeleteSession = async () => {
  if (!confirm('Are you sure you want to delete this session?')) {
    return;
  }

  loading.value = true;
  authStore.error = null;
  successMessage.value = '';

  if (!session.value?.id) {
    authStore.error = 'Session ID not found.';
    loading.value = false;
    return;
  }

  const payload: DeleteSessionRequest = { id: session.value.id };

  try {
    const response = await api.post<DeleteSessionResponse>('/agent/session/delete', payload);
    if (response.data.data?.message) {
      successMessage.value = response.data.data.message;
      alert(response.data.data.message);
      router.push('/agents'); // Redirect to dashboard after deletion
    }
  } catch (err: any) {
    authStore.error = err.response?.data?.error?.message || 'Failed to delete session';
  } finally {
    loading.value = false;
  }
};


onMounted(() => {
  if (sessionId.value) {
    fetchSessionDetails(sessionId.value);
  }
});

// Watch for route param changes (e.g., navigating from /agents/1 to /agents/2)
watch(() => route.params.id, (newId) => {
  if (newId) {
    sessionId.value = newId as string;
    fetchSessionDetails(newId as string);
  } else {
    session.value = null;
  }
});
</script>

<style scoped>
/* Scoped styles for AgentSessionDetailPage */
</style>
