<template>
  <v-card class="mb-6 elevation-2">
    <v-card-text>
      <v-row>
        <!-- Program Code Filter -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="filters.program_code"
            label="Program Code"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            @keyup.enter="applyFilters"
          ></v-text-field>
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
  program_code: '',
  department: null as string | null,
});

const departmentItems = computed(() => {
  const options = enumsStore.getDepartmentOptions();
  return options.length > 0 ? options : [
    { title: 'Loading...', value: '', disabled: true }
  ];
});

const applyFilters = () => {
  const activeFilters: Record<string, any> = {};

  if (filters.program_code) activeFilters.program_code = filters.program_code;
  if (filters.department) activeFilters.department= filters.department;
  
  emits('filters-updated', activeFilters);
};

const resetFilters = () => {
  filters.program_code = '';
  filters.department = null;
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