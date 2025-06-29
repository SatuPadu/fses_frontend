<template>
    <PermissionGuard module="students" action="view">
        <v-dialog
            v-model="dialogModel"
            max-width="800"
        >
            <v-card v-if="student" class="student-details-modal">
                <v-card-title class="d-flex justify-space-between align-center pa-6 pb-4">
                    <div class="d-flex align-center">
                        <v-icon class="mr-3" color="primary" size="28">mdi-school</v-icon>
                        <span class="text-h5 font-weight-medium">Student Details</span>
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
                        <!-- Basic Information Section -->
                        <v-col cols="12">
                            <h3 class="text-subtitle-1 font-weight-medium mb-4 text-primary">Basic Information</h3>
                        </v-col>
                        
                        <v-col cols="12" sm="6">
                            <div class="info-field">
                                <label class="text-caption font-weight-medium text-medium-emphasis">Matric Number</label>
                                <p class="text-body-1 font-weight-medium">{{ student.matric_number }}</p>
                            </div>
                        </v-col>
                        
                        <v-col cols="12" sm="6">
                            <div class="info-field">
                                <label class="text-caption font-weight-medium text-medium-emphasis">Full Name</label>
                                <p class="text-body-1 font-weight-medium">{{ student.name }}</p>
                            </div>
                        </v-col>
                        
                        <v-col cols="12">
                            <div class="info-field">
                                <label class="text-caption font-weight-medium text-medium-emphasis">Email Address</label>
                                <p class="text-body-1 font-weight-medium">{{ student.email }}</p>
                            </div>
                        </v-col>
                        
                        <v-col cols="12" sm="6">
                            <div class="info-field">
                                <label class="text-caption font-weight-medium text-medium-emphasis">Program</label>
                                <p class="text-body-1 font-weight-medium">{{ student.program?.program_name || '-' }}</p>
                            </div>
                        </v-col>
                        
                        <v-col cols="12" sm="6">
                            <div class="info-field">
                                <label class="text-caption font-weight-medium text-medium-emphasis">Current Semester</label>
                                <p class="text-body-1 font-weight-medium">{{ student.current_semester }}</p>
                            </div>
                        </v-col>
                        
                        <v-col cols="12" sm="6">
                            <div class="info-field">
                                <label class="text-caption font-weight-medium text-medium-emphasis">Department</label>
                                <p class="text-body-1 font-weight-medium">{{ student.department }}</p>
                            </div>
                        </v-col>
                        
                        <v-col cols="12" sm="6">
                            <div class="info-field">
                                <label class="text-caption font-weight-medium text-medium-emphasis">Country</label>
                                <p class="text-body-1 font-weight-medium">{{ student.country || '-' }}</p>
                            </div>
                        </v-col>
                        
                        <v-col cols="12">
                            <div class="info-field">
                                <label class="text-caption font-weight-medium text-medium-emphasis">Research Title</label>
                                <p class="text-body-1 font-weight-medium">{{ student.research_title || '-' }}</p>
                            </div>
                        </v-col>
                        
                        <!-- Supervisor Information Section -->
                        <v-col cols="12">
                            <h3 class="text-subtitle-1 font-weight-medium mb-4 mt-6 text-primary">Supervisor Information</h3>
                        </v-col>
                        
                        <v-col cols="12" sm="6">
                            <div class="info-field">
                                <label class="text-caption font-weight-medium text-medium-emphasis">Main Supervisor</label>
                                <p class="text-body-1 font-weight-medium">{{ getSupervisorDisplayName(student.main_supervisor) }}</p>
                            </div>
                        </v-col>
                        
                        <v-col cols="12" sm="6" v-if="student.co_supervisors && student.co_supervisors.length > 0">
                            <div class="info-field"  v-for="(coSupervisor, index) in student.co_supervisors"
                            :key="index">
                                <label class="text-caption font-weight-medium text-medium-emphasis">Co-Supervisor {{ index + 1 }}</label>
                                <div class="co-supervisors-container">
                                {{ getCoSupervisorDisplayName(coSupervisor) }}
                                </div>
                            </div>
                        </v-col>
                        
                        <!-- Evaluations Section -->
                        <v-col cols="12" v-if="student.evaluations && student.evaluations.length > 0 && !isOfficeAssistant">
                            <h3 class="text-subtitle-1 font-weight-medium mb-4 mt-6 text-primary">Evaluation Information</h3>
                        </v-col>
                        
                        <template v-if="student.evaluations && student.evaluations.length > 0 && !isOfficeAssistant">
                            <v-col 
                                cols="12" 
                                v-for="(evaluation, index) in student.evaluations" 
                                :key="evaluation.id"
                            >
                                <div class="mb-4">
                                    <v-row dense>
                                        <v-col cols="12" sm="6">
                                            <div class="info-field">
                                                <label class="text-caption font-weight-medium text-medium-emphasis">Evaluation Type</label>
                                                <p class="text-body-1 font-weight-medium">{{ student.evaluation_type || '-' }}</p>
                                            </div>
                                        </v-col>
                                        
                                        <v-col cols="12" sm="6">
                                            <div class="info-field">
                                                <label class="text-caption font-weight-medium text-medium-emphasis">Examiner 1</label>
                                                <p class="text-body-1 font-weight-medium">
                                                    {{ evaluation.examiner1 ? getSupervisorDisplayName(evaluation.examiner1) : '-' }}
                                                </p>
                                            </div>
                                        </v-col>
                                        
                                        <v-col cols="12" sm="6">
                                            <div class="info-field">
                                                <label class="text-caption font-weight-medium text-medium-emphasis">Examiner 2</label>
                                                <p class="text-body-1 font-weight-medium">
                                                    {{ evaluation.examiner2 ? getSupervisorDisplayName(evaluation.examiner2) : '-' }}
                                                </p>
                                            </div>
                                        </v-col>
                                        
                                        <v-col cols="12" sm="6">
                                            <div class="info-field">
                                                <label class="text-caption font-weight-medium text-medium-emphasis">Examiner 3</label>
                                                <p class="text-body-1 font-weight-medium">
                                                    {{ evaluation.examiner3 ? getSupervisorDisplayName(evaluation.examiner3) : '-' }}
                                                </p>
                                            </div>
                                        </v-col>
                                        
                                        <v-col cols="12" sm="6">
                                            <div class="info-field">
                                                <label class="text-caption font-weight-medium text-medium-emphasis">Chairperson</label>
                                                <p class="text-body-1 font-weight-medium">
                                                    {{ evaluation.chairperson ? getSupervisorDisplayName(evaluation.chairperson) : '-' }}
                                                </p>
                                            </div>
                                        </v-col>
                                    </v-row>
                                    <div class="mt-3">
                                        <v-chip 
                                            :color="getEvaluationStatusColor(evaluation.nomination_status)" 
                                            size="small" 
                                            class="mr-2 font-weight-medium"
                                        >
                                            {{ evaluation.nomination_status }}
                                        </v-chip>
                                        <span class="text-body-2 font-weight-medium text-medium-emphasis">
                                            Semester {{ evaluation.semester }} | {{ evaluation.academic_year }}
                                        </span>
                                    </div>
                                </div>
                                
                                <v-divider v-if="index < student.evaluations.length - 1" class="my-4"></v-divider>
                            </v-col>
                        </template>
                    </v-row>
                </v-card-text>
                
                <v-divider></v-divider>
                
                <v-card-actions class="pa-6 pt-4">
                    <div class="d-flex gap-3 w-100">
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
import PermissionGuard from '~/components/shared/PermissionGuard.vue';
import type { Student } from '~/types/global';
import { usePermissions } from '~/composables/usePermissions';

