<template>
    <v-dialog v-model="dialogModel" max-width="800">
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <span>Add New Student</span>
                <v-btn icon="mdi-close" variant="text" @click="toggleDialog"></v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-row dense>
                    <v-col cols="12" sm="6">
                        <v-label class="font-weight-bold mb-1">Matric Number*</v-label>
                        <v-text-field
                            v-model="formData.matric_number"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.matric_number"
                            required
                            @blur="formData.matric_number = formData.matric_number?.trim()"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-label class="font-weight-bold mb-1">Full Name*</v-label>
                        <v-text-field
                            v-model="formData.name"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.name"
                            required
                            @blur="formData.name = formData.name?.trim()"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-label class="font-weight-bold mb-1">Email*</v-label>
                        <v-text-field
                            v-model="formData.email"
                            type="email"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.email"
                            required
                            @blur="formData.email = formData.email?.trim()"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-label class="font-weight-bold mb-1">Department*</v-label>
                        <v-select
                            v-model="formData.department"
                            :items="departmentItems"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.department"
                            :loading="enumsStore.loading"
                            required
                            @update:model-value="handleDepartmentChange"
                        ></v-select>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-label class="font-weight-bold mb-1">Program*</v-label>
                        <v-select
                            v-model="formData.program_id"
                            :items="programs"
                            item-title="program_name"
                            item-value="id"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.program_id"
                            :loading="loadingPrograms"
                            required
                            :disabled="!formData.department"
                            @update:model-value="handleProgramChange"
                        ></v-select>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-label class="font-weight-bold mb-1">Current Semester*</v-label>
                        <v-select
                            v-model="formData.current_semester"
                            :items="semesterOptions"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.current_semester"
                            required
                            :disabled="!formData.program_id"
                            :loading="loading"
                        ></v-select>
                        <div v-if="formData.program_id && semesterOptions.length === 1" class="text-caption text-info mt-1">
                            <v-icon size="small" color="info" class="mr-1">mdi-information</v-icon>
                            Only semester {{ semesterOptions[0].value }} is eligible for First Stage Evaluation for this program.
                        </div>
                        <div v-else-if="formData.program_id && semesterOptions.length > 1" class="text-caption text-info mt-1">
                            <v-icon size="small" color="info" class="mr-1">mdi-information</v-icon>
                            Semesters {{ semesterOptions.map(s => s.value).join(', ') }} are eligible for First Stage Evaluation for this program.
                        </div>
                        <div v-else-if="formData.program_id" class="text-caption text-grey mt-1">
                            <v-icon size="small" color="grey" class="mr-1">mdi-information</v-icon>
                            Select the current semester for First Stage Evaluation eligibility.
                        </div>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-label class="font-weight-bold mb-1">Country</v-label>
                        <v-text-field
                            v-model="formData.country"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.country"
                            @blur="formData.country = formData.country?.trim()"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-label class="font-weight-bold mb-1">Research Supervisor*</v-label>
                        <v-select
                            v-model="formData.main_supervisor_id"
                            :items="supervisors"
                            item-title="displayName"
                            item-value="id"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.main_supervisor_id"
                            :loading="loadingSupervisors"
                            required
                            :disabled="!formData.department"
                            @update:model-value="handleSupervisorChange"
                        ></v-select>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-label class="font-weight-bold mb-1">Co-Supervisors</v-label>
                        <v-select
                            v-model="formData.co_supervisor_ids"
                            :items="coSupervisors"
                            item-title="displayName"
                            item-value="id"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.co_supervisor_ids"
                            :loading="loadingCoSupervisors"
                            multiple
                            chips
                            closable-chips
                            clearable
                            :disabled="!formData.main_supervisor_id"
                        ></v-select>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-label class="font-weight-bold mb-1">Evaluation Type*</v-label>
                        <v-select
                            v-model="formData.evaluation_type"
                            :items="evaluationTypeItems"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.evaluation_type"
                            :loading="enumsStore.loading"
                            required
                        ></v-select>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="justify-start">
                <v-btn 
                    @click="handleSubmit" 
                    color="primary" 
                    variant="flat" 
                    :loading="loading"
                >
                    Create Student
                </v-btn>
                <v-btn @click="toggleDialog" :disabled="loading">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useUserManagement } from '~/composables/useUserManagement';
