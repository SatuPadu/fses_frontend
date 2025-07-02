
<template>
  <div>
    <!-- Loading State -->
    <v-row v-if="loading">
      <v-col cols="12">
        <v-card elevation="2" class="pa-8 text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
            class="mb-4"
          />
          <h3 class="text-h6">Loading dashboard data...</h3>
        </v-card>
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-row v-else-if="error">
      <v-col cols="12">
        <v-card elevation="2" class="pa-8 text-center">
          <v-icon
            color="error"
            size="64"
            class="mb-4"
          >
            mdi-alert-circle
          </v-icon>
          <h3 class="text-h6 text-error mb-2">Error Loading Dashboard</h3>
          <p class="text-body-1 text-medium-emphasis">{{ error }}</p>
          <v-btn
            color="primary"
            variant="outlined"
            class="mt-4"
            @click="fetchOfficeAssistantData"
          >
            Retry
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dashboard Content -->
    <div v-else-if="officeAssistantData">
      <!-- Header -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h4 font-weight-bold text-primary mb-2">
                Dashboard
              </h1>
              <p class="text-subtitle-1 text-medium-emphasis">
                Welcome back! Here's an overview of student management and administrative actions.
              </p>
            </div>
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-refresh"
              @click="fetchOfficeAssistantData"
              :loading="loading"
            >
              Refresh
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Student Management Overview -->
      <v-row class="mb-6">
        <v-col cols="12">
          <StudentManagementOverview :data="officeAssistantData.student_management" />
        </v-col>
      </v-row>

      <!-- Quick Actions -->
      <v-row>
        <v-col cols="12">
          <QuickActions :actions="officeAssistantData.quick_actions" />
        </v-col>
      </v-row>
    </div>

    <!-- No Data State -->
    <v-row v-else>
      <v-col cols="12">
        <v-card elevation="2" class="pa-8 text-center">
          <v-icon
            color="grey"
            size="64"
            class="mb-4"
          >
            mdi-database-off
          </v-icon>
          <h3 class="text-h6 text-grey mb-2">No Dashboard Data</h3>
          <p class="text-body-1 text-medium-emphasis">
            No dashboard data available. Please try refreshing the page.
          </p>
          <v-btn
            color="primary"
            variant="outlined"
            class="mt-4"
            @click="fetchOfficeAssistantData"
          >
            Load Data
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template> 

<script setup lang="ts">
import { onMounted } from 'vue';
import { useDashboard } from '@/composables/useDashboard';
import { useToast } from '@/composables/useToast';
import StudentManagementOverview from './StudentManagementOverview.vue';
import QuickActions from './QuickActions.vue';

const { officeAssistantData, loading, error, fetchOfficeAssistantData } = useDashboard();
const { error: showError } = useToast();

onMounted(async () => {
  const data = await fetchOfficeAssistantData();
  if (!data && error.value) {
    showError('Error', error.value);
  }
});
</script>