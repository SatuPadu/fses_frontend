<template>
  <v-row>
    <v-col cols="12" md="12">
      <h1 class="text-h4 font-weight-bold mb-6">Import Data</h1>
      
      <!-- Import Data Card -->
      <UiParentCard class="mb-6" :showTitle="false">
        <v-card-title class="d-flex justify-space-between align-center pb-4">
          <div>
            <h2 class="text-h5 font-weight-medium"></h2>
          </div>
          <v-btn
            color="primary"
            variant="outlined"
            @click="downloadTemplate"
            prepend-icon="mdi-download"
            size="large"
          >
            Download Template
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <!-- Modern File Upload Area -->
          <div 
            class="file-upload-area"
            :class="{ 'drag-over': isDragOver, 'has-file': file }"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @click="triggerFileInput"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".csv,.xlsx,.xls"
              @change="handleFileSelect"
              style="display: none"
            />
            
            <div class="text-center pa-8">
              <v-icon 
                :icon="file ? 'mdi-file-check' : 'mdi-cloud-upload'" 
                size="64" 
                :color="file ? 'success' : 'primary'"
                class="mb-4"
              ></v-icon>
              
              <h3 class="text-h6 font-weight-medium mb-2">
                {{ file ? 'File Selected' : 'Drop your file here' }}
              </h3>
              
              <p class="text-body-2 text-medium-emphasis mb-4">
                {{ file ? file[0]?.name : 'or click to browse files' }}
              </p>
              
              <div v-if="file" class="file-info pa-3 bg-grey-lighten-5 rounded-lg">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-file-document" color="primary" class="mr-2"></v-icon>
                    <span class="text-body-2 font-weight-medium">{{ file[0]?.name }}</span>
                  </div>
                  <v-btn
                    icon="mdi-close"
                    variant="text"
                    size="small"
                    @click.stop="clearFile"
                    color="error"
                  ></v-btn>
                </div>
                <p class="text-caption text-medium-emphasis mt-1">
                  Size: {{ formatFileSize(file[0]?.size) }}
                </p>
              </div>
              
              <div v-else class="supported-formats">
                <p class="text-caption text-medium-emphasis">
                  Supported formats: CSV, XLSX, XLS
                </p>
              </div>
            </div>
          </div>

          <!-- Upload Button -->
          <div class="text-center mt-6">
            <v-btn
              @click="handleFileUpload"
              :disabled="!file || loading"
              :loading="loading"
              color="primary"
              variant="flat"
              size="large"
              class="px-8"
              prepend-icon="mdi-upload"
            >
              {{ loading ? 'Uploading...' : 'Start Import' }}
            </v-btn>
          </div>
        </v-card-text>
      </UiParentCard>

      <v-spacer/>
      <v-spacer/>
      <v-spacer/>

      <!-- Import Progress Card -->
      <template v-if="importId">
        <UiParentCard class="mb-6" :showTitle="false">
          <v-card-title class="p-6">
            <h2 class="text-h5 font-weight-medium ml-6 mt-6">Import Progress</h2>
          </v-card-title>
          
          <v-card-text class="pa-6">
            <!-- Overall Progress -->
            <div v-if="importProgress" class="mb-6">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-body-1 font-weight-medium">Processing Progress</span>
                <span class="text-body-2 text-medium-emphasis">{{ Math.ceil(importProgress.progress) }}%</span>
              </div>
              <v-progress-linear
                :model-value="importProgress.progress"
                height="12"
                rounded
                color="primary"
                class="mb-2"
              ></v-progress-linear>
            </div>

            <!-- Status Message -->
            <v-alert 
              v-if="importStatus" 
              :type="getAlertType(importStatus.status)" 
              class="mb-6"
              variant="tonal"
            >
              <template v-slot:prepend>
                <v-icon :icon="getStatusIcon(importStatus.status)"></v-icon>
              </template>
              {{ importStatus.message }}
            </v-alert>

            <!-- Summary -->
            <div v-if="summary" class="mb-6">
              <h3 class="text-h6 font-weight-medium mb-4">Import Summary</h3>
              <v-row>
                <v-col 
                  v-for="(value, key) in summary" 
                  :key="key" 
                  cols="6" 
                  sm="4" 
                  md="3"
                >
                  <v-card variant="outlined" class="text-center pa-3">
                    <div class="text-h6 font-weight-bold text-primary">{{ value }}</div>
                    <div class="text-caption text-medium-emphasis">{{ formatSummaryKey(key) }}</div>
                  </v-card>
                </v-col>
              </v-row>
            </div>
            
            <!-- Errors -->
            <div v-if="errors && errors.length > 0" class="mb-6">
              <h3 class="text-h6 font-weight-medium text-error mb-4">
                <v-icon icon="mdi-alert-circle" class="mr-2"></v-icon>
                Import Errors ({{ errors.length }})
              </h3>
              <v-expansion-panels variant="accordion">
                <v-expansion-panel
                  v-for="(error, index) in errors"
                  :key="index"
                  class="mb-2"
                >
                  <v-expansion-panel-title class="text-error">
                    <v-icon icon="mdi-alert" class="mr-2"></v-icon>
                    Row {{ error.row_number }}: {{ error.error }}
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                          <table class="bordered-table">
                            <thead>
                              <tr>
                                <th class="text-caption">Field</th>
                                <th class="text-caption">Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(value, key) in error.row_data" :key="key">
                                <td class="font-weight-medium text-caption">{{ formatTableKey(key) }}</td>
                                <td class="text-caption">{{ value }}</td>
                              </tr>
                            </tbody>
                          </table>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>

          </v-card-text>
        </UiParentCard>
      </template>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useUserManagement } from '~/composables/useUserManagement';
import UiParentCard from '~/components/shared/UiParentCard.vue';

