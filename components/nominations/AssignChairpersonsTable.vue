<template>
  <v-data-table-server
    :headers="headers"
    :items="processedNominations"
    :items-length="totalItems"
    :loading="loading"
    :items-per-page="itemsPerPage"
    :page="page"
    class="elevation-1 bordered-table"
    @update:options="handleOptionsUpdate"
  >
    <!-- Serial Number -->
    <template #item.index="{ index }">
      {{ (page - 1) * itemsPerPage + index + 1 }}
    </template>
    
    <!-- Student Info -->
    <template #item.student_name="{ item }">
      <div>
        <div class="font-weight-medium">{{ item.student?.name }}</div>
        <div class="text-caption text-muted">{{ item.student?.matric_number }}</div>
      </div>
    </template>
    
    <!-- Program Info -->
    <template #item.program="{ item }">
      <div>
        <div class="font-weight-medium">{{ item.student?.program?.program_name }}</div>
        <div class="text-caption text-muted">Semester {{ item.student?.current_semester }}</div>
      </div>
    </template>
    
    <!-- Main Supervisor -->
    <template #item.main_supervisor="{ item }">
      <div class="text-caption">
        <span v-if="item._mainSupervisor">{{ item._mainSupervisor }}</span>
        <span v-else class="text-muted">No supervisor</span>
      </div>
    </template>
    
    <!-- Co-Supervisors -->
    <template #item.co_supervisor="{ item }">
      <div>
        <div v-if="item._coSupervisors?.length">
          <div
            v-for="co in item._coSupervisors"
            :key="co.label"
            class="text-caption"
          > {{ co.name }}
          </div>
        </div>
        <div v-else class="text-caption text-muted">
          No co-supervisors
        </div>
      </div>
    </template>
    
    <!-- Status -->
    <template #item.nomination_status="{ item }">
      <v-chip
        :color="STATUS_CONFIG[item.nomination_status]?.color || 'grey'"
        :text="STATUS_CONFIG[item.nomination_status]?.text || item.nomination_status"
        size="small"
        variant="flat"
      />
    </template>
    
    <!-- Examiners -->
    <template #item.examiners="{ item }">
      <div class="d-flex flex-column gap-1">
        <div v-if="item._examiners?.length">
          <div
            v-for="examiner in item._examiners"
            :key="examiner.key"
            class="text-caption"
          >
            <strong>{{ examiner.key }}:</strong> {{ examiner.name }}
          </div>
        </div>
        <div v-else class="text-caption text-muted">
          No examiners assigned
        </div>
      </div>
    </template>
    
    <!-- Chairperson Selection -->
    <template #item.chairperson="{ item }">
      <div class="chairperson-cell">
        <v-select
          :model-value="assignmentMap[item.id]?.chairperson_id || null"
          :items="chairpersonOptions"
          :item-title="lecturerDisplay"
          item-value="id"
          density="compact"
          variant="outlined"
          placeholder="Select Chairperson"
          :disabled="loadingSuggestions"
          hide-details
          class="chairperson-select"
          @update:model-value="(value: any) => onManualChairpersonChange(item.id, value)"
        >
          <template #item="{ props: itemProps, item: selectItem }">
            <v-list-item v-bind="itemProps">
              <template #append>
                <v-chip
                  v-if="chairpersonStats[selectItem.raw.id]"
                  size="x-small"
                  color="primary"
                  variant="text"
                >
                  {{ chairpersonStats[selectItem.raw.id] }}/{{ MAX_ASSIGNMENTS }}
                </v-chip>
              </template>
            </v-list-item>
          </template>
        </v-select>
        
        <div v-if="getAssignmentStatus(item).show" 
             class="auto-assigned-label"
             :class="getAssignmentStatus(item).class">
          <v-icon size="small" class="mr-1">
            {{ getAssignmentStatus(item).icon }}
          </v-icon>
          <span>{{ getAssignmentStatus(item).text }}</span>
        </div>
      </div>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { toRefs, computed, ref, watch, onMounted, nextTick } from 'vue';
