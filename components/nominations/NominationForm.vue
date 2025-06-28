<template>
  <v-dialog :model-value="dialog" @update:model-value="$emit('toggle-dialog')" max-width="800px">
    <v-card>
      <!-- Loading overlay -->
      <v-overlay
        :model-value="loadingModal"
        contained
        persistent
        class="align-center justify-center"
      >
        <v-progress-circular
          indeterminate
          size="64"
          color="primary"
        ></v-progress-circular>
        <div class="mt-4 text-center">
          <div class="text-body-1">Loading nomination data...</div>
          <div class="text-caption text-medium-emphasis">Please wait while we fetch the latest information</div>
        </div>
      </v-overlay>

      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ isEdit ? 'Edit Nomination' : 'Nominate Examiners' }}</span>
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
                <v-col cols="12">
                  <v-text-field
                    v-model="researchTitle"
                    label="Research Title"
                    variant="outlined"
                    density="compact"
                    :rules="[v => !!v || 'Research title is required']"
                    required
                    @blur="researchTitle = researchTitle?.trim()"
                  />
                </v-col>
              </v-row>
            </div>
          </div>

          <!-- Examiner Selection -->
          <div class="section-divider mb-4">
            <div class="text-h6 my-4">Examiner Selection</div>
            <div v-if="!loadingExaminerSuggestions && availableExaminers1.length === 0 && availableExaminers2.length === 0 && availableExaminers3.length === 0" class="text-warning mb-3">
              No examiner suggestions available for this student. Please contact the administrator.
            </div>
            <div>
              <v-row>
                <v-col cols="12" md="4">
                  <v-autocomplete
                    v-model="selectedExaminer1"
                    :items="availableExaminers1"
                    item-title="displayName"
                    item-value="id"
                    label="Examiner 1"
                    variant="outlined"
                    density="compact"
                    :loading="loadingExaminerSuggestions"
                    :disabled="availableExaminers1.length === 0"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-autocomplete
                    v-model="selectedExaminer2"
                    :items="availableExaminers2"
                    item-title="displayName"
                    item-value="id"
                    label="Examiner 2"
                    variant="outlined"
                    density="compact"
                    :loading="loadingExaminerSuggestions && !!selectedExaminer1"
                    :disabled="!isExaminer2Enabled"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-autocomplete
                    v-model="selectedExaminer3"
                    :items="availableExaminers3"
                    item-title="displayName"
                    item-value="id"
                    label="Examiner 3"
                    variant="outlined"
                    density="compact"
                    :loading="loadingExaminerSuggestions && !!selectedExaminer1 && !!selectedExaminer2"
                    :disabled="!isExaminer3Enabled"
                    clearable
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
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="`Semester ${nominationData?.student?.current_semester || '-'}`"
                    label="Semester"
                    variant="outlined"
                    density="compact"
                    readonly
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-combobox
                    v-model="academicYear"
                    :items="academicYearOptions"
                    item-title="title"
                    item-value="value"
                    label="Academic Year"
                    variant="outlined"
                    density="compact"
                    :rules="[v => !!v || 'Academic year is required']"
                    :loading="loadingAcademicYears"
                    required
                    clearable
                    @update:model-value="handleAcademicYearChange"
                    @blur="academicYear = academicYear?.trim()"
                  />
                </v-col>
              </v-row>
            </div>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-start">
        <v-btn
          color="primary"
          variant="flat"
          @click="submitForm"
          :loading="loading"
          :disabled="!isFormValid"
        >
          {{ isEdit ? 'Update Nomination' : 'Create Nomination' }}
        </v-btn>
        <v-btn color="secondary" variant="outlined" @click="closeDialog">
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, toRaw, onMounted, computed } from 'vue';
import { useNominationManagement } from '~/composables/useNominationManagement';
import type { Evaluation, Lecturer, Examiner } from '~/types/global';

const props = defineProps<{
  dialog: boolean;
  nominationData?: Evaluation;
  isEdit?: boolean;
}>();

const emits = defineEmits(['toggle-dialog', 'nomination-created', 'nomination-updated']);

const nominationManagement = useNominationManagement();
const form = ref();
const isFormValid = ref(false);
const loading = ref(false);

// Form data
const researchTitle = ref('');
const selectedExaminer1 = ref<number | null>(null);
const selectedExaminer2 = ref<number | null>(null);
const selectedExaminer3 = ref<number | null>(null);
const academicYear = ref<string>('');

// Available examiners
const availableExaminers = ref<Lecturer[]>([]);
const availableExaminers1 = ref<Examiner[]>([]);
const availableExaminers2 = ref<Examiner[]>([]);
const availableExaminers3 = ref<Examiner[]>([]);

