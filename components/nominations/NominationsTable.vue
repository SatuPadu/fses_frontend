<template>
  <v-data-table-server
    :headers="headers"
    :items="processedNominations"
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
          <div>
            <div class="font-weight-medium">{{ item.student?.name }}</div>
            <div class="text-caption text-muted">{{ item.student?.matric_number }}</div>
          </div>
        </td>
        <td class="border border-gray-300">
          <div>
            <div class="font-weight-medium">{{ item.student?.program?.program_name }}</div>
            <div class="text-caption text-muted">Semester {{ item.student?.current_semester }}</div>
          </div>
        </td>
        <td class="border border-gray-300">
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
        </td>
        <td class="border border-gray-300">
          <v-chip
            :color="getStatusColor(item.nomination_status)"
            :text="getStatusText(item.nomination_status)"
            size="small"
            variant="flat"
          />
        </td>
        <td class="border border-gray-300">
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
        </td>
        <td class="border border-gray-300">
          <div class="d-flex flex-column gap-1">
            <div v-if="item.chairperson" class="text-caption">
              <strong>Chairperson:</strong> {{ (item.chairperson.title ? item.chairperson.title + ' ' : '') + item.chairperson.name }}
            </div>
            <div v-else class="text-caption text-muted">
              No chairperson assigned
            </div>
          </div>
        </td>
        <td v-if="canEditNominations || canCreateNominations || canViewNominations || canPostponeNominations" class="border border-gray-300">
          <div class="d-flex justify-center">
            <v-btn 
              v-if="canViewNominations"
              icon="mdi-eye"
              variant="text"
              @click="showDetails(item)"
              color="info"
            />
            <v-btn 
              v-if="canCreateNominations && item.nomination_status === 'Pending'"
              icon="mdi-pencil"
              variant="text"
              @click="editNomination(item)"
              color="primary"
            />
            <v-btn 
              v-if="canEditNominations && item.nomination_status === 'Nominated'"
              icon="mdi-pencil"
              variant="text"
              @click="editNomination(item)"
              color="warning"
            />
            <v-btn 
              v-if="canPostponeNominations && item.nomination_status !== 'Locked'"
              icon="mdi-calendar-clock"
              variant="text"
              @click="postponeEvaluation(item)"
              color="orange"
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
import { useEnumsStore } from '~/stores/enums';
import type { Evaluation } from '~/types/global';

const props = defineProps<{
  nominations: Evaluation[];
  loading: boolean;
  totalItems: number;
  itemsPerPage: number;
  page: number;
}>();

const { nominations, loading, totalItems, itemsPerPage, page } = toRefs(props);
const emits = defineEmits([
  'update-options', 
  'edit-nomination', 
  'postpone-evaluation', 
  'show-details'
]);

const { 
  canViewNominations, 
  canCreateNominations, 
  canEditNominations, 
  canPostponeNominations 
} = usePermissions();

const enumsStore = useEnumsStore();

const headers: Array<{
    title: string;
    key: string;
    sortable: boolean;
    width?: string;
    align?: 'start' | 'center' | 'end';
  }> = [
  { title: 'No.', key: 'index', sortable: false, width: '60px', align: 'center' },
  { title: 'Student', key: 'student_name', sortable: false, width: '200px', align: 'start' },
  { title: 'Program', key: 'program', sortable: false, width: '150px', align: 'start' },
  { title: 'Co-Supervisor', key: 'co_supervisor', sortable: false, width: '180px', align: 'start' },
  { title: 'Status', key: 'nomination_status', sortable: false, width: '120px', align: 'start' },
  { title: 'Examiners', key: 'examiners', sortable: false, width: '200px', align: 'start' },
  { title: 'Chairperson', key: 'chairperson', sortable: false, width: '180px', align: 'start' },
  { title: 'Actions', key: 'actions', sortable: false, width: '120px', align: 'center' },
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
  const statusOptions = enumsStore.getNominationStatusOptions();
  const statusOption = statusOptions.find(option => option.value === status);
  return statusOption ? statusOption.title : status;
};

const handleOptionsUpdate = (options: any) => {
  emits('update-options', options);
};

const editNomination = (nomination: Evaluation) => {
  emits('edit-nomination', nomination);
};

const postponeEvaluation = (nomination: Evaluation) => {
  emits('postpone-evaluation', nomination);
};

const showDetails = (nomination: Evaluation) => {
  emits('show-details', nomination);
};

// Processed nominations with  co_supervisors flattened for display
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

.section-divider {
  border-bottom: 1px solid #e0e0e0;
}
</style>