<script setup>
definePageMeta({
  middleware: ["authenticated"],
});

const { user, clear: clearSession } = useUserSession();

async function logout() {
  await clearSession();
  await navigateTo("/login");
}

const accountInfo = [
  { label: "Name", value: user.value.name },
  { label: "Email", value: user.value.email },
  { label: "Phone", value: user.value.phone },
  { label: "Password", value: user.value.password },
];
</script>

<template>
  <div class="min-h-screen bg-base text-text pb-16">
    <h2 class="text-2xl font-semibold mb-2">Account Information</h2>
    <div class="divide-y divide-overlay bg-surface px-4 py-2 rounded-xl">
      <div
        v-for="(info, index) in accountInfo"
        :key="index"
        class="py-3 flex justify-between"
      >
        <span class="font-semibold">{{ info.label }}</span>
        <span class="text-subtle italic">{{ info.value }}</span>
      </div>
    </div>
    <div class="flex items-center justify-end p-4">
      <button class="colored-text cursor-pointer" @click="logout">Logout</button>
    </div>
  </div>
</template>