// Loading states
const loadingExaminerSuggestions = ref(false);
const loadingAcademicYears = ref(false);
const loadingModal = ref(false);

// Options
const academicYearOptions = ref<Array<{ title: string; value: string }>>([]);

// Handle academic year change - add new option if it doesn't exist
const handleAcademicYearChange = (value: string) => {
  if (value && typeof value === 'string') {
    // Check if the value already exists in the options
    const existingOption = academicYearOptions.value.find(option => option.value === value);
    
    if (!existingOption) {
      // Add the new academic year to the options list
      academicYearOptions.value.push({
        title: value,
        value: value
      });
      
      // Sort the options to keep them organized
      academicYearOptions.value.sort((a, b) => a.value.localeCompare(b.value));
    }
  }
};

// Load examiner suggestions based on student ID
const loadExaminerSuggestions = async (studentId: number) => {
  loadingExaminerSuggestions.value = true;
  
  try {
    // Only load examiner 1 suggestions initially
    const examiner1Response = await nominationManagement.getExaminer1Suggestions(studentId);
    
    // Get current examiners from nomination data (for edit mode)
    const currentExaminer1 = props.nominationData?.examiner1;
    const currentExaminer2 = props.nominationData?.examiner2;
    const currentExaminer3 = props.nominationData?.examiner3;

    // Start with examiner 1 suggestions only
    let examiner1List = examiner1Response.data || [];

    // In edit mode, add current examiner 1 if not already in the list
    if (props.isEdit && currentExaminer1 && !examiner1List.find(e => e.id === currentExaminer1.id)) {
      const examiner1AsExaminer: Examiner = {
        id: currentExaminer1.id,
        name: currentExaminer1.name,
        email: currentExaminer1.email,
        title: currentExaminer1.title,
        phone: currentExaminer1.phone || undefined,
        department: currentExaminer1.department || '',
        is_from_fai: currentExaminer1.is_from_fai,
        external_institution: currentExaminer1.external_institution || undefined,
        specialization: currentExaminer1.specialization || undefined
      };
      examiner1List = [examiner1AsExaminer, ...examiner1List];
    }

    availableExaminers1.value = addDisplayName(examiner1List);
    
    // Initialize examiner 2 and 3 as empty (will be loaded when examiner 1 is selected)
    availableExaminers2.value = [];
    availableExaminers3.value = [];

    // If in edit mode and we have current examiners, load them sequentially
    if (props.isEdit) {
      if (currentExaminer1) {
        // Load examiner 2 suggestions based on examiner 1
        await loadExaminer2Suggestions(studentId, currentExaminer1.id);
        
        if (currentExaminer2) {
          // Load examiner 3 suggestions based on examiner 1 and 2
          await loadExaminer3Suggestions(studentId, currentExaminer1.id, currentExaminer2.id);
        }
      }
    }

  } catch (error) {
    console.error('Error loading examiner suggestions:', error);
    // If suggestions fail, set empty arrays
    availableExaminers1.value = [];
    availableExaminers2.value = [];
    availableExaminers3.value = [];
    availableExaminers.value = [];
  } finally {
    loadingExaminerSuggestions.value = false;
  }
};

// Load examiner 2 suggestions based on examiner 1
const loadExaminer2Suggestions = async (studentId: number, examiner1Id: number) => {
  try {
    const examiner2Response = await nominationManagement.getExaminer2Suggestions(studentId);
    let examiner2List = examiner2Response.data || [];
    
    // Filter out examiner 1 from examiner 2 list
    examiner2List = examiner2List.filter(e => e.id !== examiner1Id);
    
    // In edit mode, add current examiner 2 if not already in the list
    const currentExaminer2 = props.nominationData?.examiner2;
    if (props.isEdit && currentExaminer2 && !examiner2List.find(e => e.id === currentExaminer2.id)) {
      const examiner2AsExaminer: Examiner = {
        id: currentExaminer2.id,
        name: currentExaminer2.name,
        email: currentExaminer2.email,
        title: currentExaminer2.title,
        phone: currentExaminer2.phone || undefined,
        department: currentExaminer2.department || '',
        is_from_fai: currentExaminer2.is_from_fai,
        external_institution: currentExaminer2.external_institution || undefined,
        specialization: currentExaminer2.specialization || undefined
      };
      examiner2List = [examiner2AsExaminer, ...examiner2List];
    }
    
    availableExaminers2.value = addDisplayName(examiner2List);
  } catch (error) {
    console.error('Error loading examiner 2 suggestions:', error);
    availableExaminers2.value = [];
  }
};

