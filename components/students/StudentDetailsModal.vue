<template>
    <PermissionGuard module="students" action="view">
        <v-dialog
            v-model="dialogModel"
            max-width="700"
        >
            <v-card v-if="student">
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>Student Details</span>
                    <v-btn icon="mdi-close" variant="text" @click="emits('toggle-dialog')"></v-btn>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12" sm="6">
                            <p class="text-subtitle-2">Matric Number</p>
                            <p>{{ student.matric_number }}</p>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <p class="text-subtitle-2">Full Name</p>
                            <p>{{ student.name }}</p>
                        </v-col>
                        <v-col cols="12">
                            <p class="text-subtitle-2">Email</p>
                            <p>{{ student.email }}</p>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <p class="text-subtitle-2">Program</p>
                            <p>{{ student.program?.program_name || '-' }}</p>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <p class="text-subtitle-2">Current Semester</p>
                            <p>{{ student.current_semester }}</p>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <p class="text-subtitle-2">Department</p>
                            <p>{{ student.department }}</p>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <p class="text-subtitle-2">Country</p>
                            <p>{{ student.country || '-' }}</p>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <p class="text-subtitle-2">Reasearch Supervisor</p>
                            <p>{{ getSupervisorDisplayName(student.main_supervisor) }}</p>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <p class="text-subtitle-2">Evaluation Type</p>
                            <p>{{ student.evaluation_type }}</p>
                        </v-col>
                        <v-col cols="12">
                            <p class="text-subtitle-2">Research Title</p>
                            <p>{{ student.research_title || '-' }}</p>
                        </v-col>
                        <v-col cols="12">
                            <p class="text-subtitle-2">Co-Supervisors</p>
                            <div v-if="student.co_supervisors && student.co_supervisors.length > 0">
                                <div v-for="coSupervisor in student.co_supervisors" :key="coSupervisor.id" class="mb-2">
                                    <v-chip
                                        size="small"
                                        color="secondary"
                                        variant="outlined"
                                        class="mr-2"
                                    >
                                        {{ getCoSupervisorDisplayName(coSupervisor) }}
                                    </v-chip>
                                </div>
                            </div>
                            <p v-else>-</p>
                        </v-col>
                        <v-col cols="12">
                            <p class="text-subtitle-2">My Role</p>
                            <div v-if="student.user_roles && student.user_roles.length > 0">
                                <v-chip
                                    v-for="role in student.user_roles"
                                    :key="role"
                                    class="mr-2 mt-1"
                                    size="small"
                                    color="primary"
                                >
                                    {{ role }}
                                </v-chip>
                            </div>
                            <p v-else>-</p>
                        </v-col>
                        <v-col cols="12">
                            <p class="text-subtitle-2">Evaluations</p>
                            <div v-if="student.evaluations && student.evaluations.length > 0">
                                <div v-for="evaluation in student.evaluations" :key="evaluation.id" class="mb-2">
                                    <v-chip
                                        size="small"
                                        :color="getEvaluationStatusColor(evaluation.nomination_status)"
                                        variant="outlined"
                                        class="mr-2"
                                    >
                                        {{ evaluation.nomination_status }} - Semester {{ evaluation.semester }} {{ evaluation.academic_year }}
                                    </v-chip>
                                </div>
                            </div>
                            <p v-else>-</p>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions class="justify-start">
                    <v-btn @click="emits('toggle-dialog')">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </PermissionGuard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PermissionGuard from '~/components/shared/PermissionGuard.vue';
import type { Student } from '~/types/global';

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
            return 'default';
    }
};
</script> 