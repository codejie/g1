<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">File Manager</h1>

    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 class="text-xl font-semibold mb-4">Upload File</h2>
      <input type="file" @change="handleFileChange" class="mb-4" />
      <button
        @click="uploadFile"
        :disabled="!selectedFile || uploading"
        class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        :class="{ 'opacity-50 cursor-not-allowed': uploading }"
      >
        <span v-if="uploading">Uploading...</span>
        <span v-else>Upload</span>
      </button>
      <div v-if="uploadMessage" :class="{'text-green-500': !authStore.error, 'text-red-500': authStore.error}" class="mt-2">{{ uploadMessage }}</div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Download File</h2>
      <input
        type="text"
        v-model="downloadFileName"
        placeholder="Enter file name to download"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
      />
      <button
        @click="downloadFile"
        :disabled="!downloadFileName || downloading"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        :class="{ 'opacity-50 cursor-not-allowed': downloading }"
      >
        <span v-if="downloading">Downloading...</span>
        <span v-else>Download</span>
      </button>
      <div v-if="downloadMessage" :class="{'text-green-500': !authStore.error, 'text-red-500': authStore.error}" class="mt-2">{{ downloadMessage }}</div>
    </div>

    <div v-if="authStore.error" class="text-red-500 text-center mt-4">{{ authStore.error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import api from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import { type UploadResponse, type DownloadRequest } from '../../types/file';

const authStore = useAuthStore();

const selectedFile = ref<File | null>(null);
const downloadFileName = ref('');

const uploading = ref(false);
const uploadMessage = ref('');

const downloading = ref(false);
const downloadMessage = ref('');

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  } else {
    selectedFile.value = null;
  }
};

const uploadFile = async () => {
  if (!selectedFile.value) {
    uploadMessage.value = 'Please select a file to upload.';
    return;
  }

  uploading.value = true;
  uploadMessage.value = '';
  authStore.error = null;

  const formData = new FormData();
  formData.append('file', selectedFile.value);

  try {
    const response = await api.post<UploadResponse>('/file/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.data.data) {
      uploadMessage.value = `File uploaded: ${response.data.data.fileName} (${(response.data.data.size / 1024).toFixed(2)} KB)`;
      downloadFileName.value = response.data.data.fileName; // Pre-fill for easy download test
    }
  } catch (err: any) {
    authStore.error = err.response?.data?.error?.message || 'File upload failed';
    uploadMessage.value = '';
  } finally {
    uploading.value = false;
  }
};

const downloadFile = async () => {
  if (!downloadFileName.value) {
    downloadMessage.value = 'Please enter a file name to download.';
    return;
  }

  downloading.value = true;
  downloadMessage.value = '';
  authStore.error = null;

  const payload: DownloadRequest = {
    fileName: downloadFileName.value,
  };

  try {
    const response = await api.post('/file/download', payload, {
      responseType: 'blob', // Important for file downloads
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', downloadFileName.value); // Set the download filename
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    downloadMessage.value = `File '${downloadFileName.value}' downloaded successfully!`;
  } catch (err: any) {
    authStore.error = err.response?.data?.error?.message || 'File download failed';
    downloadMessage.value = '';
  } finally {
    downloading.value = false;
  }
};
</script>

<style scoped>
/* Scoped styles for FileManager */
</style>
