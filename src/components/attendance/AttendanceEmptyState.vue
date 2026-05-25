<script setup>
import { Button } from '@/components/ui/button'

const emit = defineEmits(['create'])
</script>

<template>
  <div class="rounded-md border py-12 text-center">
    <p class="font-medium">No records yet</p>
    <p class="mt-1 text-sm text-muted-foreground">Create the first attendance entry.</p>
    <Button class="mt-4" @click="emit('create')">New Record</Button>
  </div>
</template>
