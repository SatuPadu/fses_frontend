<template>
  <v-data-table-server
    :headers="headers"
    :items="users"
    :items-length="totalItems"
    :loading="loading"
    :items-per-page="itemsPerPage"
    :page="page"
    @update:options="handleOptionsUpdate"
    class="elevation-1 bordered-table"
  >
    <template v-slot:item="{ item, index }">
      <tr>
        <td class="border border-gray-300">{{ (page - 1) * itemsPerPage + index + 1 }}</td>
        <td class="border border-gray-300">
          <a @click.prevent="showDetails(item)" href="#" class="text-primary_text hover:underline">
            {{ item.staff_number }}
          </a>
        </td>
        <td class="border border-gray-300">{{ item.lecturer?.title || '-' }}</td>
        <td class="border border-gray-300">{{ item.name }}</td>
        <td class="border border-gray-300">{{ item.department }}</td>
        <td class="border border-gray-300">{{ getRoleNames(item.roles) }}</td>
        <td class="border border-gray-300">{{ item.email }}</td>
        <td class="border border-gray-300">{{ item.lecturer?.phone || '-' }}</td>
        <td class="border border-gray-300">
          <v-tooltip
            :text="!item.is_active ? 'Click to reactivate' : ''"
            :disabled="item.is_active"
          >
            <template v-slot:activator="{ props }">
              <v-chip 
                v-bind="props"
                :color="item.is_active ? 'success' : 'error'" 
                dark 
                small
                :clickable="!item.is_active"
                @click="!item.is_active && reactivateUser(item)"
                :class="{ 'cursor-pointer': !item.is_active }"
              >
                {{ item.is_active ? 'Active' : 'Inactive' }}
              </v-chip>
            </template>
          </v-tooltip>
        </td>
        <td v-if="canEditUsers || canDeleteUsers" class="border border-gray-300">
          <div class="d-flex justify-end">
            <v-btn 
              v-if="canEditUsers"
              icon="mdi-pencil" 
              variant="text" 
              @click="editUser(item)"
              color="primary"
            />
            <v-btn 
              v-if="canDeleteUsers"
              icon="mdi-delete" 
              variant="text" 
              @click="deleteUser(item)"
              color="error"
            />
          </div>
        </td>
      </tr>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { ref, toRefs, computed } from 'vue';
import { usePermissions } from '~/composables/usePermissions';
import type { User } from '~/types/global';

const props = defineProps<{
  users: User[];
  loading: boolean;
  totalItems: number;
  itemsPerPage: number;
  page: number;
}>();

const { users, loading, totalItems, itemsPerPage, page } = toRefs(props);
const emits = defineEmits(['update-options', 'edit-user', 'delete-user', 'page-changed', 'items-per-page-changed', 'show-details', 'reactivate-user']);

const { canEditUsers, canDeleteUsers } = usePermissions();

const headers = computed(() => {
  const baseHeaders: Array<{
    title: string;
    key: string;
    sortable: boolean;
    align?: 'start' | 'center' | 'end';
  }> = [
    { title: 'No.', key: 'index', sortable: false },
    { title: 'Staff Number', key: 'staff_number', sortable: true },
    { title: 'Title', key: 'lecturer.title', sortable: true },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Department', key: 'department', sortable: true },
    { title: 'Role', key: 'roles', sortable: false },
    { title: 'Email', key: 'email', sortable: true },
    { title: 'Phone', key: 'lecturer.phone', sortable: true },
    { title: 'Status', key: 'is_active', sortable: true },
  ];

  // Only add Actions column if user has edit or delete permissions
  if (canEditUsers.value || canDeleteUsers.value) {
    baseHeaders.push({ title: 'Actions', key: 'actions', sortable: false, align: 'end' });
  }

  return baseHeaders;
});

const getRoleNames = (roles: any[] | undefined): string => {
  if (!roles || roles.length === 0) return '-';
  return roles.map(role => role.role_name).join(', ');
};

const handleOptionsUpdate = (options: any) => {
  emits('update-options', options);
};

const editUser = (user: User) => {
  emits('edit-user', user);
};

const deleteUser = (user: User) => {
  emits('delete-user', user);
};

const showDetails = (user: User) => {
  emits('show-details', user);
};

const reactivateUser = (user: User) => {
  emits('reactivate-user', user);
};
</script>

<style scoped>
.v-data-table :deep(table) {
  border-collapse: collapse;
}

.v-data-table :deep(th) {
  border: 1px solid #e0e0e0 !important;
  background-color: #f5f5f5;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  opacity: 0.8;
}
</style>