import { useNominationManagement } from '~/composables/useNominationManagement';
import type { Evaluation } from '~/types/global';

// Constants
const MAX_ASSIGNMENTS = 4;

// Types
interface Assignment {
  evaluation_id: number;
  chairperson_id: number;
  is_auto_assigned: boolean;
}

interface ProcessedNomination extends Evaluation {
  _coSupervisors: Array<{
    label: string;
    name: string;
    isExternal: boolean;
  }>;
  _mainSupervisor: string;
  _examiners: Array<{
    key: string;
    name: string;
  }>;
}

interface ChairpersonCandidate {
  id: number;
  name: string;
  title?: string;
  current_assignments?: number;
}

interface SmartAssignmentResult {
  chairperson: ChairpersonCandidate;
  reason: string;
}

// Props
const props = defineProps<{
  nominations: Evaluation[];
  loading: boolean;
  totalItems: number;
  itemsPerPage: number;
  page: number;
  assignments: Assignment[];
}>();

const { nominations, loading, totalItems, itemsPerPage, page, assignments } = toRefs(props);
const emits = defineEmits<{
  'update-options': [options: any];
  'assignment-changed': [assignments: Assignment[]];
  'smart-assign-all': [];
}>();

// Composables
const nominationManagement = useNominationManagement();

// Constants
const STATUS_CONFIG = {
  Pending: { color: 'warning', text: 'Pending' },
  Nominated: { color: 'info', text: 'Nominated' },
  Locked: { color: 'success', text: 'Locked' },
  Postponed: { color: 'orange', text: 'Postponed' },
} as const;

const headers: Array<{
  title: string;
  key: string;
  sortable: boolean;
  width?: string;
  align?: 'start' | 'center' | 'end';
}> = [
  { title: 'No.', key: 'index', sortable: false, width: '80px', align: 'center' },
  { title: 'Student Information', key: 'student_name', sortable: false, width: '200px', align: 'start' },
  { title: 'Program & Semester', key: 'program', sortable: false, width: '200px', align: 'start' },
  { title: 'Research Supervisor', key: 'main_supervisor', sortable: false, width: '250px', align: 'start' },
  { title: 'Co-Supervisor', key: 'co_supervisor', sortable: false, width: '250px', align: 'start' },
  { title: 'Nomination Status', key: 'nomination_status', sortable: false, width: '150px', align: 'center' },
  { title: 'Assigned Examiners', key: 'examiners', sortable: false, width: '300px', align: 'start' },
  { title: 'Assign Chairperson', key: 'chairperson', sortable: false, width: '250px', align: 'start' },
] as const;

// State
const chairpersonOptions = ref<ChairpersonCandidate[]>([]);
const loadingSuggestions = ref(false);

