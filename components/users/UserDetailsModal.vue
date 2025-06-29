<template>
    <PermissionGuard module="users" action="view">
        <v-dialog
            v-model="dialogModel"
            max-width="700"
        >
            <v-card v-if="user" class="user-details-modal">
                <v-card-title class="d-flex justify-space-between align-center pa-6 pb-4">
                    <div class="d-flex align-center">
                        <v-icon class="mr-3" color="primary" size="28">mdi-account-details</v-icon>
                        <span class="text-h5 font-weight-medium">User Details</span>
                    </div>
                    <v-btn 
                        icon="mdi-close" 
                        variant="text" 
                        size="small"
                        @click="emits('toggle-dialog')"
                        class="close-btn"
                    ></v-btn>
                </v-card-title>
                
                <v-divider></v-divider>
                
                <v-card-text class="pa-6">
                    <v-row dense>
                        <v-col cols="12" sm="6">
                            <div class="info-field">
                                <label class="text-caption font-weight-medium text-medium-emphasis">Staff Number</label>
                                <p class="text-body-1 font-weight-medium">{{ user.staff_number || '-' }}</p>
                            </div>
                        </v-col>
                        
                        <v-col cols="12" sm="6">
                            <div class="info-field">
                                <label class="text-caption font-weight-medium text-medium-emphasis">Full Name</label>
                                <p class="text-body-1 font-weight-medium">{{ user.name }}</p>
                            </div>
                        </v-col>
                        
                        <v-col cols="12">
                            <div class="info-field">
                                <label class="text-caption font-weight-medium text-medium-emphasis">Email Address</label>
                                <p class="text-body-1 font-weight-medium">{{ user.email }}</p>
                            </div>
                        </v-col>
                        
                        <v-col cols="12" sm="6">
                            <div class="info-field">
                                <label class="text-caption font-weight-medium text-medium-emphasis">Department</label>
                                <p class="text-body-1 font-weight-medium">{{ user.department || '-' }}</p>
                            </div>
                        </v-col>
                        
                        <v-col cols="12" sm="6">
                            <div class="info-field">
                                <label class="text-caption font-weight-medium text-medium-emphasis">Title</label>
                                <p class="text-body-1 font-weight-medium">{{ user.lecturer?.title || '-' }}</p>
                            </div>
                        </v-col>
                        
                        <v-col cols="12" sm="6" v-if="user.lecturer">
                            <div class="info-field">
                                <label class="text-caption font-weight-medium text-medium-emphasis">Phone Number</label>
                                <p class="text-body-1 font-weight-medium">{{ user.lecturer.phone || '-' }}</p>
                            </div>
                        </v-col>
                        
                        <v-col cols="12" sm="6" v-if="user.lecturer">
                            <div class="info-field">
                                <label class="text-caption font-weight-medium text-medium-emphasis">Specialization</label>
                                <p class="text-body-1 font-weight-medium">{{ user.lecturer.specialization || '-' }}</p>
                            </div>
                        </v-col>
                        
                        <v-col cols="12" v-if="user.lecturer?.external_institution">
                            <div class="info-field">
                                <label class="text-caption font-weight-medium text-medium-emphasis">External Institution</label>
                                <p class="text-body-1 font-weight-medium">{{ user.lecturer.external_institution }}</p>
                            </div>
                        </v-col>
                        
                        <!-- Roles Section -->
                        <v-col cols="12">
                            <div class="info-field">
                                <div v-if="user.roles && user.roles.length > 0" class="d-flex flex-wrap gap-2">
                                    <v-chip
                                        v-for="role in user.roles"
                                        :key="role.id"
                                        :color="getRoleColor(role.role_name)"
                                        variant="flat"
                                        size="small"
                                        class="font-weight-medium"
                                    >
                                        <v-icon start size="16" class="mr-1">mdi-shield-account</v-icon>
                                        {{ role.role_name }}
                                    </v-chip>
                                </div>
                                <p v-else class="text-body-1 text-medium-emphasis">No roles assigned</p>
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
                
                <v-divider></v-divider>
                
                <v-card-actions class="pa-6 pt-4">
                    <div class="d-flex gap-3 w-100">
                        <PermissionButton
                            v-if="showMakePgamButton"
                            @click="makePgam"
                            color="primary"
                            variant="elevated"
                            :loading="pgamStore.loading"
                            module="users"
                            action="create"
                            :roles="['PGAM', 'OfficeAssistant']"
                            prepend-icon="mdi-shield-crown"
                            class="font-weight-medium"
                        >
                            Make PGAM
                        </PermissionButton>
                        
                        <v-btn 
                            @click="emits('toggle-dialog')"
                            variant="outlined"
                            color="grey-darken-1"
                            class="font-weight-medium"
                        >
                            Close
                        </v-btn>
                    </div>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </PermissionGuard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePgamStore } from '@/stores/pgam';
import PermissionGuard from '~/components/shared/PermissionGuard.vue';
import PermissionButton from '~/components/shared/PermissionButton.vue';
import type { User } from '~/types/global';

const props = defineProps({
    dialog: {
        type: Boolean,
        default: false
    },
    user: {
        type: Object as () => User | null,
        required: true
    }
});

const emits = defineEmits(['toggle-dialog']);

const pgamStore = usePgamStore();

const dialogModel = computed({
    get() {
        return props.dialog;
    },
    set() {
        emits('toggle-dialog');
    }
});

const showMakePgamButton = computed(() => {
    return !pgamStore.pgamUser;
});

const getRoleColor = (roleName: string): string => {
    const roleColors: { [key: string]: string } = {
        'PGAM': 'deep-purple',
        'OfficeAssistant': 'blue',
        'ProgramCoordinator': 'green',
        'Chairperson': 'orange',
        'ResearchSupervisor': 'teal',
        'CoSupervisor': 'cyan'
    };
    return roleColors[roleName] || 'grey';
};

const makePgam = async () => {
    if (!props.user) return;
    try {
        await pgamStore.assignPgam(props.user.id);
    } catch (error) {
        console.error('Failed to assign PGAM role:', error);
        // Optionally, show a toast or notification to the user
    }
};

</script>

<style scoped>
.user-details-modal {
    border-radius: 12px;
}

.close-btn {
    transition: all 0.2s ease;
}

.close-btn:hover {
    background-color: rgba(0, 0, 0, 0.04);
    transform: scale(1.1);
}

.info-field {
    margin-bottom: 8px;
}

.info-field label {
    display: block;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-field p {
    margin: 0;
    padding: 8px 12px;
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 6px;
    border-left: 3px solid var(--v-primary-base);
}

.gap-2 {
    gap: 8px;
}

.gap-3 {
    gap: 12px;
}

.w-100 {
    width: 100%;
}
</style>