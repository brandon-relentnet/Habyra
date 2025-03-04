<script setup>
import { usePomodoroStore } from "~/stores/pomodoroStore";
import { storeToRefs } from "pinia";

const pomodoroStore = usePomodoroStore();
const { timerState, formattedTime, progress } = storeToRefs(pomodoroStore);
</script>

<template>
  <div class="w-64 h-64 mx-auto relative">
    <!-- Progress Circle -->
    <svg class="w-full h-full" viewBox="0 0 100 100">
      <!-- Background Circle -->
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="#2a2e36"
        stroke-width="8"
      />
      <!-- Progress Circle -->
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        :stroke="timerState === 'break' ? '#9ccfd8' : '#eb6f92'"
        stroke-width="8"
        stroke-linecap="round"
        :stroke-dasharray="`${progress * 2.83}, 283`"
        transform="rotate(-90 50 50)"
      />
    </svg>

    <!-- Time Display -->
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span class="text-5xl font-bold tracking-widest">{{
        formattedTime
      }}</span>
      <span class="text-lg text-subtle mt-2 capitalize">
        {{ timerState === "idle" ? "Ready" : timerState }}
      </span>
    </div>
  </div>
</template>
