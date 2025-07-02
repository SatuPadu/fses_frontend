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
            @click="fetchAllDashboardData"
          >
            Retry
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Header -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h4 font-weight-bold text-primary mb-2">
                Dashboard
              </h1>
              <p class="text-subtitle-1 text-medium-emphasis">
                Welcome back! Here's your personalized dashboard overview.
              </p>
            </div>
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-refresh"
              @click="fetchAllDashboardData"
              :loading="loading"
            >
              Refresh
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Research Supervisor Section -->
      <v-row v-if="hasResearchSupervisorRole && researchSupervisorData" class="mb-6">
        <v-col cols="12">
          <v-card elevation="2" class="pa-6 mb-6">
            <!-- My Students Overview -->
            <h4 class="text-h6 mb-3">My Students Overview</h4>
            <v-row class="mb-4 flex justify-center align-center">
              <v-col cols="12" md="2" v-for="(item, idx) in [
                {icon: 'mdi-account-group', color: 'primary', value: researchSupervisorData.my_students.total_students, label: 'Total Students'},
                {icon: 'mdi-check-circle', color: 'success', value: researchSupervisorData.my_students.eligible_for_evaluation, label: 'Eligible for Evaluation'},
                {icon: 'mdi-clock', color: 'warning', value: researchSupervisorData.my_students.pending_nominations, label: 'Pending Nominations'},
                {icon: 'mdi-check-decagram', color: 'info', value: researchSupervisorData.my_students.completed_nominations, label: 'Completed Nominations'},
                {icon: 'mdi-pause-circle', color: 'error', value: researchSupervisorData.my_students.postponed_evaluations, label: 'Postponed Evaluations'}
              ]" :key="idx">
                <div class="text-center">
                  <v-icon :size="48" :color="item.color" class="mb-2">{{ item.icon }}</v-icon>
                  <h3 class="text-h4 font-weight-bold" :class="`text-${item.color}`">
                    {{ item.value }}
                  </h3>
                  <p class="text-subtitle-2 text-medium-emphasis">{{ item.label }}</p>
                </div>
              </v-col>
            </v-row>
            <v-divider class="mb-4" />
            <!-- Pending Nominations -->
            <div v-if="researchSupervisorData.pending_nominations_list.length > 0">
              <h4 class="text-h6 mb-3">Pending Nominations</h4>
              <v-data-table
                :headers="[
                  { title: 'Student Name', key: 'name' },
                  { title: 'Matric Number', key: 'matric_number' },
                  { title: 'Current Semester', key: 'current_semester' },
                  { title: 'Program', key: 'program.program_name' },
                  { title: 'Department', key: 'program.department' }
                ]"
                :items="researchSupervisorData.pending_nominations_list"
                :loading="loading"
                class="elevation-1"
              >
                <template #item.program.program_name="{ item }">
                  {{ item.program.program_name }}
                </template>
                <template #item.program.department="{ item }">
                  {{ item.program.department }}
                </template>
              </v-data-table>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Program Coordinator Section -->
      <v-row v-if="hasProgramCoordinatorRole && programCoordinatorData" class="mb-6">
        <v-col cols="12">
          <v-card elevation="2" class="pa-6 mb-6">
            <v-card-title class="text-h6 mb-4 d-flex align-center">
              <v-icon color="primary" class="mr-2">mdi-account-cog</v-icon>
              Program Coordinator Overview
            </v-card-title>
            <v-divider class="mb-4" />
            <!-- Department Overview -->
            <h4 class="text-h6 mb-3">Department Overview</h4>
            <v-row class="mb-4">
              <v-col cols="12" md="3">
                <div class="text-center">
                  <v-icon size="48" color="primary" class="mb-2">
                    mdi-account-group
                  </v-icon>
                  <h3 class="text-h4 font-weight-bold text-primary">
                    {{ programCoordinatorData.department_overview.total_students }}
                  </h3>
                  <p class="text-subtitle-2 text-medium-emphasis">Total Students</p>
                </div>
              </v-col>
              <v-col cols="12" md="9">
                <v-row>
                  <v-col cols="12" md="6">
                    <h4 class="text-h6 mb-3">Students by Program</h4>
                    <v-list>
                      <v-list-item
                        v-for="(count, program) in programCoordinatorData.department_overview.by_program"
                        :key="program"
                        class="px-0"
                      >
                        <template #prepend>
                          <v-icon color="primary">mdi-school</v-icon>
                        </template>
                        <v-list-item-title>{{ program }}</v-list-item-title>
                        <template #append>
                          <v-chip color="primary" variant="outlined">
                            {{ count }} students
                          </v-chip>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-col>
                  <v-col cols="12" md="6">
                    <h4 class="text-h6 mb-3">Students by Evaluation Status</h4>
                    <v-list>
                      <v-list-item
                        v-for="(count, status) in programCoordinatorData.department_overview.by_evaluation_status"
                        :key="status"
                        class="px-0"
                      >
                        <template #prepend>
                          <v-icon :color="status === 'Postponed' ? 'warning' : 'error'">
                            {{ status === 'Postponed' ? 'mdi-pause-circle' : 'mdi-lock' }}
                          </v-icon>
                        </template>
                        <v-list-item-title>{{ status }}</v-list-item-title>
                        <template #append>
                          <v-chip :color="status === 'Postponed' ? 'warning' : 'error'" variant="outlined">
                            {{ count }} students
                          </v-chip>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-divider class="mb-4" />
            <!-- Evaluation Management -->
            <h4 class="text-h6 mb-3">Evaluation Management</h4>
            <v-row class="mb-4">
              <v-col cols="12" md="3" v-for="(item, idx) in [
                {icon: 'mdi-clock', color: 'warning', value: programCoordinatorData.evaluation_management.awaiting_chairperson_assignment, label: 'Awaiting Chairperson Assignment'},
                {icon: 'mdi-check-circle', color: 'success', value: programCoordinatorData.evaluation_management.completed_assignments, label: 'Completed Assignments'},
                {icon: 'mdi-pause-circle', color: 'error', value: programCoordinatorData.evaluation_management.postponed_evaluations, label: 'Postponed Evaluations'},
                {icon: 'mdi-lock', color: 'info', value: programCoordinatorData.evaluation_management.locked_nominations_count, label: 'Locked Nominations'}
              ]" :key="idx">
                <div class="text-center">
                  <v-icon :size="48" :color="item.color" class="mb-2">{{ item.icon }}</v-icon>
                  <h3 class="text-h4 font-weight-bold" :class="`text-${item.color}`">
                    {{ item.value }}
                  </h3>
                  <p class="text-subtitle-2 text-medium-emphasis">{{ item.label }}</p>
                </div>
              </v-col>
            </v-row>
            <v-divider class="mb-4" />
            <!-- Workload Distribution -->
            <h4 class="text-h6 mb-3">Workload Distribution</h4>
            <v-row>
              <v-col cols="12" md="6">
                <h4 class="text-h6 mb-3">Examiner Workload</h4>
                <v-data-table
                  :headers="[
                    { title: 'Name', key: 'name' },
                    { title: 'Staff Number', key: 'staff_number' },
                    { title: 'Session Count', key: 'session_count' }
                  ]"
                  :items="programCoordinatorData.workload_distribution.examiners"
                  :loading="loading"
                  class="elevation-1"
                />
              </v-col>
              <v-col cols="12" md="6">
                <h4 class="text-h6 mb-3">Chairperson Workload</h4>
                <v-data-table
                  :headers="[
                    { title: 'Name', key: 'name' },
                    { title: 'Staff Number', key: 'staff_number' },
                    { title: 'Session Count', key: 'session_count' }
                  ]"
                  :items="programCoordinatorData.workload_distribution.chairpersons"
                  :loading="loading"
                  class="elevation-1"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- PGAM Section -->
      <v-row v-if="hasPGAMRole && pgamData" class="mb-6" align="stretch">
        <!-- Top row: Students by Program, Evaluation Type, Nomination Status -->
        <v-col cols="12" md="4" class="fill-height">
          <v-card elevation="1" class="pa-4 mb-4 h-100">
            <h4 class="text-h6 mb-3">Students by Program</h4>
            <v-list>
              <v-list-item
                v-for="(count, program) in pgamData.faculty_wide_overview.by_program"
                :key="program"
                class="px-0"
              >
                <template #prepend>
                  <v-icon color="primary">mdi-school</v-icon>
                </template>
                <v-list-item-title>{{ program }}</v-list-item-title>
                <template #append>
                  <v-chip color="primary" variant="outlined">
                    {{ count }} students
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
        <v-col cols="12" md="4" class="fill-height">
          <v-card elevation="1" class="pa-4 mb-4 h-100">
            <h4 class="text-h6 mb-3">Students by Evaluation Type</h4>
            <v-list>
              <v-list-item
                v-for="(count, type) in pgamData.faculty_wide_overview.by_evaluation_type"
                :key="type"
                class="px-0"
              >
                <template #prepend>
                  <v-icon color="success">mdi-clipboard-check</v-icon>
                </template>
                <v-list-item-title>{{ type }}</v-list-item-title>
                <template #append>
                  <v-chip color="success" variant="outlined">
                    {{ count }} students
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
        <v-col cols="12" md="4" class="fill-height">
          <v-card elevation="1" class="pa-4 mb-4 h-100">
            <h4 class="text-h6 mb-3">Students by Nomination Status</h4>
            <v-list>
              <v-list-item
                v-for="(count, status) in pgamData.faculty_wide_overview.by_nomination_status"
                :key="status"
                class="px-0"
              >
                <template #prepend>
                  <v-icon :color="status === 'Postponed' ? 'warning' : 'error'">
                    {{ status === 'Postponed' ? 'mdi-pause-circle' : 'mdi-lock' }}
                  </v-icon>
                </template>
                <v-list-item-title>{{ status }}</v-list-item-title>
                <template #append>
                  <v-chip :color="status === 'Postponed' ? 'warning' : 'error'" variant="outlined">
                    {{ count }} students
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
        <!-- Second row: Student Counts by Department, Evaluation Progress by Department -->
        <v-col cols="12" md="6" class="fill-height">
          <v-card elevation="1" class="pa-4 mb-4 h-100">
            <h4 class="text-h6 mb-3">Student Counts by Department</h4>
            <v-list>
              <v-list-item
                v-for="(count, department) in pgamData.department_comparison.student_counts"
                :key="department"
                class="px-0"
              >
                <template #prepend>
                  <v-icon color="primary">mdi-domain</v-icon>
                </template>
                <v-list-item-title>{{ department }}</v-list-item-title>
                <template #append>
                  <v-chip color="primary" variant="outlined">
                    {{ count }} students
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
        <v-col cols="12" md="6" class="fill-height">
          <v-card elevation="1" class="pa-4 mb-4 h-100">
            <h4 class="text-h6 mb-3">Evaluation Progress by Department</h4>
            <v-list>
              <v-list-item
                v-for="(progress, department) in pgamData.department_comparison.evaluation_progress"
                :key="department"
                class="px-0"
              >
                <template #prepend>
                  <v-icon color="success">mdi-progress-check</v-icon>
                </template>
                <v-list-item-title>{{ department }}</v-list-item-title>
                <template #append>
                  <v-chip :color="progress.percentage > 50 ? 'success' : progress.percentage > 25 ? 'warning' : 'error'" variant="outlined">
                    {{ progress.completed }}/{{ progress.total }} ({{ progress.percentage }}%)
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
        <!-- Third row: System Statistics, System Usage Statistics -->
        <v-col cols="12" md="6" class="fill-height">
          <v-card elevation="1" class="pa-4 mb-4 h-100">
            <h4 class="text-h6 mb-3">System Statistics</h4>
            <v-row>
              <v-col cols="12" md="6">
                <div class="text-center mb-4">
                  <v-icon size="48" color="primary" class="mb-2">
                    mdi-account-tie
                  </v-icon>
                  <h3 class="text-h4 font-weight-bold text-primary">
                    {{ pgamData.system_statistics.total_lecturers }}
                  </h3>
                  <p class="text-subtitle-2 text-medium-emphasis">Total Lecturers</p>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="text-center mb-4">
                  <v-icon size="48" color="success" class="mb-2">
                    mdi-clipboard-check
                  </v-icon>
                  <h3 class="text-h4 font-weight-bold text-success">
                    {{ pgamData.system_statistics.total_evaluations_this_semester }}
                  </h3>
                  <p class="text-subtitle-2 text-medium-emphasis">Evaluations This Semester</p>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="text-center mb-4">
                  <v-icon size="48" color="info" class="mb-2">
                    mdi-account-search
                  </v-icon>
                  <h3 class="text-h4 font-weight-bold text-info">
                    {{ pgamData.system_statistics.average_workload_per_examiner }}
                  </h3>
                  <p class="text-subtitle-2 text-medium-emphasis">Avg Workload per Examiner</p>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="text-center mb-4">
                  <v-icon size="48" color="warning" class="mb-2">
                    mdi-account-cog
                  </v-icon>
                  <h3 class="text-h4 font-weight-bold text-warning">
                    {{ pgamData.system_statistics.average_workload_per_chairperson }}
                  </h3>
                  <p class="text-subtitle-2 text-medium-emphasis">Avg Workload per Chairperson</p>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <v-col cols="12" md="6" class="fill-height">
          <v-card elevation="1" class="pa-4 mb-4 h-100">
            <h4 class="text-h6 mb-3">System Usage Statistics (Last 30 Days)</h4>
            <v-list>
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon color="primary">mdi-login</v-icon>
                </template>
                <v-list-item-title>Total Logins</v-list-item-title>
                <template #append>
                  <v-chip color="primary" variant="outlined">
                    {{ pgamData.system_statistics.system_usage_statistics.total_logins_last_30_days }}
                  </v-chip>
                </template>
              </v-list-item>
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon color="info">mdi-cursor-pointer</v-icon>
                </template>
                <v-list-item-title>Total Actions</v-list-item-title>
                <template #append>
                  <v-chip color="info" variant="outlined">
                    {{ pgamData.system_statistics.system_usage_statistics.total_actions_last_30_days }}
                  </v-chip>
                </template>
              </v-list-item>
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Successful Actions</v-list-item-title>
                <template #append>
                  <v-chip color="success" variant="outlined">
                    {{ pgamData.system_statistics.system_usage_statistics.successful_actions_last_30_days }}
                  </v-chip>
                </template>
              </v-list-item>
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon color="error">mdi-close-circle</v-icon>
                </template>
                <v-list-item-title>Failed Actions</v-list-item-title>
                <template #append>
                  <v-chip color="error" variant="outlined">
                    {{ pgamData.system_statistics.system_usage_statistics.failed_actions_last_30_days }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>

      <!-- No Data State -->
      <v-row v-if="!hasResearchSupervisorRole && !hasProgramCoordinatorRole && !hasPGAMRole">
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
              No dashboard data available for your roles. Please try refreshing the page.
            </p>
            <v-btn
              color="primary"
              variant="outlined"
              class="mt-4"
              @click="fetchAllDashboardData"
            >
              Load Data
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template> 

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useDashboard } from '@/composables/useDashboard';
import { useAuthStore } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';

