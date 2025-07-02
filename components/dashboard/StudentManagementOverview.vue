<template>
  <v-row>
    <!-- Total Students Card -->
    <v-col cols="12" md="3">
      <v-card elevation="2" class="text-center pa-4 h-100 d-flex flex-column">
        <div class="flex-grow-1 d-flex flex-column justify-center align-center">
          <v-icon size="48" color="primary" class="mb-3">
            mdi-account-group
          </v-icon>
          <h2 class="text-h4 font-weight-bold text-primary">
            {{ data.total_students }}
          </h2>
          <p class="text-subtitle-1 text-medium-emphasis">
            Total Students Managed
          </p>
        </div>
      </v-card>
    </v-col>

    <!-- Program Distribution -->
    <v-col cols="12" md="4">
      <v-card elevation="2" class="pa-4 h-100 d-flex flex-column">
        <v-card-title class="text-h6 mb-3">
          Student Distribution by Program
        </v-card-title>
        <div class="flex-grow-1 d-flex align-center justify-center">
          <apexchart
            type="donut"
            height="250"
            :options="programChartOptions.chartOptions"
            :series="programChartOptions.series"
          />
        </div>
      </v-card>
    </v-col>

    <!-- Department Distribution -->
    <v-col cols="12" md="5">
      <v-card elevation="2" class="pa-4 h-100 d-flex flex-column">
        <v-card-title class="text-h6 mb-3">
          Student Distribution by Department
        </v-card-title>
        <div class="flex-grow-1 d-flex align-center justify-center">
          <apexchart
            type="bar"
            height="250"
            :options="departmentChartOptions.chartOptions"
            :series="departmentChartOptions.series"
          />
        </div>
      </v-card>
    </v-col>

    <!-- Evaluation Type Distribution -->
    <v-col cols="12" md="6">
      <v-card elevation="2" class="pa-4 h-100 d-flex flex-column">
        <v-card-title class="text-h6 mb-3">
          Student Distribution by Evaluation Type
        </v-card-title>
        <div class="flex-grow-1 d-flex align-center justify-center">
          <apexchart
            type="pie"
            height="250"
            :options="evaluationChartOptions.chartOptions"
            :series="evaluationChartOptions.series"
          />
        </div>
      </v-card>
    </v-col>

    <!-- Semester Distribution -->
    <v-col cols="12" md="6">
      <v-card elevation="2" class="pa-4 h-100 d-flex flex-column">
        <v-card-title class="text-h6 mb-3">
          Student Distribution by Semester
        </v-card-title>
        <div class="flex-grow-1">
          <v-list>
            <v-list-item
              v-for="(count, semester) in data.by_semester"
              :key="semester"
              class="px-0"
            >
              <template #prepend>
                <v-icon color="primary">mdi-school</v-icon>
              </template>
              <v-list-item-title>
                Semester {{ semester }}
              </v-list-item-title>
              <template #append>
                <v-chip color="primary" variant="outlined">
                  {{ count }} students
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';
import type { StudentManagement } from '@/types/dashboard';

const props = defineProps<{
  data: StudentManagement;
}>();

const theme = useTheme();
const primary = theme.current.value.colors.primary;
const secondary = theme.current.value.colors.secondary;
const success = theme.current.value.colors.success;
const warning = theme.current.value.colors.warning;

// Chart options for program distribution
const programChartOptions = computed(() => ({
  series: Object.values(props.data.by_program),
  chartOptions: {
    labels: Object.keys(props.data.by_program),
    colors: [primary, secondary, success, warning],
    chart: {
      type: 'donut',
      height: 250,
      fontFamily: 'inherit',
    },
    legend: {
      position: 'bottom',
      fontSize: '14px',
      fontFamily: 'inherit',
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val.toFixed(1) + '%';
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
        },
      },
    },
  },
}));

// Chart options for department distribution
const departmentChartOptions = computed(() => ({
  series: [{
    name: 'Students',
    data: Object.values(props.data.by_department),
  }],
  chartOptions: {
    chart: {
      type: 'bar',
      height: 250,
      fontFamily: 'inherit',
      toolbar: { show: false },
    },
    colors: [primary],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: Object.keys(props.data.by_department),
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'inherit',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Number of Students',
        style: {
          fontSize: '12px',
          fontFamily: 'inherit',
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val + ' students';
        },
      },
    },
  },
}));

// Chart options for evaluation type distribution
const evaluationChartOptions = computed(() => ({
  series: Object.values(props.data.by_evaluation_type),
  chartOptions: {
    labels: Object.keys(props.data.by_evaluation_type),
    colors: [success, warning],
    chart: {
      type: 'pie',
      height: 250,
      fontFamily: 'inherit',
    },
    legend: {
      position: 'bottom',
      fontSize: '14px',
      fontFamily: 'inherit',
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val.toFixed(1) + '%';
      },
    },
  },
}));
</script>