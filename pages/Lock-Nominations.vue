<template>
  <PermissionGuard module="nominations" action="lock">
    <v-row>
      <v-col cols="12" md="12">
        <h1>Lock Nominations</h1>
        
        <!-- Filters -->
        <div class="mb-4 mt-4">
          <NominationFilters @filters-updated="handleFiltersUpdated" />
        </div>
        
        <!-- Lock Button -->
        <div v-if="selectedNominations.length > 0" class="d-flex justify-start mb-4">
          <v-btn
            color="success"
            variant="flat"
            @click="lockSelectedNominations"
            :loading="lockingNominations"
          >
            <v-icon left>mdi-lock</v-icon>
            Lock Selected Nominations ({{ selectedNominations.length }})
          </v-btn>
        </div>
        
        <!-- Nominations Table -->
        <UiParentCard class="mt-4" :showTitle="false">
          <LockNominationsTable
            :nominations="nominations"
            :loading="loading"
            :total-items="pagination.totalItems"
            :items-per-page="pagination.itemsPerPage"
            :page="pagination.page"
            :selected-nominations="selectedNominations"
            @update-options="handleOptionsUpdate"
            @selection-changed="handleSelectionChanged"
          />
        </UiParentCard>
      </v-col>
    </v-row>
  </PermissionGuard>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import UiParentCard from '~/components/shared/UiParentCard.vue';
import NominationFilters from '~/components/nominations/NominationFilters.vue';
import LockNominationsTable from '~/components/nominations/LockNominationsTable.vue';
import PermissionGuard from '~/components/shared/PermissionGuard.vue';
import { useNominationManagement } from '~/composables/useNominationManagement';
import { usePermissions } from '~/composables/usePermissions';
import { useToast } from '~/composables/useToast';
import type { Evaluation } from '~/types/global';

const nominationManagement = useNominationManagement();
const { canLockNominations } = usePermissions();
const toast = useToast();

// State
const nominations = ref<Evaluation[]>([]);
const selectedNominations = ref<number[]>([]);
const loading = ref(false);
const lockingNominations = ref(false);
const activeFilters = ref({});

// Pagination and sorting state
const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
  totalItems: 0,
  sortBy: [{ key: 'student_name', order: 'desc' }],
});

// Fetch nominations from API with chairperson_assigned=true
const fetchNominations = async () => {
  if (!canLockNominations.value) {
    return;
  }

  loading.value = true;
  try {
    // Add chairperson_assigned=true and department_specific=true to filters
    const filtersWithChairperson = {
      ...activeFilters.value,
      chairperson_assigned: true,
      department_specific: true
    };

    const response = await nominationManagement.getNominations({
      page: pagination.page,
      per_page: pagination.itemsPerPage,
      sortBy: pagination.sortBy.length ? pagination.sortBy[0].key : 'student_name',
      sortOrder: pagination.sortBy.length ? pagination.sortBy[0].order : 'desc',
      filters: filtersWithChairperson,
      locked: false
    });

    // Update the nominations and pagination
    nominations.value = (response.data.items || [])
      .filter((item: any) => item && typeof item.id === 'number' && typeof item.student_id === 'number') as Evaluation[];
    pagination.totalItems = response.data.pagination?.total || 0;

  } catch (error) {
    console.error('Error fetching nominations:', error);
    toast.error('Failed to fetch nominations. Please try again later.');
  } finally {
    loading.value = false;
  }
};

// Event Handlers
const handleFiltersUpdated = (filters: any) => {
  activeFilters.value = filters;
  pagination.page = 1; // Reset to first page
  selectedNominations.value = []; // Clear selections when filters change
  fetchNominations();
};

const handleOptionsUpdate = ({ page, itemsPerPage, sortBy }: any) => {
  pagination.page = page;
  pagination.itemsPerPage = itemsPerPage;
  pagination.sortBy = sortBy;
  fetchNominations();
};

const handleSelectionChanged = (ids: number[]) => {
  selectedNominations.value = ids;
};

const lockSelectedNominations = async () => {
  if (selectedNominations.value.length === 0) return;
  
  lockingNominations.value = true;
  try {
    await nominationManagement.lockNominations(selectedNominations.value);
    // Refresh the list after locking
    fetchNominations();
    selectedNominations.value = [];
    toast.success('Nominations locked successfully!');
  } catch (error) {
    console.error('Error locking nominations:', error);
    toast.error('Failed to lock nominations. Please try again later.');
  } finally {
    lockingNominations.value = false;
  }
};

onMounted(() => {
  // Wait a bit for permissions to initialize, then fetch nominations
  setTimeout(() => {
    fetchNominations();
  }, 100);
});
</script> 