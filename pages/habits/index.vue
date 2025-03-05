<script setup>
import { useTasksStore } from "@/stores/tasks";
import { computed, ref, onMounted } from "vue";
import {
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
  ChartBarIcon,
  BookOpenIcon,
  ArrowLongRightIcon,
} from "@heroicons/vue/24/solid";

definePageMeta({
  title: "Habit Builder",
  description: "Build better habits one small step at a time.",
  layout: "habits",
});

const tasksStore = useTasksStore();
const tasks = computed(() => tasksStore.tasks);
const completedTasks = computed(() => tasks.value.filter(task => task.completed).length);

// Get goals from localStorage
const goals = computed(() => {
  const storedGoals = localStorage.getItem("goals") 
    ? JSON.parse(localStorage.getItem("goals") || "[]") 
    : [];
  return storedGoals;
});

const completedGoals = computed(() => goals.value.filter(goal => goal.completed).length);

// Current streak
const currentStreak = ref(localStorage.getItem("currentStreak") 
  ? parseInt(localStorage.getItem("currentStreak") || "0") 
  : 0);

// Features cards
const features = [
  {
    title: "Tasks",
    description: "Create and manage daily tasks that build positive habits",
    icon: ClipboardDocumentListIcon,
    color: "bg-linear-to-br from-rose via-iris to-foam",
    link: "/habits/tasks",
    stats: `${completedTasks.value} / ${tasks.value.length} completed`,
  },
  {
    title: "Goals",
    description: "Set short, long-term, and life goals to guide your journey",
    icon: TrophyIcon,
    color: "bg-linear-to-bl from-rose via-iris to-foam",
    link: "/habits/goals",
    stats: `${completedGoals.value} / ${goals.value.length} achieved`,
  },
  {
    title: "Statistics",
    description: "Track your progress and visualize your habit-building journey",
    icon: ChartBarIcon,
    color: "bg-linear-to-tr from-rose via-iris to-foam",
    link: "/habits/statistics",
    stats: `${currentStreak.value} day streak`,
  },
  {
    title: "About",
    description: "Learn proven techniques for building lasting habits",
    icon: BookOpenIcon,
    color: "bg-linear-to-tl from-rose via-iris to-foam",
    link: "/habits/about",
    stats: "Atomic Habits principles",
  },
];

// Quick tips for habit building
const quickTips = [
  "Make it obvious - Place visual cues in your environment",
  "Make it attractive - Pair habits with activities you enjoy",
  "Make it easy - Start with a two-minute version of your habit",
  "Make it satisfying - Track your progress visually",
  "Focus on becoming 1% better every day"
];

// Welcome message that changes based on time of day
const welcomeMessage = ref("");

onMounted(() => {
  const hour = new Date().getHours();
  if (hour < 12) {
    welcomeMessage.value = "Good morning";
  } else if (hour < 18) {
    welcomeMessage.value = "Good afternoon";
  } else {
    welcomeMessage.value = "Good evening";
  }
});
</script>

<template>
  <div class="min-h-screen bg-base text-text pb-16">
    <!-- Hero section -->
    <div class="mb-10">
      <h1 class="text-3xl font-bold mb-2">{{ welcomeMessage }}</h1>
      <p class="text-subtle">
        Your habit-building journey is all about small, consistent improvements.
        <span v-if="currentStreak > 0" class="text-foam">
          {{ currentStreak }} day streak! Keep it up!
        </span>
      </p>
    </div>
    
    <!-- Feature cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
      <div 
        v-for="feature in features" 
        :key="feature.title"
        class="bg-surface rounded-xl overflow-hidden relative group p-6"
      >
        <!-- Card content -->
        <RouterLink :to="feature.link">
          <div class="flex items-center gap-4 mb-4">
            <div :class="`size-12 rounded-xl ${feature.color} flex items-center justify-center`">
              <component :is="feature.icon" class="size-6 text-surface" />
            </div>
            <h2 class="text-xl font-semibold">{{ feature.title }}</h2>
          </div>
          
          <p class="text-subtle mb-6">{{ feature.description }}</p>
          
          <div class="flex justify-between items-center">
            <span class="text-sm text-subtle">{{ feature.stats }}</span>
            <span class="colored-text hover:underline flex items-center gap-1">
              Go to {{ feature.title }}
              <ArrowLongRightIcon class="size-5 text-subtle" />
            </span>
          </div>
        </RouterLink>
        
        <!-- Hover effect overlay -->
        <div class="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" :class="feature.color"></div>
      </div>
    </div>
    
    <!-- Quick start section -->
    <div class="bg-surface rounded-xl p-6 mb-12">
      <h2 class="text-xl font-semibold mb-4">Quick Start Guide</h2>
      <p class="text-subtle mb-6">
        Ready to build better habits? Here's a simple path to get started:
      </p>
      
      <ol class="space-y-4">
        <li class="flex items-start gap-3">
          <div class="size-8 rounded-full bg-foam/10 flex items-center justify-center text-foam font-semibold flex-shrink-0">
            1
          </div>
          <div>
            <h3 class="font-medium">Create small, achievable tasks</h3>
            <p class="text-subtle text-sm">
              Start with 2-minute tasks that are easy to complete. Use the 
              <RouterLink to="/habits/tasks" class="colored-text hover:underline">Tasks</RouterLink> 
              page to track daily actions.
            </p>
          </div>
        </li>
        
        <li class="flex items-start gap-3">
          <div class="size-8 rounded-full bg-iris/10 flex items-center justify-center text-iris font-semibold flex-shrink-0">
            2
          </div>
          <div>
            <h3 class="font-medium">Define your goals</h3>
            <p class="text-subtle text-sm">
              Set clear intentions on the 
              <RouterLink to="/habits/goals" class="colored-text hover:underline">Goals</RouterLink> 
              page to give direction to your habit-building efforts.
            </p>
          </div>
        </li>
        
        <li class="flex items-start gap-3">
          <div class="size-8 rounded-full bg-gold/10 flex items-center justify-center text-gold font-semibold flex-shrink-0">
            3
          </div>
          <div>
            <h3 class="font-medium">Track your progress</h3>
            <p class="text-subtle text-sm">
              Visit the 
              <RouterLink to="/habits/statistics" class="colored-text hover:underline">Statistics</RouterLink> 
              page to see your habit streaks and monitor your improvement.
            </p>
          </div>
        </li>
        
        <li class="flex items-start gap-3">
          <div class="size-8 rounded-full bg-rose/10 flex items-center justify-center text-rose font-semibold flex-shrink-0">
            4
          </div>
          <div>
            <h3 class="font-medium">Learn more about habit building</h3>
            <p class="text-subtle text-sm">
              Explore the 
              <RouterLink to="/habits/about" class="colored-text hover:underline">About</RouterLink> 
              page to understand the science of habit formation.
            </p>
          </div>
        </li>
      </ol>
    </div>
    
    <!-- Tip of the day -->
    <div class="bg-surface rounded-xl p-6">
      <div class="flex items-center gap-3 mb-4">
        <CheckCircleIcon class="size-6 text-foam" />
        <h2 class="text-xl font-semibold">Habit Building Tip</h2>
      </div>
      
      <p class="text-subtle italic border-l-4 border-foam/30 pl-4 py-1">
        {{ quickTips[Math.floor(Math.random() * quickTips.length)] }}
      </p>
    </div>
  </div>
</template>