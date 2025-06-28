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
                                @blur="formData.staff_number = formData.staff_number?.trim()"
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
                                @blur="formData.email = formData.email?.trim()"
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
                        <v-col cols="12">
                            <v-label class="font-weight-bold mb-1">External Institution</v-label>
                            <v-text-field
                                v-model="formData.external_institution"
                                density="compact"
                                variant="outlined"
                                :error-messages="formErrors.external_institution"
                                @blur="formData.external_institution = formData.external_institution?.trim()"
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

const toggleDialog = () => {
    emits('toggle-dialog');
};

const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.value.staff_number) errors.staff_number = 'Staff number is required';
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
            formErrors.value = error.response.data.errors;
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
        email: '',
        department: null,
        phone: '',
        external_institution: '',
        specialization: '',
    };
    formErrors.value = {};
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

