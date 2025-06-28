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
                  >
                    <template #append-item>
                      <v-list-item class="sticky-add-new" @click.stop="handleAddLecturerClick(1)">
                        <v-btn color="primary" block variant="tonal">
                          <v-icon left>mdi-plus</v-icon>
                          Add New Examiner
                        </v-btn>
                      </v-list-item>
                    </template>
                  </v-autocomplete>
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
                    :loading="loadingExaminer2"
                    :disabled="!isExaminer2Enabled"
                    clearable
                  >
                    <template #append-item>
                      <v-list-item class="sticky-add-new" @click.stop="handleAddLecturerClick(2)">
                        <v-btn color="primary" block variant="tonal">
                          <v-icon left>mdi-plus</v-icon>
                          Add New Examiner
                        </v-btn>
                      </v-list-item>
                    </template>
                  </v-autocomplete>
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
                    :loading="loadingExaminer3"
                    :disabled="!isExaminer3Enabled"
                    clearable
                  >
                    <template #append-item>
                      <v-list-item class="sticky-add-new" @click.stop="handleAddLecturerClick(3)">
                        <v-btn color="primary" block variant="tonal">
                          <v-icon left>mdi-plus</v-icon>
                          Add New Examiner
                        </v-btn>
                      </v-list-item>
                    </template>
                  </v-autocomplete>
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

      <AddLecturerForm
        :dialog="showAddLecturerDialog"
        :title="addLecturerTarget === 1 ? 'Add New Examiner 1' : addLecturerTarget === 2 ? 'Add New Examiner 2' : 'Add New Examiner 3'"
        @toggle-dialog="showAddLecturerDialog = false"
        @lecturer-added="handleLecturerAdded"
      />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, toRaw, computed } from 'vue';
import { useNominationManagement } from '~/composables/useNominationManagement';
import { useUserManagement } from '~/composables/useUserManagement';
import { useToast } from '~/composables/useToast';
import type { Evaluation, Lecturer, Examiner } from '~/types/global';
import AddLecturerForm from '~/components/lecturers/AddLecturerForm.vue';

const props = defineProps<{
  dialog: boolean;
  nominationData?: Evaluation;
  isEdit?: boolean;
}>();

const emits = defineEmits(['toggle-dialog', 'nomination-created', 'nomination-updated']);

const nominationManagement = useNominationManagement();
const userManagement = useUserManagement();
const toast = useToast();
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

// Loading states - separate loading for each examiner level
const loadingExaminerSuggestions = ref(false);
const loadingExaminer2 = ref(false);
const loadingExaminer3 = ref(false);
const loadingAcademicYears = ref(false);
const loadingModal = ref(false);

// Options
const academicYearOptions = ref<Array<{ title: string; value: string }>>([]);

// Add New Lecturer modal state
const showAddLecturerDialog = ref(false);
const addLecturerTarget = ref<1 | 2 | 3 | null>(null);

// Flag to prevent watchers from running during initialization
const isInitializing = ref(false);

// Store current examiner selections during edit mode
const currentExaminerSelections = ref<{
  examiner1?: number;
  examiner2?: number;
  examiner3?: number;
}>({});

// Handle academic year change - add new option if it doesn't exist
const handleAcademicYearChange = (value: string) => {
  if (value && typeof value === 'string') {
    const existingOption = academicYearOptions.value.find(option => option.value === value);
    
    if (!existingOption) {
      academicYearOptions.value.push({
        title: value,
        value: value
      });
      academicYearOptions.value.sort((a, b) => a.value.localeCompare(b.value));
    }
  }
};