// Load examiner 3 suggestions based on examiner 1 and 2
const loadExaminer3Suggestions = async (studentId: number, examiner1Id: number, examiner2Id: number) => {
  try {
    const examiner3Response = await nominationManagement.getExaminer3Suggestions(studentId);
    let examiner3List = examiner3Response.data || [];
    
    // Filter out examiner 1 and 2 from examiner 3 list
    examiner3List = examiner3List.filter(e => e.id !== examiner1Id && e.id !== examiner2Id);
    
    // In edit mode, add current examiner 3 if not already in the list
    const currentExaminer3 = props.nominationData?.examiner3;
    if (props.isEdit && currentExaminer3 && !examiner3List.find(e => e.id === currentExaminer3.id)) {
      const examiner3AsExaminer: Examiner = {
        id: currentExaminer3.id,
        name: currentExaminer3.name,
        email: currentExaminer3.email,
        title: currentExaminer3.title,
        phone: currentExaminer3.phone || undefined,
        department: currentExaminer3.department || '',
        is_from_fai: currentExaminer3.is_from_fai,
        external_institution: currentExaminer3.external_institution || undefined,
        specialization: currentExaminer3.specialization || undefined
      };
      examiner3List = [examiner3AsExaminer, ...examiner3List];
    }
    
    availableExaminers3.value = addDisplayName(examiner3List);
  } catch (error) {
    console.error('Error loading examiner 3 suggestions:', error);
    availableExaminers3.value = [];
  }
};

// Add displayName property to examiner arrays
const addDisplayName = (examiners: Examiner[]) => {
  return examiners.map(examiner => ({
    ...examiner,
    displayName: `${examiner.title || ''} ${examiner.name}`.trim()
  }));
};

// Load academic years from API
const loadAcademicYears = async () => {
  loadingAcademicYears.value = true;
  
  try {
    const response = await nominationManagement.getAcademicYears();
    
    if (response.data && Array.isArray(response.data)) {
      academicYearOptions.value = response.data.map((year: string) => ({
        title: year,
        value: year
      }));
    } else {
      academicYearOptions.value = [];
    }
  } catch (error) {
    // Fallback to empty array
    academicYearOptions.value = [];
  } finally {
    loadingAcademicYears.value = false;
  }
};

// Initialize form - improved version with proxy handling
const initializeForm = async () => {
  // Reset form first
  researchTitle.value = '';
  selectedExaminer1.value = null;
  selectedExaminer2.value = null;
  selectedExaminer3.value = null;
  academicYear.value = '';

  // If data exists (either editing or creating new), populate form
  if (props.nominationData) {
    // Wait for next tick to ensure examiners are loaded
    await nextTick();
    
    // Add a small delay to ensure data is fully loaded
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Convert proxy to raw object to access nested properties properly
    const rawData = toRaw(props.nominationData);
    
    
    // Always populate student data if available
    researchTitle.value = rawData.student?.research_title || '';
    
    // Fallback: if research title is empty, try to get it from other possible sources
    if (!researchTitle.value && rawData.student) {
      // Try different possible field names
      const possibleFields = [
        'research_title',
        'researchTitle', 
        'title',
        'thesis_title',
        'thesisTitle'
      ];
      
      for (const field of possibleFields) {
        const value = (rawData.student as any)[field];
        if (value) {
          researchTitle.value = value;
          break;
        }
      }
    }
    
    // Only populate examiner and evaluation data if editing
    if (props.isEdit) {
      selectedExaminer1.value = rawData.examiner1?.id || null;
      selectedExaminer2.value = rawData.examiner2?.id || null;
      selectedExaminer3.value = rawData.examiner3?.id || null;
      academicYear.value = rawData.academic_year || '';
    }
    
  }
};

// Submit form
const submitForm = async () => {
  if (!form.value?.validate()) return;

  loading.value = true;
  try {
    const formData = {
      student_id: props.nominationData?.student?.id || 0,
      semester: Number(props.nominationData?.student?.current_semester) || 0,
      academic_year: (academicYear.value as any)?.value || academicYear.value || '',
      examiner1_id: selectedExaminer1.value || undefined,
      examiner2_id: selectedExaminer2.value || undefined,
      examiner3_id: selectedExaminer3.value || undefined,
    };

    if (props.isEdit && props.nominationData) {
      await nominationManagement.updateNomination(props.nominationData.id.toString(), formData);
      emits('nomination-updated');
    } else {
      await nominationManagement.createNomination(formData);
      emits('nomination-created');
    }

    closeDialog();
  } catch (error) {
    console.error('Error submitting nomination:', error);
  } finally {
    loading.value = false;
  }
};

// Close dialog
const closeDialog = () => {
  emits('toggle-dialog');
};

