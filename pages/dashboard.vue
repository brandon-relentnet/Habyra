<script setup>
definePageMeta({
  middleware: ["authenticated"],
});

const { user, clear: clearSession } = useUserSession();

async function logout() {
  await clearSession();
  await navigateTo("/registration");
}
</script>

<template>
  <div class="min-h-screen bg-base text-text pb-16">
    <header class="bg-surface p-6">
      <div class="container mx-auto">
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p class="text-subtle italic font-serif">Welcome to your dashboard</p>
      </div>
    </header>
    <h1>Welcome {{ user.name }}</h1>
    <button @click="logout">Logout</button>
  </div>
</template>
