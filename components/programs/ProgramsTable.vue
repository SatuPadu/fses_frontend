<template>
    <v-data-table-server
      :headers="headers"
      :items="programs"
      :items-length="totalItems"
      :loading="loading"
      :items-per-page="itemsPerPage"
      :page="page"
      @update:options="handleOptionsUpdate"
      class="elevation-1 bordered-table"
    >
      <template v-slot:item="{ item, index }">
        <tr>
          <td class="border border-gray-300">{{ (page - 1) * itemsPerPage + index + 1 }}</td>
          <td class="border border-gray-300">{{ item.program_name }}</td>
          <td class="border border-gray-300">{{ item.program_code }}</td>
          <td class="border border-gray-300">{{ item.department }}</td>
          <td class="border border-gray-300">{{ item.total_semesters }}</td>
          <td v-if="canEditPrograms || canDeletePrograms" class="border border-gray-300">
            <div class="d-flex justify-end">
              <v-btn 
                v-if="canEditPrograms"
                icon="mdi-pencil" 
                variant="text" 
                @click="editProgram(item)"
                color="primary"
              />
              <v-btn 
                v-if="canDeletePrograms"
                icon="mdi-delete" 
                variant="text" 
                @click="deleteProgram(item)"
                color="error"
              />
            </div>
          </td>
        </tr>
      </template>
    </v-data-table-server>
</template>

<script setup lang="ts">
import { ref, toRefs, watch, computed } from 'vue';
import { usePermissions } from '~/composables/usePermissions';
import type { Program } from '~/types/global';

const props = defineProps<{
  programs: Program[];
  loading: boolean;
  totalItems: number;
  itemsPerPage: number;
  page: number;
}>();

const { programs, loading, totalItems, itemsPerPage, page } = toRefs(props);
const emits = defineEmits(['update-options', 'edit-program', 'delete-program', 'items-per-page-changed']);

const { canEditPrograms, canDeletePrograms } = usePermissions();

const localItemsPerPage = ref(itemsPerPage.value);

// Watch for external changes to itemsPerPage
watch(itemsPerPage, (newValue) => {
  localItemsPerPage.value = newValue;
});

const headers = computed(() => {
  const baseHeaders: Array<{
    title: string;
    key: string;
    sortable: boolean;
    align?: 'start' | 'center' | 'end';
  }> = [
    { title: 'No.', key: 'index', sortable: false },
    { title: 'Program Name', key: 'program_name', sortable: true },
    { title: 'Program Code', key: 'program_code', sortable: true },
    { title: 'Department', key: 'department', sortable: true },
    { title: 'Total Semesters', key: 'total_semesters', sortable: true },
  ];

  // Only add Actions column if user has edit or delete permissions
  if (canEditPrograms.value || canDeletePrograms.value) {
    baseHeaders.push({ title: 'Actions', key: 'actions', sortable: false, align: 'end' });
  }

  return baseHeaders;
});

const handleOptionsUpdate = (options: any) => {
  emits('update-options', options);
};

const handleItemsPerPageChange = (newItemsPerPage: number) => {
  emits('items-per-page-changed', newItemsPerPage);
};

const editProgram = (program: Program) => {
  emits('edit-program', program);
};

const deleteProgram = (program: Program) => {
  emits('delete-program', program);
};
</script>

<style scoped>
.v-data-table :deep(table) {
  border-collapse: collapse;
}

.v-data-table :deep(th) {
  border: 1px solid #e0e0e0 !important;
  background-color: #f5f5f5;
}
</style>