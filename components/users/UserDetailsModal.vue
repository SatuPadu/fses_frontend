<template>
    <v-dialog
        v-model="dialogModel"
        max-width="600"
    >
        <v-card v-if="user">
            <v-card-title class="d-flex justify-space-between align-center">
                <span>User Details</span>
                <v-btn icon="mdi-close" variant="text" @click="emits('toggle-dialog')"></v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-row dense>
                    <v-col cols="12" sm="6">
                        <p class="text-subtitle-2">Staff Number</p>
                        <p>{{ user.staff_number }}</p>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <p class="text-subtitle-2">Name</p>
                        <p>{{ user.name }}</p>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <p class="text-subtitle-2">Title</p>
                        <p>{{ user.lecturer?.title || '-' }}</p>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <p class="text-subtitle-2">Department</p>
                        <p>{{ user.department }}</p>
                    </v-col>
                    <v-col cols="12">
                        <p class="text-subtitle-2">Email</p>
                        <p>{{ user.email }}</p>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <p class="text-subtitle-2">Phone</p>
                        <p>{{ user.lecturer?.phone || '-' }}</p>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <p class="text-subtitle-2">Specialization</p>
                        <p>{{ user.lecturer?.specialization || '-' }}</p>
                    </v-col>
                    <v-col cols="12">
                        <p class="text-subtitle-2">External Institution</p>
                        <p>{{ user.lecturer?.external_institution || '-' }}</p>
                    </v-col>
                    <v-col cols="12">
                        <p class="text-subtitle-2">Roles</p>
                        <v-chip
                            v-for="role in user.roles"
                            :key="role.id"
                            class="mr-2 mt-1"
                            size="small"
                        >
                            {{ role.role_name }}
                        </v-chip>
                         <p v-if="!user.roles || user.roles.length === 0">-</p>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="justify-start">
                <v-btn
                    v-if="showMakePgamButton"
                    @click="makePgam"
                    color="secondary"
                    variant="flat"
                    :loading="pgamStore.loading"
                >
                    Make PGAM
                </v-btn>
                <v-btn @click="emits('toggle-dialog')">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePgamStore } from '@/stores/pgam';
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