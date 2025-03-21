<script setup>
import { onMounted, watch, computed } from "vue";
import { usePomodoroStore } from "~/stores/pomodoroStore";
import { storeToRefs } from "pinia";

// No authentication middleware - anyone can use the timer
// Only statistics are restricted to logged-in users

// Get user session
const { loggedIn } = useUserSession();

// Initialize pomodoro store
const pomodoroStore = usePomodoroStore();
const { timerState, formattedTime } = storeToRefs(pomodoroStore);

// Set up page title
watch([formattedTime, timerState], () => {
  if (timerState.value === "running") {
    document.title = `${formattedTime.value} - Working - Pomodoro Timer`;
  } else if (timerState.value === "break") {
    document.title = `${formattedTime.value} - Break - Pomodoro Timer`;
  } else {
    document.title = "Pomodoro Timer";
  }
});

// Initialize store on page load
onMounted(async () => {
  await pomodoroStore.initializeStore();

  // Request notification permission
  if (
    Notification &&
    Notification.permission !== "granted" &&
    Notification.permission !== "denied"
  ) {
    Notification.requestPermission();
  }
});

// Status message based on current state
const statusMessage = computed(() => {
  switch (timerState.value) {
    case "running":
      return `Focus on your work.`;
    case "break":
      return `Take a break and relax!`;
    case "paused":
      return "Timer paused. Resume when you're ready.";
    default:
      return "Ready to start a new Pomodoro session?";
  }
});
</script>

<template>
  <div class="min-h-screen bg-base text-text pb-16">
    <!-- Main Timer Section -->
    <section class="max-w-2xl mx-auto mb-10">
      <div class="p-8">
        <!-- Timer Display -->
        <div class="text-center mb-8">
          <PomodoroTimerDisplay />

          <!-- Current Status -->
          <div class="mt-4 text-subtle italic font-serif">
            <p>{{ statusMessage }}</p>
          </div>
        </div>

        <!-- Timer Controls -->
        <PomodoroControls />
      </div>
    </section>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
      <!-- Settings Section -->
      <PomodoroSettings />

      <!-- Statistics Section -->
      <PomodoroStatistics v-if="loggedIn" />
      <div v-else class="p-6">
        <h2 class="text-xl font-semibold mb-4">Statistics</h2>
        <div class="bg-overlay/30 p-6 rounded-xl text-center">
          <p class="mb-3">Please log in to track and view your statistics.</p>
          <NuxtLink
            to="/login"
            class="inline-block px-4 py-2 bg-overlay hover:bg-overlay/80 rounded-xl"
          >
            Login to your account
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
