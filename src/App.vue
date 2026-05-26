<script setup lang="ts">
  import EmployeeTable from './components/EmployeeTable.vue';
  import Header from './components/Header.vue';
  import Footer from './components/Footer.vue';
</script>

<template>
  <Header />
  <div class="h-screen max-h-screen overflow-y-scroll">
    <EmployeeTable />
  </div>
  <Footer />
</template>