// Expose smart assignment function for parent component
const smartAssignAll = async (): Promise<Assignment[]> => {
  const newAssignments: Assignment[] = [];
  const tempStats: Record<number, number> = {};
  
  // Initialize temp stats with DB assignments only
  chairpersonOptions.value.forEach(chairperson => {
    tempStats[chairperson.id] = chairperson.current_assignments || 0;
  });
  
  // Process each nomination individually
  for (const nomination of processedNominations.value) {
    const existingAssignment = assignmentMap.value[nomination.id];
    let shouldAutoAssign = false;
    
    if (!existingAssignment) {
      // No assignment exists - auto assign
      shouldAutoAssign = true;
    } else if (existingAssignment.is_auto_assigned) {
      // Already auto assigned - skip (keep existing)
      newAssignments.push(existingAssignment);
      // Update temp stats to account for this auto assignment
      if (tempStats[existingAssignment.chairperson_id] !== undefined) {
        tempStats[existingAssignment.chairperson_id]++;
      }
    } else {
      // Manual assignment - check for errors
      const examinerIds = getExaminerIds(nomination);
      const requiresProfessor = needsProfessorChairperson(nomination);
      const chairperson = chairpersonOptions.value.find(c => c.id === existingAssignment.chairperson_id);
      
      const hasConflict = examinerIds.includes(existingAssignment.chairperson_id);
      const hasConstraintViolation = requiresProfessor && !isProfessor(chairperson);
      
      if (hasConflict || hasConstraintViolation) {
        // Manual assignment has errors - auto assign
        shouldAutoAssign = true;
      } else {
        // Manual assignment is valid - keep it
        newAssignments.push(existingAssignment);
        // Update temp stats to account for this manual assignment
        if (tempStats[existingAssignment.chairperson_id] !== undefined) {
          tempStats[existingAssignment.chairperson_id]++;
        }
      }
    }
    
    if (shouldAutoAssign) {
      // Find best chairperson for this nomination
      const result = findBestChairpersonWithStats(nomination, tempStats);
      if (result) {
        const assignment: Assignment = {
          evaluation_id: nomination.id,
          chairperson_id: result.chairperson.id,
          is_auto_assigned: true,
        };
        
        newAssignments.push(assignment);
        
        // Update temp stats for next iteration
        tempStats[result.chairperson.id]++;
      }
    }
  }
  
  return newAssignments;
};

// Expose for parent component
defineExpose({
  smartAssignAll
});

// Computed
const assignmentMap = computed(() => {
  const map: Record<number, Assignment> = {};
  assignments.value.forEach(assignment => {
    map[assignment.evaluation_id] = assignment;
  });
  return map;
});

// Memoized chairperson stats calculation
const chairpersonStats = computed(() => {
  const stats: Record<number, number> = {};
  
  // Initialize all chairpersons with current assignments from DB
  chairpersonOptions.value.forEach(chairperson => {
    stats[chairperson.id] = chairperson.current_assignments || 0;
  });
  
  // Add current session assignments
  assignments.value.forEach(assignment => {
    if (assignment.chairperson_id && stats[assignment.chairperson_id] !== undefined) {
      stats[assignment.chairperson_id]++;
    }
  });
  
  return stats;
});

const processedNominations = computed<ProcessedNomination[]>(() => {
  const filterNonNull = <T>(arr: (T | null)[]): T[] => arr.filter((x): x is T => x !== null);
  
  return nominations.value.map(nomination => {
    const mainSupervisor = nomination.student?.main_supervisor 
      ? `${nomination.student.main_supervisor.title || ''} ${nomination.student.main_supervisor.name || ''}`.trim()
      : '';

    // Process co-supervisors
    const coSupervisors = filterNonNull(
      nomination.student?.co_supervisors
        ?.map((co, idx) => {
          const name = co.lecturer?.name 
            ? `${co.lecturer.title ? co.lecturer.title + ' ' : ''}${co.lecturer.name}`.trim()
            : co.external_name 
              ? `${co.lecturer?.title ? co.lecturer.title + ' ' : ''}${co.external_name}`.trim()
              : null;
          return name ? { label: `Co-Supervisor ${idx + 1}`, name, isExternal: !co.lecturer?.name } : null;
        }) || []
    );

    // Process examiners
    const examiners = [
      { key: 'E1', examiner: nomination.examiner1 },
      { key: 'E2', examiner: nomination.examiner2 },
      { key: 'E3', examiner: nomination.examiner3 },
    ]
      .filter(({ examiner }) => examiner)
      .map(({ key, examiner }) => ({
        key,
        name: `${examiner!.title ? examiner!.title + ' ' : ''}${examiner!.name}`.trim(),
      }));

    return {
      ...nomination,
      _mainSupervisor: mainSupervisor,
      _coSupervisors: coSupervisors,
      _examiners: examiners,
    };
  });
});

// Methods
const handleOptionsUpdate = (options: any) => {
  emits('update-options', options);
};

