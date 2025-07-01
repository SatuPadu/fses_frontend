<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <span>First Evaluation vs Re-Evaluation</span>
      <div>
        <v-btn icon @click="downloadChart" :disabled="loading">
          <v-icon>mdi-download</v-icon>
        </v-btn>
        <v-btn icon @click="fullscreen = !fullscreen">
          <v-icon>{{ fullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}</v-icon>
        </v-btn>
      </div>
    </v-card-title>
    <v-card-text :style="fullscreen ? 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;background:white;' : ''">
      <div :style="fullscreen ? 'height:80vh;' : 'height:300px;'">
        <canvas ref="chartRef"></canvas>
      </div>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed } from 'vue';
import Chart from 'chart.js/auto';
import { useReports } from '~/composables/useReports';
import { useEnumsStore } from '~/stores/enums';

const props = defineProps({
  academicYear: { type: String, default: '' },
});
const fullscreen = ref(false);
const chartRef = ref();
let chartInstance: Chart | null = null;
const reportsApi = useReports();
const enumsStore = useEnumsStore();
const chartData = ref<any[]>([]);
const loading = ref(false);

const evaluationTypeLabels = computed(() => {
  const options = enumsStore.getEvaluationTypeOptions();
  // fallback to default if not loaded
  return options.length > 0 ? options.map(opt => opt.title) : ['First Evaluation', 'Re-Evaluation'];
});

async function fetchBarChartData() {
  loading.value = true;
  try {
    const response = await reportsApi.getEvaluationChartData(props.academicYear);
    const result = response.data || {};
    chartData.value = evaluationTypeLabels.value.map(label => {
      const key = Object.keys(result).find(k => k.replace(/[_ ]/g, '').toLowerCase() === label.replace(/[_ ]/g, '').toLowerCase());
      return { label, value: key ? result[key] || 0 : 0 };
    });
  } catch (e) {
    chartData.value = evaluationTypeLabels.value.map(label => ({ label, value: 0 }));
  } finally {
    loading.value = false;
    await nextTick();
    renderChart();
  }
}

function renderChart() {
  if (!chartRef.value) return;
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(chartRef.value, {
    type: 'bar',
    data: {
      labels: chartData.value.map((d: any) => d.label),
      datasets: [{
        label: 'Count',
        data: chartData.value.map((d: any) => d.value),
        backgroundColor: ['#1976d2', '#43a047', '#ff9800', '#e91e63'],
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: false },
      },
    },
  });
}

function downloadChart() {
  if (!chartInstance) return;
  const link = document.createElement('a');
  link.href = chartInstance.toBase64Image();
  link.download = 'first-stage-evaluation-bar-chart.png';
  link.click();
}

onMounted(async () => {
  if (!enumsStore.enumsData) {
    await enumsStore.fetchEnums();
  }
  await fetchBarChartData();
});
watch(() => props.academicYear, fetchBarChartData);
</script> 