const authStore = useAuthStore();
const { 
  researchSupervisorData, 
  programCoordinatorData, 
  pgamData, 
  loading, 
  error, 
  fetchResearchSupervisorData,
  fetchProgramCoordinatorData,
  fetchPGAMData
} = useDashboard();
const { error: showError } = useToast();

// Computed properties to check user roles
const hasResearchSupervisorRole = computed(() => 
  authStore.roles.some(role => role.role_name === 'ResearchSupervisor')
);

const hasProgramCoordinatorRole = computed(() => 
  authStore.roles.some(role => role.role_name === 'ProgramCoordinator')
);

const hasPGAMRole = computed(() => 
  authStore.roles.some(role => role.role_name === 'PGAM')
);

// Get user roles for display
const userRoles = computed(() => 
  authStore.roles.map(role => role.role_name).join(', ')
);

// Fetch data for all roles the user has
const fetchAllDashboardData = async () => {
  const promises = [];
  
  if (hasResearchSupervisorRole.value) {
    promises.push(fetchResearchSupervisorData());
  }
  
  if (hasProgramCoordinatorRole.value) {
    promises.push(fetchProgramCoordinatorData());
  }
  
  if (hasPGAMRole.value) {
    promises.push(fetchPGAMData());
  }
  
  try {
    await Promise.all(promises);
  } catch (err) {
    if (error.value) {
      showError('Error', error.value);
    }
  }
};

onMounted(async () => {
  await fetchAllDashboardData();
});
</script>