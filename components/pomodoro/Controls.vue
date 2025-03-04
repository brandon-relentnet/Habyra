<script setup>
import { usePomodoroStore } from "~/stores/pomodoroStore";
import { storeToRefs } from "pinia";
import { computed } from "vue";

// Import Heroicons
import {
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ForwardIcon,
} from "@heroicons/vue/24/solid";

const pomodoroStore = usePomodoroStore();
const { timerState, previousState } = storeToRefs(pomodoroStore);

// Computed property to determine if we're in break mode (either active or paused)
const isBreakMode = computed(() => {
  return (
    timerState.value === "break" ||
    (timerState.value === "paused" && previousState.value === "break")
  );
});

// Computed property to determine if we're in work mode (either active or paused)
const isWorkMode = computed(() => {
  return (
    timerState.value === "running" ||
    (timerState.value === "paused" && previousState.value === "running")
  );
});

// Timer control functions
const startTimer = () => pomodoroStore.startTimer();
const pauseTimer = () => pomodoroStore.pauseTimer();
const resetTimer = () => pomodoroStore.resetTimer();
const skipToBreak = () => pomodoroStore.skipToBreak();
const skipBreak = () => pomodoroStore.skipBreak();
</script>

<template>
  <div class="flex flex-wrap justify-center gap-4">
    <button
      v-if="timerState === 'idle' || timerState === 'paused'"
      @click="startTimer"
      class="px-6 py-3 bg-overlay hover:bg-overlay/80 rounded-xl font-medium flex items-center gap-2"
    >
      <PlayIcon class="w-5 h-5" />
      {{ timerState === "paused" ? "Resume" : "Start" }}
    </button>

    <button
      v-if="timerState === 'running' || timerState === 'break'"
      @click="pauseTimer"
      class="px-6 py-3 bg-overlay hover:bg-overlay/80 rounded-xl font-medium flex items-center gap-2"
    >
      <PauseIcon class="w-5 h-5" />
      Pause
    </button>

    <button
      v-if="isWorkMode"
      @click="resetTimer"
      class="px-6 py-3 bg-overlay hover:bg-overlay/80 rounded-xl font-medium flex items-center gap-2"
    >
      <ArrowPathIcon class="w-5 h-5" />
      Reset
    </button>

    <button
      v-if="timerState === 'running'"
      @click="skipToBreak"
      class="px-6 py-3 bg-overlay hover:bg-overlay/80 rounded-xl font-medium flex items-center gap-2"
    >
      <ForwardIcon class="w-5 h-5" />
      Skip to Break
    </button>

    <button
      v-if="isBreakMode"
      @click="skipBreak"
      class="px-6 py-3 bg-overlay hover:bg-overlay/80 rounded-xl font-medium flex items-center gap-2"
    >
      <ForwardIcon class="w-5 h-5" />
      Skip Break
    </button>
  </div>
</template>
