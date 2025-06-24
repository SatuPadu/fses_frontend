<template>
  <PermissionGuard module="users" action="view">
    <v-row>
      <v-col cols="12" md="12">
        <h1>User Management</h1>
        <!-- Action Buttons -->
        <div class="d-flex justify-end mb-4 mt-4 gap-2">
          <PermissionButton 
            module="users" 
            action="create"
            @click="showAddFormDialog = true" 
            color="primary" 
            variant="flat" 
            :prepend-icon="PlusIcon"
          >
            Add User
          </PermissionButton>
        </div>

        <!-- Filters -->
        <UserFilters @filters-updated="handleFiltersUpdated" />

        <!-- Users Table -->
        <UiParentCard class="mt-4" :showTitle="false">
          <UsersTable
            :users="users"
            :loading="loading"
            :total-items="pagination.totalItems"
            :items-per-page="pagination.itemsPerPage"
            :page="pagination.page"
            @update-options="handleOptionsUpdate"
            @edit-user="handleEditUser"
            @delete-user="handleDeleteUser"
            @page-changed="handlePageChange"
            @items-per-page-changed="handleItemsPerPageChange"
            @show-details="handleShowDetails"
            @reactivate-user="handleReactivateUser"
          />
        </UiParentCard>
      </v-col>
    </v-row>

    <!-- Dialogs -->
    <PermissionGuard module="users" action="create">
      <AddUserForm
        :dialog="showAddFormDialog"
        @toggle-dialog="showAddFormDialog = false"
        @user-added="handleUserAdded"
      />
    </PermissionGuard>

    <PermissionGuard module="users" action="edit">
      <UpdateUserForm
        v-if="selectedUser"
        :dialog="showUpdateFormDialog"
        :user-info="selectedUser"
        @toggle-dialog="showUpdateFormDialog = false"
        @user-updated="handleUserUpdated"
      />
    </PermissionGuard>

    <UserDetailsModal
      v-if="selectedUser"
      :dialog="showDetailsDialog"
      :user="selectedUser"
      @toggle-dialog="showDetailsDialog = false"
    />

    <PermissionGuard module="users" action="delete">
      <v-dialog v-model="showDeleteDialog" max-width="400">
        <v-card
          title="Confirm Deletion"
          text="Are you sure you want to remove this user? This action cannot be undone."
        >
          <template v-slot:prepend>
            <v-icon :icon="ExclamationCircleIcon" color="error"></v-icon>
          </template>
          <v-card-actions class="justify-start">
            <v-btn
              color="error"
              text="Delete"
              :loading="loading"
              @click="confirmDeleteUser"
            />
            <v-btn text="Cancel" @click="showDeleteDialog = false"></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </PermissionGuard>
  </PermissionGuard>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import UiParentCard from '~/components/shared/UiParentCard.vue';
import UserFilters from '~/components/users/UserFilters.vue';
import UsersTable from '~/components/users/UsersTable.vue';
import AddUserForm from '~/components/users/AddUserForm.vue';
import UpdateUserForm from '~/components/users/UpdateUserForm.vue';
import UserDetailsModal from '~/components/users/UserDetailsModal.vue';
import PermissionButton from '~/components/shared/PermissionButton.vue';
import PermissionGuard from '~/components/shared/PermissionGuard.vue';
import { useUserManagement } from '~/composables/useUserManagement';
import { usePermissions } from '~/composables/usePermissions';
import type { User } from '~/types/global';
import { PlusIcon, ExclamationCircleIcon } from 'vue-tabler-icons';

const userManagement = useUserManagement();
const { canViewUsers, canCreateUsers, canEditUsers, canDeleteUsers } = usePermissions();

// Dialog states
const showAddFormDialog = ref(false);
const showUpdateFormDialog = ref(false);
const showDeleteDialog = ref(false);
const showDetailsDialog = ref(false);

// User data and state
const users = ref<User[]>([]);
const selectedUser = ref<User | null>(null);
const loading = ref(false);
const activeFilters = ref({});

// Pagination and sorting state
const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
  totalItems: 0,
  sortBy: [{ key: 'name', order: 'desc' }],
});

// Fetch users from API
const fetchUsers = async () => {
  // Check if user has permission to view users
  if (!canViewUsers.value) {
    console.log('No permission to view users');
    return;
  }

  loading.value = true;
  try {
    // Call the getUsers API with the correct parameters
    const response = await userManagement.getUsers({
      page: pagination.page,
      perPage: pagination.itemsPerPage,
      sortBy: pagination.sortBy.length ? pagination.sortBy[0].key : 'name',
      sortOrder: pagination.sortBy.length ? pagination.sortBy[0].order : 'desc',
      filters: activeFilters.value
    });

    // Update the users and pagination
    users.value = response.data.items || [];
    pagination.totalItems = response.data.pagination?.total || 0;

  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    loading.value = false;
  }
};

// Event Handlers
const handleFiltersUpdated = (filters: any) => {
  activeFilters.value = filters;
  pagination.page = 1; // Reset to first page
  fetchUsers();
};

const handlePageChange = (newPage: number) => {
  pagination.page = newPage;
  fetchUsers();
};

const handleItemsPerPageChange = (newItemsPerPage: number) => {
  pagination.itemsPerPage = newItemsPerPage;
  pagination.page = 1; // Reset to first page
  fetchUsers();
};

const handleOptionsUpdate = ({ page, itemsPerPage, sortBy }: any) => {
  pagination.page = page;
  pagination.itemsPerPage = itemsPerPage;
  pagination.sortBy = sortBy;
  fetchUsers();
};

const handleImportComplete = () => {
  fetchUsers(); // Refresh list after bulk import
};

const handleUserAdded = () => {
  fetchUsers(); // Refresh list
};

const handleUserUpdated = () => {
  fetchUsers(); // Refresh list
};

const handleReactivateUser = async (user: User) => {
  loading.value = true;
  try {
    await userManagement.reactivateUser(user.id.toString());
    fetchUsers(); // Refresh list
  } catch (error) {
    console.error('Error reactivating user:', error);
  } finally {
    loading.value = false;
  }
};

const handleEditUser = (user: User) => {
  if (!canEditUsers.value) {
    return;
  }
  selectedUser.value = user;
  showUpdateFormDialog.value = true;
};

const handleShowDetails = (user: User) => {
  if (!canViewUsers.value) {
    return;
  }
  selectedUser.value = user;
  showDetailsDialog.value = true;
};

const handleDeleteUser = (user: User) => {
  if (!canDeleteUsers.value) {
    return;
  }
  selectedUser.value = user;
  showDeleteDialog.value = true;
};

const confirmDeleteUser = async () => {
  if (!selectedUser.value || !canDeleteUsers.value) return;
  loading.value = true;
  try {
    await userManagement.deleteUser(selectedUser.value.id.toString());
    fetchUsers();
  } catch (error) {
    console.error('Error deleting user:', error);
  } finally {
    showDeleteDialog.value = false;
    loading.value = false;
  }
};

onMounted(() => {
  // Wait a bit for permissions to initialize, then fetch users
  setTimeout(() => {
    fetchUsers();
  }, 100);
});
</script>