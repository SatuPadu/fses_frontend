<template>
    <v-dialog
        v-model="dialogModel"
        max-width="600"
    >
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <span>Add New Program</span>
                <v-btn icon="mdi-close" variant="text" @click="toggleDialog"></v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-row dense>
                    <v-col cols="12">
                        <v-label class="font-weight-bold mb-1">Program Name*</v-label>
                        <v-text-field
                            v-model="formData.program_name"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.program_name"
                            required
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-label class="font-weight-bold mb-1">Program Code*</v-label>
                        <v-text-field
                            v-model="formData.program_code"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.program_code"
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
                        <v-label class="font-weight-bold mb-1">Total Semesters*</v-label>
                        <v-text-field
                            v-model="formData.total_semesters"
                            type="number"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.total_semesters"
                            required
                        ></v-text-field>
                    </v-col>
                     <v-col cols="12" sm="6">
                        <v-label class="font-weight-bold mb-1">Evaluation Semester*</v-label>
                        <v-text-field
                            v-model="formData.evaluation_semester"
                            type="number"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.evaluation_semester"
                            required
                        ></v-text-field>
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
                    Create Program
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

const emits = defineEmits(['toggle-dialog', 'program-added']);

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
    program_name: '',
    program_code: '',
    department: null as string | null,
    total_semesters: null as number | null,
    evaluation_semester: null as number | null,
});

// Form validation
const formErrors = ref<Record<string, string>>({});
const loading = ref(false);

const departmentItems = computed(() => enumsStore.getDepartmentOptions());

const toggleDialog = () => {
    emits('toggle-dialog');
};

const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.value.program_name) errors.program_name = 'Program name is required';
    if (!formData.value.program_code) errors.program_code = 'Program code is required';
    if (!formData.value.department) errors.department = 'Department is required';
    if (!formData.value.total_semesters) errors.total_semesters = 'Total semesters is required';
    if (!formData.value.evaluation_semester) errors.evaluation_semester = 'Evaluation semester is required';


    formErrors.value = errors;
    return Object.keys(errors).length === 0;
};

const handleSubmit = async () => {
    if (!validateForm()) {
        return;
    }

    loading.value = true;
    formErrors.value = {};

    try {
        await userManagement.createProgram(formData.value);
        emits('program-added');
        toggleDialog();
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.errors) {
            formErrors.value = error.response.data.errors;
        } else {
            console.error('Error creating program:', error);
        }
    } finally {
        loading.value = false;
    }
};

const resetForm = () => {
    formData.value = {
        program_name: '',
        program_code: '',
        department: null,
        total_semesters: null,
        evaluation_semester: null,
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
});
</script> 