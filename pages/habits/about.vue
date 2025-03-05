<script setup>
import {
  LightBulbIcon,
  UserIcon,
  ArrowPathIcon,
  RocketLaunchIcon,
  HeartIcon,
  BookOpenIcon,
  FingerPrintIcon,
  ArrowSmallRightIcon,
} from "@heroicons/vue/24/solid";

definePageMeta({
  title: "About Habit Building",
  description:
    "Learn how to build lasting habits using proven techniques from Atomic Habits.",
  layout: "habits",
});

// Habit loops based on Atomic Habits
const habitLoops = [
  {
    id: 1,
    title: "Cue",
    description:
      "Make it obvious. Set up triggers that prompt you to start your habit.",
    color: "from-gold to-gold/80",
    icon: LightBulbIcon,
    examples: [
      "Place running shoes by the door",
      "Keep books on your nightstand",
      "Use environmental reminders",
      "Stack habits with existing routines",
    ],
  },
  {
    id: 2,
    title: "Craving",
    description: "Make it attractive. Increase the appeal of your habits.",
    color: "from-love to-love/80",
    icon: HeartIcon,
    examples: [
      "Join a community with shared habits",
      "Pair habits with activities you enjoy",
      "Create a motivating environment",
      "Focus on the benefits, not the process",
    ],
  },
  {
    id: 3,
    title: "Response",
    description: "Make it easy. Reduce friction and simplify the habit.",
    color: "from-iris to-iris/80",
    icon: ArrowPathIcon,
    examples: [
      "Break habits into 2-minute actions",
      "Prepare your environment in advance",
      "Remove obstacles to good habits",
      "Create friction for bad habits",
    ],
  },
  {
    id: 4,
    title: "Reward",
    description: "Make it satisfying. Create a feeling of immediate success.",
    color: "from-foam to-foam/80",
    icon: RocketLaunchIcon,
    examples: [
      "Celebrate small wins immediately",
      "Track progress visually",
      "Never miss twice (maintain the streak)",
      "Design rewards that reinforce identity",
    ],
  },
];

// Core principles from Atomic Habits
const corePrinciples = [
  {
    id: 1,
    title: "Habits are the compound interest of self-improvement",
    description:
      "Small changes often appear to make no difference until you cross a critical threshold. The most powerful outcomes are delayed.",
    icon: ArrowPathIcon,
  },
  {
    id: 2,
    title: "Focus on systems, not goals",
    description:
      "Goals are about the results you want to achieve. Systems are about the processes that lead to those results. Focus on the process.",
    icon: RocketLaunchIcon,
  },
  {
    id: 3,
    title: "Identity-based habits",
    description:
      "The most effective way to change your habits is to focus on who you want to become, not what you want to achieve.",
    icon: UserIcon,
  },
  {
    id: 4,
    title: "The Two-Minute Rule",
    description:
      "When you start a new habit, it should take less than two minutes to do. Scale down until the habit can be done in two minutes or less.",
    icon: FingerPrintIcon,
  },
];

// Recommended resources
const resources = [
  {
    title: "Atomic Habits",
    author: "James Clear",
    description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    link: "https://jamesclear.com/atomic-habits",
  },
  {
    title: "Tiny Habits",
    author: "BJ Fogg",
    description: "The Small Changes That Change Everything",
    link: "https://www.tinyhabits.com/",
  },
  {
    title: "The Power of Habit",
    author: "Charles Duhigg",
    description: "Why We Do What We Do in Life and Business",
    link: "https://charlesduhigg.com/the-power-of-habit/",
  },
];
</script>

