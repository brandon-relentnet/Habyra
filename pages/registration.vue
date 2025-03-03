<script setup lang="ts">
const { loggedIn, fetch: refreshSession } = useUserSession();
const router = useRouter();

// Redirect if already logged in
if (loggedIn.value) {
  router.push("/dashboard");
}

const formData = reactive({
  name: "",
  email: "",
  password: "",
  passwordConfirm: "",
});

const formErrors = reactive({
  name: "",
  email: "",
  password: "",
  passwordConfirm: "",
  general: "",
});

const isSubmitting = ref(false);

async function register() {
  // Reset errors
  Object.keys(formErrors).forEach((key) => {
    formErrors[key as keyof typeof formErrors] = "";
  });

  // Basic validation
  let hasErrors = false;

  if (!formData.name) {
    formErrors.name = "Name is required";
    hasErrors = true;
  }

  if (!formData.email) {
    formErrors.email = "Email is required";
    hasErrors = true;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    formErrors.email = "Please enter a valid email";
    hasErrors = true;
  }

  if (!formData.password) {
    formErrors.password = "Password is required";
    hasErrors = true;
  } else if (formData.password.length < 8) {
    formErrors.password = "Password must be at least 8 characters";
    hasErrors = true;
  }

  if (formData.password !== formData.passwordConfirm) {
    formErrors.passwordConfirm = "Passwords do not match";
    hasErrors = true;
  }

  if (hasErrors) return;

  isSubmitting.value = true;

  try {
    await $fetch("/api/register", {
      method: "POST",
      body: formData,
    });

    // Refresh the session and redirect to dashboard
    await refreshSession();
    await navigateTo("/dashboard");
  } catch (error: any) {
    // Handle API errors
    if (error.data?.statusCode === 409) {
      formErrors.email = "Email already exists";
    } else if (error.data?.data) {
      // Handle validation errors from Zod
      const zodErrors = error.data.data;
      zodErrors.forEach((err: any) => {
        const path = err.path[0];
        formErrors[path as keyof typeof formErrors] = err.message;
      });
    } else {
      formErrors.general =
        error.data?.message || "An error occurred during registration";
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <section class="container mx-auto p-4 text-text min-h-screen pt-40">
    <h1 class="text-2xl font-bold mb-4">Create an Account</h1>
    <p class="text-subtle italic font-serif mb-6">
      Sign up to start your health journey with us
    </p>

    <div
      v-if="formErrors.general"
      class="bg-love/10 text-love p-4 rounded-xl mb-4"
    >
      {{ formErrors.general }}
    </div>

    <form @submit.prevent="register" class="flex flex-col gap-4 max-w-sm">
      <div>
        <input
          v-model="formData.name"
          type="text"
          placeholder="Full Name"
          class="bg-surface ring p-2 ring-foam/10 border-3 border-transparent focus:border-foam/60 transition duration-200 outline-none rounded-xl placeholder-subtle placeholder:italic w-full"
          :class="{ 'border-love/60': formErrors.name }"
        />
        <p v-if="formErrors.name" class="text-love text-sm mt-1">
          {{ formErrors.name }}
        </p>
      </div>

      <div>
        <input
          v-model="formData.email"
          type="email"
          placeholder="Email"
          class="bg-surface ring p-2 ring-foam/10 border-3 border-transparent focus:border-foam/60 transition duration-200 outline-none rounded-xl placeholder-subtle placeholder:italic w-full"
          :class="{ 'border-love/60': formErrors.email }"
        />
        <p v-if="formErrors.email" class="text-love text-sm mt-1">
          {{ formErrors.email }}
        </p>
      </div>

      <div>
        <input
          v-model="formData.password"
          type="password"
          placeholder="Password (min 8 characters)"
          class="bg-surface ring p-2 ring-foam/10 border-3 border-transparent focus:border-foam/60 transition duration-200 outline-none rounded-xl placeholder-subtle placeholder:italic w-full"
          :class="{ 'border-love/60': formErrors.password }"
        />
        <p v-if="formErrors.password" class="text-love text-sm mt-1">
          {{ formErrors.password }}
        </p>
      </div>

      <div>
        <input
          v-model="formData.passwordConfirm"
          type="password"
          placeholder="Confirm Password"
          class="bg-surface ring p-2 ring-foam/10 border-3 border-transparent focus:border-foam/60 transition duration-200 outline-none rounded-xl placeholder-subtle placeholder:italic w-full"
          :class="{ 'border-love/60': formErrors.passwordConfirm }"
        />
        <p v-if="formErrors.passwordConfirm" class="text-love text-sm mt-1">
          {{ formErrors.passwordConfirm }}
        </p>
      </div>

      <button
        class="p-2 bg-surface hover:bg-overlay cursor-pointer rounded-xl flex justify-center items-center"
        type="submit"
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting">Creating account...</span>
        <span v-else>Create Account</span>
      </button>

      <div class="text-center mt-4">
        <p class="text-subtle">
          Already have an account?
          <NuxtLink to="/login" class="text-foam hover:underline"
            >Login</NuxtLink
          >
        </p>
      </div>
    </form>
  </section>
</template>
