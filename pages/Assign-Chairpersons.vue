<template>
  <PermissionGuard module="chairpersons" action="assign">
    <v-row>
      <v-col cols="12" md="12">
        <h1>Assign Chairpersons</h1>
        
        <!-- Filters -->
        <div class="mb-4 mt-4">
          <NominationFilters @filters-updated="handleFiltersUpdated" />
        </div>
        
        <!-- Smart Auto Assign Button -->
        <div class="d-flex justify-start mb-4">
          <v-btn
            color="primary"
            variant="flat"
            @click="smartAutoAssignChairpersons"
            :loading="autoAssigning"
            :disabled="nominations.length === 0"
            prepend-icon="mdi-auto-fix"
          >
            Auto Assign Chairpersons
          </v-btn>
        </div>
        
        <!-- Nominations Table -->
        <UiParentCard class="mt-4" :showTitle="false">
          <AssignChairpersonsTable
            ref="chairpersonTableRef"
            :nominations="nominations"
            :loading="loading"
            :total-items="pagination.totalItems"
            :items-per-page="pagination.itemsPerPage"
            :page="pagination.page"
            :assignments="assignments"
            @update-options="handleOptionsUpdate"
            @assignment-changed="handleAssignmentChanged"
          />
        </UiParentCard>
        
        <!-- Action Buttons -->
        <div class="d-flex justify-start mt-4 gap-2">
          <v-btn
            color="success"
            variant="flat"
            @click="saveAssignments"
            :loading="saving"
            :disabled="assignments.length === 0"
            prepend-icon="mdi-content-save"
          >
            Save Assignments
          </v-btn>
          <v-btn
            color="secondary"
            variant="outlined"
            @click="clearAssignments"
            :disabled="assignments.length === 0"
            prepend-icon="mdi-delete"
          >
            Clear All
          </v-btn>
        </div>
      </v-col>
    </v-row>
    
    <!-- Save Confirmation Dialog -->
    <v-dialog v-model="showSaveDialog" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-alert-circle" color="warning" class="mr-2"></v-icon>
          Confirm Save
        </v-card-title>
        <v-card-text>
          Are you sure you want to save the chairperson assignments? This action cannot be undone.
        </v-card-text>
        <v-card-actions class="justify-start">
          <v-btn
            color="primary"
            variant="flat"
            :loading="saving"
            @click="confirmSave"
          >
            Save
          </v-btn>
          <v-btn variant="outlined" @click="showSaveDialog = false" :disabled="saving">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </PermissionGuard>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import UiParentCard from '~/components/shared/UiParentCard.vue';
import NominationFilters from '~/components/nominations/NominationFilters.vue';
import AssignChairpersonsTable from '~/components/nominations/AssignChairpersonsTable.vue';
import PermissionGuard from '~/components/shared/PermissionGuard.vue';
import { useNominationManagement } from '~/composables/useNominationManagement';
import { usePermissions } from '~/composables/usePermissions';
import { useToast } from '~/composables/useToast';
import type { Evaluation } from '~/types/global';

const nominationManagement = useNominationManagement();
const { canAssignChairpersons } = usePermissions();
const toast = useToast();

// Template refs
const chairpersonTableRef = ref();

// State
const nominations = ref<Evaluation[]>([]);
const loading = ref(false);
const autoAssigning = ref(false);
const saving = ref(false);
const showSaveDialog = ref(false);
const activeFilters = ref<Record<string, any>>({});

// Assignments state
const assignments = ref<Array<{
  evaluation_id: number;
  chairperson_id: number;
  is_auto_assigned: boolean;
}>>([]);

// Pagination and sorting state
const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
  totalItems: 0,
  sortBy: [{ key: 'student_name', order: 'desc' as 'asc' | 'desc' }],
});

// Fetch nominations from API with chairperson_assigned=false (not yet assigned)
const fetchNominations = async () => {
  if (!canAssignChairpersons.value) {
    return;
  }

  loading.value = true;
  try {
    // Add chairperson_assigned=false to filters to get nominations without chairpersons
    const filtersWithChairperson = {
      ...activeFilters.value,
      chairperson_assigned: false,
      department_specific: true
    };

    const response = await nominationManagement.getNominations({
      page: pagination.page,
      perPage: pagination.itemsPerPage,
      sortBy: pagination.sortBy.length ? pagination.sortBy[0].key : 'student_name',
      sortOrder: pagination.sortBy.length ? pagination.sortBy[0].order : 'desc',
      filters: filtersWithChairperson
    });

    // Update the nominations and pagination with proper error handling
    const responseData = response?.data;
    if (responseData) {
      nominations.value = (responseData.items || [])
        .filter((item: any) => item && typeof item.id === 'number' && typeof item.student_id === 'number') as Evaluation[];
      pagination.totalItems = responseData.pagination?.total || 0;
    } else {
      nominations.value = [];
      pagination.totalItems = 0;
    }

  } catch (error) {
    console.error('Error fetching nominations:', error);
    nominations.value = [];
    pagination.totalItems = 0;
    toast.handleApiError(error, 'Failed to fetch nominations');
  } finally {
    loading.value = false;
  }
};

