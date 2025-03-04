<script setup>
import { usePomodoroStore } from "~/stores/pomodoroStore";
import { storeToRefs } from "pinia";
import { computed } from "vue";

const pomodoroStore = usePomodoroStore();
const { 
  timerState, 
  timeRemaining, 
  initialTime, 
  breakTime, 
  longBreakTime 
} = storeToRefs(pomodoroStore);

// Calculated progress for debugging
const calculatedProgress = computed(() => {
  // For work sessions
  if (timerState.value !== "break") {
    return ((initialTime.value - timeRemaining.value) / initialTime.value * 100).toFixed(2);
  } 
  // For break sessions
  else {
    const isLongBreak = pomodoroStore.statistics.completedSessions % 
      pomodoroStore.settings.sessionsBeforeLongBreak === 0;
    const maxTime = isLongBreak ? longBreakTime.value : breakTime.value;
    return ((maxTime - timeRemaining.value) / maxTime * 100).toFixed(2);
  }
});
</script>

<template>
  <div class="p-4 bg-overlay/30 rounded-xl shadow-md my-4">
    <h2 class="text-xl font-semibold mb-4">Debug Information</h2>
    <div class="grid grid-cols-2 gap-2">
      <div class="font-medium">Timer State:</div>
      <div>{{ timerState }}</div>
      
      <div class="font-medium">Time Remaining:</div>
      <div>
        {{ timeRemaining }}s 
        ({{ Math.floor(timeRemaining/60) }}:{{ (timeRemaining%60).toString().padStart(2,'0') }})
      </div>
      
      <div class="font-medium">Initial Time:</div>
      <div>{{ initialTime }}s ({{ Math.floor(initialTime/60) }} min)</div>
      
      <div class="font-medium">Break Time:</div>
      <div>{{ breakTime }}s ({{ Math.floor(breakTime/60) }} min)</div>
      
      <div class="font-medium">Long Break Time:</div>
      <div>{{ longBreakTime }}s ({{ Math.floor(longBreakTime/60) }} min)</div>
      
      <div class="font-medium">Calculated Progress:</div>
      <div>{{ calculatedProgress }}%</div>
    </div>
  </div>
</template>