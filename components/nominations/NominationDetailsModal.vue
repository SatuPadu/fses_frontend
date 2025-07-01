<template>
  <v-dialog 
    :model-value="dialog" 
    @update:model-value="$emit('toggle-dialog')" 
    max-width="900"
  >
    <v-card class="nomination-details-modal">
      <v-card-title class="d-flex justify-space-between align-center pa-6 pb-4">
        <div class="d-flex align-center">
          <v-icon class="mr-3" color="primary" size="28">mdi-clipboard-text</v-icon>
          <span class="text-h5 font-weight-medium">Nomination Details</span>
        </div>
        <v-btn 
          icon="mdi-close" 
          variant="text" 
          size="small"
          @click="closeDialog"
          class="close-btn"
        />
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-6">
        <v-row dense>
          <!-- Student Information Section -->
          <v-col cols="12">
            <h3 class="text-subtitle-1 font-weight-medium mb-4 text-primary">Student Information</h3>
          </v-col>
          
          <v-col cols="12" sm="6">
            <div class="info-field">
              <label class="text-caption font-weight-medium text-medium-emphasis">Student Name</label>
              <p class="text-body-1 font-weight-medium">{{ nominationData?.student?.name || '-' }}</p>
            </div>
          </v-col>
          
          <v-col cols="12" sm="6">
            <div class="info-field">
              <label class="text-caption font-weight-medium text-medium-emphasis">Matric Number</label>
              <p class="text-body-1 font-weight-medium">{{ nominationData?.student?.matric_number || '-' }}</p>
            </div>
          </v-col>
          
          <v-col cols="12" sm="6">
            <div class="info-field">
              <label class="text-caption font-weight-medium text-medium-emphasis">Program</label>
              <p class="text-body-1 font-weight-medium">{{ nominationData?.student?.program?.program_name || '-' }}</p>
            </div>
          </v-col>
          
          <v-col cols="12" sm="6">
            <div class="info-field">
              <label class="text-caption font-weight-medium text-medium-emphasis">Current Semester</label>
              <p class="text-body-1 font-weight-medium">{{ nominationData?.student?.current_semester ? `Semester ${nominationData.student.current_semester}` : '-' }}</p>
            </div>
          </v-col>
          
          <v-col cols="12">
            <div class="info-field">
              <label class="text-caption font-weight-medium text-medium-emphasis">Research Title</label>
              <p class="text-body-1 font-weight-medium">{{ nominationData?.student?.research_title || '-' }}</p>
            </div>
          </v-col>

          <!-- Research Supervisor Information Section -->
          <v-col cols="12">
            <h3 class="text-subtitle-1 font-weight-medium mb-4 mt-6 text-primary">Research Supervisor Information</h3>
          </v-col>
          
          <v-col cols="12" sm="6">
            <div class="info-field">
              <label class="text-caption font-weight-medium text-medium-emphasis">Research Supervisor</label>
              <p class="text-body-1 font-weight-medium">
                {{ nominationData?.student?.main_supervisor ? ((nominationData.student.main_supervisor.title ? nominationData.student.main_supervisor.title + ' ' : '') + nominationData.student.main_supervisor.name) : '-' }}
              </p>
            </div>
          </v-col>
          
          <v-col cols="12" sm="6">
            <div class="info-field">
              <label class="text-caption font-weight-medium text-medium-emphasis">Co-Supervisor</label>
              <p class="text-body-1 font-weight-medium">
                {{ nominationData?.student?.co_supervisors && nominationData.student.co_supervisors.length > 0 ? 
                  ((nominationData.student.co_supervisors[0].lecturer?.title ? nominationData.student.co_supervisors[0].lecturer.title + ' ' : '') + nominationData.student.co_supervisors[0].lecturer?.name) : 
                  'Not assigned' }}
              </p>
            </div>
          </v-col>

          <!-- Examiner Information Section -->
          <v-col cols="12">
            <h3 class="text-subtitle-1 font-weight-medium mb-4 mt-6 text-primary">Examiner Information</h3>
          </v-col>
          
          <v-col cols="12" sm="4">
            <div class="info-field">
              <label class="text-caption font-weight-medium text-medium-emphasis">Examiner 1</label>
              <p class="text-body-1 font-weight-medium">
                {{ nominationData?.examiner1 ? ((nominationData.examiner1.title ? nominationData.examiner1.title + ' ' : '') + nominationData.examiner1.name) : 'Not assigned' }}
              </p>
            </div>
          </v-col>
          
          <v-col cols="12" sm="4">
            <div class="info-field">
              <label class="text-caption font-weight-medium text-medium-emphasis">Examiner 2</label>
              <p class="text-body-1 font-weight-medium">
                {{ nominationData?.examiner2 ? ((nominationData.examiner2.title ? nominationData.examiner2.title + ' ' : '') + nominationData.examiner2.name) : 'Not assigned' }}
              </p>
            </div>
          </v-col>
          
          <v-col cols="12" sm="4">
            <div class="info-field">
              <label class="text-caption font-weight-medium text-medium-emphasis">Examiner 3</label>
              <p class="text-body-1 font-weight-medium">
                {{ nominationData?.examiner3 ? ((nominationData.examiner3.title ? nominationData.examiner3.title + ' ' : '') + nominationData.examiner3.name) : 'Not assigned' }}
              </p>
            </div>
          </v-col>

          <!-- Evaluation Details Section -->
          <v-col cols="12">
            <h3 class="text-subtitle-1 font-weight-medium mb-4 mt-6 text-primary">Evaluation Details</h3>
          </v-col>
          
          <v-col cols="12" sm="4">
            <div class="info-field">
              <label class="text-caption font-weight-medium text-medium-emphasis">Status</label>
              <div class="d-flex align-center">
                <v-chip
                  :color="getStatusColor(nominationData?.nomination_status || '')"
                  variant="flat"
                  size="small"
                  class="font-weight-medium"
                >
                  <v-icon start size="16" class="mr-1">mdi-clipboard-check</v-icon>
                  {{ getStatusText(nominationData?.nomination_status || '') }}
                </v-chip>
              </div>
            </div>
          </v-col>
          
          <v-col cols="12" sm="4">
            <div class="info-field">
              <label class="text-caption font-weight-medium text-medium-emphasis">Semester</label>
              <p class="text-body-1 font-weight-medium">{{ nominationData?.semester ? `Semester ${nominationData.semester}` : '-' }}</p>
            </div>
          </v-col>
          
          <v-col cols="12" sm="4">
            <div class="info-field">
              <label class="text-caption font-weight-medium text-medium-emphasis">Academic Year</label>
              <p class="text-body-1 font-weight-medium">{{ nominationData?.academic_year || '-' }}</p>
            </div>
          </v-col>

          <!-- Postponement Information Section -->
          <v-col cols="12" v-if="nominationData?.is_postponed">
            <h3 class="text-subtitle-1 font-weight-medium mb-4 mt-6 text-primary">Postponement Information</h3>
          </v-col>
          
          <v-col cols="12" v-if="nominationData?.is_postponed">
            <div class="info-field">
              <label class="text-caption font-weight-medium text-medium-emphasis">Reason for Postponement</label>
              <p class="text-body-1 font-weight-medium">{{ nominationData?.postponement_reason || '-' }}</p>
            </div>
          </v-col>
          
          <v-col cols="12" sm="6" v-if="nominationData?.is_postponed">
            <div class="info-field">
              <label class="text-caption font-weight-medium text-medium-emphasis">Postponed To</label>
              <p class="text-body-1 font-weight-medium">{{ formatDate(nominationData?.postponed_to) }}</p>
            </div>
          </v-col>

          <!-- Timestamps Section -->
          <v-col cols="12">
            <h3 class="text-subtitle-1 font-weight-medium mb-4 mt-6 text-primary">Timestamps</h3>
          </v-col>
          
          <v-col cols="12" sm="6">
            <div class="info-field">
              <label class="text-caption font-weight-medium text-medium-emphasis">Nominated At</label>
              <p class="text-body-1 font-weight-medium">{{ formatDate(nominationData?.created_at) }}</p>
            </div>
          </v-col>
          
          <v-col cols="12" sm="6">
            <div class="info-field">
              <label class="text-caption font-weight-medium text-medium-emphasis">Locked At</label>
              <p class="text-body-1 font-weight-medium">{{ formatDate(nominationData?.locked_at) }}</p>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-6 pt-4">
        <div class="d-flex gap-3 w-100">
          <v-btn 
            @click="closeDialog"
            variant="outlined"
            color="grey-darken-1"
            class="font-weight-medium"
          >
            Close
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import type { Evaluation } from '~/types/global';

const props = defineProps<{
  dialog: boolean;
  nominationData?: Evaluation;
}>();

const emits = defineEmits(['toggle-dialog']);

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'warning';
    case 'Nominated':
      return 'info';
    case 'Locked':
      return 'success';
    case 'Postponed':
      return 'orange';
    default:
      return 'grey';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'Pending';
    case 'Nominated':
      return 'Nominated';
    case 'Locked':
      return 'Locked';
    case 'Postponed':
      return 'Postponed';
    default:
      return status;
  }
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'Not available';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const closeDialog = () => {
  emits('toggle-dialog');
};

// Watch for dialog changes
watch(() => props.dialog, (newValue) => {
  // Handle dialog state changes if needed
});
</script>

<style scoped>
.nomination-details-modal {
  border-radius: 12px;
}

.close-btn {
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.04);
  transform: scale(1.1);
}

.info-field {
  margin-bottom: 8px;
}

.info-field label {
  display: block;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-field p {
  margin: 0;
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
  border-left: 3px solid var(--v-primary-base);
}

.gap-3 {
  gap: 12px;
}

.w-100 {
  width: 100%;
}
</style> 