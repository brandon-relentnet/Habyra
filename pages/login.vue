<script setup lang="ts">
const { loggedIn, user, fetch: refreshSession } = useUserSession();
const credentials = reactive({
  email: "",
  password: "",
});
async function login() {
  $fetch("/api/login", {
    method: "POST",
    body: credentials,
  })
    .then(async () => {
      // Refresh the session on client-side and redirect to the home page
      await refreshSession();
      await navigateTo("/");
    })
    .catch(() => alert("Bad credentials"));
}
</script>

<template>
  <section class="container mx-auto p-4 text-text min-h-screen pt-40">
    <h1 class="text-2xl font-bold mb-4">Login</h1>
    <p class="text-subtle italic font-serif mb-6">
      Enter your email and password to login
    </p>
    <form @submit.prevent="login" class="flex flex-col gap-4 max-w-sm">
      <input
        v-model="credentials.email"
        type="email"
        placeholder="Email"
        class="bg-surface ring p-2 ring-foam/10 border-3 border-transparent focus:border-foam/60 transition duration-200 outline-none rounded-xl placeholder-subtle placeholder:italic"
      />
      <input
        v-model="credentials.password"
        type="password"
        placeholder="Password"
        class="bg-surface ring p-2 ring-foam/10 border-3 border-transparent focus:border-foam/60 transition duration-200 outline-none rounded-xl placeholder-subtle placeholder:italic"
      />

      <button
        class="p-2 bg-surface hover:bg-overlay cursor-pointer rounded-xl"
        type="submit"
      >
        Login
      </button>
    </form>
  </section>
</template>