import { useEnumsStore } from '~/stores/enums';
import { useValidation } from '~/composables/useValidation';
import { useToast } from '~/composables/useToast';

const userManagement = useUserManagement();
const enumsStore = useEnumsStore();
const { validateEmail } = useValidation();
const toast = useToast();

const props = defineProps({
    dialog: {
        type: Boolean,
        default: false
    }
});

const emits = defineEmits(['toggle-dialog', 'student-added']);

const dialogModel = computed({
    get() {
        return props.dialog
    },
    set() {
        toggleDialog()
    }
});

// Form data
const formData = ref({
    matric_number: '',
    name: '',
    email: '',
    program_id: null as number | null,
    current_semester: '',
    department: null as string | null,
    country: '',
    main_supervisor_id: null as number | null,
    evaluation_type: null as string | null,
    co_supervisor_ids: [] as number[],
});

// Form validation
const formErrors = ref<Record<string, string>>({});
const loading = ref(false);
const loadingSupervisors = ref(false);
const loadingCoSupervisors = ref(false);
const loadingPrograms = ref(false);

// Dynamic options
const departmentItems = computed(() => enumsStore.getDepartmentOptions());
const evaluationTypeItems = computed(() => enumsStore.getEvaluationTypeOptions());
const programs = ref<Array<{ id: number; program_name: string; total_semesters: number }>>([]);
const lecturers = ref<Array<{ user_id: number; name: string }>>([]);
const semesterOptions = ref<Array<{ title: string; value: string }>>([]);
const supervisors = ref<Array<{ id: number; name: string; title?: string; displayName: string }>>([]);
const coSupervisors = ref<Array<{ id: number; name: string; title?: string; displayName: string }>>([]);

const toggleDialog = () => {
    emits('toggle-dialog');
};

const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.value.matric_number) errors.matric_number = 'Matric number is required';
    if (!formData.value.name) errors.name = 'Name is required';
    if (!formData.value.program_id) errors.program_id = 'Program is required';
    if (!formData.value.current_semester) errors.current_semester = 'Current semester is required';
    if (!formData.value.department) errors.department = 'Department is required';
    if (!formData.value.main_supervisor_id) errors.main_supervisor_id = 'Main supervisor is required';
    if (!formData.value.evaluation_type) errors.evaluation_type = 'Evaluation type is required';

    // Email validation
    const emailValidation = validateEmail(formData.value.email);
    if (!emailValidation.valid) {
        errors.email = emailValidation.message;
    }

    formErrors.value = errors;
    return Object.keys(errors).length === 0;
};

const fetchOptions = async () => {
    try {
        const lecturersData = await userManagement.getAllLecturers();
        lecturers.value = lecturersData.map((lecturer: any) => ({
            ...lecturer,
            displayName: `${lecturer.title ? lecturer.title + ' ' : ''}${lecturer.name}`.trim()
        }));
    } catch (e: any) {
        console.error('Error fetching options:', e.message || 'Failed to fetch options');
        toast.error('Failed to fetch lecturers', 'Unable to load lecturer options');
    }
};

const handleProgramChange = async () => {
    // Reset dependent fields
    formData.value.current_semester = '';
    semesterOptions.value = [];
    
    try {
        const programId = formData.value.program_id;
        if (programId) {
            const selectedProgram = programs.value.find(p => p.id === programId);            
            if (selectedProgram) {
                // Determine semester constraints based on program type
                let eligibleSemesters: number[] = [];
                const programName = selectedProgram.program_name.toLowerCase();
                
                if (programName.includes('mphil') || programName.includes('master')) {
                    // MPhil students: Must be in 2nd semester (2/8)
                    eligibleSemesters = [3];
                } else if (programName.includes('dse') || programName.includes('software engineering') || programName.includes('doctor of software engineering')) {
                    // DSE students: Must be in 6th, 7th, or 8th semester (6/16, 7/16, 8/16)
                    eligibleSemesters = [6, 7, 8];
                } else if (programName.includes('phd') || (programName.includes('doctor') && !programName.includes('software'))) {
                    // PhD students: Must be in 3rd semester (3/16)
                    // Check for "doctor" but exclude "software" to avoid matching DSE
                    eligibleSemesters = [3];
                } else {
                    // Default: Allow all semesters if program type is not recognized
                    const totalSemesters = selectedProgram.total_semesters || 16;
                    eligibleSemesters = Array.from({ length: totalSemesters }, (_, i) => i + 1);
                }                        
                // Generate semester options based on eligibility
                semesterOptions.value = eligibleSemesters.map(semester => ({
                    title: `Semester ${semester}`,
                    value: semester.toString()
                }));
            }
        }
    } catch (e: any) {
        console.error('Error generating semester options:', e.message || 'Failed to generate semester options');
    }
};

