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
                        ></v-text-field>
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
                            :loading="loading"
                            required
                        ></v-select>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-label class="font-weight-bold mb-1">Current Semester*</v-label>
                        <v-text-field
                            v-model="formData.current_semester"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.current_semester"
                            required
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
                        ></v-select>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-label class="font-weight-bold mb-1">Country</v-label>
                        <v-text-field
                            v-model="formData.country"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.country"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-label class="font-weight-bold mb-1">Main Supervisor*</v-label>
                        <v-select
                            v-model="formData.main_supervisor_id"
                            :items="lecturers"
                            item-title="displayName"
                            item-value="id"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.main_supervisor_id"
                            :loading="loading"
                            required
                        ></v-select>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-label class="font-weight-bold mb-1">Co-Supervisors</v-label>
                        <v-select
                            v-model="formData.co_supervisor_ids"
                            :items="lecturers"
                            item-title="displayName"
                            item-value="id"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.co_supervisor_ids"
                            :loading="loading"
                            multiple
                            chips
                            closable-chips
                            clearable
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

const userManagement = useUserManagement();
const enumsStore = useEnumsStore();

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

// Dynamic options
const departmentItems = computed(() => enumsStore.getDepartmentOptions());
const evaluationTypeItems = computed(() => enumsStore.getEvaluationTypeOptions());
const programs = ref<Array<{ id: number; program_name: string }>>([]);
const lecturers = ref<Array<{ user_id: number; name: string }>>([]);

const toggleDialog = () => {
    emits('toggle-dialog');
};

const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.value.matric_number) errors.matric_number = 'Matric number is required';
    if (!formData.value.name) errors.name = 'Name is required';
    if (!formData.value.email) errors.email = 'Email is required';
    if (!formData.value.program_id) errors.program_id = 'Program is required';
    if (!formData.value.current_semester) errors.current_semester = 'Current semester is required';
    if (!formData.value.department) errors.department = 'Department is required';
    if (!formData.value.main_supervisor_id) errors.main_supervisor_id = 'Main supervisor is required';
    if (!formData.value.evaluation_type) errors.evaluation_type = 'Evaluation type is required';

    formErrors.value = errors;
    return Object.keys(errors).length === 0;
};

const fetchOptions = async () => {
    try {
        const [programsData, lecturersData] = await Promise.all([
            userManagement.getAllPrograms(),
            userManagement.getAllLecturers()
        ]);
        
        programs.value = programsData;
        lecturers.value = lecturersData.map((lecturer: any) => ({
            ...lecturer,
            displayName: `${lecturer.title ? lecturer.title + ' ' : ''}${lecturer.name}`.trim()
        }));
    } catch (e: any) {
        console.error('Error fetching options:', e.message || 'Failed to fetch options');
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

        console.log('Submitting student data:', submitData);
        
        await userManagement.createStudent(submitData);
        emits('student-added');
        toggleDialog();
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.errors) {
            formErrors.value = error.response.data.errors;
        } else {
            console.error('Error creating student:', error);
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
};

watch(() => props.dialog, (newVal) => {
    if (!newVal) {
        resetForm();
    } else if (enumsStore.enumsData === null) {
        enumsStore.fetchEnums();
    }
});

onMounted(() => {
    if (enumsStore.enumsData === null) {
        enumsStore.fetchEnums();
    }
    fetchOptions();
});
</script> 