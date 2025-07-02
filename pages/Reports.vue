<template>
  <v-row>
    <v-col cols="12">
      <h1>Reports & Statistics</h1>
      <!-- Filters -->
      <div class="mb-4 mt-4">
        <DashboardReportFilters @filters-updated="handleFiltersUpdated" />
      </div>
      <!-- Export Button -->
      <div class="d-flex justify-end mb-2" v-if="permissions.isProgramCoordinator.value || permissions.isPGAM.value">
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
import { usePermissions } from '~/composables/usePermissions';
import { useUserManagement } from '~/composables/useUserManagement';
import { useToast } from '~/composables/useToast';

const reportsApi = useReports();
const nominationManagement = useNominationManagement();
const permissions = usePermissions();
const userManagement = useUserManagement();
const toast = useToast();

// State
const reports = ref([]);
const loading = ref(false);
const activeFilters = ref({
  is_postponed: false,
});

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

const examinerSummary = ref<Record<string, any> | undefined>(undefined);
const chairpersonSummary = ref<number | undefined>(undefined);

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
  if (!selectedExaminer.value) { examinerSummary.value = undefined; return; }
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
  if (!selectedChairperson.value) { chairpersonSummary.value = undefined; return; }
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
      per_page: pagination.itemsPerPage,
      sortBy: pagination.sortBy[0]?.key || 'student_name',
      sortOrder: pagination.sortBy[0]?.order || 'desc',
      filters: {
        ...activeFilters.value,
        locked: activeFilters.value?.is_postponed ? false : true,
      },
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
    // Remove null/empty filters
    const cleanedFilters = Object.fromEntries(
      Object.entries(activeFilters.value).filter(([_, v]) => v !== null && v !== undefined && v !== '')
    );
    const exportBody = {
      columns: [
        "no", "student_name", "program", "evaluation_type", "research_title",
        "current_semester", "main_supervisor", "co_supervisor",
        "examiner_1", "examiner_2", "examiner_3", "chairperson"
      ],
      format: "xlsx",
      filters: cleanedFilters
    };
    const blob = await userManagement.nominationsExport(exportBody);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluations_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (e) {
    console.error('Failed to export report:', e);
    toast.handleApiError(e, 'Failed to export report');
  }
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