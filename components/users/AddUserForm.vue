<template>
    <PermissionGuard module="users" action="create">
        <v-dialog
            v-model="dialogModel"
            max-width="600"
        >
            <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>Add New User</span>
                    <v-btn icon="mdi-close" variant="text" @click="toggleDialog"></v-btn>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12" sm="6">
                            <v-label class="font-weight-bold mb-1">Staff Number*</v-label>
                            <v-text-field
                                v-model="formData.staff_number"
                                density="compact"
                                variant="outlined"
                                :error-messages="formErrors.staff_number"
                                required
                                placeholder="Enter at least 8 alphanumeric characters"
                                @blur="validateStaffNumberOnBlur"
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
                                @blur="formData.name = formData.name?.trim()"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-label class="font-weight-bold mb-1">Role*</v-label>
                            <v-select
                                v-model="formData.role"
                                :items="roleItems"
                                density="compact"
                                variant="outlined"
                                :error-messages="formErrors.role"
                                :loading="enumsStore.loading"
                                required
                                @update:model-value="handleRoleChange"
                            ></v-select>
                        </v-col>
                         <v-col cols="12" sm="6">
                            <v-label class="font-weight-bold mb-1">Title<span v-if="formData.role !== 'OfficeAssistant'">*</span></v-label>
                            <v-select
                                v-model="formData.title"
                                :items="titleItems"
                                density="compact"
                                variant="outlined"
                                :error-messages="formErrors.title"
                                :loading="enumsStore.loading"
                                :required="formData.role !== 'OfficeAssistant'"
                                :disabled="formData.role === 'OfficeAssistant'"
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
                                :disabled="formData.role === 'OfficeAssistant'"
                            ></v-select>
                        </v-col>
                        <v-col cols="6">
                            <v-label class="font-weight-bold mb-1">Email*</v-label>
                            <v-text-field
                                v-model="formData.email"
                                type="email"
                                density="compact"
                                variant="outlined"
                                :error-messages="formErrors.email"
                                :rules="emailRules"
                                required
                                @blur="validateEmailOnBlur"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-label class="font-weight-bold mb-1">Phone</v-label>
                            <v-text-field
                                v-model="formData.phone"
                                density="compact"
                                variant="outlined"
                                :error-messages="formErrors.phone"
                                @blur="formData.phone = formData.phone?.trim()"
                            ></v-text-field>
                        </v-col>
                         <v-col cols="12" sm="6">
                            <v-label class="font-weight-bold mb-1">Specialization</v-label>
                            <v-text-field
                                v-model="formData.specialization"
                                density="compact"
                                variant="outlined"
                                :error-messages="formErrors.specialization"
                                @blur="formData.specialization = formData.specialization?.trim()"
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
                        module="users"
                        action="create"
                    >
                        Create User
                    </PermissionButton>
                    <v-btn @click="toggleDialog" :disabled="loading">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </PermissionGuard>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useUserManagement } from '~/composables/useUserManagement';
import { useEnumsStore } from '~/stores/enums';
import { useValidation } from '~/composables/useValidation';
import { useToast } from '~/composables/useToast';
import PermissionGuard from '~/components/shared/PermissionGuard.vue';
import PermissionButton from '~/components/shared/PermissionButton.vue';

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

const emits = defineEmits(['toggle-dialog', 'user-added']);

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
    staff_number: '',
    name: '',
    title: null as string | null,
    role: null as string | null,
    email: '',
    department: null as string | null,
    phone: '',
    specialization: '',
});

// Form validation
const formErrors = ref<Record<string, string>>({});
const loading = ref(false);

const emailRules = [
  (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'E-mail must be valid',
];

const titleItems = computed(() => enumsStore.getTitleOptions());
const departmentItems = computed(() => enumsStore.getDepartmentOptions());
const roleItems = computed(() => enumsStore.getRoleOptions());

const toggleDialog = () => {
    emits('toggle-dialog');
};

const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.value.staff_number) {
        errors.staff_number = 'Staff number is required';
    } else if (formData.value.staff_number.length < 8) {
        errors.staff_number = 'Staff number must be at least 8 characters';
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.value.staff_number)) {
        errors.staff_number = 'Staff number must be alphanumeric (letters and numbers only)';
    }
    
    if (!formData.value.name) errors.name = 'Name is required';
    if (formData.value.role !== 'OfficeAssistant' && !formData.value.title) errors.title = 'Title is required';
    if (!formData.value.role) errors.role = 'Role is required';
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
    if (!validateForm()) {
        return;
    }

    loading.value = true;

    try {
        const response = await userManagement.createUser(formData.value);
        toast.handleApiSuccess(response, 'User created successfully');
        
        emits('user-added');
        
        resetForm();
        toggleDialog();
    } catch (error: any) {
        // Handle API errors (e.g., validation)
        if (error.response && error.response.data && error.response.data.errors) {
            // Transform backend error format to match our form structure
            const backendErrors = error.response.data.errors;
            const transformedErrors: Record<string, string> = {};
            
            Object.keys(backendErrors).forEach(key => {
                if (Array.isArray(backendErrors[key])) {
                    transformedErrors[key] = backendErrors[key][0]; // Take first error message
                } else {
                    transformedErrors[key] = backendErrors[key];
                }
            });
            
            formErrors.value = transformedErrors;
        } else {
            console.error('Error creating user:', error);
            toast.handleApiError(error, 'Failed to create user');
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
        role: null,
        email: '',
        department: null,
        phone: '',
        specialization: '',
    };
    formErrors.value = {};
};

const handleRoleChange = () => {
    if (formData.value.role === 'OfficeAssistant') {
        formData.value.department = 'Other';
        formData.value.title = null;
    } else {
        if (formData.value.department === 'Other') {
            formData.value.department = null;
        }   
    }
};

const validateEmailOnBlur = () => {
    formData.value.email = formData.value.email?.trim();
    const emailValidation = validateEmail(formData.value.email);
    if (!emailValidation.valid) {
        formErrors.value.email = emailValidation.message;
    } else {
        // Clear email error if validation passes
        if (formErrors.value.email) {
            delete formErrors.value.email;
        }
    }
};

const validateStaffNumberOnBlur = () => {
    formData.value.staff_number = formData.value.staff_number?.trim();
    
    if (!formData.value.staff_number) {
        formErrors.value.staff_number = 'Staff number is required';
    } else if (formData.value.staff_number.length < 8) {
        formErrors.value.staff_number = 'Staff number must be at least 8 characters';
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.value.staff_number)) {
        formErrors.value.staff_number = 'Staff number must be alphanumeric (letters and numbers only)';
    } else {
        // Clear staff number error if validation passes
        if (formErrors.value.staff_number) {
            delete formErrors.value.staff_number;
        }
    }
};

watch(() => props.dialog, (newVal) => {
    if (!newVal) {
        resetForm();
    } else {
      if (!enumsStore.enumsData) {
        enumsStore.fetchEnums();
      }
    }
});

onMounted(() => {
  if (!enumsStore.enumsData) {
    enumsStore.fetchEnums();
  }
});
</script>

