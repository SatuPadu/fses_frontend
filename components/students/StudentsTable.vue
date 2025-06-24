<template>
    <v-data-table-server
      :headers="headers"
      :items="students"
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
          <td class="border border-gray-300">{{ item.matric_number }}</td>
          <td class="border border-gray-300">{{ item.name }}</td>
          <td class="border border-gray-300">{{ item.email }}</td>
          <td class="border border-gray-300">{{ item.program?.program_name || '-' }}</td>
          <td class="border border-gray-300">{{ item.current_semester }}</td>
          <td class="border border-gray-300">{{ item.program?.department || '-' }}</td>
          <td class="border border-gray-300">{{ item.main_supervisor?.name || '-' }}</td>
          <td v-if="canEditStudents || canDeleteStudents || canCreateNominations" class="border border-gray-300">
            <div class="d-flex justify-end">
              <v-btn 
                v-if="canEditStudents"
                icon="mdi-pencil" 
                variant="text" 
                @click="editStudent(item)"
                color="primary"
              />
              <v-btn 
                v-if="canDeleteStudents"
                icon="mdi-delete" 
                variant="text" 
                @click="deleteStudent(item)"
                color="error"
              />
              <v-btn
                v-if="canCreateNominations && (!item.evaluations || item.evaluations.length === 0)"
                icon="mdi-plus"
                variant="text"
                @click="$emit('add-nomination', item)"
                color="success"
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
import type { Student } from '~/types/global';

const props = defineProps<{
  students: Student[];
  loading: boolean;
  totalItems: number;
  itemsPerPage: number;
  page: number;
}>();

const { students, loading, totalItems, itemsPerPage, page } = toRefs(props);
const emits = defineEmits(['update-options', 'edit-student', 'delete-student', 'add-nomination']);

const { canEditStudents, canDeleteStudents, canCreateNominations } = usePermissions();

const headers = computed(() => {
  const baseHeaders: Array<{
    title: string;
    key: string;
    sortable: boolean;
    align?: 'start' | 'center' | 'end';
  }> = [
    { title: 'No.', key: 'index', sortable: false },
    { title: 'Matric Number', key: 'matric_number', sortable: true },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Email', key: 'email', sortable: true },
    { title: 'Program', key: 'program.program_name', sortable: true },
    { title: 'Current Semester', key: 'current_semester', sortable: true },
    { title: 'Department', key: 'program.department', sortable: true },
    { title: 'Supervisor', key: 'main_supervisor.name', sortable: true },
  ];

  // Add Actions column if user has edit/delete permissions or can create nominations
  if (canEditStudents.value || canDeleteStudents.value || canCreateNominations.value) {
    baseHeaders.push({ title: 'Actions', key: 'actions', sortable: false, align: 'end' });
  }

  return baseHeaders;
});

const handleOptionsUpdate = (options: any) => {
  emits('update-options', options);
};

const editStudent = (student: Student) => {
  emits('edit-student', student);
};

const deleteStudent = (student: Student) => {
  emits('delete-student', student);
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
