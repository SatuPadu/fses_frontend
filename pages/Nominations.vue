<template>
  <PermissionGuard module="nominations" action="view">
    <v-row>
      <v-col cols="12" md="12">
        <h1>Examiner Nominations</h1>
        <!-- Action Buttons (if any) -->
        <!-- <div class="d-flex justify-end mb-4 mt-4 gap-2">
          <PermissionButton ...>Add Nomination</PermissionButton>
        </div> -->
        <!-- Filters -->
        <div class="mb-4 mt-4">
          <NominationFilters @filters-updated="handleFiltersUpdated" />
        </div>
        <!-- Nominations Table -->
        <UiParentCard class="mt-4" :showTitle="false">
          <NominationsTable
            :nominations="nominations"
            :loading="loading"
            :total-items="pagination.totalItems"
            :items-per-page="pagination.itemsPerPage"
            :page="pagination.page"
            @update-options="handleOptionsUpdate"
            @nominate-examiners="handleNominateExaminers"
            @edit-nomination="handleEditNomination"
            @postpone-evaluation="handlePostponeEvaluation"
            @lock-nomination="handleLockNomination"
            @show-details="handleShowDetails"
          />
        </UiParentCard>
      </v-col>
    </v-row>

    <!-- Dialogs -->
    <PermissionGuard module="nominations" action="create">
      <NominationForm
        v-show="showNominationFormDialog"
        :dialog="showNominationFormDialog"
        :nomination-data="selectedNomination || undefined"
        :is-edit="isEditMode"
        @toggle-dialog="showNominationFormDialog = false"
        @nomination-created="handleNominationCreated"
        @nomination-updated="handleNominationUpdated"
      />
    </PermissionGuard>

    <PermissionGuard module="nominations" action="postpone">
      <PostponeEvaluation
        v-if="showPostponeDialog"
        :dialog="showPostponeDialog"
        :nomination-data="selectedNomination || undefined"
        @toggle-dialog="showPostponeDialog = false"
        @evaluation-postponed="handleEvaluationPostponed"
      />
    </PermissionGuard>

    <NominationDetailsModal
      v-if="showDetailsDialog && selectedNomination"
      :dialog="showDetailsDialog"
      :nomination-data="selectedNomination || undefined"
      @toggle-dialog="showDetailsDialog = false"
    />

    <PermissionGuard module="nominations" action="lock">
      <v-dialog v-model="showLockDialog" max-width="400">
        <v-card
          title="Confirm Lock"
          text="Are you sure you want to lock this nomination? This action cannot be undone and will prevent further modifications."
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-lock" color="warning"></v-icon>
          </template>
          <v-card-actions class="justify-start">
            <v-btn
              color="warning"
              text="Lock Nomination"
              :loading="loading"
              @click="confirmLockNomination"
            />
            <v-btn text="Cancel" @click="showLockDialog = false"></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </PermissionGuard>
  </PermissionGuard>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import UiParentCard from '~/components/shared/UiParentCard.vue';
import NominationFilters from '~/components/nominations/NominationFilters.vue';
import NominationsTable from '~/components/nominations/NominationsTable.vue';
import NominationForm from '~/components/nominations/NominationForm.vue';
import PostponeEvaluation from '~/components/nominations/PostponeEvaluation.vue';
import NominationDetailsModal from '~/components/nominations/NominationDetailsModal.vue';
import PermissionGuard from '~/components/shared/PermissionGuard.vue';
import { useNominationManagement } from '~/composables/useNominationManagement';
import { usePermissions } from '~/composables/usePermissions';
import type { Evaluation } from '~/types/global';

const nominationManagement = useNominationManagement();
const { canViewNominations, canCreateNominations, canEditNominations, canPostponeNominations, canLockNominations } = usePermissions();

// Dialog states
const showNominationFormDialog = ref(false);
const showPostponeDialog = ref(false);
const showDetailsDialog = ref(false);
const showLockDialog = ref(false);

// Nomination data and state
const nominations = ref<Evaluation[]>([]);
const selectedNomination = ref<Evaluation | null>(null);
const loading = ref(false);
const activeFilters = ref({});
const isEditMode = ref(false);

// Pagination and sorting state
const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
  totalItems: 0,
  sortBy: [{ key: 'student_name', order: 'desc' }],
});

// Fetch nominations from API
const fetchNominations = async () => {
  // Check if user has permission to view nominations
  if (!canViewNominations.value) {
    return;
  }

  loading.value = true;
  try {
    // Call the getNominations API with the correct parameters
    const response = await nominationManagement.getNominations({
      page: pagination.page,
      perPage: pagination.itemsPerPage,
      sortBy: pagination.sortBy.length ? pagination.sortBy[0].key : 'student_name',
      sortOrder: pagination.sortBy.length ? pagination.sortBy[0].order : 'desc',
      filters: activeFilters.value
    });

    // Update the nominations and pagination
    nominations.value = (response.data.items || [])
      .filter((item: any) => item && typeof item.id === 'number' && typeof item.student_id === 'number') as Evaluation[];
    pagination.totalItems = response.data.pagination?.total || 0;

  } catch (error) {
    console.error('Error fetching nominations:', error);
  } finally {
    loading.value = false;
  }
};

// Event Handlers
const handleFiltersUpdated = (filters: any) => {
  activeFilters.value = filters;
  pagination.page = 1; // Reset to first page
  fetchNominations();
};

const handleOptionsUpdate = ({ page, itemsPerPage, sortBy }: any) => {
  pagination.page = page;
  pagination.itemsPerPage = itemsPerPage;
  pagination.sortBy = sortBy;
  fetchNominations();
};

const handleNominateExaminers = (nomination: Evaluation) => {
  if (!canCreateNominations.value) {
    return;
  }
  selectedNomination.value = nomination;
  isEditMode.value = false;
  showNominationFormDialog.value = true;
};

const handleEditNomination = (nomination: Evaluation) => {
  if (!canEditNominations.value) {
    return;
  }
  selectedNomination.value = nomination;
  isEditMode.value = true;
  showNominationFormDialog.value = true;
};

const handlePostponeEvaluation = (nomination: Evaluation) => {
  if (!canPostponeNominations.value) {
    return;
  }
  selectedNomination.value = nomination;
  showPostponeDialog.value = true;
};

const handleLockNomination = (nomination: Evaluation) => {
  if (!canLockNominations.value) {
    return;
  }
  selectedNomination.value = nomination;
  showLockDialog.value = true;
};

const handleShowDetails = (nomination: Evaluation) => {
  if (!canViewNominations.value) {
    return;
  }
  selectedNomination.value = nomination;
  showDetailsDialog.value = true;
};

const handleNominationCreated = () => {
  fetchNominations(); // Refresh list
};

const handleNominationUpdated = () => {
  fetchNominations(); // Refresh list
};

const handleEvaluationPostponed = () => {
  fetchNominations(); // Refresh list
};

const confirmLockNomination = async () => {
  if (!selectedNomination.value || !canLockNominations.value) return;
  loading.value = true;
  try {
    await nominationManagement.lockNomination(selectedNomination.value.id.toString());
    fetchNominations();
  } catch (error) {
    console.error('Error locking nomination:', error);
  } finally {
    showLockDialog.value = false;
    loading.value = false;
  }
};

onMounted(() => {
  // Wait a bit for permissions to initialize, then fetch nominations
  setTimeout(() => {
    fetchNominations();
  }, 100);
});
</script> 