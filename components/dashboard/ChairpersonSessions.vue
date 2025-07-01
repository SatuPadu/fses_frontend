<template>
    <v-card elevation="10" class="bg-white">
      <v-card-item>
        <div class="d-sm-flex align-center justify-space-between pt-sm-2">
          <v-card-title class="text-h5">Chairperson Sessions</v-card-title>
        </div>
        
        <!-- Filter Controls -->
        <v-row class="my-4">
          <v-col cols="12" md="6">
            <v-select
              label="Chairperson"
              :items="props.chairpersons"
              v-model="localChairperson"
              @update:model-value="onChairpersonChange"
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
              :disabled="!localChairperson"
              variant="outlined"
              density="compact"
            />
          </v-col>
        </v-row>
  
        <!-- Main Content -->
        <v-row>
          <!-- Loading State -->
          <template v-if="loading">
            <v-col cols="12" class="d-flex justify-center align-center" style="min-height: 200px;">
              <v-progress-circular indeterminate color="primary" />
            </v-col>
          </template>
          
          <!-- No Data State -->
          <template v-else-if="!props.summary || !localYear">
            <v-col cols="12" class="d-flex justify-center align-center" style="min-height: 200px;">
              <div class="text-center">
                <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-chart-donut</v-icon>
                <div class="text-body-1 text-medium-emphasis">
                  Select chairperson and year to view sessions
                </div>
              </div>
            </v-col>
          </template>
          
          <!-- Data Display -->
          <template v-else>
            <v-col cols="7" sm="7">
              <div class="mt-2">
                <!-- Growth Indicator -->
                <div class="mt-1">
                  <v-avatar class="bg-lightsuccess text-success" size="25">
                    <v-icon size="20">mdi-trending-up</v-icon>
                  </v-avatar>
                  <span class="text-subtitle-1 ml-2 font-weight-bold">{{ growthPercentage }}%</span>
                  <span class="text-subtitle-1 text-muted ml-2">of Maximum Sessions</span>
                </div>
                
                <!-- Legend -->
                <div class="d-flex align-center mt-sm-10 mt-8">
                  <h6 class="text-subtitle-1 text-muted">
                    <v-icon
                      icon="mdi-checkbox-blank-circle"
                      class="mr-1"
                      size="10"
                      color="primary"
                    ></v-icon>
                    Chairing
                  </h6>
                  <h6 class="text-subtitle-1 text-muted pl-5">
                    <v-icon
                      icon="mdi-checkbox-blank-circle"
                      class="mr-1"
                      size="10"
                      color="lightprimary"
                    ></v-icon>
                    Can Chair
                  </h6>
                </div>
              </div>
            </v-col>
            
            <!-- Chart Section -->
            <v-col cols="5" sm="5" class="pl-lg-0">
              <div class="d-flex align-center flex-shrink-0 justify-center position-relative">
                <apexchart
                  class="pt-6"
                  type="donut"
                  height="145"
                  :options="chartOptions"
                  :series="chartSeries"
                />
                <!-- Center Text -->
                <div class="position-absolute d-flex flex-column align-center justify-center" style="top: 50%; left: 50%; transform: translate(-50%, -50%);">
                  <div class="text-h4 font-weight-bold mt-4">{{ props.summary }}/4</div>
                </div>
              </div>
            </v-col>
          </template>
        </v-row>
      </v-card-item>
    </v-card>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, computed } from 'vue';
import type { PropType } from 'vue';
import { useTheme } from "vuetify";
  
  const props = defineProps({
  summary: { type: Number as PropType<number | undefined>, default: undefined },
  loading: { type: Boolean, default: false },
  chairpersons: { type: Array, required: true },
  academicYears: { type: Array, required: false, default: () => [] },
  selectedChairperson: { type: String as PropType<string | null>, default: null },
  selectedYear: { type: String as PropType<string | null>, default: null },
});
  
  const emits = defineEmits(['update:chairperson', 'update:year']);
  
  const localChairperson = ref<string | null>(props.selectedChairperson || null);
const localYear = ref<string | null>(props.selectedYear || null);
  
  // Theme setup for chart colors
  const theme = useTheme();
  const primary = computed(() => theme.current.value.colors.primary);
  const lightprimary = computed(() => theme.current.value.colors.lightprimary);
  
  // Chart configuration
  const chartOptions = computed(() => {
    return {
      labels: ["Completed", "Remaining"],
      chart: {
        type: "donut",
        fontFamily: `inherit`,
        foreColor: "#a1aab2",
        toolbar: {
          show: false,
        },
      },
      colors: [primary.value, lightprimary.value],
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
          donut: {
            size: "75%",
            background: "transparent",
          },
        },
      },
      stroke: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      tooltip: { 
        theme: "light", 
        fillSeriesColor: false,
        y: {
          formatter: function (val: number) {
            return val + " sessions"
          }
        }
      },
    };
  });
  
  // Chart data based on summary
  const chartSeries = computed(() => {
    if (!props.summary) return [0, 0];
    const completed = props.summary;
    const remaining = Math.max(0, 4 - completed); // Assuming max 4 sessions
    return [completed, remaining];
  });
  
  // Calculate growth percentage (mock calculation)
  const growthPercentage = computed(() => {
    if (!props.summary) return 0;
    // This would typically come from your data
    // For now, showing a mock calculation
    return Math.round((props.summary / 4) * 100);
  });
  
  function onChairpersonChange(val: string) {
    emits('update:chairperson', val);
  }
  
  function onYearChange(val: string) {
    emits('update:year', val);
  }
  
  // Watch for prop changes
watch(() => props.selectedChairperson, (val) => { 
  localChairperson.value = val || null; 
});

watch(() => props.selectedYear, (val) => { 
  localYear.value = val || null; 
});
  </script>
  
  <style scoped>
    .bg-lightsuccess {
      background-color: #e8f5e8 !important;
    }
    
    .text-success {
      color: #4caf50 !important;
    }
  .withbg {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }
  
  .bg-lightsuccess {
    background-color: #e8f5e8 !important;
  }
  
  .text-success {
    color: #4caf50 !important;
  }
  
  .text-muted {
    color: #6c757d !important;
  }
  </style>