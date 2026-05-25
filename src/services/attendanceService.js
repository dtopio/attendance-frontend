import api from './api.js'

const ATTENDANCE_ENDPOINT = '/attendance'

export async function fetchAttendanceRecords() {
  const { data } = await api.get(ATTENDANCE_ENDPOINT)
  return normalizeRecords(data)
}

export async function createAttendanceRecord(payload) {
  const { data } = await api.post(ATTENDANCE_ENDPOINT, payload)
  return data
}

export async function updateAttendanceRecord(id, payload) {
  const { data } = await api.put(`${ATTENDANCE_ENDPOINT}/${id}`, payload)
  return data
}

export async function deleteAttendanceRecord(id) {
  await api.delete(`${ATTENDANCE_ENDPOINT}/${id}`)
}

function normalizeRecords(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}
