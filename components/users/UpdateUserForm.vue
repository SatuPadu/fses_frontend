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
import PermissionGuard from '~/components/shared/PermissionGuard.vue';
import PermissionButton from '~/components/shared/PermissionButton.vue';
import type { User } from '~/types/global';

const userManagement = useUserManagement();
const enumsStore = useEnumsStore();

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
    email: '',
    department: null as string | null,
    phone: '',
    external_institution: '',
    specialization: '',
});
const staffNumber = ref('');

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

    if (!formData.value.name) errors.name = 'Name is required';
    if (!formData.value.title) errors.title = 'Title is required';
    if (!formData.value.email) errors.email = 'Email is required';
    if (!formData.value.department) errors.department = 'Department is required';

    formErrors.value = errors;
    return Object.keys(errors).length === 0;
};

const handleSubmit = async () => {
    if (!validateForm() || !props.userInfo) {
        return;
    }

    loading.value = true;

    try {
        await userManagement.updateUser(props.userInfo.id.toString(), formData.value);
        
        emits('user-updated');
        
        toggleDialog();
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.errors) {
            formErrors.value = error.response.data.errors;
        } else {
            console.error('Error updating user:', error);
        }
    } finally {
        loading.value = false;
    }
};

const resetForm = () => {
    formData.value = {
        name: '',
        title: null,
        email: '',
        department: null,
        phone: '',
        external_institution: '',
        specialization: '',
    };
    staffNumber.value = '';
    formErrors.value = {};
};

watch(() => props.userInfo, (newUserInfo) => {
    if (newUserInfo) {
        formData.value = {
            name: newUserInfo.name,
            title: newUserInfo.lecturer?.title || null,
            email: newUserInfo.email,
            department: newUserInfo.department,
            phone: newUserInfo.lecturer?.phone || '',
            external_institution: newUserInfo.lecturer?.external_institution || '',
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