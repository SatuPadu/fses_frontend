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
          <td class="border border-gray-300 text-center">{{ (page - 1) * itemsPerPage + index + 1 }}</td>
          <td class="border border-gray-300 text-start">{{ item.matric_number }}</td>
          <td class="border border-gray-300 text-start">{{ item.name }}</td>
          <td class="border border-gray-300 text-start">{{ item.email }}</td>
          <td class="border border-gray-300 text-start">{{ item.program?.program_name || '-' }}</td>
          <td class="border border-gray-300 text-start">{{ item.current_semester }}</td>
          <td class="border border-gray-300 text-start">{{ item.program?.department || '-' }}</td>
          <td class="border border-gray-300 text-start">{{ getSupervisorDisplayName(item.main_supervisor) }}</td>
          <td v-if="!isOfficeAssistant" class="border border-gray-300 text-start">
            <v-chip
              v-for="role in item.user_roles"
              :key="role"
              class="mr-1 mb-1"
              size="small"
              color="primary"
              variant="outlined"
            >
              {{ formatRoleName(role) }}
            </v-chip>
            <span v-if="!item.user_roles || item.user_roles.length === 0">-</span>
          </td>
          <td class="border border-gray-300 text-center">
            <div class="d-flex justify-center">
              <v-btn 
                icon="mdi-eye" 
                variant="text" 
                @click="viewStudentDetails(item)"
                color="info"
              />
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
                v-if="canCreateNominations && (!item.evaluations || item.evaluations.length === 0) && item?.user_roles?.includes('ResearchSupervisor')"
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
import { useEnumsStore } from '~/stores/enums';
import { useAuthStore } from '~/composables/useAuth';
import type { Student } from '~/types/global';

const props = defineProps<{
  students: Student[];
  loading: boolean;
  totalItems: number;
  itemsPerPage: number;
  page: number;
}>();

const { students, loading, totalItems, itemsPerPage, page } = toRefs(props);
const emits = defineEmits(['update-options', 'edit-student', 'delete-student', 'add-nomination', 'view-student-details']);

const { canEditStudents, canDeleteStudents, canCreateNominations, isOfficeAssistant } = usePermissions();
const enumsStore = useEnumsStore();
const authStore = useAuthStore();

const headers = computed(() => {
  const baseHeaders: Array<{
    title: string;
    key: string;
    sortable: boolean;
    align?: 'start' | 'center' | 'end';
  }> = [
    { title: 'No.', key: 'index', sortable: false, align: 'center' },
    { title: 'Matric Number', key: 'matric_number', sortable: false, align: 'start' },
    { title: 'Name', key: 'name', sortable: false, align: 'start' },
    { title: 'Email', key: 'email', sortable: false, align: 'start' },
    { title: 'Program', key: 'program.program_name', sortable: false, align: 'start' },
    { title: 'Current Semester', key: 'current_semester', sortable: false, align: 'start' },
    { title: 'Department', key: 'program.department', sortable: false, align: 'start' },
    { title: 'Research Supervisor', key: 'main_supervisor.name', sortable: false, align: 'start' },
    ...(isOfficeAssistant.value ? [] : [{ title: 'My Role', key: 'user_roles', sortable: false }]),
    { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
  ];

  return baseHeaders;
});

const formatRoleName = (roleValue: string): string => {
  if (!enumsStore.enumsData?.roles) return roleValue;
  
  // Get the formatted title from the enums
  const roleTitle = enumsStore.enumsData.roles[roleValue];
  return roleTitle || roleValue;
};

const handleOptionsUpdate = (options: any) => {
  emits('update-options', options);
};

const viewStudentDetails = (student: Student) => {
  emits('view-student-details', student);
};

const editStudent = (student: Student) => {
  emits('edit-student', student);
};

const deleteStudent = (student: Student) => {
  emits('delete-student', student);
};

const getSupervisorDisplayName = (supervisor: any) => {
  if (supervisor) {
    return `${supervisor.title} ${supervisor.name}`;
  }
  return '-';
};

const isStudentSupervisor = (student: Student) => {
  // Check if the current user is the main supervisor for this student
  if (!authStore.user || !student.main_supervisor) {
    return false;
  }
  
  // Compare the current user's ID with the student's main supervisor ID
  return authStore.user.id === student.main_supervisor.user_id;
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
