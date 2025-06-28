<template>
  <v-card class="mb-6 elevation-2">
    <v-card-text>
      <v-row>
        <!-- Student Name Filter -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="filters.student_name"
            label="Student Name"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            @keyup.enter="applyFilters"
            @blur="filters.student_name = filters.student_name?.trim()"
          ></v-text-field>
        </v-col>

        <!-- Matric Number Filter -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="filters.matric_number"
            label="Matric Number"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            @keyup.enter="applyFilters"
            @blur="filters.matric_number = filters.matric_number?.trim()"
          ></v-text-field>
        </v-col>

        <!-- Nomination Status Filter -->
        <v-col cols="12" md="6">
          <v-select
            v-model="filters.nomination_status"
            :items="statusItems"
            label="Nomination Status"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            :loading="enumsStore.loading"
            :disabled="statusItems.length === 0"
          ></v-select>
        </v-col>

        <!-- Department Filter -->
        <v-col cols="12" md="6">
          <v-select
            v-model="filters.department"
            :items="departmentItems"
            label="Department"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            :loading="enumsStore.loading"
          ></v-select>
        </v-col>

        <!-- Semester Filter -->
        <v-col cols="12" md="6">
          <v-select
            v-model="filters.semester"
            :items="semesterItems"
            label="Semester"
            density="compact"
            variant="outlined"
            clearable
            hide-details
          ></v-select>
        </v-col>

        <!-- Academic Year Filter -->
        <v-col cols="12" md="6">
          <v-select
            v-model="filters.academic_year"
            :items="academicYearItems"
            label="Academic Year"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            :loading="loadingAcademicYears"
            :disabled="academicYearItems.length === 0"
          ></v-select>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions class="pa-4 pt-0">
      <v-btn
        color="primary"
        variant="flat"
        @click="applyFilters"
        class="mr-2"
      >
        Search
      </v-btn>
      <v-btn
        variant="outlined"
        @click="resetFilters"
      >
        Reset
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref } from 'vue';
import { useEnumsStore } from '~/stores/enums';
import { useNominationManagement } from '~/composables/useNominationManagement';

const emits = defineEmits(['filters-updated']);

const enumsStore = useEnumsStore();
const nominationManagement = useNominationManagement();

const filters = reactive({
  student_name: '',
  matric_number: '',
  nomination_status: null as string | null,
  department: null as string | null,
  semester: null as string | null,
  academic_year: null as string | null,
});

const semesterItems = [
  { title: 'Semester 1', value: '1' },
  { title: 'Semester 2', value: '2' },
  { title: 'Semester 3', value: '3' },
  { title: 'Semester 4', value: '4' },
  { title: 'Semester 5', value: '5' },
  { title: 'Semester 6', value: '6' },
];

// Academic years loaded from API
const academicYearItems = ref<Array<{ title: string; value: string }>>([]);

const departmentItems = computed(() => {
  const options = enumsStore.getDepartmentOptions();
  return options.length > 0 ? options : [
    { title: 'Loading...', value: '', disabled: true }
  ];
});

// Nomination status items from enums
const statusItems = computed(() => {
  const options = enumsStore.getNominationStatusOptions();
  return options.length > 0 ? options : [
    { title: 'Loading...', value: '', disabled: true }
  ];
});

// Loading state for academic years
const loadingAcademicYears = ref(false);

// Load academic years from API
const loadAcademicYears = async () => {
  loadingAcademicYears.value = true;  
  try {
    const response = await nominationManagement.getAcademicYears();
    
    if (response.data && Array.isArray(response.data)) {
      academicYearItems.value = response.data.map((year: string) => ({
        title: year,
        value: year
      }));
    } else {
      console.warn('No academic years data received or invalid format for filters');
      academicYearItems.value = [];
    }
  } catch (error) {
    console.error('Error loading academic years for filters:', error);
    // Fallback to empty array
    academicYearItems.value = [];
  } finally {
    loadingAcademicYears.value = false;
  }
};

const applyFilters = () => {
  const activeFilters: Record<string, any> = {};

  if (filters.student_name) activeFilters.student_name = filters.student_name;
  if (filters.matric_number) activeFilters.matric_number = filters.matric_number;
  if (filters.nomination_status) activeFilters.nomination_status = filters.nomination_status;
  if (filters.department) activeFilters.department = filters.department;
  if (filters.semester) activeFilters.semester = filters.semester;
  if (filters.academic_year) activeFilters.academic_year = filters.academic_year;
  
  emits('filters-updated', activeFilters);
};

const resetFilters = () => {
  filters.student_name = '';
  filters.matric_number = '';
  filters.nomination_status = null;
  filters.department = null;
  filters.semester = null;
  filters.academic_year = null;
  emits('filters-updated', {});
};

// Fetch enums if not already loaded
onMounted(async () => {
  if (!enumsStore.enumsData && !enumsStore.loading) {
    try {
      await enumsStore.fetchEnums();
    } catch (error) {
      console.error('Failed to fetch enums:', error);
    }
  }
  
  // Load academic years from API
  try {
    await loadAcademicYears();
  } catch (error) {
    console.error('Failed to load academic years:', error);
  }
});
</script> 