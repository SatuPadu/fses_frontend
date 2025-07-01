<template>
  <v-card>
    <v-card-title>Examiner Sessions</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <v-select
            label="Examiner"
            :items="props.examiners"
            v-model="localExaminer"
            @update:model-value="onExaminerChange"
            clearable
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
          />
        </v-col>
      </v-row>
      <div class="d-flex flex-column align-center mt-6 mb-2">
        <v-progress-circular v-if="loading" indeterminate color="primary" />
        <template v-else>
          <div v-if="summary !== undefined" class="text-h3 font-weight-bold mb-1">
            {{ summary }}
          </div>
          <div v-if="!summary" class="text-caption text-grey">No data available</div>
        </template>
      </div>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  summary: { type: Number, default: null },
  loading: { type: Boolean, default: false },
  examiners: { type: Array, required: true },
  academicYears: { type: Array, required: false, default: () => [] },
  selectedExaminer: { type: String, default: null },
  selectedYear: { type: String, default: null },
});
const emits = defineEmits(['update:examiner', 'update:year']);

const localExaminer = props.selectedExaminer ? ref(props.selectedExaminer) : ref(null);
const localYear = props.selectedYear ? ref(props.selectedYear) : ref(null);

function onExaminerChange(val: string) {
  emits('update:examiner', val);
}
function onYearChange(val: string) {
  emits('update:year', val);
}
watch(() => props.selectedExaminer, (val) => { localExaminer.value = val; });
watch(() => props.selectedYear, (val) => { localYear.value = val; });
</script> 