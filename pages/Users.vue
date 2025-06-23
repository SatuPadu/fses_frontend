<script setup lang="ts">
import { ref } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import UsersList from '@/components/dashboard/UsersList.vue';
import AddUserForm from '@/components/users/AddUserForm.vue';
import {PlusIcon} from 'vue-tabler-icons';

const showAddFormDialog = ref(false);

const toggleAddFormDialog = () => {
    showAddFormDialog.value = !showAddFormDialog.value;
}
</script>
<template>
    <v-row>
        <v-col cols="12" md="12">
            <UiParentCard title="User Management">
                <template v-slot:action>
                    <div class="pr-7">
                        <v-btn @click="toggleAddFormDialog()" color="primary" variant="outlined" :prepend-icon="PlusIcon">
                            Add New User
                        </v-btn>
                        <div class="pa-4 text-center">
                            <AddUserForm
                                :dialog="showAddFormDialog"
                                @toggle-dialog="toggleAddFormDialog"
                            />
                        </div>
                    </div>
                </template>
                <UsersList />
            </UiParentCard>
        </v-col>
    </v-row>
</template>
