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
  >
    <template #item.index="{ index }">
      {{ (page - 1) * itemsPerPage + index + 1 }}
    </template>
    <template #item.student_name="{ item }">
      {{ item.student?.name || '-' }}
    </template>
    <template #item.program="{ item }">
      {{ item.student?.program?.program_code || '-' }}
    </template>
    <template #item.evaluation_type="{ item }">
      {{ item.student?.evaluation_type || '-' }}
    </template>
    <template #item.research_title="{ item }">
      {{ item.student?.research_title || '-' }}
    </template>
    <template #item.current_semester="{ item }">
      {{ item.student?.current_semester + '/' + item.student?.program?.total_semesters || '-' }}
    </template>
    <template #item.main_supervisor="{ item }">
      {{ item.student?.main_supervisor?.name || '-' }}
    </template>
    <template #item.co_supervisor="{ item }">
      <span v-if="item.student?.co_supervisors && item.student.co_supervisors.length">
        {{ item.student.co_supervisors.map((cs: any) => cs.lecturer?.name || cs.external_name).join('; ') }}
      </span>
      <span v-else>-</span>
    </template>
    <template #item.examiner_1="{ item }">
      {{ item.examiner1?.name || '-' }}
    </template>
    <template #item.examiner_2="{ item }">
      {{ item.examiner2?.name || '-' }}
    </template>
    <template #item.examiner_3="{ item }">
      {{ item.examiner3?.name || '-' }}
    </template>
    <template #item.chairperson="{ item }">
      {{ item.chairperson?.name || '-' }}
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
  align?: 'start' | 'center' | 'end';
}> = [
  { title: 'No.', key: 'index', sortable: false, width: '80px' },
  { title: 'Student Name', key: 'student_name', width: '400px', sortable: false },
  { title: 'Program', key: 'program', width: '250px', sortable: false },
  { title: 'Evaluation Type', key: 'evaluation_type', width: '250px', sortable: false },
  { title: 'Research Title', key: 'research_title', width: '400px', sortable: false },
  { title: 'Current Semester', key: 'current_semester', width: '180px', sortable: false },
  { title: 'Main Supervisor', key: 'main_supervisor', width: '300px', sortable: false },
  { title: 'Co-Supervisor', key: 'co_supervisor', width: '300px', sortable: false },
  { title: 'Examiner 1', key: 'examiner_1', width: '300px', sortable: false },
  { title: 'Examiner 2', key: 'examiner_2', width: '300px', sortable: false },
  { title: 'Examiner 3', key: 'examiner_3', width: '300px', sortable: false },
  { title: 'Chairperson', key: 'chairperson', width: '300px', sortable: false },
];

function emitUpdateOptions(options: any) {
  emits('update-options', options);
}
</script> 


<style scoped>
.v-data-table :deep(.v-data-table__wrapper) {
  border: 1px solid #e0e0e0;
  overflow-x: auto;
  min-width: 1200px;
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