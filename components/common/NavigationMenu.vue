<script setup>
import {
  ClockIcon,
  HomeIcon,
  BookOpenIcon,
  CheckCircleIcon,
  HeartIcon,
  FireIcon,
  ServerStackIcon,
  ArrowRightEndOnRectangleIcon,
  UserIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/vue/24/solid";
import { useRoute } from "vue-router";
import { computed } from "vue";

const { loggedIn } = useUserSession();
const route = useRoute();

const navItems = [
  {
    name: "Home",
    path: "/",
    title: "Habyra",
    description:
      "Your all-in-one tool for building habits, boosting productivity, and prioritizing wellness — effortlessly.",
    icon: HomeIcon,
  },
  {
    name: "Pomodoro",
    path: "/pomodoro",
    title: "Pomodoro Timer",
    description:
      "Boost productivity with focused work sessions and regular breaks.",
    icon: ClockIcon,
  },
  {
    name: "Recipes",
    path: "/recipes",
    title: "Recipe Book",
    description:
      "Discover, save, and organize your favorite recipes for a healthier lifestyle.",
    icon: BookOpenIcon,
  },
  {
    name: "Habits",
    path: "/habits",
    title: "Habit Tracker",
    description:
      "Track and build positive habits with powerful habit-forming techniques.",
    icon: CheckCircleIcon,
    children: [
      {
        path: "/habits/about",
        title: "About Habit Tracking",
        description: "Learn the science behind building lasting habits.",
      },
      {
        path: "/habits/goals",
        title: "Habit Goals",
        description: "Set and track habit-related goals effectively.",
      },
      {
        path: "/habits/statistics",
        title: "Habit Statistics",
        description: "Analyze your habit-building progress over time.",
      },
      {
        path: "/habits/tasks",
        title: "Habit Tasks",
        description: "Manage daily tasks related to your habits.",
      },
    ],
  },
  {
    name: "Fitness",
    path: "/fitness",
    title: "Fitness Tracker",
    description:
      "Monitor your workouts, set fitness goals, and stay on top of your progress.",
    icon: FireIcon,
  },
  {
    name: "Wellness",
    path: "/wellness",
    title: "Wellness Hub",
    description:
      "Stay mindful of your mental health, meditation, and overall well-being.",
    icon: HeartIcon,
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    title: "Your Dashboard",
    description:
      "Customize your Habyra experience and access all your tools in one place.",
    icon: ServerStackIcon,
  },
  {
    name: "Registration",
    path: "/registration",
    title: "Create an Account",
    description:
      "Sign up for Habyra and start your journey towards better habits and productivity.",
    icon: ClipboardDocumentCheckIcon,
  },
  {
    name: "Login",
    path: "/login",
    title: "Log in to Habyra",
    description: "Access your account and continue where you left off.",
    icon: ArrowRightEndOnRectangleIcon,
  },
  {
    name: "Account",
    path: "/account",
    title: "Your Account",
    description: "Manage your account settings, preferences, and security.",
    icon: UserIcon,
  },
];

const visibleNavItems = computed(() => {
  return navItems.filter((item) => {
    if (item.name === "Registration") return false;
    if (item.name === "Login") return !loggedIn.value;
    if (item.name === "Account") return loggedIn.value;

    return true;
  });
});

const activeNavItem = computed(() => {
  // Check if current route matches any nav item directly
  let foundItem = navItems.find((item) => item.path === route.path);
  if (foundItem) return foundItem;

  // If in a subpage of Habits, return the parent Habits tab but update title & description
  let habitsSection = navItems.find((item) => item.name === "Habits");
  let subpage = habitsSection?.children?.find((child) =>
    route.path.startsWith(child.path)
  );

  return subpage
    ? {
        ...habitsSection,
        title: subpage.title,
        description: subpage.description,
      }
    : habitsSection;
});

// Add a function to check if a nav item should be considered active
const isActive = (item) => {
  if (item.path === route.path) return true;
  
  // Check if route is a child route of this item
  if (item.children && route.path.startsWith(item.path + '/')) return true;
  
  return false;
};
</script>

<template>
  <div>
    <div class="relative h-20 w-full">
      <nav class="fixed top-0 left-0 w-full bg-base h-20 z-50">
        <ul class="flex text-text gap-x-4 items-center justify-center h-full">
          <li v-for="item in visibleNavItems" :key="item.name">
            <RouterLink
              :to="item.path"
              class="text-text px-4 py-2 font-semibold"
              :class="{ 'colored-text': isActive(item) }"
            >
              {{ item.name }}
            </RouterLink>
          </li>
        </ul>
      </nav>
    </div>

    <header v-if="activeNavItem" class="bg-surface z-25 relative h-30">
      <div class="container mx-auto flex items-center h-full">
        <component
          :is="activeNavItem.icon"
          class="size-12 bg-linear-to-br from-rose via-iris to-foam text-surface rounded-xl p-2 mr-4"
        />
        <div>
          <h1 class="text-2xl font-semibold text-text">
            {{ activeNavItem.title }}
          </h1>
          <p class="text-subtle italic font-serif">
            {{ activeNavItem.description }}
          </p>
        </div>
      </div>
    </header>
  </div>
</template>