<template>
  <div class="min-h-screen bg-base text-text pb-16">
    <!-- Hero section -->
    <div class="mb-16 text-center">
      <h1 class="text-3xl font-bold mb-4">Build Better Habits</h1>
      <p class="text-subtle max-w-2xl mx-auto">
        Learn how to create lasting habits using scientific principles from
        <a
          href="https://jamesclear.com/atomic-habits"
          target="_blank"
          class="inline-flex items-center gap-1 colored-text hover:underline"
          >Atomic Habits</a
        >
        by James Clear. Small changes, remarkable results.
      </p>
    </div>

    <!-- The Four Laws of Behavior Change -->
    <div class="mb-16">
      <h2 class="text-2xl font-semibold mb-6 border-b border-surface pb-2">
        The Four Laws of Behavior Change
      </h2>
      <p class="mb-8 text-subtle">
        These four simple steps will help you build better habits and break bad
        ones. Based on the habit loop: cue, craving, response, and reward.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="loop in habitLoops"
          :key="loop.id"
          class="bg-surface rounded-xl overflow-hidden"
        >
          <div
            :class="`bg-gradient-to-r ${loop.color} p-4 flex items-center gap-3`"
          >
            <div
              class="bg-surface rounded-full size-10 flex items-center justify-center"
            >
              <component :is="loop.icon" class="size-6 text-text" />
            </div>
            <h3 class="text-xl font-semibold text-surface">{{ loop.title }}</h3>
          </div>

          <div class="p-6">
            <p class="mb-4">{{ loop.description }}</p>

            <h4 class="font-medium mb-2">Examples:</h4>
            <ul class="space-y-2">
              <li
                v-for="(example, i) in loop.examples"
                :key="i"
                class="flex items-start gap-2"
              >
                <ArrowSmallRightIcon class="size-4 mt-1 text-subtle" />
                <span>{{ example }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Key Principles -->
    <div class="mb-16">
      <h2 class="text-2xl font-semibold mb-6 border-b border-surface pb-2">
        Key Principles
      </h2>
      <p class="mb-8 text-subtle">
        These core ideas from Atomic Habits will transform how you think about
        progress and self-improvement.
      </p>

      <div class="space-y-6">
        <div
          v-for="principle in corePrinciples"
          :key="principle.id"
          class="bg-surface rounded-xl p-6 flex gap-4"
        >
          <div
            class="bg-overlay rounded-full size-12 flex-shrink-0 flex items-center justify-center"
          >
            <component :is="principle.icon" class="size-6 text-foam" />
          </div>

          <div>
            <h3 class="text-lg font-semibold mb-2">{{ principle.title }}</h3>
            <p class="text-subtle">{{ principle.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- How to Use This App -->
    <div class="mb-16">
      <h2 class="text-2xl font-semibold mb-6 border-b border-surface pb-2">
        How to Use This App
      </h2>

      <div class="space-y-6">
        <div class="bg-surface rounded-xl p-6">
          <h3 class="text-lg font-semibold mb-3">
            1. Create daily tasks that build habits
          </h3>
          <p class="text-subtle mb-4">
            Use the Tasks section to create small, manageable daily tasks that
            support your habit building. Keep tasks small and specific—use the
            Two-Minute Rule to start.
          </p>
          <div class="bg-overlay rounded-xl p-4 text-subtle italic">
            <strong>Example:</strong> Instead of "Exercise more," create tasks
            like "Put on running shoes and step outside for 2 minutes" or "Do 5
            push-ups before breakfast."
          </div>
        </div>

        <div class="bg-surface rounded-xl p-6">
          <h3 class="text-lg font-semibold mb-3">2. Set meaningful goals</h3>
          <p class="text-subtle mb-4">
            Use the Goals section to define what you're working toward. Create a
            mix of short-term, long-term, and life goals that align with the
            identity you want to build.
          </p>
          <div class="bg-overlay rounded-xl p-4 text-subtle italic">
            <strong>Example:</strong> A short-term goal might be "Meditate for 5
            minutes daily for one week." A life goal could be "Become someone
            who prioritizes mental well-being."
          </div>
        </div>

        <div class="bg-surface rounded-xl p-6">
          <h3 class="text-lg font-semibold mb-3">3. Track your progress</h3>
          <p class="text-subtle mb-4">
            Use the Statistics page to monitor your habit streaks and overall
            progress. Visualize your improvements over time and identify
            patterns in your behavior.
          </p>
          <div class="bg-overlay rounded-xl p-4 text-subtle italic">
            <strong>Tip:</strong> Don't break the chain! Try to maintain your
            streak, but if you miss a day, never miss twice in a row.
          </div>
        </div>
      </div>
    </div>

    <!-- Recommended Resources -->
    <div>
      <h2 class="text-2xl font-semibold mb-6 border-b border-surface pb-2">
        Recommended Resources
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="(resource, i) in resources"
          :key="i"
          class="bg-surface rounded-xl p-6"
        >
          <div class="flex items-center gap-3 mb-3">
            <BookOpenIcon class="size-6 text-iris" />
            <h3 class="font-semibold">{{ resource.title }}</h3>
          </div>
          <p class="text-subtle mb-2">by {{ resource.author }}</p>
          <p class="text-sm mb-4">{{ resource.description }}</p>
          <a
            :href="resource.link"
            target="_blank"
            class="inline-flex items-center gap-1 colored-text hover:underline"
          >
            Learn more
            <ArrowSmallRightIcon class="size-4 text-subtle" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Any specific styles can go here */
</style>