const onManualChairpersonChange = (evaluationId: number, chairpersonId: number | null | undefined) => {
  const currentAssignments = [...assignments.value];
  const existingIndex = currentAssignments.findIndex(a => a.evaluation_id === evaluationId);
  
  if (chairpersonId) {
    const assignment: Assignment = {
      evaluation_id: evaluationId,
      chairperson_id: chairpersonId,
      is_auto_assigned: false,
    };
    
    if (existingIndex >= 0) {
      currentAssignments[existingIndex] = assignment;
    } else {
      currentAssignments.push(assignment);
    }
  } else if (existingIndex >= 0) {
    currentAssignments.splice(existingIndex, 1);
  }
  
  emits('assignment-changed', currentAssignments);
};

const fetchChairpersonOptions = async () => {
  loadingSuggestions.value = true;
  try {
    const response = await nominationManagement.getChairpersonSuggestions();
    chairpersonOptions.value = response.data || [];
  } catch (error) {
    chairpersonOptions.value = [];
  } finally {
    loadingSuggestions.value = false;
  }
};

// Smart Assignment Logic
const isProfessor = (person: any): boolean => {
  if (!person?.title) return false;
  return person.title.trim().toLowerCase() === 'professor';
};

const needsProfessorChairperson = (item: any): boolean => {
  if (isProfessor(item.student?.main_supervisor)) return true;
  return [item.examiner1, item.examiner2, item.examiner3].some(isProfessor);
};

const getExaminerIds = (item: any): number[] => {
  return [item.examiner1_id, item.examiner2_id, item.examiner3_id].filter(Boolean);
};

const getValidChairpersonOptions = (item: any): ChairpersonCandidate[] => {
  const examinerIds = getExaminerIds(item);
  const requiresProfessor = needsProfessorChairperson(item);
  
  return chairpersonOptions.value.filter(chairperson => {
    // Check if already an examiner (conflict)
    if (examinerIds.includes(chairperson.id)) return false;
    
    // Check professor constraint
    if (requiresProfessor && !isProfessor(chairperson)) return false;
    
    // Check assignment limit
    const currentCount = chairpersonStats.value[chairperson.id] || 0;
    if (currentCount >= MAX_ASSIGNMENTS) return false;
    
    return true;
  });
};

const findBestChairperson = (item: any): SmartAssignmentResult | null => {
  return findBestChairpersonWithStats(item, chairpersonStats.value);
};

const findBestChairpersonWithStats = (item: any, stats: Record<number, number>): SmartAssignmentResult | null => {
  const examinerIds = getExaminerIds(item);
  const requiresProfessor = needsProfessorChairperson(item);
  
  const validOptions = chairpersonOptions.value.filter(chairperson => {
    // Check if already an examiner (conflict)
    if (examinerIds.includes(chairperson.id)) return false;
    
    // Check professor constraint
    if (requiresProfessor && !isProfessor(chairperson)) return false;
    
    // Check assignment limit using provided stats
    const currentCount = stats[chairperson.id] || 0;
    if (currentCount >= MAX_ASSIGNMENTS) return false;
    
    return true;
  });
  
  if (validOptions.length === 0) return null;
  
  // Sort by current assignment count (ascending) and then by name for consistency
  const sortedOptions = validOptions.sort((a, b) => {
    const countDiff = (stats[a.id] || 0) - (stats[b.id] || 0);
    if (countDiff !== 0) return countDiff;
    return a.name.localeCompare(b.name);
  });
  
  const bestChairperson = sortedOptions[0];
  const currentCount = stats[bestChairperson.id] || 0;
  
  let reason = 'Best available option';
  if (currentCount === 0) {
    reason = 'No current assignments';
  } else if (currentCount < MAX_ASSIGNMENTS - 1) {
    reason = `Balanced workload (${currentCount} assignments)`;
  } else {
    reason = `Last available slot (${currentCount} assignments)`;
  }
  
  return {
    chairperson: bestChairperson,
    reason
  };
};



