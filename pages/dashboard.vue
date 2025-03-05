<script setup>
const { loggedIn } = useUserSession();
</script>

<template>
  <div class="min-h-screen bg-base text-text pb-16">
      <div v-if="!loggedIn" class="p-6 text-center">
        <p class="mb-3">Please log in to view and edit your personal dashboard.</p>
        <NuxtLink
          to="/login"
          class="px-6 py-3 bg-surface hover:bg-overlay rounded-xl font-medium gap-2 cursor-pointer transition duration-200 inline-block"
        >
          Login to your account
        </NuxtLink>
      </div>
      <div v-else>
        <h2 class="text-2xl font-semibold mb-2">Dashboard</h2>

      </div>
  </div>
</template>
