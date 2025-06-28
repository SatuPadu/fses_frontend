<template>
    <v-dialog v-model="dialogModel" max-width="600">
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <span>Update Lecturer</span>
                <v-btn icon="mdi-close" variant="text" @click="toggleDialog"></v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-row dense>
                    <v-col cols="12" sm="6">
                        <v-label class="font-weight-bold mb-1">Staff Number</v-label>
                        <v-text-field
                            v-model="formData.staff_number"
                            density="compact"
                            variant="outlined"
                            :readonly="!isStaffNumberEditable"
                            :disabled="!isStaffNumberEditable"
                            :error-messages="formErrors.staff_number"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-label class="font-weight-bold mb-1">Full name*</v-label>
                        <v-text-field
                            v-model="formData.name"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.name"
                            required
                        ></v-text-field>
                    </v-col>
                     <v-col cols="12" sm="6">
                        <v-label class="font-weight-bold mb-1">Title*</v-label>
                        <v-select
                            v-model="formData.title"
                            :items="titleItems"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.title"
                            :loading="enumsStore.loading"
                            required
                        ></v-select>
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
                        <v-label class="font-weight-bold mb-1">Phone</v-label>
                        <v-text-field
                            v-model="formData.phone"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.phone"
                        ></v-text-field>
                    </v-col>
                     <v-col cols="12" sm="6">
                        <v-label class="font-weight-bold mb-1">Specialization</v-label>
                        <v-text-field
                            v-model="formData.specialization"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.specialization"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-label class="font-weight-bold mb-1">External Institution</v-label>
                        <v-text-field
                            v-model="formData.external_institution"
                            density="compact"
                            variant="outlined"
                            :error-messages="formErrors.external_institution"
                        ></v-text-field>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="justify-start">
                <PermissionButton
                    @click="handleSubmit" 
                    color="primary" 
                    variant="flat" 
                    :loading="loading"
                    module="lecturers"
                    action="edit"
                >
                    Update Lecturer
                </PermissionButton>
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
import type { Lecturer } from '~/types/global';
import PermissionButton from '~/components/shared/PermissionButton.vue';

const userManagement = useUserManagement();
const enumsStore = useEnumsStore();
const { validateEmail } = useValidation();
const toast = useToast();

const props = defineProps({
    dialog: {
        type: Boolean,
        default: false
    },
    lecturerInfo: {
        type: Object as () => Lecturer | null,
        default: null
    }
});

const emits = defineEmits(['toggle-dialog', 'lecturer-updated']);

const dialogModel = computed({
    get() {
        return props.dialog;
    },
    set() {
        toggleDialog();
    }
});

// Form data
const formData = ref({
    staff_number: '',
    name: '',
    title: null as string | null,
    email: '',
    department: null as string | null,
    phone: '',
    external_institution: '',
    specialization: '',
});

// Form validation
const formErrors = ref<Record<string, string>>({});
const loading = ref(false);

const titleItems = computed(() => enumsStore.getTitleOptions());
const departmentItems = computed(() => enumsStore.getDepartmentOptions());

// Track if staff number was empty when modal opened
const originalStaffNumber = ref('');

const isStaffNumberEditable = computed(() => !originalStaffNumber.value);

const toggleDialog = () => {
    emits('toggle-dialog');
};

const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.value.name) errors.name = 'Name is required';
    if (!formData.value.title) errors.title = 'Title is required';
    if (!formData.value.department) errors.department = 'Department is required';

    // Email validation
    const emailValidation = validateEmail(formData.value.email);
    if (!emailValidation.valid) {
        errors.email = emailValidation.message;
    }

    formErrors.value = errors;
    return Object.keys(errors).length === 0;
};

const handleSubmit = async () => {
    if (!validateForm() || !props.lecturerInfo) {
        return;
    }

    loading.value = true;
    formErrors.value = {};

    try {
        const response = await userManagement.updateLecturer(props.lecturerInfo.id.toString(), formData.value);
        toast.handleApiSuccess(response, 'Lecturer updated successfully');
        emits('lecturer-updated');
        toggleDialog();
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.errors) {
            formErrors.value = error.response.data.errors;
        } else {
            console.error('Error updating lecturer:', error);
            toast.handleApiError(error, 'Failed to update lecturer');
        }
    } finally {
        loading.value = false;
    }
};

const resetForm = () => {
    formData.value = {
        staff_number: '',
        name: '',
        title: null,
        email: '',
        department: null,
        phone: '',
        external_institution: '',
        specialization: '',
    };
    originalStaffNumber.value = '';
    formErrors.value = {};
};

watch(() => props.lecturerInfo, (newLecturerInfo) => {
    if (newLecturerInfo) {
        originalStaffNumber.value = newLecturerInfo.staff_number || '';
        formData.value = {
            staff_number: newLecturerInfo.staff_number || '',
            name: newLecturerInfo.name,
            title: newLecturerInfo.title,
            email: newLecturerInfo.email,
            department: newLecturerInfo.department,
            phone: newLecturerInfo.phone || '',
            external_institution: newLecturerInfo.external_institution || '',
            specialization: newLecturerInfo.specialization || '',
        };
    }
}, { immediate: true, deep: true });

watch(() => props.dialog, (newVal) => {
    if (newVal) {
        if (enumsStore.enumsData === null) {
            enumsStore.fetchEnums();
        }
    } else {
        resetForm();
    }
});

onMounted(() => {
    if (enumsStore.enumsData === null) {
        enumsStore.fetchEnums();
    }
});

</script>