// Status helpers
const hasChairpersonConflict = (item: any): boolean => {
  const chairpersonId = assignmentMap.value[item.id]?.chairperson_id;
  return chairpersonId !== null && getExaminerIds(item).includes(chairpersonId);
};

const isChairpersonProfessor = (item: any): boolean => {
  let chairperson = null;
  const chairpersonId = assignmentMap.value[item.id]?.chairperson_id;
  
  if (chairpersonId) {
    chairperson = chairpersonOptions.value.find(c => c.id === chairpersonId);
  }
  if (!chairperson && item.chairperson) {
    chairperson = item.chairperson;
  }
  
  return isProfessor(chairperson);
};

const hasChairpersonProfessorConstraintViolation = (item: any): boolean => {
  return needsProfessorChairperson(item) && !isChairpersonProfessor(item);
};

const getAssignmentStatus = (item: any) => {
  const assignment = assignmentMap.value[item.id];
  const hasAssignment = assignment || item.chairperson;
  
  if (!hasAssignment) {
    return { show: false, class: '', icon: '', text: '' };
  }
  
  const hasConflict = hasChairpersonConflict(item);
  const hasConstraintViolation = hasChairpersonProfessorConstraintViolation(item);
  
  if (hasConflict) {
    return {
      show: true,
      class: 'text-error',
      icon: 'mdi-alert-circle',
      text: 'Conflict: Chairperson is also an examiner'
    };
  }
  
  if (hasConstraintViolation) {
    return {
      show: true,
      class: 'text-warning',
      icon: 'mdi-alert',
      text: 'Constraint: Chairperson must be a Professor'
    };
  }
  
  if (assignment?.is_auto_assigned) {
    return {
      show: true,
      class: 'text-primary',
      icon: 'mdi-auto-fix',
      text: 'Auto assigned'
    };
  }
  
  return {
    show: true,
    class: 'text-success',
    icon: 'mdi-account-check',
    text: 'Manually assigned'
  };
};

// Watchers
watch(
  () => nominations.value,
  async (newNominations) => {
    if (newNominations.length > 0) {
      await fetchChairpersonOptions();
    }
  },
  { immediate: true }
);

// Debounced watcher for assignments to prevent excessive API calls
let fetchTimeout: NodeJS.Timeout;
watch(
  () => assignments.value,
  () => {
    clearTimeout(fetchTimeout);
    fetchTimeout = setTimeout(async () => {
      await fetchChairpersonOptions();
    }, 500);
  },
  { deep: true }
);

// Lifecycle
onMounted(async () => {
  await fetchChairpersonOptions();
});

const lecturerDisplay = (item: any) => `${item.title ? item.title + ' ' : ''}${item.name}`.trim();
</script>

<style scoped>
.v-data-table :deep(.v-data-table__wrapper) {
  border: 1px solid #e0e0e0;
  overflow-x: auto;
  min-width: 2000px; /* Increased to accommodate wider columns */
}

.v-data-table :deep(table) {
  border-collapse: collapse;
  table-layout: fixed !important;
  width: 100% !important;
}

.v-data-table :deep(th) {
  border: 1px solid #e0e0e0 !important;
  background-color: #f5f5f5;
  white-space: normal !important;
  word-wrap: break-word !important;
  vertical-align: top !important;
  padding: 8px !important;
}

.v-data-table :deep(td) {
  border: 1px solid #e0e0e0 !important;
  white-space: normal !important;
  word-wrap: break-word !important;
  word-break: break-word !important;
  vertical-align: top !important;
  padding: 8px !important;
}

.chairperson-select {
  min-width: 220px;
}

.chairperson-cell {
  padding-top: 8px;
  padding-bottom: 8px;
  min-height: 56px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 4px;
}

.auto-assigned-label {
  font-size: 11px;
  line-height: 1.2;
  display: flex;
  align-items: center;
}

.text-error {
  color: rgb(var(--v-theme-error)) !important;
}

.text-success {
  color: rgb(var(--v-theme-success)) !important;
}
</style>