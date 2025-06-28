<template>
  <v-dialog :model-value="dialog" @update:model-value="$emit('toggle-dialog')" max-width="800px">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Nomination Details</span>
        <v-btn icon="mdi-close" variant="text" @click="closeDialog" />
      </v-card-title>

      <v-card-text>
        <!-- Student Information -->
        <div class="section-divider mb-4">
          <div class="text-h6 my-4">Student Information</div>
          <div>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="nominationData?.student?.name"
                  label="Student Name"
                  variant="outlined"
                  density="compact"
                  readonly
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="nominationData?.student?.matric_number"
                  label="Matric Number"
                  variant="outlined"
                  density="compact"
                  readonly
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="nominationData?.student?.program?.program_name"
                  label="Program"
                  variant="outlined"
                  density="compact"
                  readonly
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="`Semester ${nominationData?.student?.current_semester}`"
                  label="Current Semester"
                  variant="outlined"
                  density="compact"
                  readonly
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  :model-value="nominationData?.student?.research_title"
                  label="Research Title"
                  variant="outlined"
                  density="compact"
                  readonly
                />
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- Research Supervisor Information -->
        <div class="section-divider mb-4">
          <div class="text-h6 my-4">Research Supervisor Information</div>
          <div>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="nominationData?.student?.main_supervisor?.name"
                  label="Research Supervisor"
                  variant="outlined"
                  density="compact"
                  readonly
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="nominationData?.student?.main_supervisor?.title"
                  label="Title"
                  variant="outlined"
                  density="compact"
                  readonly
                />
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- Examiner Information -->
        <div class="section-divider mb-4">
          <div class="text-h6 my-4">Examiner Information</div>
          <div>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  :model-value="nominationData?.examiner1 ? ((nominationData.examiner1.title ? nominationData.examiner1.title + ' ' : '') + nominationData.examiner1.name) : 'Not assigned'"
                  label="Examiner 1"
                  variant="outlined"
                  density="compact"
                  readonly
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  :model-value="nominationData?.examiner2 ? ((nominationData.examiner2.title ? nominationData.examiner2.title + ' ' : '') + nominationData.examiner2.name) : 'Not assigned'"
                  label="Examiner 2"
                  variant="outlined"
                  density="compact"
                  readonly
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  :model-value="nominationData?.examiner3 ? ((nominationData.examiner3.title ? nominationData.examiner3.title + ' ' : '') + nominationData.examiner3.name) : 'Not assigned'"
                  label="Examiner 3"
                  variant="outlined"
                  density="compact"
                  readonly
                />
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- Evaluation Details -->
        <div class="section-divider mb-4">
          <div class="text-h6 my-4">Evaluation Details</div>
          <div>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  :model-value="getStatusText(nominationData?.nomination_status || '')"
                  label="Status"
                  variant="outlined"
                  density="compact"
                  readonly
                >
                </v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  :model-value="`Semester ${nominationData?.semester}`"
                  label="Semester"
                  variant="outlined"
                  density="compact"
                  readonly
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  :model-value="nominationData?.academic_year"
                  label="Academic Year"
                  variant="outlined"
                  density="compact"
                  readonly
                />
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- Postponement Information -->
        <div v-if="nominationData?.is_postponed" class="section-divider mb-4">
          <div class="text-h6 my-4">Postponement Information</div>
          <div>
            <v-row>
              <v-col cols="12">
                <v-textarea
                  :model-value="nominationData?.postponement_reason"
                  label="Reason for Postponement"
                  variant="outlined"
                  density="compact"
                  readonly
                  rows="3"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDate(nominationData?.postponed_to)"
                  label="Postponed To"
                  variant="outlined"
                  density="compact"
                  readonly
                />
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- Timestamps -->
        <div class="section-divider mb-4">
          <div class="text-h6 my-4">Timestamps</div>
          <div>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDate(nominationData?.created_at)"
                  label="Nominated At"
                  variant="outlined"
                  density="compact"
                  readonly
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDate(nominationData?.locked_at)"
                  label="Locked At"
                  variant="outlined"
                  density="compact"
                  readonly
                />
              </v-col>
            </v-row>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="justify-start">
        <v-btn color="primary" variant="flat" @click="closeDialog">
          Close
        </v-btn>
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
.section-divider {
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
}
.section-divider:last-of-type {
  border-bottom: none;
}
</style> 