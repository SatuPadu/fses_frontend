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
          <td class="border border-gray-300">{{ (page - 1) * itemsPerPage + index + 1 }}</td>
          <td class="border border-gray-300">{{ item.staff_number }}</td>
          <td class="border border-gray-300">{{ item.title }}</td>
          <td class="border border-gray-300">{{ item.name }}</td>
          <td class="border border-gray-300">{{ item.department }}</td>
          <td class="border border-gray-300">{{ item.external_institution || '-' }}</td>
          <td class="border border-gray-300">{{ item.email }}</td>
          <td class="border border-gray-300">{{ item.phone || '-' }}</td>
          <td v-if="canEditLecturers || canDeleteLecturers" class="border border-gray-300">
            <div class="d-flex justify-end">
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
    { title: 'No.', key: 'index', sortable: false },
    { title: 'Staff Number', key: 'staff_number', sortable: true },
    { title: 'Title', key: 'title', sortable: true },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Department', key: 'department', sortable: true },
    { title: 'External Institution', key: 'external_institution', sortable: true },
    { title: 'Email', key: 'email', sortable: true },
    { title: 'Phone', key: 'phone', sortable: false },
  ];

  // Only add Actions column if user has edit or delete permissions
  if (canEditLecturers.value || canDeleteLecturers.value) {
    baseHeaders.push({ title: 'Actions', key: 'actions', sortable: false, align: 'end' });
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