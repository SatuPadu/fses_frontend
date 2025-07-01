<template>
  <v-card elevation="10" class="withbg">
    <v-card-item>
      <div class="d-flex align-center justify-space-between pt-sm-2">
        <v-card-title class="text-h5">Examiner Sessions</v-card-title>
      </div>
      
      <!-- Filters Row -->
      <v-row class="mt-2">
        <v-col cols="12" md="6">
          <v-select
            label="Examiner"
            :items="props.examiners"
            v-model="localExaminer"
            @update:model-value="onExaminerChange"
            clearable
            variant="outlined"
            density="compact"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            label="Academic Year"
            :items="props.academicYears"
            v-model="localYear"
            @update:model-value="onYearChange"
            clearable
            :loading="loading"
            :disabled="!localExaminer"
            variant="outlined"
            density="compact"
          />
        </v-col>
      </v-row>

      <!-- Two Section Layout -->
      <v-row class="mt-4">
        <div v-if="!summary || !summary.breakdown || Object.keys(summary.breakdown).length === 0" class="no-breakdown-text d-flex align-center justify-center text-center">
          <span class="text-caption text-grey">No breakdown available</span>
        </div>
        <!-- Left Section: Breakdown List -->
        <v-col cols="12" md="7" v-if="summary && summary.breakdown && Object.keys(summary.breakdown).length">
          <div class="breakdown-section">
            <v-progress-circular v-if="loading" indeterminate color="primary" size="small" />
            <template v-else>
              <div v-if="summary && summary.breakdown && Object.keys(summary.breakdown).length" class="breakdown-list">
                <div 
                  v-for="(count, year) in summary.breakdown" 
                  :key="year" 
                  class="breakdown-item d-flex justify-start align-center py-2 gap-6"
                >
                  <span class="text-body-1 text-muted">{{ year }}:</span>
                  <span class="text-body-1 font-weight-bold">{{ count }}</span>
                </div>
              </div>
            </template>
          </div>
        </v-col>
        
        <!-- Right Section: Main Metric -->
        <v-col cols="12" md="5" class="d-flex flex-column align-center justify-center" v-if="summary && summary.breakdown && Object.keys(summary.breakdown).length">
          <div class="main-metric text-center">
            <v-progress-circular v-if="loading" indeterminate color="primary" />
            <template v-else-if="!loading && summary && typeof summary.total === 'number'">
              <div class="text-body-2 text-muted">Total</div>
              <h3 v-if="summary && typeof summary.total === 'number'" class="text-h3 mb-2">
                {{ summary.total }}
              </h3>
              <div class="text-body-2 text-muted">
                {{ getMetricLabel() }}
              </div>
              
              <!-- Growth indicator for multiple years -->
              <div v-if="hasMultipleYears" class="mt-2">
                <v-avatar :class="getGrowthClass()" size="20">
                  <v-icon size="16">{{ getGrowthIcon() }}</v-icon>
                </v-avatar>
                <span class="text-caption ml-1 font-weight-bold">
                  {{ calculateGrowth() }}
                </span>
              </div>
            </template>
          </div>
        </v-col>
      </v-row>
    </v-card-item>
    
    <!-- Chart Area -->
    <div class="mt-3" v-if="chartData.series[0].data.length > 0">
      <apexchart
        type="area"
        height="60"
        :options="chartOptions"
        :series="chartData.series"
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();
const primary = computed(() => theme.current.value.colors.primary);

const props = defineProps({
  summary: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  examiners: { type: Array, required: true },
  academicYears: { type: Array, required: false, default: () => [] },
  selectedExaminer: { type: String, default: null },
  selectedYear: { type: String, default: null },
});

const emits = defineEmits(['update:examiner', 'update:year']);

const localExaminer = props.selectedExaminer ? ref(props.selectedExaminer) : ref(null);
const localYear = props.selectedYear ? ref(props.selectedYear) : ref(null);

