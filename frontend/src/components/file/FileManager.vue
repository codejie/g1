<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">File Manager</h1>

    <!-- Toolbar -->
    <div class="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow">
      <div class="flex items-center space-x-2">
        <button @click="navigateUp" :disabled="!currentPath" class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">
          Incr
        </button>
        <span class="font-mono text-gray-700">/{{ currentPath }}</span>
      </div>
      <div class="flex items-center space-x-4">
        <input type="file" ref="fileInput" @change="handleFileSelect" class="hidden" />
        <button 
          @click="triggerUpload" 
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
          :disabled="isUploading"
        >
          <span v-if="isUploading">Uploading...</span>
          <span v-else>Upload File</span>
        </button>
        <button @click="fetchFiles" class="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded">Refresh</button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ errorMessage }}
    </div>

    <!-- File List -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center text-gray-500">Loading...</div>
      
      <table v-else class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Name
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Size
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Type
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Date
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="files.length === 0">
            <td colspan="5" class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center text-gray-500">
              No files found
            </td>
          </tr>
          <tr v-for="file in files" :key="file.path" class="hover:bg-gray-50">
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <div class="flex items-center cursor-pointer" @click="handleItemClick(file)">
                <span v-if="file.type === 'directory'" class="text-yellow-500 mr-2">📁</span>
                <span v-else class="text-gray-500 mr-2">📄</span>
                <span :class="{'font-semibold text-blue-600': file.type === 'directory'}">{{ file.name }}</span>
              </div>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {{ formatSize(file.size || 0) }}
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {{ file.type }}
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {{ file.updated ? new Date(file.updated).toLocaleString() : '-' }}
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <button 
                v-if="file.type !== 'directory'"
                @click="onDownloadFile(file)" 
                class="text-blue-600 hover:text-blue-900"
                :disabled="isDownloading"
              >
                Download
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { listFiles, uploadFile, downloadFile } from '../../services/files';
import { useAuthStore } from '../../stores/auth';
import type { FileItem } from '@/types/files'; // Adjust path if needed

const authStore = useAuthStore();
const files = ref<FileItem[]>([]);
const currentPath = ref('');
const isLoading = ref(false);
const isUploading = ref(false);
const isDownloading = ref(false);
const errorMessage = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const fetchFiles = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const result = await listFiles({
      path: currentPath.value,
      page_info: { page: 1, size: 100 } // Fetching up to 100 for simplicity
    });
    
    // Check if result has items (API interceptor returns payload directly)
    if (result && result.items) {
       files.value = result.items;
    } else {
       files.value = [];
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Error loading files';
  } finally {
    isLoading.value = false;
  }
};

const handleItemClick = (file: FileItem) => {
  if (file.type === 'directory') {
    currentPath.value = file.path; // Use the path provided by backend
    fetchFiles();
  }
};

const navigateUp = () => {
    if (!currentPath.value) return;
    const parts = currentPath.value.split('/'); 
    parts.pop();
    currentPath.value = parts.join('/');
    fetchFiles();
};

const triggerUpload = () => {
  fileInput.value?.click();
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    await onUploadFile(target.files[0]);
    // clear input
    target.value = '';
  }
};

const onUploadFile = async (file: File) => {
  isUploading.value = true;
  errorMessage.value = '';
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', currentPath.value);
  formData.append('name', file.name);

  try {
    await uploadFile(formData);
    // Refresh list
    fetchFiles();
  } catch (err: any) {
    errorMessage.value = err.message || 'Upload failed';
  } finally {
    isUploading.value = false;
  }
};

const onDownloadFile = async (file: FileItem) => {
  isDownloading.value = true;
  errorMessage.value = '';
  try {
    const blob = await downloadFile({
      path: file.path, 
      name: file.name
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', file.name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    errorMessage.value = 'Download failed';
  } finally {
    isDownloading.value = false;
  }
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

onMounted(() => {
  fetchFiles();
});
</script>
