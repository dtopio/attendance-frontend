<script setup lang="ts">
import {ref, onMounted} from 'vue';
import api from '../api';

const isLoading = ref(true);
const records = ref(null);

onMounted(async () => {
    try {
        const response = await api.get('/attendance/');
        records.value = response.data;
    } catch (error) {
        console.error('Error fetching attendance records:', error);
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
    <table id="employeeTable" class="bg-white rounded-lg shadow-md w-full">
        <thead>
            <tr class="text-left text-sm font-semibold">
                <th class="px-4 py-3">ID</th>
                <th class="px-4 py-3">Employee</th>
                <th class="px-4 py-3">Date</th>
                <th class="px-4 py-3">Check-in-time</th>
                <th class="px-4 py-3">Check-out-time</th>
                <th class="px-4 py-3">Action</th>
            </tr>
        </thead>

        <tbody>
            <tr v-if="isLoading">
                <td colspan="6" class="text-center">Loading...</td>
            </tr>

            <tr v-else-if="records === null">
                <td colspan="6" class="text-center">No attendance records found.</td>
            </tr>

            <tr v-else v-for="record in records" :key="record.id" class="divide-y divide-slate-100">
                <!-- similar to how handlebars inject context into html -->
                <td class="px-4 py-3">{{ record.id }}</td>
                <td class="px-4 py-3">{{ record.name }}</td>
                <td class="px-4 py-3">{{ record.date }}</td>
                <td class="px-4 py-3">{{ record.check_in_time }}</td>
                <td class="px-4 py-3">{{ record.check_out_time }}</td>
                <td class="px-4 py-3 space-x-2">
                    <button type="button" class="cursor-pointer">Edit</button>
                    <button type="button" class="cursor-pointer">Delete</button>
                </td>
            </tr>
        </tbody>
    </table>
</template>