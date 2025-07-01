<template>
  <v-row>
    <v-col cols="12">
      <h1>Reports & Statistics</h1>
      <!-- Filters -->
      <div class="mb-4 mt-4">
        <DashboardReportFilters @filters-updated="handleFiltersUpdated" />
      </div>
      <!-- Export Button -->
      <div class="d-flex justify-end mb-2">
        <v-btn color="primary" variant="outlined" @click="exportReport">
          <v-icon left>mdi-download</v-icon>
          Export
        </v-btn>
      </div>
      <!-- Report Table -->
      <UiParentCard class="mt-4" :showTitle="false">
        <DashboardReportTable
          :reports="reports"
          :loading="loading"
          :total-items="pagination.totalItems"
          :items-per-page="pagination.itemsPerPage"
          :page="pagination.page"
          @update-options="handleOptionsUpdate"
        />
      </UiParentCard>
    </v-col>
  </v-row>
  <v-row class="mt-8">
    <v-col cols="12">
      <FirstStageBarChart :data="barChartData" :loading="loading" :academic-year="selectedAcademicYear" />
    </v-col>
  </v-row>
  <v-row class="mt-4">
    <v-col cols="12" md="6">
      <ExaminerSessions
        :summary="examinerSummary"
        :loading="examinerLoading"
        :examiners="examiners"
        :academic-years="academicYears"
        :selected-examiner="selectedExaminer"
        :selected-year="selectedExaminerYear"
        @update:examiner="selectedExaminer = $event"
        @update:year="selectedExaminerYear = $event"
      />
    </v-col>
    <v-col cols="12" md="6">
      <ChairpersonSessions
        :summary="chairpersonSummary"
        :loading="chairpersonLoading"
        :chairpersons="chairpersons"
        :academic-years="academicYears"
        :selected-chairperson="selectedChairperson"
        :selected-year="selectedChairpersonYear"
        @update:chairperson="selectedChairperson = $event"
        @update:year="selectedChairpersonYear = $event"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import UiParentCard from '~/components/shared/UiParentCard.vue';
import DashboardReportFilters from '~/components/dashboard/ReportFilters.vue';
import DashboardReportTable from '~/components/dashboard/ReportTable.vue';
import FirstStageBarChart from '~/components/dashboard/FirstStageBarChart.vue';
import ExaminerSessions from '~/components/dashboard/ExaminerSessions.vue';
import ChairpersonSessions from '~/components/dashboard/ChairpersonSessions.vue';
import { useReports } from '~/composables/useReports';
import { useNominationManagement } from '~/composables/useNominationManagement';

const reportsApi = useReports();
const nominationManagement = useNominationManagement();

// State
const reports = ref([]);
const loading = ref(false);
const activeFilters = ref({});

// Pagination and sorting state
const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
  totalItems: 0,
  sortBy: [{ key: 'student_name', order: 'desc' }],
});

// Statistics state
const barChartData = ref([
  { label: 'First Evaluation', value: 0 },
  { label: 'Re-Evaluation', value: 0 },
]);
const selectedAcademicYear = ref(null);
const academicYears = ref([]);

const examiners = ref([]);
const selectedExaminer = ref(null);
const selectedExaminerYear = ref(null);

const chairpersonSessions = ref([]);
const chairpersons = ref([]);
const selectedChairperson = ref(null);
const selectedChairpersonYear = ref(null);

const examinerSummary = ref(null);
const chairpersonSummary = ref(null);

const examinerLoading = ref(false);
const chairpersonLoading = ref(false);

// Fetch bar chart data
async function fetchBarChartData() {
  loading.value = true;
  try {
    const data = await reportsApi.getEvaluationChartData(selectedAcademicYear.value);
    barChartData.value = [
      { label: 'First Evaluation', value: data.first_evaluation || 0 },
      { label: 'Re-Evaluation', value: data.re_evaluation || 0 },
    ];
  } catch (e) {
    barChartData.value = [
      { label: 'First Evaluation', value: 0 },
      { label: 'Re-Evaluation', value: 0 },
    ];
  } finally {
    loading.value = false;
  }
}

// Fetch examiners and sessions
async function fetchExaminers() {
  const data = await reportsApi.getUniqueExaminers();
  const items = data.data || [];
  examiners.value = items.length > 0
    ? items.map((e: any) => ({ title: (e.title ? e.title + ' ' : '') + e.name, value: e.id }))
    : [{ title: 'No examiners found', value: '', disabled: true }];
}
async function fetchExaminerSessions() {
  if (!selectedExaminer.value) { examinerSummary.value = null; return; }
  examinerLoading.value = true;
  try {
    const data = await reportsApi.getExaminerSessions(selectedExaminer.value, selectedExaminerYear.value);
    examinerSummary.value = data.data;
  } finally {
    examinerLoading.value = false;
  }
}

