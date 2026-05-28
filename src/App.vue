<script setup>
  import Header from './components/Header.vue';
  import Footer from './components/Footer.vue';
  import { ref, onMounted, computed } from 'vue';
  import api from './api';
  
  const submitting = ref(false);
  const form = ref({
    employee_name: '', 
    date: '', 
    check_in_time: '', 
    check_out_time: ''
  });
  const editingId = ref(null);
  const deletingId = ref(null);
  const errors = ref({});
  const isLoading = ref(true);
  const records = ref(null);
  const query = ref('');
  const filteredRecords = computed(() => {
    if(query.value.trim() === '') {
      return records.value;
    } else {
      return records.value.filter(record => 
        record.employee_name.toLowerCase().includes(query.value.toLowerCase())
      );
    }
  });
  const ascending = ref(true);
  const confirmDelete = ref(false);

  // This thing is like useEffect in React, it runs after the component is mounted
  onMounted(async () => {
      try {
          // make a GET request to the backend API to fetch attendance records
          const response = await api.get('/attendance/');
          records.value = response.data;
      } catch (error) {
          console.error('Error fetching attendance records:', error);
      } finally {
          isLoading.value = false;
      }
  });

  // helper function to format form data before sending to backend
  const formatData = (data) => {
    return {
      employee_name: data.employee_name,
      date: data.date,
      check_in_time: `${data.check_in_time}:00`,
      check_out_time: data.check_out_time ? `${data.check_out_time}:00` : null,
    };
  }

  // logic to handle submitting the form for both adding and editing records
  const handleSubmit = async () => {
    // Reset error
    submitting.value = true;
    errors.value = {};

    try {
      // format form data to match backend expectations
      const formattedData = formatData(form.value);
      let response = null;
      
      if(editingId.value) {
        response = await api.put(`/attendance/${editingId.value}/`, JSON.stringify(formattedData));
        records.value.splice(
          records.value.findIndex(record => record.id === editingId.value), 
          1, 
          {...formattedData, id: editingId.value}
        );
        editingId.value = null;
        window.location.href = '';
      }
      else {
        response = await api.post('/attendance', JSON.stringify(formattedData));
        records.value.push(response.data);
      }

      form.value={employee_name: '', date: '', check_in_time: '', check_out_time: ''};
    }
    catch (error) {
      console.error('Error adding record:', error);
      // store error message to display to user
      errors.value = error.response.data.errors;
    }
    finally {
      submitting.value = false;
    }
  }

  // helper function to handle filling in the correct editingId and populating the form
  const handleEdit = (record) => {
    window.location.href = '#form';
    editingId.value = record.id;
    form.value = {
      employee_name: record.employee_name,
      date: record.date,
      check_in_time: record.check_in_time?.slice(0, 5), // remove seconds
      check_out_time: record.check_out_time?.slice(0, 5) // remove seconds
    };
  }

  const handleConfirmDelete = (confirmation, record) => {
    if(record) {
      confirmDelete.value = confirmation;
      deletingId.value = record.id;
    }
  }

  // logic to handle deleting a record
  const handleDelete = async (recordId) => {
    try {
      await api.delete(`/attendance/${recordId}/`);
      records.value = records.value.filter(r => r.id !== recordId);
    } catch (error) {
      console.error('Error deleting record:', error);
      window.alert('Failed to delete record. Please try again.');
    }
    finally {
      confirmDelete.value = false;
    }
  }

  // helper function to reset form and editingId when canceling an edit
  const handleCancel = () => {
    editingId.value = null;
    form.value = {employee_name: '', date: '', check_in_time: '', check_out_time: ''};
    errors.value = {};
  }

  // helper function to sort records by date, toggling between ascending and descending order
  const handleSort = () => {
    records.value.sort((a, b) => {
      const dateA = a.date.toLowerCase();
      const dateB = b.date.toLowerCase();
      if(ascending.value) {
        return dateB.localeCompare(dateA);
      }
      else {
        return dateA.localeCompare(dateB);
      }
    })
    ascending.value = !ascending.value;
  }

  // helper function to calculate duration between check-in and check-out times
  const calculateDuration = (checkIn, checkOut) => {
    if(!checkOut) return 'N/A';
    const checkInHour = parseInt(checkIn.slice(0, 2));
    const checkOutHour = parseInt(checkOut.slice(0, 2));
    return `${checkOutHour - checkInHour}`;
  }
