<template>
    <v-data-table-server
      :headers="headers"
      :items="processedNominations"
      :items-length="totalItems"
      :loading="loading"
      :items-per-page="itemsPerPage"
      :page="page"
      class="elevation-1 bordered-table"
      @update:options="handleOptionsUpdate"
    >
      <!-- Serial Number -->
      <template #item.index="{ index }">
        {{ (page - 1) * itemsPerPage + index + 1 }}
      </template>
      
      <!-- Student Info -->
      <template #item.student_name="{ item }">
        <div>
          <div class="font-weight-medium">{{ item.student?.name }}</div>
          <div class="text-caption text-muted">{{ item.student?.matric_number }}</div>
        </div>
      </template>
      
      <!-- Program Info -->
      <template #item.program="{ item }">
        <div>
          <div class="font-weight-medium">{{ item.student?.program?.program_name }}</div>
          <div class="text-caption text-muted">Semester {{ item.student?.current_semester }}</div>
        </div>
      </template>
      
      <!-- Co-Supervisors -->
      <template #item.co_supervisor="{ item }">
        <div>
          <div v-if="item._coSupervisors?.length">
            <div
              v-for="co in item._coSupervisors"
              :key="co.label"
              class="text-caption"
            >
              <strong>{{ co.label }}:</strong> {{ co.name }}
            </div>
          </div>
          <div v-else class="text-caption text-muted">
            No co-supervisors
          </div>
        </div>
      </template>
      
      <!-- Status -->
      <template #item.nomination_status="{ item }">
        <v-chip
          :color="STATUS_CONFIG[item.nomination_status]?.color || 'grey'"
          :text="STATUS_CONFIG[item.nomination_status]?.text || item.nomination_status"
          size="small"
          variant="flat"
        />
      </template>
      
      <!-- Examiners -->
      <template #item.examiners="{ item }">
        <div class="d-flex flex-column gap-1">
          <div v-if="item._examiners?.length">
            <div
              v-for="examiner in item._examiners"
              :key="examiner.key"
              class="text-caption"
            >
              <strong>{{ examiner.key }}:</strong> {{ examiner.name }}
            </div>
          </div>
          <div v-else class="text-caption text-muted">
            No examiners assigned
          </div>
        </div>
      </template>
      
      <!-- Chairperson Selection -->
      <template #item.chairperson="{ item }">
        <div class="chairperson-cell">
          <v-select
            :model-value="assignmentMap[item.id]?.chairperson_id || null"
            :items="chairpersonOptions"
            :item-title="lecturerDisplay"
            item-value="id"
            density="compact"
            variant="outlined"
            placeholder="Select Chairperson"
            :disabled="loadingSuggestions"
            hide-details
            class="chairperson-select"
            @update:model-value="(value) => onManualChairpersonChange(item.id, value)"
          >
          </v-select>
          <div v-if="assignmentMap[item.id]?.is_auto_assigned" class="auto-assigned-label text-primary">
            <v-icon size="small" class="mr-1">mdi-auto-fix</v-icon>
            Auto-assigned
          </div>
        </div>
      </template>
    </v-data-table-server>
  </template>
  
  <script setup lang="ts">
  import { toRefs, computed, ref, watch, onMounted } from 'vue';
  import { useNominationManagement } from '~/composables/useNominationManagement';
  import type { Evaluation } from '~/types/global';
  
  // Types
  interface Assignment {
    evaluation_id: number;
    chairperson_id: number;
    is_auto_assigned: boolean;
  }
  
  interface ProcessedNomination extends Evaluation {
    _coSupervisors: Array<{
      label: string;
      name: string;
      isExternal: boolean;
    }>;
    _examiners: Array<{
      key: string;
      name: string;
    }>;
  }
  
  // Props
  const props = defineProps<{
    nominations: Evaluation[];
    loading: boolean;
    totalItems: number;
    itemsPerPage: number;
    page: number;
    assignments: Assignment[];
  }>();
  
  const { nominations, loading, totalItems, itemsPerPage, page, assignments } = toRefs(props);
  const emits = defineEmits<{
    'update-options': [options: any];
    'assignment-changed': [assignments: Assignment[]];
  }>();
  
  // Composables
  const nominationManagement = useNominationManagement();
  
  // Constants
  const STATUS_CONFIG = {
    Pending: { color: 'warning', text: 'Pending' },
    Nominated: { color: 'info', text: 'Nominated' },
    Locked: { color: 'success', text: 'Locked' },
    Postponed: { color: 'orange', text: 'Postponed' },
  } as const;
  
  const headers = [
    { title: 'No.', key: 'index', sortable: false, width: '60px' },
    { title: 'Student', key: 'student_name', sortable: true, width: '200px' },
    { title: 'Program', key: 'program', sortable: true, width: '150px' },
    { title: 'Co-Supervisor', key: 'co_supervisor', sortable: true, width: '180px' },
    { title: 'Status', key: 'nomination_status', sortable: true, width: '120px' },
    { title: 'Examiners', key: 'examiners', sortable: false, width: '200px' },
    { title: 'Chairperson', key: 'chairperson', sortable: false, width: '200px' },
  ] as const;
  
  // State
  const chairpersonOptions = ref<any[]>([]);
  const loadingSuggestions = ref(false);
  
  // Computed
  const assignmentMap = computed(() => {
    const map: Record<number, Assignment> = {};
    assignments.value.forEach(assignment => {
      map[assignment.evaluation_id] = assignment;
    });
    return map;
  });
  
  const processedNominations = computed<ProcessedNomination[]>(() => {
    const filterNonNull = <T>(arr: (T | null)[]): T[] => arr.filter((x): x is T => x !== null);
    return nominations.value.map(nomination => {
      // Process co-supervisors
      const coSupervisors = filterNonNull(
        nomination.student?.co_supervisors
          ?.map((co, idx) => {
            const name = co.lecturer?.name 
              ? `${co.lecturer.title ? co.lecturer.title + ' ' : ''}${co.lecturer.name}`.trim()
              : co.external_name 
                ? `${co.lecturer?.title ? co.lecturer.title + ' ' : ''}${co.external_name}`.trim()
                : null;
            return name ? { label: `Co-Supervisor ${idx + 1}`, name, isExternal: !co.lecturer?.name } : null;
          }) || []
      );
  
      // Process examiners
      const examiners = [
        { key: 'E1', examiner: nomination.examiner1 },
        { key: 'E2', examiner: nomination.examiner2 },
        { key: 'E3', examiner: nomination.examiner3 },
      ]
        .filter(({ examiner }) => examiner)
        .map(({ key, examiner }) => ({
          key,
          name: `${examiner!.title ? examiner!.title + ' ' : ''}${examiner!.name}`.trim(),
        }));
  
      return {
        ...nomination,
        _coSupervisors: coSupervisors,
        _examiners: examiners,
      };
    });
  });
  
  // Methods
  const handleOptionsUpdate = (options: any) => {
    emits('update-options', options);
  };
  
  const onManualChairpersonChange = (evaluationId: number, chairpersonId: number | null | undefined) => {
    const currentAssignments = [...assignments.value];
    const existingIndex = currentAssignments.findIndex(a => a.evaluation_id === evaluationId);
    
    if (chairpersonId) {
      const assignment: Assignment = {
        evaluation_id: evaluationId,
        chairperson_id: chairpersonId,
        is_auto_assigned: false,
      };
      
      if (existingIndex >= 0) {
        currentAssignments[existingIndex] = assignment;
      } else {
        currentAssignments.push(assignment);
      }
    } else if (existingIndex >= 0) {
      currentAssignments.splice(existingIndex, 1);
    }
    
    emits('assignment-changed', currentAssignments);
  };
  
  const fetchChairpersonOptions = async () => {
    loadingSuggestions.value = true;
    try {
      const response = await nominationManagement.getChairpersonSuggestions();
      chairpersonOptions.value = response.data || [];
    } catch (error) {
      chairpersonOptions.value = [];
    } finally {
      loadingSuggestions.value = false;
    }
  };
  
  // Watchers
  watch(
    () => nominations.value,
    async (newNominations) => {
      if (newNominations.length > 0) {
        await fetchChairpersonOptions();
      }
    },
    { immediate: true }
  );
  
  // Also watch assignments to update counts when assignments change
  watch(
    () => assignments.value,
    async () => {
      await fetchChairpersonOptions();
    },
    { deep: true }
  );
  
  // Lifecycle
  onMounted(async () => {
    await fetchChairpersonOptions();
  });
  
  const lecturerDisplay = (item: any) => `${item.title ? item.title + ' ' : ''}${item.name}`.trim();
  </script>
  
  <style scoped>
  .v-data-table :deep(.v-data-table__wrapper) {
    border: 1px solid #e0e0e0;
  }
  
  .v-data-table :deep(table) {
    border-collapse: collapse;
  }
  
  .v-data-table :deep(th) {
    border: 1px solid #e0e0e0 !important;
    background-color: #f5f5f5;
  }
  
  .v-data-table :deep(td) {
    border: 1px solid #e0e0e0 !important;
  }
  
  .chairperson-select {
    min-width: 200px;
  }
  
  .chairperson-cell {
    padding-top: 8px;
    padding-bottom: 8px;
    min-height: 56px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .auto-assigned-label {
    font-size: 11px;
    margin-top: 2px;
    margin-bottom: 2px;
    line-height: 1.2;
  }
  </style>