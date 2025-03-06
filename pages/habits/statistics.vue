<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useTasksStore } from "@/stores/tasks";
import { useGoalsStore } from "@/stores/goals";
import { useStatisticsStore } from "@/stores/statistics";
import { 
  ChartBarIcon, 
  CheckCircleIcon, 
  FireIcon, 
  CalendarIcon,
  ClockIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from "@heroicons/vue/24/solid";

definePageMeta({
  title: "Habit Statistics",
  description: "Track your progress and see how your habits are improving over time.",
});

const tasksStore = useTasksStore();
const goalsStore = useGoalsStore();
const statsStore = useStatisticsStore();

// Initialize stores when component mounts
onMounted(async () => {
  await tasksStore.initialize();
  await goalsStore.initialize();
  await statsStore.initialize();
});

// Statistics calculations
const tasks = computed(() => tasksStore.tasks);
const goals = computed(() => goalsStore.goals);

const totalTasks = computed(() => tasks.value.length);
const completedTasks = computed(() => tasks.value.filter(task => task.completed).length);
const pendingTasks = computed(() => tasks.value.filter(task => !task.completed).length);
const completionRate = computed(() => 
  totalTasks.value > 0 ? Math.round((completedTasks.value / totalTasks.value) * 100) : 0
);

// Goals statistics
const totalGoals = computed(() => goals.value.length);
const completedGoals = computed(() => goals.value.filter((goal: { completed: any; }) => goal.completed).length);
const pendingGoals = computed(() => goals.value.filter((goal: { completed: any; }) => !goal.completed).length);
const goalCompletionRate = computed(() => 
  totalGoals.value > 0 ? Math.round((completedGoals.value / totalGoals.value) * 100) : 0
);

// Streak information
const currentStreak = computed(() => statsStore.currentStreak);
const longestStreak = computed(() => statsStore.longestStreak);

// Weekly progress
const weeklyProgress = computed(() => statsStore.weeklyProgress);

// Week-over-week change
const weekOverWeekChange = computed(() => statsStore.weekOverWeekChange);

// Time of day statistics
const timeOfDayStats = computed(() => statsStore.timeOfDayStats);

// Most productive day
const mostProductiveDay = computed(() => statsStore.mostProductiveDay);

// Calculate max value for chart scaling
const maxCompleted = computed(() => {
  const weeklyMax = Math.max(...weeklyProgress.value.map(day => day.completed));
  const timeMax = Math.max(...timeOfDayStats.value.map(time => time.completed));
  return Math.max(weeklyMax, timeMax, 5); // At least 5 for scale
});

// Function to get bar height percentage
function getBarHeight(value: number) {
  return (value / maxCompleted.value) * 100;
}
</script>

<template>
  <div class="bg-base pb-16 min-h-screen text-text">
    <h1 class="mb-6 font-bold text-2xl">Habit Statistics</h1>

    <!-- Stats Overview Cards -->
    <div class="gap-4 grid grid-cols-1 md:grid-cols-2 mb-8">
      <!-- Tasks Card -->
      <div class="bg-surface p-6 rounded-xl">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="mb-4 font-semibold text-lg">Tasks Overview</h2>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <CheckCircleIcon class="size-5 text-foam" />
                <span>{{ completedTasks }} completed</span>
              </div>
              <div class="flex items-center gap-2">
                <ClockIcon class="size-5 text-iris" />
                <span>{{ pendingTasks }} pending</span>
              </div>
              <div class="flex items-center gap-2">
                <ChartBarIcon class="size-5 text-gold" />
                <span>{{ completionRate }}% completion rate</span>
              </div>
            </div>
          </div>
          
          <!-- Circular progress indicator -->
          <div class="relative size-20">
            <svg viewBox="0 0 36 36" class="size-20">
              <!-- Background circle -->
              <path class="stroke-surface-600" stroke-dasharray="100, 100" stroke-width="3" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <!-- Foreground circle -->
              <path 
                :class="completionRate >= 75 ? 'stroke-foam' : completionRate >= 50 ? 'stroke-iris' : completionRate >= 25 ? 'stroke-gold' : 'stroke-rose'" 
                :stroke-dasharray="`${completionRate}, 100`" 
                stroke-width="3" 
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <!-- Percentage text -->
              <text x="18" y="20.5" class="font-medium text-[10px]" text-anchor="middle">{{ completionRate }}%</text>
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Goals Card -->
      <div class="bg-surface p-6 rounded-xl">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="mb-4 font-semibold text-lg">Goals Progress</h2>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <TrophyIcon class="size-5 text-gold" />
                <span>{{ completedGoals }} achieved</span>
              </div>
              <div class="flex items-center gap-2">
                <CalendarIcon class="size-5 text-iris" />
                <span>{{ pendingGoals }} in progress</span>
              </div>
              <div class="flex items-center gap-2">
                <ChartBarIcon class="size-5 text-gold" />
                <span>{{ goalCompletionRate }}% achievement rate</span>
              </div>
            </div>
          </div>
          
          <!-- Circular progress indicator -->
          <div class="relative size-20">
            <svg viewBox="0 0 36 36" class="size-20">
              <!-- Background circle -->
              <path class="stroke-surface-600" stroke-dasharray="100, 100" stroke-width="3" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <!-- Foreground circle -->
              <path 
                :class="goalCompletionRate >= 75 ? 'stroke-foam' : goalCompletionRate >= 50 ? 'stroke-iris' : goalCompletionRate >= 25 ? 'stroke-gold' : 'stroke-rose'" 
                :stroke-dasharray="`${goalCompletionRate}, 100`" 
                stroke-width="3" 
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <!-- Percentage text -->
              <text x="18" y="20.5" class="font-medium text-[10px]" text-anchor="middle">{{ goalCompletionRate }}%</text>
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Streaks Card -->
    <div class="bg-surface mb-8 p-6 rounded-xl">
      <h2 class="mb-4 font-semibold text-lg">Habit Streaks</h2>
      <div class="gap-6 grid grid-cols-1 md:grid-cols-2">
        <!-- Current Streak -->
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-subtle text-sm">Current Streak</h3>
            <div class="flex items-end gap-1 mt-1">
              <span class="font-bold text-3xl">{{ currentStreak }}</span>
              <span class="mb-1 text-subtle">days</span>
            </div>
          </div>
          <div class="flex justify-center items-center bg-overlay rounded-full size-14">
            <FireIcon class="size-8 text-rose" />
          </div>
        </div>
        
        <!-- Longest Streak -->
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-subtle text-sm">Longest Streak</h3>
            <div class="flex items-end gap-1 mt-1">
              <span class="font-bold text-3xl">{{ longestStreak }}</span>
              <span class="mb-1 text-subtle">days</span>
            </div>
          </div>
          <div class="flex justify-center items-center bg-overlay rounded-full size-14">
            <TrophyIcon class="size-8 text-gold" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Weekly Progress & Productivity Insights -->
    <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
      <!-- Weekly Progress Chart -->
      <div class="bg-surface p-6 rounded-xl">
        <h2 class="mb-4 font-semibold text-lg">Weekly Activity</h2>
        
        <!-- Bar chart -->
        <div class="flex justify-between items-end mb-2 h-36">
          <div v-for="day in weeklyProgress" :key="day.day" class="flex flex-col items-center w-full">
            <div 
              class="bg-iris rounded-t-md w-4/5 transition-all duration-500 ease-in-out"
              :style="`height: ${getBarHeight(day.completed)}%`"
            ></div>
          </div>
        </div>
        
        <!-- X-axis labels -->
        <div class="flex justify-between text-subtle text-xs">
          <div v-for="day in weeklyProgress" :key="day.day" class="w-full text-center">
            {{ day.day }}
          </div>
        </div>
        
        <!-- Week over week trend -->
        <div class="flex items-center gap-2 mt-4 pt-4 border-surface-600 border-t">
          <div 
            class="flex items-center gap-1"
            :class="weekOverWeekChange >= 0 ? 'text-foam' : 'text-rose'"
          >
            <ArrowTrendingUpIcon v-if="weekOverWeekChange >= 0" class="size-4" />
            <ArrowTrendingDownIcon v-else class="size-4" />
            <span class="font-medium">{{ Math.abs(weekOverWeekChange) }}%</span>
          </div>
          <span class="text-subtle text-sm">vs last week</span>
        </div>
      </div>
      
      <!-- Productivity Insights -->
      <div class="bg-surface p-6 rounded-xl">
        <h2 class="mb-4 font-semibold text-lg">Productivity Insights</h2>
        
        <div class="space-y-4">
          <!-- Time of day stats -->
          <div>
            <h3 class="mb-2 text-subtle text-sm">When you're most productive</h3>
            <div class="flex items-end gap-2 h-20">
              <div v-for="time in timeOfDayStats" :key="time.time" class="flex flex-col items-center w-full">
                <div 
                  class="bg-foam rounded-t-md w-4/5 transition-all duration-500 ease-in-out"
                  :style="`height: ${getBarHeight(time.completed)}%`"
                ></div>
                <span class="mt-1 text-subtle text-xs">{{ time.time }}</span>
              </div>
            </div>
          </div>
          
          <!-- Most productive day -->
          <div class="pt-4 border-surface-600 border-t">
            <h3 class="mb-2 text-subtle text-sm">Most productive day</h3>
            <div class="flex items-center gap-2">
              <div class="flex justify-center items-center bg-overlay rounded-full size-10">
                <CalendarIcon class="size-6 text-iris" />
              </div>
              <span class="font-medium">{{ mostProductiveDay }}</span>
            </div>
          </div>
          
          <!-- Task completion trend -->
          <div class="pt-4 border-surface-600 border-t">
            <h3 class="mb-2 text-subtle text-sm">Task completion trend</h3>
            <div class="flex items-center gap-2">
              <div class="flex justify-center items-center bg-overlay rounded-full size-10">
                <ChartBarIcon class="size-6 text-gold" />
              </div>
              <span>You complete {{ weeklyProgress.reduce((sum, day) => sum + day.completed, 0) }} tasks per week on average</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* For consistent svg rendering */
svg text {
  fill: currentColor;
}
</style>