</script>

<template>
  <Header />
  <div class="h-screen max-h-screen overflow-y-scroll">
    <!-- Search bar -->
    <input type="text" placeholder="Search..." class="bg-white rounded-lg shadow-md p-2 m-2 w-1/3" v-model="query"/>

    <!-- Employee table -->
    <table id="employeeTable" class="bg-white rounded-lg shadow-md w-full">
        <thead>
            <tr class="text-left text-sm font-semibold">
                <th class="px-4 py-3">ID</th>
                <th class="px-4 py-3">Employee</th>
                <th class="px-4 py-3 cursor-pointer" @click="handleSort">Date {{ ascending ? '🔼' : '🔽' }}</th>
                <th class="px-4 py-3">Check-in-time</th>
                <th class="px-4 py-3">Check-out-time</th>
                <th class="px-4 py-3">Duration</th>
                <th class="px-4 py-3">Action</th>
            </tr>
        </thead>

        <tbody>
            <tr v-if="isLoading" class="animate-pulse">
                <td class="size-10 rounded-lg bg-gray-200" colspan="7"></td>
            </tr>

            <tr v-else-if="filteredRecords.length === 0">
                <td colspan="7" class="text-center">No attendance records found.</td>
            </tr>

            <tr v-else v-for="record in filteredRecords" :key="record.id" class="divide-y divide-slate-100">
                <!-- similar to how handlebars inject context into html -->
                <td class="px-4 py-3">{{ record.id }}</td>
                <td class="px-4 py-3">{{ record.employee_name }}</td>
                <td class="px-4 py-3">{{ record.date }}</td>
                <td class="px-4 py-3">{{ record.check_in_time }}</td>
                <td class="px-4 py-3">{{ record.check_out_time }}</td>
                <td class="px-4 py-3">{{ calculateDuration(record.check_in_time, record.check_out_time) }}</td>
                <td class="px-4 py-3 space-x-2">
                  <button type="button" class="cursor-pointer" @click="handleEdit(record)">Edit</button>
                  <button type="button" class="cursor-pointer" @click="handleConfirmDelete(true, record)">Delete</button>
                </td>
                <!-- Delete confirmation modal -->
                <div v-if="confirmDelete" class="fixed w-full h-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800/30 flex items-center justify-center"
                  @click="handleConfirmDelete(false)"
                >
                  <div class="bg-white rounded-lg shadow-md bg-opacity-30 flex flex-col items-center justify-center p-5">
                    <p class="font-semibold text-center">Are you sure you want to delete this record?</p>
                    <button type="button" class="cursor-pointer text-center" @click="handleDelete(deletingId)">Confirm</button>
                    <button type="button" class="cursor-pointer text-center" @click="handleConfirmDelete(false)">Cancel</button>
                  </div>
                </div>
            </tr>
        </tbody>
    </table>

    <!-- Add and edit record form -->
    <form id="form" class="bg-white rounded-lg shadow-md mx-auto max-w-2xl flex flex-col gap-4 p-6 m-6">
      <h2 class="text-sm font-semibold text-center">{{ editingId ? 'Edit Record' : 'Add Record' }}</h2>

      <input type="text" placeholder="Enter employee name... " v-model="form.employee_name"/>
      <p v-if="errors.employee_name" class="text-red-600 text-sm">{{ errors.employee_name[0] }}</p>

      <input type="date" v-model="form.date" />
      <p v-if="errors.date" class="text-red-600 text-sm">{{ errors.date[0] }}</p>

      <input type="time" v-model="form.check_in_time" />
      <p v-if="errors.check_in_time" class="text-red-600 text-sm">{{ errors.check_in_time[0] }}</p>

      <input type="time" v-model="form.check_out_time" />
      <p v-if="errors.check_out_time" class="text-red-600 text-sm">{{ errors.check_out_time[0] }}</p>

      <button v-if="editingId" @click="handleCancel" type="button" class="cursor-pointer">Cancel</button>
      <button @click="handleSubmit" type="button" class="cursor-pointer">{{ submitting ? 'Submitting...' : 'Submit' }}</button>
    </form>
  </div>
  <Footer />
</template>
