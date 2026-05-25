<script setup>
import { onMounted, ref } from 'vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AttendanceEmptyState from '@/components/attendance/AttendanceEmptyState.vue'
import AttendanceFormDialog from '@/components/attendance/AttendanceFormDialog.vue'
import AttendanceTable from '@/components/attendance/AttendanceTable.vue'
import { useAttendanceRecords } from '@/composables/useAttendanceRecords.js'

const emptyForm = () => ({
  employee_name: '',
  date: '',
  check_in_time: '',
  check_out_time: '',
})

const {
  records,
  sortedRecords,
  loading,
  loadError,
  submitting,
  deletingId,
  validationErrors,
  loadRecords,
  saveRecord,
  removeRecord,
  clearValidationErrors,
} = useAttendanceRecords()

const form = ref(emptyForm())
const editingId = ref(null)
const dialogOpen = ref(false)

function resetForm() {
  form.value = emptyForm()
  editingId.value = null
  clearValidationErrors()
}

function openCreateDialog() {
  resetForm()
  dialogOpen.value = true
}

function openEditDialog(record) {
  editingId.value = record.id
  clearValidationErrors()
  form.value = {
    employee_name: record.employee_name ?? '',
    date: record.date ?? '',
    check_in_time: toInputTime(record.check_in_time),
    check_out_time: toInputTime(record.check_out_time),
  }
  dialogOpen.value = true
}

async function submitForm() {
  const savedRecord = await saveRecord({
    id: editingId.value,
    payload: form.value,
  })

  if (!savedRecord) return

  dialogOpen.value = false
  resetForm()
}

async function deleteRecord(record) {
  const confirmed = window.confirm(`Delete attendance record for ${record.employee_name}?`)
  if (!confirmed) return

  const deleted = await removeRecord(record)

  if (deleted && editingId.value === record.id) {
    dialogOpen.value = false
    resetForm()
  }
}

function toInputTime(value) {
  return value ? String(value).slice(0, 5) : ''
}

onMounted(loadRecords)
</script>

<template>
  <main class="min-h-screen bg-muted/60 px-4 py-8 text-foreground sm:px-6 lg:px-8">
    <div class="mx-auto flex max-w-6xl flex-col gap-6">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-medium text-primary">Attendance tracker</p>
          <h1 class="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Manage attendance records
          </h1>
        </div>

        <div class="flex gap-2">
          <Button variant="outline" :disabled="loading" @click="loadRecords">
            {{ loading ? 'Refreshing...' : 'Refresh' }}
          </Button>
          <Button @click="openCreateDialog">
            New Record
          </Button>
        </div>
      </header>

      <Alert v-if="loadError" variant="destructive">
        <AlertTitle>Request failed</AlertTitle>
        <AlertDescription>{{ loadError }}</AlertDescription>
      </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Attendance records</CardTitle>
          </CardHeader>
        <CardContent>
          <div v-if="loading" class="rounded-md border py-12 text-center text-sm text-muted-foreground">
            Loading records...
          </div>

          <AttendanceEmptyState
            v-else-if="records.length === 0"
            @create="openCreateDialog"
          />

          <AttendanceTable
            v-else
            :records="sortedRecords"
            :deleting-id="deletingId"
            @edit="openEditDialog"
            @delete="deleteRecord"
          />
        </CardContent>
      </Card>

      <AttendanceFormDialog
        v-model:open="dialogOpen"
        v-model:form="form"
        :errors="validationErrors"
        :editing-id="editingId"
        :submitting="submitting"
        @cancel="resetForm"
        @submit="submitForm"
      />
    </div>
  </main>
</template>
