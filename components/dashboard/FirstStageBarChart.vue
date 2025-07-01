<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <span>First Evaluation vs Re-Evaluation</span>
      <div class="d-flex gap-2">
        <v-select
          v-model="selectedAcademicYear"
          :items="academicYears"
          label="Academic Year"
          density="compact"
          hide-details
          style="min-width: 200px"
          @update:model-value="onAcademicYearChange"
        />
        <v-select
          v-model="selectedProgram"
          :items="chartData.programs"
          label="Program"
          density="compact"
          hide-details
          style="min-width: 200px"
          clearable
        />
      </div>
    </v-card-title>
    <v-card-text>
      <div style="min-height:370px;">
        <apexchart
          v-if="!loading"
          type="bar"
          height="370"
          :options="chartOptions"
          :series="filteredSeries"
        />
        <v-progress-circular v-else indeterminate color="primary" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useReports } from '~/composables/useReports';
import { useNominationManagement } from '~/composables/useNominationManagement';

interface SeriesItem {
  name: string;
  data: number[];
}
interface ChartData {
  categories: string[];
  series: SeriesItem[];
  programs: string[];
}

const reportsApi = useReports();
const nominationManagement = useNominationManagement();
const chartData = ref<ChartData>({ categories: [], series: [], programs: [] });
const loading = ref(false);

const academicYears = ref<Array<{ title: string; value: string }>>([]);
const selectedAcademicYear = ref<string | null>(null);
const selectedProgram = ref<string | null>(null);

const emits = defineEmits(['update:academicYear']);

function onAcademicYearChange(val: string) {
  selectedAcademicYear.value = val;
  emits('update:academicYear', val);
}

async function fetchAcademicYears() {
  try {
    const data = await nominationManagement.getAcademicYears();
    if (data && data.data && Array.isArray(data.data)) {
      academicYears.value = data.data.map((year: string) => ({ title: year, value: year }));
      // Set default to latest year
      if (academicYears.value.length > 0) {
        selectedAcademicYear.value = academicYears.value[0].value;
      }
    } else {
      academicYears.value = [];
    }
  } catch (e) {
    academicYears.value = [];
  }
}

async function fetchBarChartData() {
  if (!selectedAcademicYear.value) return;
  loading.value = true;
  try {
    const response = await reportsApi.getEvaluationChartData(selectedAcademicYear.value);
    chartData.value = response.data || { categories: [], series: [], programs: [] };
  } catch (e) {
    chartData.value = { categories: [], series: [], programs: [] };
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await fetchAcademicYears();
  await fetchBarChartData();
});
watch(selectedAcademicYear, fetchBarChartData);

const filteredSeries = computed<SeriesItem[]>(() => {
  if (!selectedProgram.value) return chartData.value.series;
  const idx = chartData.value.programs.indexOf(selectedProgram.value);
  if (idx === -1) return chartData.value.series;
  // Only show data for the selected program
  return chartData.value.series.map((s) => ({
    name: s.name,
    data: [s.data[idx]]
  }));
});

const filteredPrograms = computed<string[]>(() => {
  if (!selectedProgram.value) return chartData.value.programs;
  return chartData.value.programs.filter((p) => p === selectedProgram.value);
});

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    height: 370,
    stacked: false,
    toolbar: { show: true }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '40%',
      borderRadius: 6
    }
  },
  xaxis: {
    categories: filteredPrograms.value,
    title: { text: 'Programs' },
    labels: { style: { fontSize: '14px' } }
  },
  yaxis: {
    title: { text: 'Evaluations' },
    min: 0,
    labels: { style: { fontSize: '14px' } }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left',
    offsetX: 40
  },
  fill: { opacity: 1 },
  tooltip: {
    y: { formatter: (val: number) => val }
  },
  dataLabels: {
    enabled: true,
    formatter: function (val: number) {
      return val === 0 ? '0' : val;
    },
    style: {
      fontSize: '14px',
      fontWeight: 'bold'
    }
  },
  colors: [
    '#1976d2', // Blue
    '#ff9800', // Orange
    '#9e9e9e', // Grey
    '#ffc107'  // Amber
  ]
}));
</script> 