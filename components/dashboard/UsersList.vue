<script setup lang="ts">
import { ref, shallowRef} from 'vue';
import {productPerformance} from '@/data/dashboard/dashboardData';
import {SearchIcon, EditIcon, TrashIcon, ExclamationCircleIcon} from 'vue-tabler-icons';
import UpdateUserForm from '../users/UpdateUserForm.vue';

const showDeleteDialog = ref(false);
const showUpdateFormDialog = ref(false);
const defaultRoleSelect = shallowRef({ name: 'All Roles', value: '' });
const defaultDeptSelect = shallowRef({ name: 'All Departments', value: '' });
const defaultFilterSelect = shallowRef({ name: 'Sort by...', value: '' });
const tableHeaders = ref([
    { title: 'STAFF NUMBER', key: 'staffNumber', align: 'start'},
    { title: 'NAME', key: 'name', align: 'start'},
    { title: 'EMAIL', key: 'email', align: 'start'},
    { title: 'ROLE', key: 'role', align: 'start'},
    { title: 'DEPARTMENT', key: 'department', align: 'start'},
    { title: 'STATUS', key: 'isActive', align: 'start'},
    { title: 'ACTIONS', key: 'actions', align: 'start'},
]);
const RoleSelectItems = [
    { name: 'All Roles', value: '' },
    { name: 'Office Assistant', value: '' },
    { name: 'Supervisor', value: '' },
    { name: 'Program Coordinator', value: '' },
    { name: 'PGAM', value: '' },
]
const DeptSelectItems = [
    { name: 'All Departments', value: '' },
    { name: 'SEAT', value: '' },
    { name: 'II', value: '' },
    { name: 'BIHG', value: '' },
    { name: 'CAI', value: '' },
    { name: 'Other', value: '' },
]
const FilterSelectItems = [
    { name: 'Sort by...', value: '' },
    { name: 'Staff Num', value: '' },
    { name: 'Name', value: '' },
    { name: 'Email', value: '' },
    { name: 'Role', value: '' },
    { name: 'Department', value: '' },
    { name: 'Status', value: '' },
]
const TableItems = ref([
    {
        staffNumber: 'OA123456',
        name: 'John Smith',
        email: 'officeassistant@utm.com',
        role: 'Office Assistant',
        department: 'Other',
        isActive: true,
        actions: 'Hi',
        phone: '',
    }
])

const toggleDeleteDialog = () => {
    showDeleteDialog.value = !showDeleteDialog.value;
}
const toggleUpdateFormDialog = () => {
    showUpdateFormDialog.value = !showUpdateFormDialog.value;
}
</script>
<template>
    <v-card-item class="pa-6">
        <div class="mt-1">
            <v-text-field :prepend-inner-icon="SearchIcon" variant="outlined" class="grow-2" placeholder="Search by name or email..."></v-text-field>
            <div class="d-flex gap-2">
                <v-select v-model="defaultRoleSelect" density="compact" variant="outlined" :items="RoleSelectItems" item-title="name" item-value="value"></v-select>
                <v-select v-model="defaultDeptSelect" density="compact" variant="outlined" :items="DeptSelectItems" item-title="name" item-value="value"></v-select>
                <v-select v-model="defaultFilterSelect" density="compact" variant="outlined" :items="FilterSelectItems" item-title="name" item-value="value"></v-select>
            </div>
        </div>
        <v-data-table
            :headers="tableHeaders"
            :items="TableItems"
        >
            <template v-slot:item.isActive="{ item }">
                <v-chip v-if="item.isActive" class="text-body-1 bg-success">Active</v-chip>
                <v-chip v-else class="text-body-1">Inactive</v-chip>
            </template>
            <template v-slot:item.actions="{ item }">
                <div class="d-flex justify-end my-auto gap-2">
                    <v-btn @click="toggleUpdateFormDialog" :icon="EditIcon" color="primary" variant="outlined">
                    </v-btn>
                    <UpdateUserForm 
                        :dialog="showUpdateFormDialog"
                        :userInfo="item"
                        @toggle-dialog="toggleUpdateFormDialog"
                    />
                    <v-btn @click="toggleDeleteDialog()" :icon="TrashIcon" color="error" variant="outlined">
                    </v-btn>
                    <v-dialog
                        v-model="showDeleteDialog"
                        width="auto"
                    >
                        <v-card
                            max-width="400"
                            text="Are you sure you want to remove this user? This action cannot be undone."
                            title="Confirm Deletion"
                        >
                            <template v-slot:prepend>
                                <v-avatar color="error">
                                    <v-icon :icon="ExclamationCircleIcon"></v-icon>
                                </v-avatar>
                            </template>
                            <template v-slot:actions>
                                <div class="d-flex gap-2">
                                    <v-btn
                                        text="Cancel"
                                        variant="outlined"
                                        @click="toggleDeleteDialog()"
                                    ></v-btn>
                                    <v-btn
                                        color="error"
                                        variant="outlined"
                                        text="Delete"
                                    ></v-btn>
                                </div>
                            </template>
                        </v-card>
                    </v-dialog>
                </div>
            </template>
        </v-data-table>
    </v-card-item>
</template>
