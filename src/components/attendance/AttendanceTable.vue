<script setup>
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

defineProps({
  records: {
    type: Array,
    required: true,
  },
  deletingId: {
    type: [Number, String, null],
    default: null,
  },
})

const emit = defineEmits(['edit', 'delete'])

function formatTime(value) {
  return value ? String(value).slice(0, 5) : '—'
}
</script>

<template>
  <div class="overflow-hidden rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Check-in</TableHead>
          <TableHead>Check-out</TableHead>
          <TableHead class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="record in records" :key="record.id">
          <TableCell class="font-medium">{{ record.employee_name }}</TableCell>
          <TableCell class="text-muted-foreground">{{ record.date }}</TableCell>
          <TableCell class="text-muted-foreground">{{ formatTime(record.check_in_time) }}</TableCell>
          <TableCell class="text-muted-foreground">{{ formatTime(record.check_out_time) }}</TableCell>
          <TableCell>
            <div class="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                :disabled="deletingId === record.id"
                @click="emit('edit', record)"
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                :disabled="deletingId === record.id"
                @click="emit('delete', record)"
              >
                {{ deletingId === record.id ? 'Deleting...' : 'Delete' }}
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
