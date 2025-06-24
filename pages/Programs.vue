<template>
  <PermissionGuard module="programs" action="view">
    <v-row>
      <v-col cols="12" md="12">
        <h1>Program Management</h1>
        <!-- Action Buttons -->
        <div class="d-flex justify-end mb-4 mt-4 gap-2">
          <PermissionButton 
            module="programs" 
            action="create"
            @click="showAddFormDialog = true" 
            color="primary" 
            variant="flat" 
            :prepend-icon="PlusIcon"
          >
            Add Program
          </PermissionButton>
        </div>

        <!-- Filters -->
        <ProgramFilters @filters-updated="handleFiltersUpdated" />

        <!-- Programs Table -->
        <UiParentCard class="mt-4" :showTitle="false">
          <ProgramsTable
            :programs="programs"
            :loading="loading"
            :total-items="pagination.totalItems"
            :items-per-page="pagination.itemsPerPage"
            :page="pagination.page"
            @update-options="handleOptionsUpdate"
            @edit-program="handleEditProgram"
            @delete-program="handleDeleteProgram"
          />
        </UiParentCard>
      </v-col>
    </v-row>

    <!-- Dialogs -->
    <PermissionGuard module="programs" action="create">
      <AddProgramForm
        :dialog="showAddFormDialog"
        @toggle-dialog="showAddFormDialog = false"
        @program-added="handleProgramAdded"
      />
    </PermissionGuard>

    <PermissionGuard module="programs" action="edit">
      <UpdateProgramForm
        v-if="selectedProgram"
        :dialog="showUpdateFormDialog"
        :program-info="selectedProgram"
        @toggle-dialog="showUpdateFormDialog = false"
        @program-updated="handleProgramUpdated"
      />
    </PermissionGuard>

    <PermissionGuard module="programs" action="delete">
      <v-dialog v-model="showDeleteDialog" max-width="400">
        <v-card
          title="Confirm Deletion"
          text="Are you sure you want to remove this program? This action cannot be undone."
        >
          <template v-slot:prepend>
            <v-icon :icon="ExclamationCircleIcon" color="error"></v-icon>
          </template>
          <v-card-actions class="justify-start">
            <v-btn
              color="error"
              text="Delete"
              :loading="loading"
              @click="confirmDeleteProgram"
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
import ProgramFilters from '~/components/programs/ProgramFilters.vue';
import ProgramsTable from '~/components/programs/ProgramsTable.vue';
import AddProgramForm from '~/components/programs/AddProgramForm.vue';
import UpdateProgramForm from '~/components/programs/UpdateProgramForm.vue';
import PermissionButton from '~/components/shared/PermissionButton.vue';
import PermissionGuard from '~/components/shared/PermissionGuard.vue';
import { useUserManagement } from '~/composables/useUserManagement';
import { usePermissions } from '~/composables/usePermissions';
import type { Program } from '~/types/global';
import { PlusIcon, ExclamationCircleIcon } from 'vue-tabler-icons';

const userManagement = useUserManagement();
const { canViewPrograms, canCreatePrograms, canEditPrograms, canDeletePrograms } = usePermissions();

// Dialog states
const showAddFormDialog = ref(false);
const showUpdateFormDialog = ref(false);
const showDeleteDialog = ref(false);

// Program data and state
const programs = ref<Program[]>([]);
const selectedProgram = ref<Program | null>(null);
const loading = ref(false);
const activeFilters = ref({});

// Pagination and sorting state
const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
  totalItems: 0,
  sortBy: [{ key: 'program_name', order: 'desc' }],
});

// Fetch programs from API
const fetchPrograms = async () => {
  // Check if user has permission to view programs
  if (!canViewPrograms.value) {
    console.log('No permission to view programs');
    return;
  }

  loading.value = true;
  try {
    const response = await userManagement.getPrograms({
      page: pagination.page,
      perPage: pagination.itemsPerPage,
      sortBy: pagination.sortBy.length ? pagination.sortBy[0].key : 'program_name',
      sortOrder: pagination.sortBy.length ? pagination.sortBy[0].order : 'desc',
      filters: activeFilters.value
    });

    programs.value = response.data.items || [];
    pagination.totalItems = response.data.pagination?.total || 0;

  } catch (error) {
    console.error('Error fetching programs:', error);
  } finally {
    loading.value = false;
  }
};

// Event Handlers
const handleFiltersUpdated = (filters: any) => {
  activeFilters.value = filters;
  pagination.page = 1; // Reset to first page
  fetchPrograms();
};

const handleOptionsUpdate = ({ page, itemsPerPage, sortBy }: any) => {
  pagination.page = page;
  pagination.itemsPerPage = itemsPerPage;
  pagination.sortBy = sortBy;
  fetchPrograms();
};

const handleProgramAdded = () => {
  fetchPrograms(); // Refresh list
};

const handleProgramUpdated = () => {
  fetchPrograms(); // Refresh list
};

const handleEditProgram = (program: Program) => {
  if (!canEditPrograms.value) {
    return;
  }
  selectedProgram.value = program;
  showUpdateFormDialog.value = true;
};

const handleDeleteProgram = (program: Program) => {
  if (!canDeletePrograms.value) {
    return;
  }
  selectedProgram.value = program;
  showDeleteDialog.value = true;
};

const confirmDeleteProgram = async () => {
  if (!selectedProgram.value || !canDeletePrograms.value) return;
  loading.value = true;
  try {
    await userManagement.deleteProgram(selectedProgram.value.id.toString());
    fetchPrograms();
  } catch (error) {
    console.error('Error deleting program:', error);
  } finally {
    showDeleteDialog.value = false;
    loading.value = false;
  }
};

onMounted(() => {
  // Wait a bit for permissions to initialize, then fetch programs
  setTimeout(() => {
    fetchPrograms();
  }, 100);
});
</script>