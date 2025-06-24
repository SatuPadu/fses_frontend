<template>
  <PermissionGuard module="lecturers" action="view">
    <v-row>
      <v-col cols="12" md="12">
        <h1>Lecturer Management</h1>
        <!-- Action Buttons -->
        <div class="d-flex justify-end mb-4 mt-4 gap-2">
          <PermissionButton 
            module="lecturers" 
            action="create"
            @click="showAddFormDialog = true" 
            color="primary" 
            variant="flat" 
            :prepend-icon="PlusIcon"
          >
            Add Lecturer
          </PermissionButton>
        </div>

        <!-- Filters -->
        <LecturerFilters @filters-updated="handleFiltersUpdated" />

        <!-- Lecturers Table -->
        <UiParentCard class="mt-4" :showTitle="false">
          <LecturersTable
            :lecturers="lecturers"
            :loading="loading"
            :total-items="pagination.totalItems"
            :items-per-page="pagination.itemsPerPage"
            :page="pagination.page"
            @update-options="handleOptionsUpdate"
            @edit-lecturer="handleEditLecturer"
            @delete-lecturer="handleDeleteLecturer"
            @page-changed="handlePageChange"
            @items-per-page-changed="handleItemsPerPageChange"
          />
        </UiParentCard>
      </v-col>
    </v-row>

    <!-- Dialogs -->
    <PermissionGuard module="lecturers" action="create">
      <AddLecturerForm
        :dialog="showAddFormDialog"
        @toggle-dialog="showAddFormDialog = false"
        @lecturer-added="handleLecturerAdded"
      />
    </PermissionGuard>

    <PermissionGuard module="lecturers" action="edit">
      <UpdateLecturerForm
        v-if="selectedLecturer"
        :dialog="showUpdateFormDialog"
        :lecturer-info="selectedLecturer"
        @toggle-dialog="showUpdateFormDialog = false"
        @lecturer-updated="handleLecturerUpdated"
      />
    </PermissionGuard>

    <PermissionGuard module="lecturers" action="delete">
      <v-dialog v-model="showDeleteDialog" max-width="400">
        <v-card
          title="Confirm Deletion"
          text="Are you sure you want to remove this lecturer? This action cannot be undone."
        >
          <template v-slot:prepend>
            <v-icon :icon="ExclamationCircleIcon" color="error"></v-icon>
          </template>
          <v-card-actions class="justify-start">
            <v-btn
              color="error"
              text="Delete"
              :loading="loading"
              @click="confirmDeleteLecturer"
            />
            <v-btn text="Cancel" @click="showDeleteDialog = false"></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </PermissionGuard>
  </PermissionGuard>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import UiParentCard from '~/components/shared/UiParentCard.vue';
import LecturerFilters from '~/components/lecturers/LecturerFilters.vue';
import LecturersTable from '~/components/lecturers/LecturersTable.vue';
import AddLecturerForm from '~/components/lecturers/AddLecturerForm.vue';
import UpdateLecturerForm from '~/components/lecturers/UpdateLecturerForm.vue';
import PermissionButton from '~/components/shared/PermissionButton.vue';
import PermissionGuard from '~/components/shared/PermissionGuard.vue';
import { useUserManagement } from '~/composables/useUserManagement';
import { usePermissions } from '~/composables/usePermissions';
import type { Lecturer } from '~/types/global';
import { PlusIcon, ExclamationCircleIcon } from 'vue-tabler-icons';

const userManagement = useUserManagement();
const { canViewLecturers, canCreateLecturers, canEditLecturers, canDeleteLecturers } = usePermissions();

// Dialog states
const showAddFormDialog = ref(false);
const showUpdateFormDialog = ref(false);
const showDeleteDialog = ref(false);

// Lecturer data and state
const lecturers = ref<Lecturer[]>([]);
const selectedLecturer = ref<Lecturer | null>(null);
const loading = ref(false);
const activeFilters = ref({});

// Pagination and sorting state
const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
  totalItems: 0,
  sortBy: [{ key: 'name', order: 'desc' }],
});

// Fetch lecturers from API
const fetchLecturers = async () => {
  // Check if user has permission to view lecturers
  if (!canViewLecturers.value) {
    console.log('No permission to view lecturers');
    return;
  }

  loading.value = true;
  try {
    // Call the getLecturers API with the correct parameters
    const response = await userManagement.getLecturers({
      page: pagination.page,
      perPage: pagination.itemsPerPage,
      sortBy: pagination.sortBy.length ? pagination.sortBy[0].key : 'name',
      sortOrder: pagination.sortBy.length ? pagination.sortBy[0].order : 'desc',
      filters: activeFilters.value
    });

    // Update the lecturers and pagination
    lecturers.value = response.data.items || [];
    pagination.totalItems = response.data.pagination?.total || 0;

  } catch (error) {
    console.error('Error fetching lecturers:', error);
  } finally {
    loading.value = false;
  }
};

// Event Handlers
const handleFiltersUpdated = (filters: any) => {
  activeFilters.value = filters;
  pagination.page = 1; // Reset to first page
  fetchLecturers();
};

const handlePageChange = (newPage: number) => {
  pagination.page = newPage;
  fetchLecturers();
};

const handleItemsPerPageChange = (newItemsPerPage: number) => {
  pagination.itemsPerPage = newItemsPerPage;
  pagination.page = 1; // Reset to first page
  fetchLecturers();
};

const handleOptionsUpdate = ({ page, itemsPerPage, sortBy }: any) => {
  pagination.page = page;
  pagination.itemsPerPage = itemsPerPage;
  pagination.sortBy = sortBy;
  fetchLecturers();
};

const handleLecturerAdded = () => {
  fetchLecturers(); // Refresh list
};

const handleLecturerUpdated = () => {
  fetchLecturers(); // Refresh list
};

const handleEditLecturer = (lecturer: Lecturer) => {
  if (!canEditLecturers.value) {
    return;
  }
  selectedLecturer.value = lecturer;
  showUpdateFormDialog.value = true;
};

const handleDeleteLecturer = (lecturer: Lecturer) => {
  if (!canDeleteLecturers.value) {
    return;
  }
  selectedLecturer.value = lecturer;
  showDeleteDialog.value = true;
};

const confirmDeleteLecturer = async () => {
  if (!selectedLecturer.value || !canDeleteLecturers.value) return;
  loading.value = true;
  try {
    await userManagement.deleteLecturer(selectedLecturer.value.id.toString());
    fetchLecturers();
  } catch (error) {
    console.error('Error deleting lecturer:', error);
  } finally {
    showDeleteDialog.value = false;
    loading.value = false;
  }
};

onMounted(() => {
  // Wait a bit for permissions to initialize, then fetch lecturers
  setTimeout(() => {
    fetchLecturers();
  }, 100);
});
</script>