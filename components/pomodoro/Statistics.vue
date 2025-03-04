<script setup>
import { usePomodoroStore } from "~/stores/pomodoroStore";
import { storeToRefs } from "pinia";
import {
  ClockIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowPathIcon,
} from "@heroicons/vue/24/solid";
import { onMounted } from "vue";

const pomodoroStore = usePomodoroStore();
const { statistics, isSyncing, lastSyncTime, isSyncedWithServer } =
  storeToRefs(pomodoroStore);

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Format time for display
const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Sync with server
const syncWithServer = async () => {
  try {
    await pomodoroStore.syncWithServer();
  } catch (error) {
    console.error("Error syncing with server:", error);
    // You might want to show a notification to the user
  }
};

// Fetch data when component is mounted
onMounted(async () => {
  try {
    await pomodoroStore.fetchFromServer();
  } catch (error) {
    console.error("Error fetching data:", error);
    // You might want to show a notification to the user
  }
});
</script>

<template>
  <section class="bg-surface rounded-2xl p-6 shadow-md">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold">Your Statistics</h2>
      <button
        @click="syncWithServer"
        class="flex items-center gap-1 text-subtle hover:text-text p-1 rounded"
        :disabled="isSyncing"
      >
        <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': isSyncing }" />
        <span class="text-xs">{{ isSyncing ? "Syncing..." : "Sync" }}</span>
      </button>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-overlay/30 p-4 rounded-xl">
        <div class="flex items-start gap-2">
          <CalendarIcon class="w-5 h-5 text-foam mt-1" />
          <div>
            <h3 class="text-subtle text-sm">Today</h3>
            <p class="text-2xl font-bold">{{ statistics.completedToday }}</p>
            <p class="text-sm text-subtle">sessions</p>
          </div>
        </div>
      </div>

      <div class="bg-overlay/30 p-4 rounded-xl">
        <div class="flex items-start gap-2">
          <CalendarIcon class="w-5 h-5 text-foam mt-1" />
          <div>
            <h3 class="text-subtle text-sm">This Week</h3>
            <p class="text-2xl font-bold">{{ statistics.completedThisWeek }}</p>
            <p class="text-sm text-subtle">sessions</p>
          </div>
        </div>
      </div>

      <div class="bg-overlay/30 p-4 rounded-xl">
        <div class="flex items-start gap-2">
          <ChartBarIcon class="w-5 h-5 text-foam mt-1" />
          <div>
            <h3 class="text-subtle text-sm">All Time</h3>
            <p class="text-2xl font-bold">{{ statistics.completedSessions }}</p>
            <p class="text-sm text-subtle">sessions</p>
          </div>
        </div>
      </div>

      <div class="bg-overlay/30 p-4 rounded-xl">
        <div class="flex items-start gap-2">
          <ClockIcon class="w-5 h-5 text-foam mt-1" />
          <div>
            <h3 class="text-subtle text-sm">Total Focus Time</h3>
            <p class="text-2xl font-bold">
              {{ Math.floor(statistics.totalFocusTime / 3600) }}
            </p>
            <p class="text-sm text-subtle">hours</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Session History -->
    <div v-if="statistics.sessionsHistory.length > 0">
      <h3 class="font-medium mb-3">Recent Sessions</h3>
      <div class="bg-overlay/30 p-4 rounded-xl max-h-56 overflow-y-auto">
        <div
          v-for="(session, index) in statistics.sessionsHistory
            .slice()
            .reverse()
            .slice(0, 10)"
          :key="index"
          class="py-2 border-b border-overlay last:border-b-0"
        >
          <div class="flex justify-between text-sm">
            <span
              >{{ formatDate(session.date) }} -
              {{ Math.floor(session.duration / 60) }} min</span
            >
            <span class="text-subtle">
              {{ formatTime(session.date) }}
              <span v-if="!session.synced" class="ml-1 text-yellow-500">⚠</span>
            </span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8 text-subtle">
      <p>No sessions recorded yet.</p>
      <p class="text-sm">Complete your first pomodoro to see statistics.</p>
    </div>

    <div v-if="lastSyncTime" class="mt-4 text-xs text-subtle text-right">
      Last synced: {{ new Date(lastSyncTime).toLocaleString() }}
    </div>
  </section>
</template>