// Chart configuration
const chartOptions = computed(() => {
  const breakdownEntries = props.summary?.breakdown ? Object.entries(props.summary.breakdown) : [];
  let labels = breakdownEntries.map(([year]) => year);
  
  // For single data point, duplicate the label to match the data
  if (labels.length === 1) {
    labels = [labels[0], labels[0]];
  }
  
  return {
    labels: labels,
    chart: {
      type: "area",
      height: 60,
      fontFamily: `inherit`,
      foreColor: "#a1aab2",
      toolbar: {
        show: false,
      },
      sparkline: {
        enabled: true,
      },
      group: "sparklines",
    },
    colors: [primary.value],
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "solid",
      opacity: 0.05,
    },
    markers: {
      size: 4,
    },
    tooltip: {
      theme: "light",
      x: {
        show: true,
      },
    },
  };
});

// Chart data based on breakdown
const chartData = computed(() => {
  if (props.summary && props.summary.breakdown) {
    const breakdownEntries = Object.entries(props.summary.breakdown);
    let data = breakdownEntries.map(([year, count]) => count);
    
    // For single data point, duplicate it to make the chart render
    if (data.length === 1) {
      data = [data[0], data[0]];
    }
    
    return {
      series: [
        {
          name: "Sessions",
          data: data,
        },
      ],
    };
  }
  
  // Default empty data
  return {
    series: [
      {
        name: "Sessions",
        data: [],
      },
    ],
  };
});

function onExaminerChange(val: string) {
  if (!val) {
    localYear.value = null;
  }
  emits('update:examiner', val);
}

function onYearChange(val: string) {
  emits('update:year', val);
}

// Computed properties for data handling
const hasMultipleYears = computed(() => {
  return props.summary && props.summary.breakdown && Object.keys(props.summary.breakdown).length > 1;
});

function getMetricLabel(): string {
  if (!props.summary || !props.summary.total) return 'students examined';
  
  const total = props.summary.total;
  return total === 1 ? 'student examined' : 'students examined';
}

function getCurrentPeriod(): string {
  if (!props.summary || !props.summary.breakdown) return '';
  const years = Object.keys(props.summary.breakdown);
  return years[0] || '';
}

function getGrowthClass(): string {
  const growth = calculateGrowthNumber();
  if (growth > 0) return 'bg-lightsuccess text-success';
  if (growth < 0) return 'bg-lighterror text-error';
  return 'bg-lightwarning text-warning';
}

function getGrowthIcon(): string {
  const growth = calculateGrowthNumber();
  if (growth > 0) return 'mdi-trending-up';
  if (growth < 0) return 'mdi-trending-down';
  return 'mdi-minus';
}

function calculateGrowthNumber(): number {
  if (!props.summary || !props.summary.breakdown) return 0;
  
  const years = Object.keys(props.summary.breakdown).sort();
  if (years.length < 2) return 0;
  
  const current = props.summary.breakdown[years[years.length - 1]];
  const previous = props.summary.breakdown[years[years.length - 2]];
  
  if (!previous || previous === 0) return 0;
  
  return Math.round((current - previous) / previous * 100);
}

function calculateGrowth(): string {
  const growth = calculateGrowthNumber();
  return growth > 0 ? `+${growth}%` : `${growth}%`;
}

watch(() => props.selectedExaminer, (val) => { 
  localExaminer.value = val; 
});

watch(() => props.selectedYear, (val) => { 
  localYear.value = val; 
});
</script>

<style scoped>
.breakdown-section {
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.breakdown-list {
  border-left: 3px solid rgba(var(--v-theme-primary), 0.2);
  padding-left: 16px;
}

.breakdown-item {
  border-bottom: 1px solid rgba(var(--v-theme-surface-variant), 0.12);
}

.breakdown-item:last-child {
  border-bottom: none;
}

.no-breakdown-text {
  width: 100%;
  height: 100%;
  min-height: 120px;
}

.main-metric {
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

@media (max-width: 960px) {
  .breakdown-section,
  .main-metric {
    min-height: auto;
  }
  
  .no-breakdown-text {
    min-height: auto;
  }
}
</style>