// Fetch chairpersons and sessions
async function fetchChairpersons() {
  const data = await reportsApi.getUniqueChairpersons();
  const items = data.data || [];
  chairpersons.value = items.length > 0
    ? items.map((c: any) => ({ title: (c.title ? c.title + ' ' : '') + c.name, value: c.id }))
    : [{ title: 'No chairpersons found', value: '', disabled: true }];
}
async function fetchChairpersonSessions() {
  if (!selectedChairperson.value) { chairpersonSummary.value = null; return; }
  chairpersonLoading.value = true;
  try {
    const data = await reportsApi.getChairpersonSessions(selectedChairperson.value, selectedChairpersonYear.value);
    chairpersonSummary.value = data.data;
  } finally {
    chairpersonLoading.value = false;
  }
}

// Fetch academic years (reuse from enums or API if available)
async function fetchAcademicYears() {
  try {
    const data = await nominationManagement.getAcademicYears();
    if (data && data.data && Array.isArray(data.data)) {
      academicYears.value = data.data.map((year: string) => ({ title: year, value: year }));
    } else {
      academicYears.value = [];
    }
  } catch (e) {
    academicYears.value = [];
  }
}

onMounted(async () => {
  await fetchAcademicYears();
  await fetchBarChartData();
  await fetchExaminers();
  await fetchChairpersons();
  await fetchReports();
});

watch(selectedAcademicYear, fetchBarChartData);
watch([selectedExaminer, selectedExaminerYear], fetchExaminerSessions);
watch([selectedChairpersonYear], fetchChairpersonSessions);

async function fetchReports() {
  loading.value = true;
  try {
    const options = {
      page: pagination.page,
      perPage: pagination.itemsPerPage,
      sortBy: pagination.sortBy[0]?.key || 'student_name',
      sortOrder: pagination.sortBy[0]?.order || 'desc',
      filters: {
        ...activeFilters.value,
        locked: true,
      }
    };

    const data = await nominationManagement.getNominations(options);
    
    if (data && data.data) {
      reports.value = data.data.items || [];
      pagination.totalItems = data.data.total || 0;
    } else {
      reports.value = [];
      pagination.totalItems = 0;
    }
  } catch (e) {
    console.error('Failed to fetch reports:', e);
    reports.value = [];
    pagination.totalItems = 0;
  } finally {
    loading.value = false;
  }
}

async function exportReport() {
  try {
    // Create export options with all data (no pagination)
    const exportOptions = {
      page: 1,
      perPage: 10000, // Large number to get all data
      sortBy: pagination.sortBy[0]?.key || 'student_name',
      sortOrder: pagination.sortBy[0]?.order || 'desc',
      filters: {
        ...activeFilters.value,
        // Add any additional filters needed for reports
      }
    };

    const data = await nominationManagement.getNominations(exportOptions);
    
    if (data && data.data && data.data.items) {
      // Convert data to CSV format
      const csvContent = convertToCSV(data.data.items);
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `reports_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (e) {
    console.error('Failed to export report:', e);
    // You might want to show a toast notification here
  }
}

function convertToCSV(data: any[]) {
  if (!data || data.length === 0) return '';
  
  // Define CSV headers based on the data structure
  const headers = [
    'Student Name',
    'Matric Number',
    'Program',
    'Department',
    'Supervisor',
    'Co-Supervisors',
    'Examiner 1',
    'Examiner 2', 
    'Examiner 3',
    'Chairperson',
    'Status',
    'Academic Year'
  ];
  
  const csvRows = [headers.join(',')];
  
  data.forEach(item => {
    const row = [
      `"${item.student?.name || ''}"`,
      `"${item.student?.matric_number || ''}"`,
      `"${item.student?.program?.program_name || ''}"`,
      `"${item.student?.program?.department || ''}"`,
      `"${item.student?.supervisor?.name || ''}"`,
      `"${item.student?.co_supervisors?.map((cs: any) => cs.lecturer?.name || cs.external_name).join('; ') || ''}"`,
      `"${item.examiner1?.name || ''}"`,
      `"${item.examiner2?.name || ''}"`,
      `"${item.examiner3?.name || ''}"`,
      `"${item.chairperson?.name || ''}"`,
      `"${item.nomination_status || ''}"`,
      `"${item.academic_year || ''}"`
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
}

function handleFiltersUpdated(filters: any) {
  activeFilters.value = filters;
  pagination.page = 1;
  fetchReports();
}

function handleOptionsUpdate({ page, itemsPerPage, sortBy }: any) {
  pagination.page = page;
  pagination.itemsPerPage = itemsPerPage;
  pagination.sortBy = sortBy;
  fetchReports();
}
</script> 