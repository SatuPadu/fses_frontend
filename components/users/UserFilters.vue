<template>
  <v-card class="mb-6 elevation-2">
    <v-card-text>
      <v-row>
        <!-- Status Filter -->
        <v-col cols="12" md="6">
          <v-select
            v-model="filters.status"
            :items="statusItems"
            label="Status"
            density="compact"
            variant="outlined"
            clearable
            hide-details
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

        <!-- Role Filter -->
        <v-col cols="12" md="6">
          <v-select
            v-model="filters.role"
            :items="roleItems"
            label="Role"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            :loading="enumsStore.loading"
          ></v-select>
        </v-col>

        <!-- Name Filter -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="filters.name"
            label="Name"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            @keyup.enter="applyFilters"
          ></v-text-field>
        </v-col>

        <!-- Staff Number Filter -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="filters.staff_number"
            label="Staff Number"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            @keyup.enter="applyFilters"
          ></v-text-field>
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
import { reactive, computed, onMounted } from 'vue';
import { useEnumsStore } from '~/stores/enums';

const emits = defineEmits(['filters-updated']);

const enumsStore = useEnumsStore();

const filters = reactive({
  status: null as boolean | null,
  department: null as string | null,
  role: null as string | null,
  name: '',
  staff_number: '',
});

const statusItems = [
  { title: 'Active', value: true },
  { title: 'Inactive', value: false },
];

const departmentItems = computed(() => {
  const options = enumsStore.getDepartmentOptions();
  return options.length > 0 ? options : [
    { title: 'Loading...', value: '', disabled: true }
  ];
});

const roleItems = computed(() => {
  const options = enumsStore.getRoleOptions();
  return options.length > 0 ? options : [
    { title: 'Loading...', value: '', disabled: true }
  ];
});

const applyFilters = () => {
  const activeFilters: Record<string, any> = {};

  if (filters.name) activeFilters.name = filters.name;
  if (filters.staff_number) activeFilters.staff_number = filters.staff_number;
  if (filters.department) activeFilters.department = filters.department;
  if (filters.role) activeFilters.role = filters.role;
  if (filters.status !== null) activeFilters.is_active = filters.status;
  
  emits('filters-updated', activeFilters);
};

const resetFilters = () => {
  filters.status = null;
  filters.department = null;
  filters.role = null;
  filters.name = '';
  filters.staff_number = '';
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
});
</script> 