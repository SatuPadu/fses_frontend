<script setup lang="ts">
import { ref, shallowRef, computed, watch } from 'vue';

const defaultTitleSelect = shallowRef({ name: 'Dr.', value: 'Dr' });
const TitleSelectItems = [
    { name: 'Dr.', value: 'Dr' },
    { name: 'Prof. Madya', value: 'ProfessorMadya' },
    { name: 'Prof.', value: 'Professor' },
]

const props = defineProps({
    dialog: {
        type: Boolean,
        default: false
    }
})
const emits = defineEmits(['toggle-dialog'])

const dialogModel = computed({
    get() {
        return props.dialog
    },
    set() {
        toggleDialog()
    }
})

const toggleDialog = () => {
    emits('toggle-dialog')
}

</script>

<template>
    <v-dialog
        v-model="dialogModel"
        max-width="600"
        persistent
    >
        <v-card title="Add New User">
            <v-divider></v-divider>
            <v-card-text>
                <v-row dense>
                    <v-col
                    cols="12"
                    >
                    <v-label class="font-weight-bold mb-1">Full name*</v-label>
                    <v-text-field
                        density="compact"
                        variant="outlined"
                        hide-details
                        color="primary"
                        :disabled="loading"
                        required
                    ></v-text-field>
                    </v-col>

                    <v-col
                    cols="12"
                    sm="6"
                    >
                    <v-label class="font-weight-bold mb-1">Staff Number*</v-label>
                    <v-text-field
                        density="compact"
                        variant="outlined"
                        hide-details
                        color="primary"
                        :disabled="loading"
                        required
                    ></v-text-field>
                    </v-col>

                    <v-col
                    cols="12"
                    sm="6"
                    >
                    <v-label class="font-weight-bold mb-1">Title*</v-label>
                    <v-select
                        v-model="defaultTitleSelect"
                        :items="TitleSelectItems"
                        item-title="name"
                        item-value="value"
                        density="compact"
                        variant="outlined"
                        hide-details
                        color="primary"
                        :disabled="loading"
                        required
                    ></v-select>
                    </v-col>

                    <v-col
                    cols="12"
                    sm="6"
                    >
                    <v-label class="font-weight-bold mb-1">Role*</v-label>
                    <v-select
                        v-model="defaultTitleSelect"
                        :items="TitleSelectItems"
                        item-title="name"
                        item-value="value"
                        density="compact"
                        variant="outlined"
                        hide-details
                        color="primary"
                        :disabled="loading"
                        required
                    ></v-select>
                    </v-col>

                    <v-col
                    cols="12"
                    sm="6"
                    >
                    <v-label class="font-weight-bold mb-1">Department*</v-label>
                    <v-select
                        v-model="defaultTitleSelect"
                        :items="TitleSelectItems"
                        item-title="name"
                        item-value="value"
                        density="compact"
                        variant="outlined"
                        hide-details
                        color="primary"
                        :disabled="loading"
                        required
                    ></v-select>
                    </v-col>

                    <v-col
                    cols="12"
                    >
                    <v-label class="font-weight-bold mb-1">Email*</v-label>
                    <v-text-field
                        density="compact"
                        variant="outlined"
                        hide-details
                        color="primary"
                        :disabled="loading"
                        required
                    ></v-text-field>
                    </v-col>

                    <v-col
                    cols="12"
                    >
                    <v-label class="font-weight-bold mb-1">Phone</v-label>
                    <v-text-field
                        density="compact"
                        variant="outlined"
                        hide-details
                        color="primary"
                        :disabled="loading"
                    ></v-text-field>
                    </v-col>
                </v-row>
                
                <small class="text-caption text-medium-emphasis">*indicates required field</small>

                <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn
                    text="Close"
                    variant="outlined"
                    @click="toggleDialog"
                ></v-btn>

                <v-btn
                    color="primary"
                    text="Add"
                    variant="outlined"
                ></v-btn>
                </v-card-actions>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>