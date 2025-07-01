<template>
    <v-data-table-server
      :headers="headers"
      :items="lecturers"
      :items-length="totalItems"
      :loading="loading"
      :items-per-page="itemsPerPage"
      :page="page"
      @update:options="handleOptionsUpdate"
      class="elevation-1 bordered-table"
    >
      <template v-slot:item="{ item, index }">
        <tr>
          <td class="border border-gray-300 text-center">{{ (page - 1) * itemsPerPage + index + 1 }}</td>
          <td class="border border-gray-300 text-start">{{ item.staff_number }}</td>
          <td class="border border-gray-300 text-start">{{ item.title }}</td>
          <td class="border border-gray-300 text-start">{{ item.name }}</td>
          <td class="border border-gray-300 text-start">{{ item.department }}</td>
          <td class="border border-gray-300 text-start">{{ item.external_institution || '-' }}</td>
          <td class="border border-gray-300 text-start">{{ item.email }}</td>
          <td class="border border-gray-300 text-start">{{ item.phone || '-' }}</td>
          <td v-if="canEditLecturers || canDeleteLecturers" class="border border-gray-300 text-center">
            <div class="d-flex justify-center">
              <v-btn 
                v-if="canEditLecturers"
                icon="mdi-pencil" 
                variant="text" 
                @click="editLecturer(item)"
                color="primary"
              />
              <v-btn 
                v-if="canDeleteLecturers"
                icon="mdi-delete" 
                variant="text" 
                @click="deleteLecturer(item)"
                color="error"
              />
            </div>
          </td>
        </tr>
      </template>
    </v-data-table-server>
</template>

<script setup lang="ts">
import { ref, toRefs, computed } from 'vue';
import { usePermissions } from '~/composables/usePermissions';
import type { Lecturer } from '~/types/global';

const props = defineProps<{
  lecturers: Lecturer[];
  loading: boolean;
  totalItems: number;
  itemsPerPage: number;
  page: number;
}>();

const { lecturers, loading, totalItems, itemsPerPage, page } = toRefs(props);
const emits = defineEmits(['update-options', 'edit-lecturer', 'delete-lecturer']);

const { canEditLecturers, canDeleteLecturers } = usePermissions();

const headers = computed(() => {
  const baseHeaders: Array<{
    title: string;
    key: string;
    sortable: boolean;
    align?: 'start' | 'center' | 'end';
  }> = [
    { title: 'No.', key: 'index', sortable: false, align: 'center' },
    { title: 'Staff Number', key: 'staff_number', sortable: false, align: 'start' },
    { title: 'Title', key: 'title', sortable: false, align: 'start' },
    { title: 'Name', key: 'name', sortable: false, align: 'start' },
    { title: 'Department', key: 'department', sortable: false, align: 'start' },
    { title: 'External Institution', key: 'external_institution', sortable: false, align: 'start' },
    { title: 'Email', key: 'email', sortable: false, align: 'start' },
    { title: 'Phone', key: 'phone', sortable: false, align: 'start' },
  ];

  // Only add Actions column if user has edit or delete permissions
  if (canEditLecturers.value || canDeleteLecturers.value) {
    baseHeaders.push({ title: 'Actions', key: 'actions', sortable: false, align: 'center' });
  }

  return baseHeaders;
});

const handleOptionsUpdate = (options: any) => {
  emits('update-options', options);
};

const editLecturer = (lecturer: Lecturer) => {
  emits('edit-lecturer', lecturer);
};

const deleteLecturer = (lecturer: Lecturer) => {
  emits('delete-lecturer', lecturer);
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