const { importData, getImportStream, downloadImportTemplate } = useUserManagement();

const file = ref<File[] | null>(null);
const loading = ref(false);
const importId = ref<string | null>(null);
const importStatus = ref<any>(null);
const importProgress = ref<any>(null);
const detailedProgress = ref<any[]>([]);
const summary = ref<any>(null);
const errors = ref<any[]>([]);
const isDragOver = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

let eventSource: EventSource | null = null;

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    file.value = Array.from(target.files);
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
  
  if (event.dataTransfer?.files) {
    file.value = Array.from(event.dataTransfer.files);
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const clearFile = () => {
  file.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const handleFileUpload = async () => {
  if (!file.value || file.value.length === 0) return;

  loading.value = true;
  resetState();

  try {
    const data = await importData(file.value[0]);
    importId.value = data.import_id;
    startStreaming(data.import_id);
  } catch (error) {
    console.error('Error starting import:', error);
    loading.value = false;
  }
};

const startStreaming = (id: string) => {
  eventSource = getImportStream(
    id,
    (data) => {
      if (data.status) {
        importStatus.value = data.status;
        if(data.status.summary) summary.value = data.status.summary;
        if(data.status.errors) errors.value = data.status.errors;
      }
      if (data.progress) {
        importProgress.value = data.progress;
      }
      if (data.detailed_progress) {
        detailedProgress.value = [...data.detailed_progress].reverse();
      }

      if (data.status?.status === 'completed' || data.status?.status === 'failed') {
        eventSource?.close();
        eventSource = null;
      }
    },
    (error) => {
      console.error('Stream error:', error);
      loading.value = false;
      eventSource = null;
    }
  );

  eventSource.onopen = () => {
    loading.value = false;
  };
};

const resetState = () => {
    importId.value = null;
    importStatus.value = null;
    importProgress.value = null;
    detailedProgress.value = [];
    summary.value = null;
    errors.value = [];
    if(eventSource) {
        eventSource.close();
        eventSource = null;
    }
};

const downloadTemplate = async () => {
  try {
    const blob = await downloadImportTemplate();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fses_student_evaluation_template.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading template:', error);
  }
};

const getAlertType = (status: string) => {
  switch (status) {
    case 'completed': return 'success';
    case 'failed': return 'error';
    case 'processing': return 'info';
    default: return 'info';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return 'mdi-check-circle';
    case 'failed': return 'mdi-alert-circle';
    case 'processing': return 'mdi-sync';
    default: return 'mdi-information';
  }
};

const getDotColor = (item: any) => {
    if (item.title.includes('error')) return 'error';
    if (item.data.action === 'created') return 'success';
    if (item.data.action === 'updated') return 'warning';
    return 'primary';
};

const formatSummaryKey = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Enhanced helper methods
const formatBasicInfo = (data: any) => {
  const parts = [];
  if (data.table) parts.push(`Table: ${formatTableKey(data.table)}`);
  if (data.action) parts.push(`Action: ${formatTableKey(data.action)}`);
  if (data.message) parts.push(data.message);
  return parts.join(' | ') || 'Processing...';
};

const shouldShowAsTable = (key: string, value: any) => {
  return value && 
         typeof value === 'object' && 
         !Array.isArray(value) && 
         Object.keys(value).length > 0;
};

const getTableClass = (dataKey: string) => {
  const colorMap: { [key: string]: string } = {
    'row_data': 'bg-grey-lighten-5',
    'lecturer_data': 'bg-blue-lighten-5',
    'user_data': 'bg-green-lighten-5',
    'student_data': 'bg-purple-lighten-5',
    'course_data': 'bg-cyan-lighten-5',
    'evaluation_data': 'bg-amber-lighten-5',
    'data': 'bg-orange-lighten-5'
  };
  return colorMap[dataKey] || 'bg-teal-lighten-5';
};

const hasTableData = (data: any) => {
  return Object.keys(data).some(key => shouldShowAsTable(key, data[key]));
};

const getSimpleData = (data: any) => {
  const simple: { [key: string]: any } = {};
  Object.keys(data).forEach(key => {
    if (!shouldShowAsTable(key, data[key])) {
      simple[key] = data[key];
    }
  });
  return simple;
};

const formatValue = (value: any) => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

// Updated formatDetailedLog method (simplified since we're not showing JSON anymore)
const formatDetailedLog = (data: any) => {
    return `Table: ${formatTableKey(data.table)} | Action: ${formatTableKey(data.action)}`;
};

// Enhanced formatTableKey method
const formatTableKey = (key: string) => {
    if (!key) return '';
    return key.replace(/_/g, ' ')
             .replace(/\b\w/g, l => l.toUpperCase())
             .trim();
};

onUnmounted(() => {
  if (eventSource) {
    eventSource.close();
  }
});
</script>

<style scoped>
.file-upload-area {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  background-color: #fafafa;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-upload-area:hover {
  border-color: #1976d2;
  background-color: #f3f8ff;
}

.file-upload-area.drag-over {
  border-color: #1976d2;
  background-color: #e3f2fd;
  transform: scale(1.02);
}

.file-upload-area.has-file {
  border-color: #4caf50;
  background-color: #f1f8e9;
}

.file-info {
  max-width: 400px;
  margin: 0 auto;
}

.supported-formats {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
}

.error-data {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 12px;
  margin-top: 8px;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 0.8em;
  font-family: 'Courier New', monospace;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.bordered-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  font-size: 0.75rem;
}

.bordered-table th,
.bordered-table td {
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
  text-align: left;
}

.bordered-table th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.bordered-table tbody tr:nth-child(even) {
  background-color: #fafafa;
}

.bordered-table tbody tr:hover {
  background-color: #f0f0f0;
}
</style>