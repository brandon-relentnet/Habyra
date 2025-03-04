<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import { usePomodoroStore } from "~/stores/pomodoroStore";
import { storeToRefs } from "pinia";
import {
  Cog6ToothIcon,
  XMarkIcon,
  AdjustmentsVerticalIcon,
} from "@heroicons/vue/24/solid";
import autoAnimate from "@formkit/auto-animate";

const pomodoroStore = usePomodoroStore();
const { settings } = storeToRefs(pomodoroStore);

// Local state for settings form
const showSettings = ref(false);
const localSettings = reactive({ ...settings.value });

// Ensure store is properly initialized
onMounted(() => {
  // Make sure we respect the persisted notification setting
  localSettings.notificationsEnabled = settings.value.notificationsEnabled;
  localSettings.notificationSound = settings.value.notificationSound;

  // Initialize the store
  pomodoroStore.initializeStore();
});

// Available notification sounds
const availableSounds = ["bell", "digital", "gentle", "chime"];

// Slider configurations for reuse
const sliderConfig = {
  workDuration: { min: 5, max: 60, step: 5, label: "Work Duration (minutes)" },
  shortBreakDuration: {
    min: 1,
    max: 15,
    step: 1,
    label: "Short Break (minutes)",
  },
  longBreakDuration: {
    min: 5,
    max: 30,
    step: 5,
    label: "Long Break (minutes)",
  },
  sessionsBeforeLongBreak: {
    min: 2,
    max: 8,
    step: 1,
    label: "Sessions until Long Break",
  },
};

// Default settings
const defaultSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  notificationsEnabled: true,
  notificationSound: "bell",
  focusModeEnabled: false,
};

// Watch for store changes to update local state
watch(
  () => settings.value,
  (newSettings) => {
    // Explicitly update each property to ensure reactivity
    Object.keys(newSettings).forEach((key) => {
      localSettings[key] = newSettings[key];
    });
  },
  { deep: true, immediate: true }
);

// Save notification sound directly
const saveNotificationSound = () => {
  pomodoroStore.setNotificationSound(localSettings.notificationSound);
};

// Apply settings changes
const applySettings = () => {
  // We need to explicitly assign each property to maintain reactivity and persistence
  settings.value = {
    workDuration: localSettings.workDuration,
    shortBreakDuration: localSettings.shortBreakDuration,
    longBreakDuration: localSettings.longBreakDuration,
    sessionsBeforeLongBreak: localSettings.sessionsBeforeLongBreak,
    notificationsEnabled: localSettings.notificationsEnabled,
    notificationSound: localSettings.notificationSound,
    focusModeEnabled: localSettings.focusModeEnabled,
  };

  // Apply settings in store and force persistence
  pomodoroStore.applySettings();

  showSettings.value = false;
};

// Apply default settings
const applyDefaultSettings = () => {
  Object.assign(localSettings, defaultSettings);
  applySettings();
};

// Toggle focus mode
const toggleFocusMode = () => {
  localSettings.focusModeEnabled = !localSettings.focusModeEnabled;
  settings.value.focusModeEnabled = localSettings.focusModeEnabled;
  pomodoroStore.applySettings(); // Make sure to persist the change
};

// Save notification setting directly to ensure it persists
const saveNotificationSetting = () => {
  settings.value.notificationsEnabled = localSettings.notificationsEnabled;
  pomodoroStore.applySettings(); // Force persistence update
};
</script>

<template>
  <section class="p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-semibold">Settings</h2>
      <div class="flex items-center gap-2">
        <button
          @click="applyDefaultSettings"
          class="flex items-center gap-1 text-subtle hover:text-text p-1 rounded cursor-pointer"
        >
          <AdjustmentsVerticalIcon class="size-4" />
          <span class="text-xs font-serif italic">Defaults</span>
        </button>
        <button
          @click="showSettings = !showSettings"
          class="hover:bg-surface p-2 rounded-xl cursor-pointer transition duration-200"
        >
          <Cog6ToothIcon v-if="!showSettings" class="size-5" />
          <XMarkIcon v-else class="size-5" />
        </button>
      </div>
    </div>

    <div v-auto-animate>
      <!-- Settings summary view -->
      <div
        v-if="!showSettings"
        class="divide-y divide-overlay bg-surface px-4 py-2 rounded-xl"
      >
        <div
          v-for="(config, key) in sliderConfig"
          :key="key"
          class="py-3 flex justify-between"
        >
          <span class="font-semibold">{{ config.label.split(" (")[0] }}</span>
          <span class="text-subtle italic"
            >{{ localSettings[key] }} minutes</span
          >
        </div>
      </div>

      <!-- Settings edit view -->
      <div v-else class="space-y-4 bg-surface p-4 rounded-xl">
        <!-- Generate sliders from config -->
        <div v-for="(config, key) in sliderConfig" :key="key">
          <label class="block mb-2 text-text">{{ config.label }}</label>
          <input
            v-model.number="localSettings[key]"
            type="range"
            :min="config.min"
            :max="config.max"
            :step="config.step"
            class="w-full appearance-none bg-highlight-med accent-love rounded-xl h-2 cursor-pointer"
          />
          <div
            class="flex justify-between text-sm text-subtle font-serif italic"
          >
            <span>{{ config.min }}</span>
            <span class="font-bold not-italic">{{ localSettings[key] }}</span>
            <span>{{ config.max }}</span>
          </div>
        </div>

        <div class="pt-4">
          <button
            @click="applySettings"
            class="w-full py-2 bg-base hover:bg-overlay rounded-xl font-medium font-sans cursor-pointer transition duration-200"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>

    <!-- Focus Mode -->
    <div class="mt-8">
      <h2 class="text-xl font-semibold mb-4">Focus Mode</h2>

      <div class="bg-surface p-4 rounded-xl">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-medium">Focus Mode</h3>
            <p class="text-sm text-subtle font-serif italic">
              Eliminates distractions during sessions
            </p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="localSettings.focusModeEnabled"
              class="sr-only peer"
              @change="toggleFocusMode"
            />
            <div
              class="w-11 h-6 bg-overlay peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foam"
            ></div>
          </label>
        </div>

        <div class="space-y-3 mt-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium">Notifications</h3>
              <p class="text-sm text-subtle font-serif italic">
                Alert when sessions end
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="localSettings.notificationsEnabled"
                class="sr-only peer"
                @change="saveNotificationSetting"
              />
              <div
                class="w-11 h-6 bg-overlay peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foam"
              ></div>
            </label>
          </div>
          <div v-auto-animate>
            <div
              v-if="localSettings.notificationsEnabled"
              key="with-notifications"
              class="space-y-3"
            >
              <h3 class="font-medium mb-2">Notification Sound</h3>
              <select
                v-model="localSettings.notificationSound"
                class="bg-surface ring p-2 ring-foam/10 border-3 border-transparent focus:border-foam/60 transition duration-200 outline-none rounded-xl w-full"
                @change="saveNotificationSound"
              >
                <option
                  v-for="sound in availableSounds"
                  :key="sound"
                  :value="sound"
                  :selected="sound === localSettings.notificationSound"
                >
                  {{ sound.charAt(0).toUpperCase() + sound.slice(1) }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