// Smart auto assign chairpersons using the child component's logic
const smartAutoAssignChairpersons = async () => {
  if (nominations.value.length === 0) {
    toast.warning('No Nominations', 'No nominations available for assignment');
    return;
  }

  if (!chairpersonTableRef.value) {
    toast.error('System Error', 'Table component not available');
    return;
  }

  autoAssigning.value = true;
  try {
    // Count existing assignments before auto-assignment
    const existingAssignments = assignments.value.length;
    const existingManualAssignments = assignments.value.filter(a => !a.is_auto_assigned).length;
    const existingAutoAssignments = assignments.value.filter(a => a.is_auto_assigned).length;
    
    // Use the child component's smart assignment function
    const newAssignments = await chairpersonTableRef.value.smartAssignAll();
    
    const totalAssigned = newAssignments.length;
    const newManualAssignments = Array.isArray(newAssignments) ? newAssignments.filter(a => !a.is_auto_assigned).length : 0;
    const newAutoAssignments = Array.isArray(newAssignments) ? newAssignments.filter(a => a.is_auto_assigned).length : 0;
    
    // Calculate changes
    const preservedManual = newManualAssignments;
    const replacedConflicted = existingManualAssignments - preservedManual;
    const newlyAutoAssigned = newAutoAssignments - existingAutoAssignments;
    
    if (totalAssigned > 0) {
      assignments.value = newAssignments;
      
      let message = `${totalAssigned} chairpersons assigned intelligently`;
      const details = [];
      
      if (newlyAutoAssigned > 0) {
        details.push(`${newlyAutoAssigned} newly assigned`);
      }
      if (preservedManual > 0) {
        details.push(`${preservedManual} manual preserved`);
      }
      if (replacedConflicted > 0) {
        details.push(`${replacedConflicted} conflicts fixed`);
      }
      
      if (details.length > 0) {
        message += ` (${details.join(', ')})`;
      }
      
      toast.success('Smart Assignment Complete', message);
    } else {
      toast.warning('No Assignments Made', 'No suitable chairpersons available for automatic assignment');
    }
  } catch (error) {
    console.error('Error smart assigning chairpersons:', error);
    toast.handleApiError(error, 'Failed to smart assign chairpersons');
  } finally {
    autoAssigning.value = false;
  }
};

// Save assignments with improved validation
const saveAssignments = () => {
  if (assignments.value.length === 0) {
    toast.warning('No Assignments', 'No assignments to save');
    return;
  }
  
  // Validate assignments before showing dialog
  const validAssignments = assignments.value.filter(assignment => 
    assignment && 
    typeof assignment.evaluation_id === 'number' && 
    typeof assignment.chairperson_id === 'number'
  );
  
  if (validAssignments.length === 0) {
    toast.error('Invalid Assignments', 'No valid assignments found');
    return;
  }
  
  assignments.value = validAssignments;
  showSaveDialog.value = true;
};

const confirmSave = async () => {
  if (assignments.value.length === 0) {
    showSaveDialog.value = false;
    return;
  }

  saving.value = true;
  try {
    const response = await nominationManagement.saveChairpersonAssignments(assignments.value);
    toast.handleApiSuccess(response, 'Chairperson assignments saved successfully');
    showSaveDialog.value = false;
    assignments.value = []; // Clear assignments after successful save
    await fetchNominations(); // Refresh the list
  } catch (error) {
    console.error('Error saving assignments:', error);
    toast.handleApiError(error, 'Failed to save assignments');
  } finally {
    saving.value = false;
  }
};

// Clear all assignments
const clearAssignments = () => {
  if (assignments.value.length === 0) {
    toast.info('No Assignments', 'No assignments to clear');
    return;
  }
  
  assignments.value = [];
  toast.info('Assignments Cleared', 'All chairperson assignments have been cleared');
};

// Event Handlers
const handleFiltersUpdated = (filters: Record<string, any>) => {
  activeFilters.value = filters || {};
  pagination.page = 1; // Reset to first page
  assignments.value = []; // Clear assignments when filters change
  fetchNominations();
};

const handleOptionsUpdate = ({ page, itemsPerPage, sortBy }: {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: 'asc' | 'desc' }>;
}) => {
  pagination.page = page || 1;
  pagination.itemsPerPage = itemsPerPage || 10;
  pagination.sortBy = sortBy || [{ key: 'student_name', order: 'desc' }];
  fetchNominations();
};

const handleAssignmentChanged = (newAssignments: Array<{
  evaluation_id: number;
  chairperson_id: number;
  is_auto_assigned: boolean;
}>) => {
  assignments.value = Array.isArray(newAssignments) ? newAssignments : [];
};

// Watch for permission changes
watch(canAssignChairpersons, (newVal) => {
  if (newVal) {
    fetchNominations();
  }
}, { immediate: false });

onMounted(() => {
  // Wait a bit for permissions to initialize, then fetch nominations
  setTimeout(() => {
    if (canAssignChairpersons.value) {
      fetchNominations();
    }
  }, 100);
});
</script>