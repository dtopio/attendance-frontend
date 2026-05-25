<script setup>
import { computed, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  form: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
  editingId: {
    type: [Number, String, null],
    default: null,
  },
  submitting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:open', 'update:form', 'submit', 'cancel'])

const isEditing = computed(() => props.editingId !== null)

const localForm = computed({
  get: () => props.form,
  set: (value) => emit('update:form', value),
})

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) emit('cancel')
  },
)

function updateField(field, value) {
  localForm.value = {
    ...localForm.value,
    [field]: value,
  }
}

function firstError(field) {
  const value = props.errors[field]
  return Array.isArray(value) ? value[0] : value
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>{{ isEditing ? 'Edit Record' : 'New Record' }}</DialogTitle>
        <DialogDescription>
          {{ isEditing ? 'Update the selected attendance entry.' : 'Add a new attendance entry.' }}
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-2">
        <div class="grid gap-2">
          <Label for="employee_name">Employee name</Label>
          <Input
            id="employee_name"
            :model-value="localForm.employee_name"
            placeholder="Jane Doe"
            :aria-invalid="Boolean(firstError('employee_name'))"
            @update:model-value="updateField('employee_name', $event)"
          />
          <p v-if="firstError('employee_name')" class="text-sm text-destructive">
            {{ firstError('employee_name') }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="date">Date</Label>
          <Input
            id="date"
            :model-value="localForm.date"
            type="date"
            :aria-invalid="Boolean(firstError('date'))"
            @update:model-value="updateField('date', $event)"
          />
          <p v-if="firstError('date')" class="text-sm text-destructive">
            {{ firstError('date') }}
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="grid gap-2">
            <Label for="check_in_time">Check-in time</Label>
            <Input
              id="check_in_time"
              :model-value="localForm.check_in_time"
              type="time"
              :aria-invalid="Boolean(firstError('check_in_time'))"
              @update:model-value="updateField('check_in_time', $event)"
            />
            <p v-if="firstError('check_in_time')" class="text-sm text-destructive">
              {{ firstError('check_in_time') }}
            </p>
          </div>

          <div class="grid gap-2">
            <Label for="check_out_time">Check-out time</Label>
            <Input
              id="check_out_time"
              :model-value="localForm.check_out_time"
              type="time"
              :aria-invalid="Boolean(firstError('check_out_time'))"
              @update:model-value="updateField('check_out_time', $event)"
            />
            <p v-if="firstError('check_out_time')" class="text-sm text-destructive">
              {{ firstError('check_out_time') }}
            </p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" :disabled="submitting" @click="emit('update:open', false)">
          Cancel
        </Button>
        <Button :disabled="submitting" @click="emit('submit')">
          {{ submitting ? 'Saving...' : isEditing ? 'Update record' : 'Create record' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
