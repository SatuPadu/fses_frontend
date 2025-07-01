<template>
  <v-card class="mb-6 elevation-2">
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4">
          <v-select
            label="Department"
            :items="departmentOptions"
            v-model="filters.department"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            :loading="loading"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            label="Program"
            :items="programOptions"
            v-model="filters.program_id"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            :loading="loading"
            :disabled="!filters.department"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            label="Evaluation Type"
            :items="evaluationTypeOptions"
            v-model="filters.evaluation_type"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            :loading="loading"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useEnumsStore } from '~/stores/enums';
import { useUserManagement } from '~/composables/useUserManagement';

const emits = defineEmits(['filters-updated']);
const enumsStore = useEnumsStore();
const userManagement = useUserManagement();

const filters = ref({
  department: null  ,
  program_id: null,
  evaluation_type: null,
});

const loading = ref(false);
const programs = ref<any[]>([]);

const departmentOptions = computed(() => enumsStore.getDepartmentOptions());
const programOptions = computed(() => {
  if (!filters.value.department) {
    return [{ title: 'Select department first', value: '', disabled: true }];
  }
  if (!programs.value || programs.value.length === 0) {
    return [{ title: 'No programs found', value: '', disabled: true }];
  }
  return programs.value.map((program: any) => ({
    title: program.program_code,
    value: program.id.toString(),
  }));
});
const evaluationTypeOptions = computed(() => enumsStore.getEvaluationTypeOptions());

async function fetchPrograms() {
  if (!filters.value.department) {
    programs.value = [];
    return;
  }
  loading.value = true;
  try {
    const data = await userManagement.getPrograms({
      page: 1,
      perPage: 1000,
      sortBy: 'program_code',
      sortOrder: 'desc',
      filters: {
        department: filters.value.department,
      },
    });
    programs.value = Array.isArray(data.data.items) ? data.data.items : [];
  } catch (e) {
    console.error('Failed to fetch programs:', e);
    programs.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  if (!enumsStore.enumsData) {
    await enumsStore.fetchEnums();
  }
});

watch(filters, (val) => {
  emits('filters-updated', { ...val });
}, { deep: true });

watch(() => filters.value.department, (newDepartment) => {
  filters.value.program_id = null;
  fetchPrograms();
});
</script> 