const handleDepartmentChange = async () => {
    // Reset dependent fields
    formData.value.program_id = null;
    formData.value.current_semester = '';
    formData.value.main_supervisor_id = null;
    formData.value.co_supervisor_ids = [];
    programs.value = [];
    semesterOptions.value = [];
    supervisors.value = [];
    coSupervisors.value = [];
    
    try {
        const department = formData.value.department;
        if (department) {
            // Fetch programs for the selected department
            loadingPrograms.value = true;
            const programsData = await userManagement.getProgramsByDepartment(department);
            programs.value = programsData;
            
            // Fetch supervisors for the selected department
            loadingSupervisors.value = true;
            const supervisorData = await userManagement.getSupervisors(department);
            supervisors.value = supervisorData.map((supervisor: any) => ({
                ...supervisor,
                displayName: `${supervisor.title ? supervisor.title + ' ' : ''}${supervisor.name}`.trim()
            }));
        }
    } catch (e: any) {
        console.error('Error fetching department data:', e.message || 'Failed to fetch department data');
        toast.error('Failed to fetch department data', 'Unable to load programs and supervisors');
    } finally {
        loadingPrograms.value = false;
        loadingSupervisors.value = false;
    }
};

const handleSupervisorChange = async () => {
    // Reset dependent fields
    formData.value.co_supervisor_ids = [];
    coSupervisors.value = [];
    
    try {
        const supervisorId = formData.value.main_supervisor_id;
        if (supervisorId) {
            loadingCoSupervisors.value = true;
            const coSupervisorData = await userManagement.getCoSupervisors(supervisorId);
            coSupervisors.value = coSupervisorData.map((coSupervisor: any) => ({
                ...coSupervisor,
                displayName: `${coSupervisor.title ? coSupervisor.title + ' ' : ''}${coSupervisor.name}`.trim()
            }));
        }
    } catch (e: any) {
        console.error('Error fetching co-supervisor options:', e.message || 'Failed to fetch co-supervisor options');
        toast.error('Failed to fetch co-supervisors', 'Unable to load co-supervisor options');
    } finally {
        loadingCoSupervisors.value = false;
    }
};

const handleSubmit = async () => {
    if (!validateForm()) {
        return;
    }

    loading.value = true;
    formErrors.value = {};

    try {
        // Prepare the data for submission
        
        const submitData = {
            ...formData.value,
            co_supervisors: formData.value.co_supervisor_ids || []
        };
                
        const response = await userManagement.createStudent(submitData);
        toast.handleApiSuccess(response, 'Student created successfully');
        emits('student-added');
        toggleDialog();
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.errors) {
            formErrors.value = error.response.data.errors;
        } else {
            console.error('Error creating student:', error);
            toast.handleApiError(error, 'Failed to create student');
        }
    } finally {
        loading.value = false;
    }
};

const resetForm = () => {
    formData.value = {
        matric_number: '',
        name: '',
        email: '',
        program_id: null,
        current_semester: '',
        department: null,
        country: '',
        main_supervisor_id: null,
        evaluation_type: null,
        co_supervisor_ids: [],
    };
    formErrors.value = {};
    semesterOptions.value = [];
    supervisors.value = [];
    coSupervisors.value = [];
};

watch(() => props.dialog, (newVal) => {
    if (!newVal) {
        resetForm();
    } else {
        if (enumsStore.enumsData === null) {
            enumsStore.fetchEnums();
        }
        // Fetch options when dialog opens
        fetchOptions();
    }
});

onMounted(() => {
    if (enumsStore.enumsData === null) {
        enumsStore.fetchEnums();
    }
    fetchOptions();
});
</script> 