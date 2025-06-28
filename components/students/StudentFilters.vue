<template>
  <v-card class="mb-6 elevation-2">
    <v-card-text>
      <v-row>
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
            @blur="filters.name = filters.name?.trim()"
          ></v-text-field>
        </v-col>

        <!-- Email Filter -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="filters.email"
            label="Email"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            @keyup.enter="applyFilters"
            @blur="filters.email = filters.email?.trim()"
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

        <!-- My Role Filter - Hidden for Office Assistants -->
        <v-col v-if="!isOfficeAssistant" cols="12" md="6">
          <v-select
            v-model="filters.my_role"
            :items="myRoleItems"
            label="My Role"
            density="compact"
            variant="outlined"
            clearable
            hide-details
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
import { usePermissions } from '~/composables/usePermissions';

const emits = defineEmits(['filters-updated']);

const enumsStore = useEnumsStore();
const { isOfficeAssistant } = usePermissions();

const filters = reactive({
  matric_number: '',
  name: '',
  email: '',
  department: null as string | null,
  my_role: null as string | null,
});

const departmentItems = computed(() => {
  const options = enumsStore.getDepartmentOptions();
  return options.length > 0 ? options : [
    { title: 'Loading...', value: '', disabled: true }
  ];
});

const myRoleItems = computed(() => {
  const options = enumsStore.getMyRoleOptions();
  return options.length > 0 ? options : [
    { title: 'Loading...', value: '', disabled: true }
  ];
});

const applyFilters = () => {
  const activeFilters: Record<string, any> = {};

  if (filters.matric_number) activeFilters.matric_number = filters.matric_number;
  if (filters.name) activeFilters.name = filters.name;
  if (filters.email) activeFilters.email = filters.email;
  if (filters.department) activeFilters.department = filters.department;
  if (filters.my_role) activeFilters.my_role = filters.my_role;
  
  emits('filters-updated', activeFilters);
};

const resetFilters = () => {
  filters.matric_number = '';
  filters.name = '';
  filters.email = '';
  filters.department = null;
  filters.my_role = null;
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