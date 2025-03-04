<script setup>
import { ref, watch } from 'vue';
import { usePomodoroStore } from '~/stores/pomodoroStore';
import { storeToRefs } from 'pinia';
import { 
  Cog6ToothIcon, 
  XMarkIcon 
} from '@heroicons/vue/24/solid';

const pomodoroStore = usePomodoroStore();
const { settings } = storeToRefs(pomodoroStore);

// Local state for settings form
const showSettings = ref(false);
const workDuration = ref(settings.value.workDuration);
const shortBreakDuration = ref(settings.value.shortBreakDuration);
const longBreakDuration = ref(settings.value.longBreakDuration);
const sessionsBeforeLongBreak = ref(settings.value.sessionsBeforeLongBreak);
const notificationsEnabled = ref(settings.value.notificationsEnabled);
const notificationSound = ref(settings.value.notificationSound);
const focusModeEnabled = ref(settings.value.focusModeEnabled);

// Available notification sounds
const availableSounds = ['bell', 'digital', 'gentle', 'chime'];

// Watch for store changes to update local state
watch(() => settings.value, (newSettings) => {
  workDuration.value = newSettings.workDuration;
  shortBreakDuration.value = newSettings.shortBreakDuration;
  longBreakDuration.value = newSettings.longBreakDuration;
  sessionsBeforeLongBreak.value = newSettings.sessionsBeforeLongBreak;
  notificationsEnabled.value = newSettings.notificationsEnabled;
  notificationSound.value = newSettings.notificationSound;
  focusModeEnabled.value = newSettings.focusModeEnabled;
}, { deep: true });

// Apply settings changes
const applySettings = () => {
  // Update store settings
  settings.value = {
    workDuration: workDuration.value,
    shortBreakDuration: shortBreakDuration.value,
    longBreakDuration: longBreakDuration.value,
    sessionsBeforeLongBreak: sessionsBeforeLongBreak.value,
    notificationsEnabled: notificationsEnabled.value,
    notificationSound: notificationSound.value,
    focusModeEnabled: focusModeEnabled.value
  };
  
  // Apply settings in store (no server save needed)
  pomodoroStore.applySettings();
  
  // Close settings panel
  showSettings.value = false;
};

// Toggle focus mode
const toggleFocusMode = () => {
  focusModeEnabled.value = !focusModeEnabled.value;
  settings.value.focusModeEnabled = focusModeEnabled.value;
  // No server save needed
};
</script>

<template>
  <section class="bg-surface rounded-2xl p-6 shadow-md">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Timer Settings</h2>
      <button 
        @click="showSettings = !showSettings" 
        class="bg-overlay hover:bg-overlay/80 p-2 rounded-lg"
      >
        <Cog6ToothIcon v-if="!showSettings" class="w-5 h-5" />
        <XMarkIcon v-else class="w-5 h-5" />
      </button>
    </div>

    <div v-if="!showSettings" class="divide-y divide-overlay">
      <div class="py-3 flex justify-between">
        <span>Work Duration</span>
        <span class="font-medium">{{ workDuration }} minutes</span>
      </div>
      <div class="py-3 flex justify-between">
        <span>Short Break</span>
        <span class="font-medium">{{ shortBreakDuration }} minutes</span>
      </div>
      <div class="py-3 flex justify-between">
        <span>Long Break</span>
        <span class="font-medium">{{ longBreakDuration }} minutes</span>
      </div>
      <div class="py-3 flex justify-between">
        <span>Sessions until Long Break</span>
        <span class="font-medium">{{ sessionsBeforeLongBreak }}</span>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div>
        <label class="block mb-2 text-subtle">Work Duration (minutes)</label>
        <input
          v-model.number="workDuration"
          type="range"
          min="5"
          max="60"
          step="5"
          class="w-full"
        />
        <div class="flex justify-between text-xs text-subtle">
          <span>5</span>
          <span>{{ workDuration }}</span>
          <span>60</span>
        </div>
      </div>

      <div>
        <label class="block mb-2 text-subtle">Short Break (minutes)</label>
        <input
          v-model.number="shortBreakDuration"
          type="range"
          min="1"
          max="15"
          step="1"
          class="w-full"
        />
        <div class="flex justify-between text-xs text-subtle">
          <span>1</span>
          <span>{{ shortBreakDuration }}</span>
          <span>15</span>
        </div>
      </div>

      <div>
        <label class="block mb-2 text-subtle">Long Break (minutes)</label>
        <input
          v-model.number="longBreakDuration"
          type="range"
          min="5"
          max="30"
          step="5"
          class="w-full"
        />
        <div class="flex justify-between text-xs text-subtle">
          <span>5</span>
          <span>{{ longBreakDuration }}</span>
          <span>30</span>
        </div>
      </div>

      <div>
        <label class="block mb-2 text-subtle">Sessions until Long Break</label>
        <input
          v-model.number="sessionsBeforeLongBreak"
          type="range"
          min="2"
          max="8"
          step="1"
          class="w-full"
        />
        <div class="flex justify-between text-xs text-subtle">
          <span>2</span>
          <span>{{ sessionsBeforeLongBreak }}</span>
          <span>8</span>
        </div>
      </div>

      <div class="pt-4">
        <button 
          @click="applySettings" 
          class="w-full py-2 bg-overlay hover:bg-overlay/80 rounded-xl font-medium"
        >
          Apply Settings
        </button>
      </div>
    </div>

    <!-- Focus Mode -->
    <div class="mt-8">
      <h2 class="text-xl font-semibold mb-4">Focus Mode</h2>
      
      <div class="bg-overlay/30 p-4 rounded-xl">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-medium">Focus Mode</h3>
            <p class="text-sm text-subtle">Eliminates distractions during sessions</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              v-model="focusModeEnabled" 
              class="sr-only peer"
              @change="toggleFocusMode"
            />
            <div class="w-11 h-6 bg-overlay peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foam"></div>
          </label>
        </div>
        
        <div class="space-y-3 mt-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium">Notifications</h3>
              <p class="text-sm text-subtle">Alert when sessions end</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                v-model="notificationsEnabled" 
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-overlay peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foam"></div>
            </label>
          </div>
          
          <div v-if="notificationsEnabled">
            <h3 class="font-medium mb-2">Notification Sound</h3>
            <select 
              v-model="notificationSound"
              class="bg-surface ring p-2 ring-foam/10 border-3 border-transparent focus:border-foam/60 transition duration-200 outline-none rounded-xl w-full"
            >
              <option v-for="sound in availableSounds" :key="sound" :value="sound">
                {{ sound.charAt(0).toUpperCase() + sound.slice(1) }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>