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
                    :close-on-click-outside="true"
                    transition="scale-transition"
                    location="bottom start"
                    offset="8"
                    :z-index="2000"
                    @update:model-value="handleMenuToggle"
                  >
                    <template #activator="{ props }">
                      <v-text-field
                        v-model="postponedToDisplay"
                        label="New Evaluation Date"
                        variant="outlined"
                        density="compact"
                        v-bind="props"
                        :rules="dateValidationRules"
                        required
                        placeholder="Select date"
                        readonly
                        clearable
                        append-inner-icon="mdi-calendar"
                        @click:clear="clearDate"
                        @click="openDatePicker"
                        class="date-picker-field"
                      />
                    </template>
                    <v-card class="date-picker-card" elevation="8">
                      <v-card-text class="pa-0">
                        <v-date-picker
                          v-model="selectedDate"
                          color="primary"
                          elevation="0"
                          border="0"
                          :min="minDateForPicker"
                          :max="maxDateForPicker"
                          show-adjacent-months
                          hide-header
                          width="100%"
                          @update:model-value="handleDateSelected"
                        />
                      </v-card-text>
                      <v-card-actions class="justify-end pa-3">
                        <v-btn
                          color="grey"
                          variant="text"
                          size="small"
                          @click="clearAndClose"
                        >
                          Clear
                        </v-btn>
                        <v-btn
                          color="primary"
                          variant="text"
                          size="small"
                          @click="confirmAndClose"
                          :disabled="!selectedDate"
                        >
                          OK
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-menu>
                </v-col>
              </v-row>
            </div>
          </div>

          <!-- Date Preview -->
          <div v-if="selectedDate" class="mb-4">
            <v-chip
              color="primary"
              variant="tonal"
              size="small"
              prepend-icon="mdi-calendar-check"
            >
              {{ formatDatePreview(selectedDate) }}
            </v-chip>
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
import { useToast } from '~/composables/useToast';
import type { Evaluation, PostponeNominationRequest } from '~/types/global';

const props = defineProps<{
  dialog: boolean;
  nominationData?: Evaluation;
}>();

const emits = defineEmits(['toggle-dialog', 'evaluation-postponed']);

const nominationManagement = useNominationManagement();
const toast = useToast();
const form = ref();
const isFormValid = ref(false);
const loading = ref(false);

// Form data
const reason = ref('');
const selectedDate = ref<Date | null>(null);
const dateMenu = ref(false);

// Date validation rules
const dateValidationRules = [
  (v: string) => !!v || 'New evaluation date is required',
  (v: string) => {
    if (!selectedDate.value) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate.value);
    selected.setHours(0, 0, 0, 0);
    return selected >= today || 'Date cannot be in the past';
  }
];

// Computed property for date display (dd/mm/yyyy format)
const postponedToDisplay = computed(() => {
  if (!selectedDate.value) return '';
  return formatDateDisplay(selectedDate.value);
});

// Computed property for API format (yyyy-mm-dd)
const postponedToAPI = computed(() => {
  if (!selectedDate.value) return null;
  return formatDateAPI(selectedDate.value);
});

// Date picker constraints
const minDateForPicker = computed(() => {
  const today = new Date();
  return today;
});

const maxDateForPicker = computed(() => {
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 2); // Allow up to 2 years in future
  return maxDate;
});

// Date formatting functions
const formatDateDisplay = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDatePreview = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
};

// Date picker handlers
const openDatePicker = () => {
  dateMenu.value = true;
};

const handleDateSelected = (date: Date | null) => {
  selectedDate.value = date;
};

const handleMenuToggle = (isOpen: boolean) => {
  dateMenu.value = isOpen;
  // If menu is being closed and we have a selected date, no need to do anything
  // The date will remain selected and displayed
};

const confirmAndClose = () => {
  dateMenu.value = false;
};

const clearAndClose = () => {
  selectedDate.value = null;
  dateMenu.value = false;
};

const clearDate = () => {
  selectedDate.value = null;
};

// Initialize form
const initializeForm = () => {
  reason.value = '';
  selectedDate.value = null;
  dateMenu.value = false;
  isFormValid.value = false;
};

// Submit form
const submitForm = async () => {
  const { valid } = await form.value?.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const formData = {
      reason: reason.value,
      postponed_to: postponedToAPI.value,
    } as PostponeNominationRequest;

    if (props.nominationData) {
      const response = await nominationManagement.postponeNomination(props.nominationData.id.toString(), formData);
      toast.handleApiSuccess(response, 'Evaluation postponed successfully');
      emits('evaluation-postponed');
    }

    closeDialog();
  } catch (error) {
    console.error('Error postponing evaluation:', error);
    toast.handleApiError(error, 'Failed to postpone evaluation');
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

.date-picker-field {
  cursor: pointer;
}

.date-picker-card {
  min-width: 320px;
  max-width: 400px;
}

.date-picker-card .v-date-picker {
  box-shadow: none;
}

/* Ensure proper z-index for date picker */
:deep(.v-overlay--active) {
  z-index: 2001 !important;
}

/* Custom date picker styling */
:deep(.v-date-picker) {
  border-radius: 8px;
}

:deep(.v-date-picker-month) {
  padding: 8px;
}

:deep(.v-btn--variant-text) {
  color: rgba(var(--v-theme-primary));
}
</style>