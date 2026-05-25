import { computed, ref } from 'vue'
import {
  createAttendanceRecord,
  deleteAttendanceRecord,
  fetchAttendanceRecords,
  updateAttendanceRecord,
} from '@/services/attendanceService.js'

export function useAttendanceRecords() {
  const records = ref([])
  const loading = ref(false)
  const loadError = ref('')
  const submitting = ref(false)
  const deletingId = ref(null)
  const validationErrors = ref({})

  const sortedRecords = computed(() =>
    [...records.value].sort((a, b) => `${b.date} ${b.check_in_time}`.localeCompare(`${a.date} ${a.check_in_time}`)),
  )

  async function loadRecords() {
    loading.value = true
    loadError.value = ''

    try {
      records.value = await fetchAttendanceRecords()
    } catch (error) {
      loadError.value = getApiMessage(error, 'Unable to load attendance records. Confirm the Laravel API is running.')
    } finally {
      loading.value = false
    }
  }

  async function saveRecord({ id, payload }) {
    submitting.value = true
    validationErrors.value = {}
    loadError.value = ''

    try {
      const savedRecord = id
        ? await updateAttendanceRecord(id, payload)
        : await createAttendanceRecord(payload)

      records.value = id
        ? records.value.map((record) => (record.id === id ? savedRecord : record))
        : [savedRecord, ...records.value]

      return savedRecord
    } catch (error) {
      if (error.response?.status === 422) {
        validationErrors.value = error.response.data.errors ?? {}
        return null
      }

      loadError.value = getApiMessage(error, 'Unable to save the attendance record.')
      return null
    } finally {
      submitting.value = false
    }
  }

  async function removeRecord(record) {
    deletingId.value = record.id
    loadError.value = ''

    try {
      await deleteAttendanceRecord(record.id)
      records.value = records.value.filter((item) => item.id !== record.id)
      return true
    } catch (error) {
      loadError.value = getApiMessage(error, 'Unable to delete the attendance record.')
      return false
    } finally {
      deletingId.value = null
    }
  }

  function clearValidationErrors() {
    validationErrors.value = {}
  }

  return {
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
  }
}

function getApiMessage(error, fallback) {
  return error.response?.data?.message ?? fallback
}
