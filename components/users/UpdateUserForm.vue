<template>
    <PermissionGuard module="users" action="edit">
        <v-dialog
            v-model="dialogModel"
            max-width="600"
        >
            <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>Update User</span>
                    <v-btn icon="mdi-close" variant="text" @click="toggleDialog"></v-btn>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12" sm="6">
                            <v-label class="font-weight-bold mb-1">Staff Number</v-label>
                            <v-text-field
                                :model-value="staffNumber"
                                density="compact"
                                variant="outlined"
                                readonly
                                disabled
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
                            <v-label class="font-weight-bold mb-1">Roles*</v-label>
                            <v-autocomplete
                                v-model="formData.roles"
                                :items="roleItems"
                                density="compact"
                                variant="outlined"
                                :error-messages="formErrors.roles"
                                :loading="enumsStore.loading"
                                required
                                multiple
                                chips
                                closable-chips
                                @update:model-value="handleRolesChange"
                            ></v-autocomplete>
                        </v-col>
                         <v-col cols="12" sm="6">
                            <v-label class="font-weight-bold mb-1">Title<span v-if="formData.roles.length !== 1 || !formData.roles.includes('OfficeAssistant')">*</span></v-label>
                            <v-select
                                v-model="formData.title"
                                :items="titleItems"
                                density="compact"
                                variant="outlined"
                                :error-messages="formErrors.title"
                                :loading="enumsStore.loading"
                                :required="formData.roles.length == 1 && !formData.roles.includes('OfficeAssistant')"
                                :disabled="formData.roles.length == 1 && formData.roles.includes('OfficeAssistant')"
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
                                :disabled="formData.roles.length == 1 && formData.roles.includes('OfficeAssistant')"
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
                        action="edit"
                    >
                        Update User
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
import type { User } from '~/types/global';

const userManagement = useUserManagement();
const enumsStore = useEnumsStore();
const { validateEmail } = useValidation();
const toast = useToast();

const props = defineProps({
    dialog: {
        type: Boolean,
        default: false
    },
    userInfo: {
        type: Object as () => User | null,
        default: null
    }
});

const emits = defineEmits(['toggle-dialog', 'user-updated']);

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
    name: '',
    title: null as string | null,
    roles: [] as string[],
    email: '',
    department: null as string | null,
    phone: '',
    specialization: '',
});
const staffNumber = ref('');

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

    if (!formData.value.name) errors.name = 'Name is required';
    if (!formData.value.roles.includes('OfficeAssistant') && !formData.value.title) errors.title = 'Title is required';
    if (!formData.value.roles.length) errors.roles = 'Roles are required';
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
    if (!validateForm() || !props.userInfo) {
        return;
    }

    loading.value = true;

    try {
        const response = await userManagement.updateUser(props.userInfo.id.toString(), formData.value);
        toast.handleApiSuccess(response, 'User updated successfully');
        emits('user-updated');
        toggleDialog();
    } catch (error: any) {
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
            console.error('Error updating user:', error);
            toast.handleApiError(error, 'Failed to update user');
        }
    } finally {
        loading.value = false;
    }
};

const resetForm = () => {
    formData.value = {
        name: '',
        title: null,
        roles: [],
        email: '',
        department: null,
        phone: '',
        specialization: '',
    };
    staffNumber.value = '';
    formErrors.value = {};
};

const handleRolesChange = () => {
    if (formData.value.roles.length == 1 && formData.value.roles.includes('OfficeAssistant')) {
        formData.value.department = 'Other';
        formData.value.title = null;
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

watch(() => props.userInfo, (newUserInfo) => {
    if (newUserInfo) {
        // Convert roles array to string array
        const roleValues: string[] = [];
        if (newUserInfo.roles && Array.isArray(newUserInfo.roles)) {
            newUserInfo.roles.forEach(role => {
                const roleName = typeof role === 'string' ? role : role.role_name;
                if (roleName) {
                    roleValues.push(roleName);
                }
            });
        }
        
        formData.value = {
            name: newUserInfo.name,
            title: newUserInfo.lecturer?.title || null,
            roles: roleValues,
            email: newUserInfo.email,
            department: newUserInfo.department,
            phone: newUserInfo.lecturer?.phone || '',
            specialization: newUserInfo.lecturer?.specialization || '',
        };
        staffNumber.value = newUserInfo.staff_number;
    }
}, { immediate: true, deep: true });

watch(() => props.dialog, (newVal) => {
    if (newVal) {
        if (!enumsStore.enumsData) {
            enumsStore.fetchEnums();
        }
    } else {
        resetForm();
    }
});

onMounted(() => {
    if (!enumsStore.enumsData) {
        enumsStore.fetchEnums();
    }
});

</script>