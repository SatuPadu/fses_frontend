<template>
  <v-dialog :model-value="dialog" @update:model-value="$emit('toggle-dialog')" max-width="500px">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Postpone Evaluation</span>
        <v-btn icon="mdi-close" variant="text" @click="closeDialog" />
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="isFormValid">
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
              </v-row>
            </div>
          </div>

          <!-- Postponement Details -->
          <div class="section-divider mb-4">
            <div class="text-h6 my-4">Postponement Details</div>
            <div>
              <v-row>
                <v-col cols="12">
                  <v-textarea
                    v-model="reason"
                    label="Reason for Postponement"
                    variant="outlined"
                    density="compact"
                    :rules="[v => !!v || 'Reason is required']"
                    required
                    rows="3"
                  />
                </v-col>
                <v-col cols="12">
                  <v-menu
                    v-model="dateMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template #activator="{ props }">
                      <v-text-field
                        v-model="postponedToDisplay"
                        label="New Evaluation Date"
                        variant="outlined"
                        density="compact"
                        v-bind="props"
                        :rules="[(v: any) => !!v || 'New date is required']"
                        required
                        placeholder="dd/mm/yyyy"
                        readonly
                        append-inner-icon="mdi-calendar"
                      />
                    </template>
                    <v-date-picker
                      v-model="selectedDate"
                      color="primary"
                      show-adjacent-months
                      @update:model-value="handleDateSelected"
                    />
                  </v-menu>
                </v-col>
              </v-row>
            </div>
          </div>

          <!-- Warning -->
          <v-alert
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            <strong>Note:</strong> Postponing this evaluation will send email notifications to all relevant parties.
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-start">
        <v-btn
          color="warning"
          variant="flat"
          @click="submitForm"
          :loading="loading"
          :disabled="!isFormValid"
        >
          Postpone Evaluation
        </v-btn>
        <v-btn color="secondary" variant="outlined" @click="closeDialog">
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useNominationManagement } from '~/composables/useNominationManagement';
import type { Evaluation, PostponeNominationRequest } from '~/types/global';

const props = defineProps<{
  dialog: boolean;
  nominationData?: Evaluation;
}>();

const emits = defineEmits(['toggle-dialog', 'evaluation-postponed']);

const nominationManagement = useNominationManagement();
const form = ref();
const isFormValid = ref(false);
const loading = ref(false);

// Form data
const reason = ref('');
const selectedDate = ref<Date | null>(null); // Date object for v-date-picker
const dateMenu = ref(false);

// Computed property for date display (dd/mm/yyyy format)
const postponedToDisplay = computed(() => {
  if (!selectedDate.value) return '';
  const date = selectedDate.value;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

// Computed property for API format (yyyy-mm-dd)
const postponedToAPI = computed(() => {
  if (!selectedDate.value) return null;
  const date = selectedDate.value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

// Handle date selection from picker
const handleDateSelected = (date: Date | null) => {
  selectedDate.value = date;
  dateMenu.value = false; // Close the menu when date is selected
};

// Initialize form
const initializeForm = () => {
  reason.value = '';
  selectedDate.value = null;
  dateMenu.value = false;
};

// Submit form
const submitForm = async () => {
  if (!form.value?.validate()) return;

  loading.value = true;
  try {
    const formData = {
      reason: reason.value,
      postponed_to: postponedToAPI.value,
    } as PostponeNominationRequest;

    if (props.nominationData) {
      await nominationManagement.postponeNomination(props.nominationData.id.toString(), formData);
      emits('evaluation-postponed');
    }

    closeDialog();
  } catch (error) {
    console.error('Error postponing evaluation:', error);
  } finally {
    loading.value = false;
  }
};

// Close dialog
const closeDialog = () => {
  emits('toggle-dialog');
  initializeForm();
};

// Watch for dialog changes
watch(() => props.dialog, (newValue) => {
  if (newValue) {
    initializeForm();
  }
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