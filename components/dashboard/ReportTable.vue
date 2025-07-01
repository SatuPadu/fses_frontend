<template>
  <v-data-table
    :headers="headers"
    :items="props.reports"
    :loading="props.loading"
    :items-per-page="props.itemsPerPage"
    :page="props.page"
    :server-items-length="totalItems"
    class="elevation-1"
    @update:options="emitUpdateOptions"
    resizable
  >
    <template #item.index="{ index }">
      {{ (page - 1) * itemsPerPage + index + 1 }}
    </template>
    <template #item.student_name="{ item }: { item: any }">
      {{ item.student?.name || '-' }}
    </template>
    <template #item.program="{ item }: { item: any }">
      {{ item.student?.program?.program_code || '-' }}
    </template>
    <template #item.evaluation_type="{ item }: { item: any }">
      {{ item.student?.evaluation_type || '-' }}
    </template>
    <template #item.research_title="{ item }: { item: any }">
      {{ item.student?.research_title || '-' }}
    </template>
    <template #item.current_semester="{ item }: { item: any }">
      {{ item.student?.current_semester + '/' + item.student?.program?.total_semesters || '-' }}
    </template>
    <template #item.main_supervisor="{ item }: { item: any }">
      {{ ( item.student?.main_supervisor?.title ? item.student?.main_supervisor?.title + ' ' : '') + item.student?.main_supervisor?.name || '-' }}
    </template>
    <template #item.co_supervisor="{ item }: { item: any }">
      <span v-if="item.student?.co_supervisors && item.student.co_supervisors.length">
        {{ item.student.co_supervisors.map((cs: any) => (cs.lecturer?.title ? cs.lecturer?.title + ' ' : '') + cs.lecturer?.name || cs.external_name).join('; ') }}
      </span>
      <span v-else>-</span>
    </template>
    <template #item.examiner_1="{ item }: { item: any }">
      {{ ( item.examiner1?.title ? item.examiner1?.title + ' ' : '') + item.examiner1?.name || '-' }}
    </template>
    <template #item.examiner_2="{ item }: { item: any }">
      {{ ( item.examiner2?.title ? item.examiner2?.title + ' ' : '') + item.examiner2?.name || '-' }}
    </template>
    <template #item.examiner_3="{ item }: { item: any }">
      {{ ( item.examiner3?.title ? item.examiner3?.title + ' ' : '') + item.examiner3?.name || '-' }}
    </template>
    <template #item.chairperson="{ item }: { item: any }">
      {{ ( item.chairperson?.title ? item.chairperson?.title + ' ' : '') + item.chairperson?.name || '-' }}
    </template>
  </v-data-table>
</template>
<script setup lang="ts">
const props = defineProps({
  reports: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  totalItems: { type: Number, default: 0 },
  itemsPerPage: { type: Number, default: 10 },
  page: { type: Number, default: 1 },
});
const emits = defineEmits(['update-options']);

const headers: Array<{
  title: string;
  key: string;
  sortable?: boolean;
  width?: string;
  minWidth?: string;
  align?: 'start' | 'center' | 'end';
}> = [
  { title: 'No.', key: 'index', sortable: false, width: '80px', minWidth: '80px' },
  { title: 'Student Name', key: 'student_name', width: '200px', minWidth: '200px', sortable: false },
  { title: 'Program', key: 'program', width: '100px', minWidth: '100px', sortable: false },
  { title: 'Evaluation Type', key: 'evaluation_type', width: '200px', minWidth: '200px', sortable: false },
  { title: 'Research Title', key: 'research_title', width: '400px', minWidth: '400px', sortable: false },
  { title: 'Current Semester', key: 'current_semester', width: '150px', minWidth: '150px', sortable: false, align: 'center' },
  { title: 'Main Supervisor', key: 'main_supervisor', width: '300px', minWidth: '300px', sortable: false },
  { title: 'Co-Supervisor', key: 'co_supervisor', width: '300px', minWidth: '300px', sortable: false },
  { title: 'Examiner 1', key: 'examiner_1', width: '300px', minWidth: '300px', sortable: false },
  { title: 'Examiner 2', key: 'examiner_2', width: '300px', minWidth: '300px', sortable: false },
  { title: 'Examiner 3', key: 'examiner_3', width: '300px', minWidth: '300px', sortable: false },
  { title: 'Chairperson', key: 'chairperson', width: '300px', minWidth: '300px', sortable: false },
];

function emitUpdateOptions(options: any) {
  emits('update-options', options);
}
</script> 


<style scoped>
.v-data-table :deep(.v-data-table__wrapper) {
  border: 1px solid #e0e0e0;
  overflow-x: auto;
  min-width: 1400px;
}

.v-data-table :deep(table) {
  border-collapse: collapse;
  table-layout: fixed !important;
  width: 100% !important;
}

.v-data-table :deep(th) {
  border: 1px solid #e0e0e0 !important;
  background-color: #f5f5f5;
  white-space: nowrap !important;
}

.v-data-table :deep(td) {
  border: 1px solid #e0e0e0 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
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