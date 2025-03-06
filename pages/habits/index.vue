<script setup>
import { useTasksStore } from "@/stores/tasks";
import { useGoalsStore } from "@/stores/goals";
import { useStatisticsStore } from "@/stores/statistics";
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

const tasks = computed(() => tasksStore.tasks);
const completedTasks = computed(
  () => tasks.value.filter((task) => task.completed).length
);

// Get goals from store
const goals = computed(() => goalsStore.goals);
const completedGoals = computed(
  () => goals.value.filter((goal) => goal.completed).length
);

// Current streak
const currentStreak = computed(() => statsStore.currentStreak);

// Features cards
const features = computed(() => [
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
    description:
      "Track your progress and visualize your habit-building journey",
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
]);

// Quick tips for habit building
const tipOfTheDay = ref('');
const quickTips = [
  "Make it obvious - Place visual cues in your environment",
  "Make it attractive - Pair habits with activities you enjoy",
  "Make it easy - Start with a two-minute version of your habit",
  "Make it satisfying - Track your progress visually",
  "Focus on becoming 1% better every day",
];

// Welcome message that changes based on time of day
const welcomeMessage = ref("");

onMounted(() => {
  tipOfTheDay.value = quickTips[Math.floor(Math.random() * quickTips.length)];
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
  <div class="bg-base pb-16 min-h-screen text-text">
    <!-- Hero section -->
    <div class="mb-10">
      <h1 class="mb-2 font-bold text-3xl">{{ welcomeMessage }}</h1>
      <p class="text-subtle">
        Your habit-building journey is all about small, consistent improvements.
        <span v-if="currentStreak > 0" class="text-foam">
          {{ currentStreak }} day streak! Keep it up!
        </span>
      </p>
    </div>

    <!-- Feature cards -->
    <div class="gap-6 grid grid-cols-1 sm:grid-cols-2 mb-12">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="group relative bg-surface p-6 rounded-xl overflow-hidden"
      >
        <!-- Card content -->
        <RouterLink :to="feature.link">
          <div class="flex items-center gap-4 mb-4">
            <div
              :class="`size-12 rounded-xl ${feature.color} flex items-center justify-center`"
            >
              <component :is="feature.icon" class="size-6 text-surface" />
            </div>
            <h2 class="font-semibold text-xl">{{ feature.title }}</h2>
          </div>

          <p class="mb-6 text-subtle">{{ feature.description }}</p>

          <div class="flex justify-between items-center">
            <span class="text-subtle text-sm">{{ feature.stats }}</span>
            <span class="flex items-center gap-1 hover:underline colored-text">
              Go to {{ feature.title }}
              <ArrowLongRightIcon class="size-5 text-subtle" />
            </span>
          </div>
        </RouterLink>

        <!-- Hover effect overlay -->
        <div
          class="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
          :class="feature.color"
        ></div>
      </div>
    </div>

    <!-- Quick start section -->
    <div class="bg-surface mb-12 p-6 rounded-xl">
      <h2 class="mb-4 font-semibold text-xl">Quick Start Guide</h2>
      <p class="mb-6 text-subtle">
        Ready to build better habits? Here's a simple path to get started:
      </p>

      <ol class="space-y-4">
        <li class="flex items-start gap-3">
          <div
            class="flex flex-shrink-0 justify-center items-center bg-foam/10 rounded-full size-8 font-semibold text-foam"
          >
            1
          </div>
          <div>
            <h3 class="font-medium">Create small, achievable tasks</h3>
            <p class="text-subtle text-sm">
              Start with 2-minute tasks that are easy to complete. Use the
              <RouterLink
                to="/habits/tasks"
                class="hover:underline colored-text"
                >Tasks</RouterLink
              >
              page to track daily actions.
            </p>
          </div>
        </li>

        <li class="flex items-start gap-3">
          <div
            class="flex flex-shrink-0 justify-center items-center bg-iris/10 rounded-full size-8 font-semibold text-iris"
          >
            2
          </div>
          <div>
            <h3 class="font-medium">Define your goals</h3>
            <p class="text-subtle text-sm">
              Set clear intentions on the
              <RouterLink
                to="/habits/goals"
                class="hover:underline colored-text"
                >Goals</RouterLink
              >
              page to give direction to your habit-building efforts.
            </p>
          </div>
        </li>

        <li class="flex items-start gap-3">
          <div
            class="flex flex-shrink-0 justify-center items-center bg-gold/10 rounded-full size-8 font-semibold text-gold"
          >
            3
          </div>
          <div>
            <h3 class="font-medium">Track your progress</h3>
            <p class="text-subtle text-sm">
              Visit the
              <RouterLink
                to="/habits/statistics"
                class="hover:underline colored-text"
                >Statistics</RouterLink
              >
              page to see your habit streaks and monitor your improvement.
            </p>
          </div>
        </li>

        <li class="flex items-start gap-3">
          <div
            class="flex flex-shrink-0 justify-center items-center bg-rose/10 rounded-full size-8 font-semibold text-rose"
          >
            4
          </div>
          <div>
            <h3 class="font-medium">Learn more about habit building</h3>
            <p class="text-subtle text-sm">
              Explore the
              <RouterLink
                to="/habits/about"
                class="hover:underline colored-text"
                >About</RouterLink
              >
              page to understand the science of habit formation.
            </p>
          </div>
        </li>
      </ol>
    </div>

    <!-- Tip of the day -->
    <div class="bg-surface p-6 rounded-xl">
      <div class="flex items-center gap-3 mb-4">
        <CheckCircleIcon class="size-6 text-foam" />
        <h2 class="font-semibold text-xl">Habit Building Tip</h2>
      </div>

      <p class="py-1 pl-4 border-foam/30 border-l-4 text-subtle italic">
        {{ tipOfTheDay }}
      </p>
    </div>
  </div>
</template>
