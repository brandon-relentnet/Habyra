<script setup>
import { usePomodoroStore } from "~/stores/pomodoroStore";
import { storeToRefs } from "pinia";
import { computed } from "vue";

const pomodoroStore = usePomodoroStore();
const {
  timerState,
  formattedTime,
  timeRemaining,
  initialTime,
  breakTime,
  longBreakTime,
  previousState,
} = storeToRefs(pomodoroStore);

// Determine if in break mode (either active or paused-during-break)
const isBreakMode = computed(() => {
  return (
    timerState.value === "break" ||
    (timerState.value === "paused" && previousState.value === "break")
  );
});

// Recalculate progress directly in the component
const circleProgress = computed(() => {
  // Calculate maximum time based on current state
  let maxTime;

  if (isBreakMode.value) {
    // If on a break, determine if it's a long break
    const isLongBreak =
      pomodoroStore.statistics.completedSessions %
        pomodoroStore.settings.sessionsBeforeLongBreak ===
      0;
    maxTime = isLongBreak ? longBreakTime.value : breakTime.value;
  } else {
    // For work sessions
    maxTime = initialTime.value;
  }

  // Calculate progress percentage (0 to 100)
  const percentage = ((maxTime - timeRemaining.value) / maxTime) * 100;

  // Convert percentage to stroke-dasharray value
  // Circle circumference = 2 * PI * radius = 2 * 3.14159 * 45 ≈ 283
  const circumference = 283;
  return (percentage / 100) * circumference;
});

// Determine display state text
const displayState = computed(() => {
  if (timerState.value === "idle") return "Ready";
  if (timerState.value === "paused") {
    // If paused, show what mode we're paused in
    return previousState.value === "break" ? "Break (Paused)" : "Paused";
  }
  return timerState.value;
});
</script>

<template>
  <div class="size-64 mx-auto relative">
    <!-- Progress Circle -->
    <svg class="w-full h-full" viewBox="0 0 100 100">
      <!-- Background Circle -->
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        class="stroke-highlight-med"
        stroke-width="8"
      />
      <!-- Progress Circle -->
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        :class="{ 'stroke-foam': isBreakMode, 'stroke-love': !isBreakMode }"
        stroke-width="8"
        stroke-linecap="round"
        :stroke-dasharray="`${circleProgress}, 283`"
        transform="rotate(-90 50 50)"
      />
    </svg>

    <!-- Time Display -->
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span class="text-5xl font-bold tracking-widest">{{
        formattedTime
      }}</span>
      <span class="text-lg text-subtle mt-2 capitalize italic font-serif">
        {{ displayState }}
      </span>
    </div>
  </div>
</template>
