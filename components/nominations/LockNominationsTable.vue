<template>
  <v-data-table-server
    :headers="headers"
    :items="processedNominations"
    :items-length="totalItems"
    :loading="loading"
    :items-per-page="itemsPerPage"
    :page="page"
    :item-value="'id'"
    :model-value="selectedNominations"
    show-select
    class="elevation-1 bordered-table"
    @update:model-value="handleSelectionUpdate"
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
    
    <!-- Main Supervisor - Fixed -->
    <template #item.main_supervisor="{ item }">
      <div class="text-caption">
        <span v-if="item._mainSupervisor">{{ item._mainSupervisor }}</span>
        <span v-else class="text-muted">No main supervisor</span>
      </div>
    </template>
    
    <!-- Co-Supervisors -->
    <template #item.co_supervisor="{ item }">
      <div>
        <div v-if="item._coSupervisors && item._coSupervisors.length">
          <div
            v-for="(co, idx) in item._coSupervisors"
            :key="co.label || idx"
            class="text-caption"
          >
            {{ co.name }}
            <span v-if="co.isExternal" class="text-muted ml-1">(External)</span>
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
        :color="getStatusColor(item.nomination_status)"
        :text="getStatusText(item.nomination_status)"
        size="small"
        variant="flat"
      />
    </template>
    
    <!-- Examiners -->
    <template #item.examiners="{ item }">
      <div class="d-flex flex-column gap-1">
        <div v-if="item._examiners && item._examiners.length">
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
    
    <!-- Chairperson -->
    <template #item.chairperson="{ item }">
      <div class="text-caption">
        <div v-if="item.chairperson">
          {{ item._chairperson }}
        </div>
        <div v-else class="text-muted">
          No chairperson assigned
        </div>
      </div>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { toRefs, computed } from 'vue';
import type { Evaluation } from '~/types/global';

// Types
interface ProcessedNomination extends Evaluation {
  _mainSupervisor: string;
  _coSupervisors: Array<{
    label: string;
    name: string;
    isExternal: boolean;
  }>;
  _examiners: Array<{
    key: string;
    name: string;
  }>;
  _chairperson: string;
}

const props = defineProps<{
  nominations: Evaluation[];
  loading: boolean;
  totalItems: number;
  itemsPerPage: number;
  page: number;
  selectedNominations: number[];
}>();

const { nominations, loading, totalItems, itemsPerPage, page, selectedNominations } = toRefs(props);
const emits = defineEmits(['update-options', 'selection-changed']);

const headers: Array<{
    title: string;
    key: string;
    sortable: boolean;
    width?: string;
    align?: 'start' | 'center' | 'end';
  }> = [
  { title: 'No.', key: 'index', sortable: false, width: '80px', align: 'center' },
  { title: 'Student', key: 'student_name', sortable: false, width: '200px', align: 'start' },
  { title: 'Program', key: 'program', sortable: false, width: '200px', align: 'start' },
  { title: 'Research Supervisor', key: 'main_supervisor', sortable: false, width: '250px', align: 'start' },
  { title: 'Co-Supervisor', key: 'co_supervisor', sortable: false, width: '250px', align: 'start' },
  { title: 'Status', key: 'nomination_status', sortable: false, width: '150px', align: 'center' },
  { title: 'Examiners', key: 'examiners', sortable: false, width: '300px', align: 'start' },
  { title: 'Chairperson', key: 'chairperson', sortable: false, width: '250px', align: 'start' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'warning';
    case 'Nominated':
      return 'info';
    case 'Locked':
      return 'success';
    case 'Postponed':
      return 'orange';
    default:
      return 'grey';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'Pending';
    case 'Nominated':
      return 'Nominated';
    case 'Locked':
      return 'Locked';
    case 'Postponed':
      return 'Postponed';
    default:
      return status;
  }
};

const handleOptionsUpdate = (options: any) => {
  emits('update-options', options);
};

const handleSelectionUpdate = (ids: number[]) => {
  emits('selection-changed', ids);
};

// Helper function to filter out null/undefined values
const filterNonNull = <T>(arr: (T | null | undefined)[]): T[] => 
  arr.filter((x): x is T => x !== null && x !== undefined);

// Processed nominations with all data properly formatted
const processedNominations = computed<ProcessedNomination[]>(() => {
  return nominations.value.map(nomination => {
    // Process main supervisor
    let mainSupervisor = '';
    if (nomination.student?.main_supervisor) {
      const supervisor = nomination.student.main_supervisor;
      const title = supervisor.title ? supervisor.title + ' ' : '';
      const name = supervisor.name || '';
      mainSupervisor = (title + name).trim();
    }

    // Process co-supervisors
    const coSupervisors = filterNonNull(
      nomination.student?.co_supervisors?.map((co, idx) => {
        let name = '';
        let isExternal = false;

        if (co.lecturer?.name) {
          // Internal co-supervisor
          const title = co.lecturer.title ? co.lecturer.title + ' ' : '';
          name = (title + co.lecturer.name).trim();
          isExternal = false;
        } else if (co.external_name) {
          // External co-supervisor
          const title = co.lecturer?.title ? co.lecturer.title + ' ' : '';
          name = (title + co.external_name).trim();
          isExternal = true;
        }

        return name ? {
          label: `Co-Supervisor ${idx + 1}`,
          name,
          isExternal
        } : null;
      }) || []
    );

    // Process examiners
    const examiners = filterNonNull([
      nomination.examiner1 ? {
        key: 'E1',
        name: `${nomination.examiner1.title ? nomination.examiner1.title + ' ' : ''}${nomination.examiner1.name}`.trim()
      } : null,
      nomination.examiner2 ? {
        key: 'E2', 
        name: `${nomination.examiner2.title ? nomination.examiner2.title + ' ' : ''}${nomination.examiner2.name}`.trim()
      } : null,
      nomination.examiner3 ? {
        key: 'E3',
        name: `${nomination.examiner3.title ? nomination.examiner3.title + ' ' : ''}${nomination.examiner3.name}`.trim()
      } : null,
    ]);

    // Process chairperson
    let chairperson = '';
    if (nomination.chairperson) {
      const title = nomination.chairperson.title ? nomination.chairperson.title + ' ' : '';
      const name = nomination.chairperson.name || '';
      chairperson = (title + name).trim();
    }

    return {
      ...nomination,
      _mainSupervisor: mainSupervisor,
      _coSupervisors: coSupervisors,
      _examiners: examiners,
      _chairperson: chairperson,
    };
  });
});
</script>

<style scoped>
.v-data-table :deep(.v-data-table__wrapper) {
  border: 1px solid #e0e0e0;
  overflow-x: auto;
  min-width: 2000px; /* Increased to accommodate wider columns */
}

.v-data-table :deep(table) {
  border-collapse: collapse;
  table-layout: fixed !important;
  width: 100% !important;
}

.v-data-table :deep(th) {
  border: 1px solid #e0e0e0 !important;
  background-color: #f5f5f5;
  white-space: normal !important;
  word-wrap: break-word !important;
  vertical-align: top !important;
  padding: 8px !important;
}

.v-data-table :deep(td) {
  border: 1px solid #e0e0e0 !important;
  white-space: normal !important;
  word-wrap: break-word !important;
  word-break: break-word !important;
  vertical-align: top !important;
  padding: 8px !important;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  opacity: 0.8;
}

.section-divider {
  border-bottom: 1px solid #e0e0e0;
}
</style>