// Load examiner suggestions based on student ID
const loadExaminerSuggestions = async (studentId: number) => {
  loadingExaminerSuggestions.value = true;
  
  try {
    // Load examiner 1 suggestions
    const examiner1Response = await nominationManagement.getExaminer1Suggestions(studentId);
    let examiner1List = examiner1Response.data || [];

    // In edit mode, preserve current examiner 1 if it exists
    if (props.isEdit && props.nominationData?.examiner1) {
      const currentExaminer1 = props.nominationData.examiner1;
      currentExaminerSelections.value.examiner1 = currentExaminer1.id;
      
      if (!examiner1List.find(e => e.id === currentExaminer1.id)) {
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
    }

    availableExaminers1.value = addDisplayName(examiner1List);
    
    // Set examiner 1 selection if in edit mode
    if (currentExaminerSelections.value.examiner1) {
      selectedExaminer1.value = currentExaminerSelections.value.examiner1;
    }

  } catch (error) {
    console.error('Error loading examiner suggestions:', error);
    toast.handleApiError(error, 'Failed to load examiner suggestions');
    availableExaminers1.value = [];
  } finally {
    loadingExaminerSuggestions.value = false;
  }
};

// Load examiner 2 suggestions based on examiner 1
const loadExaminer2Suggestions = async (studentId: number, examiner1Id: number) => {
  loadingExaminer2.value = true;
  
  try {
    const examiner2Response = await nominationManagement.getExaminer2Suggestions(studentId);
    let examiner2List = examiner2Response.data || [];
    
    // Filter out examiner 1 from examiner 2 list
    examiner2List = examiner2List.filter(e => e.id !== examiner1Id);
    
    // In edit mode, preserve current examiner 2 if it exists
    if (props.isEdit && props.nominationData?.examiner2) {
      const currentExaminer2 = props.nominationData.examiner2;
      currentExaminerSelections.value.examiner2 = currentExaminer2.id;
      
      if (!examiner2List.find(e => e.id === currentExaminer2.id)) {
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
    }
    
    availableExaminers2.value = addDisplayName(examiner2List);
    
    // Set examiner 2 selection if in edit mode
    if (currentExaminerSelections.value.examiner2) {
      selectedExaminer2.value = currentExaminerSelections.value.examiner2;
    }
    
  } catch (error) {
    console.error('Error loading examiner 2 suggestions:', error);
    toast.handleApiError(error, 'Failed to load examiner 2 suggestions');
    availableExaminers2.value = [];
  } finally {
    loadingExaminer2.value = false;
  }
};

// Load examiner 3 suggestions based on examiner 1 and 2
const loadExaminer3Suggestions = async (studentId: number, examiner1Id: number, examiner2Id: number) => {
  loadingExaminer3.value = true;
  
  try {
    const examiner3Response = await nominationManagement.getExaminer3Suggestions(studentId);
    let examiner3List = examiner3Response.data || [];
    
    // Filter out examiner 1 and 2 from examiner 3 list
    examiner3List = examiner3List.filter(e => e.id !== examiner1Id && e.id !== examiner2Id);
    
    // In edit mode, preserve current examiner 3 if it exists
    if (props.isEdit && props.nominationData?.examiner3) {
      const currentExaminer3 = props.nominationData.examiner3;
      currentExaminerSelections.value.examiner3 = currentExaminer3.id;
      
      if (!examiner3List.find(e => e.id === currentExaminer3.id)) {
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
    }
    
    availableExaminers3.value = addDisplayName(examiner3List);
    
    // Set examiner 3 selection if in edit mode
    if (currentExaminerSelections.value.examiner3) {
      selectedExaminer3.value = currentExaminerSelections.value.examiner3;
    }
    
  } catch (error) {
    console.error('Error loading examiner 3 suggestions:', error);
    toast.handleApiError(error, 'Failed to load examiner 3 suggestions');
    availableExaminers3.value = [];
  } finally {
    loadingExaminer3.value = false;
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
    toast.handleApiError(error, 'Failed to load academic years');
    academicYearOptions.value = [];
  } finally {
    loadingAcademicYears.value = false;
  }
};

// Initialize form data
const initializeFormData = () => {
  if (props.nominationData) {
    const rawData = toRaw(props.nominationData);
    
    // Initialize form fields
    researchTitle.value = rawData.student?.research_title || '';
    
    if (!researchTitle.value && rawData.student) {
      const possibleFields = ['research_title', 'researchTitle', 'title', 'thesis_title', 'thesisTitle'];
      for (const field of possibleFields) {
        const value = (rawData.student as any)[field];
        if (value) {
          researchTitle.value = value;
          break;
        }
      }
    }
    
    if (props.isEdit) {
      academicYear.value = rawData.academic_year || '';
    }
  }
};

// Initialize examiner selections for edit mode
const initializeExaminerSelections = () => {
  if (props.isEdit && props.nominationData) {
    currentExaminerSelections.value = {
      examiner1: props.nominationData.examiner1?.id,
      examiner2: props.nominationData.examiner2?.id,
      examiner3: props.nominationData.examiner3?.id
    };
  } else {
    currentExaminerSelections.value = {};
  }
};

// Load all data sequentially for edit mode
const loadEditModeData = async (studentId: number) => {
  try {
    // Load examiner 1 suggestions first
    await loadExaminerSuggestions(studentId);
    
    // If we have examiner 1 selection, load examiner 2
    if (currentExaminerSelections.value.examiner1) {
      await loadExaminer2Suggestions(studentId, currentExaminerSelections.value.examiner1);
      
      // If we have examiner 2 selection, load examiner 3
      if (currentExaminerSelections.value.examiner2) {
        await loadExaminer3Suggestions(studentId, currentExaminerSelections.value.examiner1, currentExaminerSelections.value.examiner2);
      }
    }
  } catch (error) {
    console.error('Error loading edit mode data:', error);
    toast.handleApiError(error, 'Failed to load nomination data');
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
      research_title: researchTitle.value?.trim() || '',
      examiner1_id: selectedExaminer1.value || undefined,
      examiner2_id: selectedExaminer2.value || undefined,
      examiner3_id: selectedExaminer3.value || undefined,
    };

    if (props.isEdit && props.nominationData) {
      const response = await nominationManagement.updateNomination(props.nominationData.id.toString(), formData);
      toast.handleApiSuccess(response, 'Nomination updated successfully');
      emits('nomination-updated');
    } else {
      const response = await nominationManagement.createNomination(formData);
      toast.handleApiSuccess(response, 'Nomination created successfully');
      emits('nomination-created');
    }

    closeDialog();
  } catch (error) {
    console.error('Error submitting nomination:', error);
    toast.handleApiError(error, 'Failed to submit nomination');
  } finally {
    loading.value = false;
  }
};

// Close dialog and reset form
const closeDialog = () => {
  // Reset all form data
  researchTitle.value = '';
  selectedExaminer1.value = null;
  selectedExaminer2.value = null;
  selectedExaminer3.value = null;
  academicYear.value = '';
  currentExaminerSelections.value = {};
  
  // Reset examiner lists
  availableExaminers1.value = [];
  availableExaminers2.value = [];
  availableExaminers3.value = [];
  
  emits('toggle-dialog');
};

// Watch for dialog changes
watch(() => props.dialog, async (newValue) => {
  if (newValue) {
    isInitializing.value = true;
    loadingModal.value = true;
    
    try {
      // Initialize examiner selections first
      initializeExaminerSelections();
      
      // Load academic years
      await loadAcademicYears();
      
      // Initialize form data
      initializeFormData();
      
      // Get student ID
      const studentId = props.nominationData?.student?.id || props.nominationData?.student_id;
      
      if (studentId) {
        if (props.isEdit) {
          // For edit mode, load all examiner data sequentially
          await loadEditModeData(studentId);
        } else {
          // For create mode, just load examiner 1 suggestions
          await loadExaminerSuggestions(studentId);
        }
      }
      
    } finally {
      loadingModal.value = false;
      isInitializing.value = false;
    }
  }
});

// Watch for examiner 1 changes (only for create mode or manual changes)
watch(selectedExaminer1, async (newExaminer1Id, oldExaminer1Id) => {
  if (isInitializing.value) return;
  
  if (newExaminer1Id !== oldExaminer1Id && newExaminer1Id) {
    // Only reset if this is a manual change (not during initialization)
    if (!props.isEdit || newExaminer1Id !== currentExaminerSelections.value.examiner1) {
      selectedExaminer2.value = null;
      selectedExaminer3.value = null;
      availableExaminers2.value = [];
      availableExaminers3.value = [];
    }
    
    if (props.nominationData?.student?.id) {
      await loadExaminer2Suggestions(props.nominationData.student.id, newExaminer1Id);
    }
  }
});

// Watch for examiner 2 changes (only for create mode or manual changes)
watch(selectedExaminer2, async (newExaminer2Id, oldExaminer2Id) => {
  if (isInitializing.value) return;
  
  if (newExaminer2Id !== oldExaminer2Id && newExaminer2Id && selectedExaminer1.value) {
    // Only reset if this is a manual change (not during initialization)
    if (!props.isEdit || newExaminer2Id !== currentExaminerSelections.value.examiner2) {
      selectedExaminer3.value = null;
      availableExaminers3.value = [];
    }
    
    if (props.nominationData?.student?.id) {
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

// Handle add lecturer functionality
const handleAddLecturerClick = (slot: 1 | 2 | 3) => {
  addLecturerTarget.value = slot;
  showAddLecturerDialog.value = true;
};

const handleLecturerAdded = async (lecturerData: any) => {
  try {
    const newLecturer = lecturerData;
    
    const examinerObj = {
      ...newLecturer,
      id: newLecturer.id,
      displayName: `${newLecturer.title || ''} ${newLecturer.name}`.trim()
    };
    
    if (addLecturerTarget.value === 1) {
      availableExaminers1.value.unshift(examinerObj);
      selectedExaminer1.value = newLecturer.id;
    } else if (addLecturerTarget.value === 2) {
      availableExaminers2.value.unshift(examinerObj);
      selectedExaminer2.value = newLecturer.id;
    } else if (addLecturerTarget.value === 3) {
      availableExaminers3.value.unshift(examinerObj);
      selectedExaminer3.value = newLecturer.id;
    }
    
    showAddLecturerDialog.value = false;
    addLecturerTarget.value = null;
    
    toast.success('Lecturer Added', `${newLecturer.name} has been added as an examiner`);
  } catch (error) {
    console.error('Error creating lecturer:', error);
    toast.handleApiError(error, 'Failed to add lecturer');
  }
};
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
.sticky-add-new {
  position: sticky;
  bottom: 0;
  background: #fff;
  z-index: 2;
  border-top: 1px solid #eee;
}
</style>