const { isOfficeAssistant } = usePermissions();

const props = defineProps({
    dialog: {
        type: Boolean,
        default: false
    },
    student: {
        type: Object as () => Student | null,
        required: true
    }
});

const emits = defineEmits(['toggle-dialog']);

const dialogModel = computed({
    get() {
        return props.dialog;
    },
    set() {
        emits('toggle-dialog');
    }
});

const getSupervisorDisplayName = (supervisor: any) => {
    if (supervisor) {
        return `${supervisor.title ? supervisor.title + ' ' : ''}${supervisor.name}`.trim();
    }
    return '-';
};

const getCoSupervisorDisplayName = (coSupervisor: any) => {
    if (coSupervisor.lecturer) {
        return `${coSupervisor.lecturer.title ? coSupervisor.lecturer.title + ' ' : ''}${coSupervisor.lecturer.name}`.trim();
    } else if (coSupervisor.external_name) {
        return `${coSupervisor.external_name}${coSupervisor.external_institution ? ` (${coSupervisor.external_institution})` : ''}`;
    }
    return '-';
};

const getEvaluationStatusColor = (status: string) => {
    switch (status) {
        case 'Pending':
            return 'warning';
        case 'Nominated':
            return 'info';
        case 'Locked':
            return 'success';
        case 'Postponed':
            return 'error';
        default:
            return 'grey';
    }
};
</script>

<style scoped>
.student-details-modal {
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

.co-supervisors-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 12px;
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 6px;
    border-left: 3px solid var(--v-primary-base);
}

.evaluation-group {
    padding: 16px;
    background-color: rgba(0, 0, 0, 0.01);
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.evaluation-header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
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