// Watch for dialog changes - improved version
watch(() => props.dialog, async (newValue) => {
  if (newValue) {
    
    // Start modal loading
    loadingModal.value = true;
    
    try {
      // Always load academic years first (for both create and edit)
      await loadAcademicYears();
      
      // Get student ID from either student object or student_id field
      const studentId = props.nominationData?.student?.id || props.nominationData?.student_id;
      
      // Always load examiner suggestions if we have student data (for both create and edit)
      if (studentId) {
        await loadExaminerSuggestions(studentId);
      } else {
        // If no student data, set empty arrays
        availableExaminers1.value = [];
        availableExaminers2.value = [];
        availableExaminers3.value = [];
        availableExaminers.value = [];
      }
      // Wait a bit more to ensure everything is ready
      await new Promise(resolve => setTimeout(resolve, 200));
      // Then initialize the form
      await initializeForm();
    } finally {
      // End modal loading
      loadingModal.value = false;
    }
  }
});

// Watch for nomination data changes - load APIs when data changes
watch(
  () => props.nominationData,
  async (newData, oldData) => {
    if (props.dialog && newData && newData !== oldData) {
      
      // Start modal loading
      loadingModal.value = true;
      
      try {
        // Load APIs when nomination data changes (for edit scenario)
        await loadAcademicYears();
        
        const studentId = newData?.student?.id || newData?.student_id;
        if (studentId) {
          await loadExaminerSuggestions(studentId);
        }
        
        // Initialize form with new data
        await initializeForm();
      } finally {
        // End modal loading
        loadingModal.value = false;
      }
    }
  },
  { deep: true }
);

// Watch for nomination data changes - only re-initialize form, don't reload APIs
watch(
  () => [props.nominationData, props.isEdit],
  async ([newNominationData, newIsEdit], [oldNominationData, oldIsEdit]) => {
    if (props.dialog && (newNominationData !== oldNominationData || newIsEdit !== oldIsEdit)) {
      // Wait a bit to ensure data is fully reactive
      await new Promise(resolve => setTimeout(resolve, 100));
      // Re-initialize form when data changes
      await initializeForm();
    }
  },
  { deep: true }
);

// Watch for examiner 1 changes
watch(selectedExaminer1, async (newExaminer1Id, oldExaminer1Id) => {
  if (newExaminer1Id !== oldExaminer1Id) {
    // Reset examiner 2 and 3 when examiner 1 changes
    selectedExaminer2.value = null;
    selectedExaminer3.value = null;
    availableExaminers2.value = [];
    availableExaminers3.value = [];
    
    // Load examiner 2 suggestions if examiner 1 is selected
    if (newExaminer1Id && props.nominationData?.student?.id) {
      await loadExaminer2Suggestions(props.nominationData.student.id, newExaminer1Id);
    }
  }
});

// Watch for examiner 2 changes
watch(selectedExaminer2, async (newExaminer2Id, oldExaminer2Id) => {
  if (newExaminer2Id !== oldExaminer2Id) {
    // Reset examiner 3 when examiner 2 changes
    selectedExaminer3.value = null;
    availableExaminers3.value = [];
    
    // Load examiner 3 suggestions if both examiner 1 and 2 are selected
    if (newExaminer2Id && selectedExaminer1.value && props.nominationData?.student?.id) {
      await loadExaminer3Suggestions(props.nominationData.student.id, selectedExaminer1.value, newExaminer2Id);
    }
  }
});

// Computed properties for field states
const isExaminer2Enabled = computed(() => {
  return selectedExaminer1.value !== null && availableExaminers2.value.length > 0;
});

const isExaminer3Enabled = computed(() => {
  return selectedExaminer1.value !== null && selectedExaminer2.value !== null && availableExaminers3.value.length > 0;
});

// OnMounted hook to ensure APIs are loaded when the component is first created
onMounted(async () => {
  if (props.dialog) {
    // Start modal loading
    loadingModal.value = true;
    
    try {
      // Always load academic years first (for both create and edit)
      await loadAcademicYears();
      
      // Get student ID from either student object or student_id field
      const studentId = props.nominationData?.student?.id || props.nominationData?.student_id;
      
      // Always load examiner suggestions if we have student data (for both create and edit)
      if (studentId) {
        await loadExaminerSuggestions(studentId);
      } else {
        // If no student data, set empty arrays
        availableExaminers1.value = [];
        availableExaminers2.value = [];
        availableExaminers3.value = [];
        availableExaminers.value = [];
      }
      // Wait a bit more to ensure everything is ready
      await new Promise(resolve => setTimeout(resolve, 200));
      // Then initialize the form
      await initializeForm();
    } finally {
      // End modal loading
      loadingModal.value = false;
    }
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