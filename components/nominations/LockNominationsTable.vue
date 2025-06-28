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
    <!-- Co-Supervisors -->
    <template #item.co_supervisor="{ item }">
      <div>
        <div v-if="item._coSupervisors && item._coSupervisors.length">
          <div
            v-for="(co, idx) in item._coSupervisors"
            :key="co.label || idx"
            class="text-caption"
          >
            <span v-if="!co.isExternal">
              <strong>{{ co.label }}:</strong>
              {{ co.name }}
            </span>
            <span v-else>
              <strong>{{ co.label }}:</strong>
              {{ co.name }}
            </span>
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
        <div v-if="item.examiner1" class="text-caption">
          <strong>E1:</strong> {{ (item.examiner1.title ? item.examiner1.title + ' ' : '') + item.examiner1.name }}
        </div>
        <div v-if="item.examiner2" class="text-caption">
          <strong>E2:</strong> {{ (item.examiner2.title ? item.examiner2.title + ' ' : '') + item.examiner2.name }}
        </div>
        <div v-if="item.examiner3" class="text-caption">
          <strong>E3:</strong> {{ (item.examiner3.title ? item.examiner3.title + ' ' : '') + item.examiner3.name }}
        </div>
        <div v-if="!item.examiner1 && !item.examiner2 && !item.examiner3" class="text-caption text-muted">
          No examiners assigned
        </div>
      </div>
    </template>
    <!-- Chairperson -->
    <template #item.chairperson="{ item }">
      <div class="d-flex flex-column gap-1">
        <div v-if="item.chairperson" class="text-caption">
          <strong>Chairperson:</strong> {{ (item.chairperson.title ? item.chairperson.title + ' ' : '') + item.chairperson.name }}
        </div>
        <div v-else class="text-caption text-muted">
          No chairperson assigned
        </div>
      </div>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { toRefs, computed } from 'vue';
import type { Evaluation } from '~/types/global';

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

const headers = [
  { title: 'No.', key: 'index', sortable: false, width: '60px' },
  { title: 'Student', key: 'student_name', sortable: true, width: '200px' },
  { title: 'Program', key: 'program', sortable: true, width: '150px' },
  { title: 'Co-Supervisor', key: 'co_supervisor', sortable: true, width: '180px' },
  { title: 'Status', key: 'nomination_status', sortable: true, width: '120px' },
  { title: 'Examiners', key: 'examiners', sortable: false, width: '200px' },
  { title: 'Chairperson', key: 'chairperson', sortable: false, width: '180px' },
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

// Processed nominations with co_supervisors flattened for display
const processedNominations = computed(() => {
  return nominations.value.map(nomination => {
    const coSupervisors = (nomination.student?.co_supervisors?.map((co, idx) => {
      if (co.lecturer && typeof co.lecturer.name === 'string') {
        return {
          label: `Co-Supervisor ${idx + 1}`,
          name: `${co.lecturer.title ? co.lecturer.title + ' ' : ''}${co.lecturer.name}`.trim(),
          isExternal: false,
        };
      } else if (co.external_name) {
        const extTitle = co.lecturer && typeof co.lecturer.title === 'string' ? co.lecturer.title + ' ' : '';
        return {
          label: `Co-Supervisor ${idx + 1}`,
          name: `${extTitle}${co.external_name}`.trim(),
          isExternal: true,
        };
      }
      return undefined;
    }) || []).filter((co) => co !== undefined) as Array<{label: string, name: string, isExternal: boolean}>;
    return {
      ...nomination,
      _coSupervisors: coSupervisors
    };
  });
});
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