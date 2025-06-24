<template>
  <PermissionGuard module="students" action="view">
    <v-row>
      <v-col cols="12" md="12">
        <h1>Student Management</h1>
        <!-- Action Buttons -->
        <div class="d-flex justify-end mb-4 mt-4 gap-2">
          <PermissionButton 
            module="students" 
            action="create"
            @click="showAddFormDialog = true" 
            color="primary" 
            variant="flat" 
            :prepend-icon="PlusIcon"
          >
            Add Student
          </PermissionButton>
        </div>

        <!-- Filters -->
        <StudentFilters @filters-updated="handleFiltersUpdated" />

        <!-- Students Table -->
        <UiParentCard class="mt-4" :showTitle="false">
          <StudentsTable
            :students="students"
            :loading="loading"
            :total-items="pagination.totalItems"
            :items-per-page="pagination.itemsPerPage"
            :page="pagination.page"
            @update-options="handleOptionsUpdate"
            @edit-student="handleEditStudent"
            @delete-student="handleDeleteStudent"
            @items-per-page-changed="handleItemsPerPageChange"
          />
        </UiParentCard>
      </v-col>
    </v-row>

    <!-- Dialogs -->
    <PermissionGuard module="students" action="create">
      <AddStudentForm
        :dialog="showAddFormDialog"
        @toggle-dialog="showAddFormDialog = false"
        @student-added="handleStudentAdded"
      />
    </PermissionGuard>

    <PermissionGuard module="students" action="edit">
      <UpdateStudentForm
        v-if="selectedStudent"
        :dialog="showUpdateFormDialog"
        :student-info="selectedStudent"
        @toggle-dialog="showUpdateFormDialog = false"
        @student-updated="handleStudentUpdated"
      />
    </PermissionGuard>

    <PermissionGuard module="students" action="delete">
      <v-dialog v-model="showDeleteDialog" max-width="400">
        <v-card
          title="Confirm Deletion"
          text="Are you sure you want to remove this student? This action cannot be undone."
        >
          <template v-slot:prepend>
            <v-icon :icon="ExclamationCircleIcon" color="error"></v-icon>
          </template>
          <v-card-actions>
            <v-spacer></v-spacer>
            <PermissionButton
              color="error"
              text="Delete"
              :loading="loading"
              @click="confirmDeleteStudent"
              module="students"
              action="delete"
            />
            <v-btn text="Cancel" @click="showDeleteDialog = false"></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </PermissionGuard>
  </PermissionGuard>
</template> 

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import UiParentCard from '~/components/shared/UiParentCard.vue';
import StudentFilters from '~/components/students/StudentFilters.vue';
import StudentsTable from '~/components/students/StudentsTable.vue';
import AddStudentForm from '~/components/students/AddStudentForm.vue';
import UpdateStudentForm from '~/components/students/UpdateStudentForm.vue';
import PermissionButton from '~/components/shared/PermissionButton.vue';
import PermissionGuard from '~/components/shared/PermissionGuard.vue';
import { useUserManagement } from '~/composables/useUserManagement';
import { usePermissions } from '~/composables/usePermissions';
import type { Student } from '~/types/global';
import { PlusIcon, ExclamationCircleIcon } from 'vue-tabler-icons';

const userManagement = useUserManagement();
const { canViewStudents, canCreateStudents, canEditStudents, canDeleteStudents } = usePermissions();

// Dialog states
const showAddFormDialog = ref(false);
const showUpdateFormDialog = ref(false);
const showDeleteDialog = ref(false);

// Student data and state
const students = ref<Student[]>([]);
const selectedStudent = ref<Student | null>(null);
const loading = ref(false);
const activeFilters = ref({});

// Pagination and sorting state
const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
  totalItems: 0,
  sortBy: [{ key: 'name', order: 'desc' }],
});

// Fetch students from API
const fetchStudents = async () => {
  // Check if user has permission to view students
  if (!canViewStudents.value) {
    console.log('No permission to view students');
    return;
  }

  loading.value = true;
  try {
    const filters: Record<string, any> = {};
    for (const [key, value] of Object.entries(activeFilters.value)) {
      if (value) {
        filters[key] = value;
      }
    }

    // Handle per_page from filters
    if (filters.per_page) {
      pagination.itemsPerPage = filters.per_page;
      delete filters.per_page; // Remove from API filters
    }

    const response = await userManagement.getStudents({
      page: pagination.page,
      perPage: pagination.itemsPerPage,
      sortBy: pagination.sortBy.length ? pagination.sortBy[0].key : 'name',
      sortOrder: pagination.sortBy.length ? pagination.sortBy[0].order : 'desc',
      filters
    });

    students.value = response.data.items || [];
    pagination.totalItems = response.data.pagination?.total || 0;

  } catch (error) {
    console.error('Error fetching students:', error);
  } finally {
    loading.value = false;
  }
};

// Event Handlers
const handleFiltersUpdated = (filters: any) => {
  activeFilters.value = filters;
  pagination.page = 1; // Reset to first page
  fetchStudents();
};

const handleOptionsUpdate = ({ page, itemsPerPage, sortBy }: any) => {
  pagination.page = page;
  pagination.itemsPerPage = itemsPerPage;
  pagination.sortBy = sortBy;
  fetchStudents();
};

const handleStudentAdded = () => {
  fetchStudents(); // Refresh list
};

const handleStudentUpdated = () => {
  fetchStudents(); // Refresh list
};

const handleEditStudent = (student: Student) => {
  if (!canEditStudents.value) {
    return;
  }
  selectedStudent.value = student;
  showUpdateFormDialog.value = true;
};

const handleDeleteStudent = (student: Student) => {
  if (!canDeleteStudents.value) {
    return;
  }
  selectedStudent.value = student;
  showDeleteDialog.value = true;
};

const confirmDeleteStudent = async () => {
  if (!selectedStudent.value || !canDeleteStudents.value) return;
  loading.value = true;
  try {
    await userManagement.deleteStudent(selectedStudent.value.id.toString());
    fetchStudents();
  } catch (error) {
    console.error('Error deleting student:', error);
  } finally {
    showDeleteDialog.value = false;
    loading.value = false;
  }
};

const handleItemsPerPageChange = (newItemsPerPage: number) => {
  pagination.itemsPerPage = newItemsPerPage;
  fetchStudents();
};

onMounted(() => {
  // Wait a bit for permissions to initialize, then fetch students
  setTimeout(() => {
    fetchStudents();
  }, 100);
});
</script>