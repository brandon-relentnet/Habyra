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
    description:
      "Access your account and continue where you left off.",
    icon: ArrowRightEndOnRectangleIcon,
  },
  {
    name: "Account",
    path: "/account",
    title: "Your Account",
    description:
      "Manage your account settings, preferences, and security.",
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
  return navItems.find((item) => item.path === route.path);
});
</script>

<template>
  <div>
    <div class="relative h-20 w-full">
      <nav class="fixed top-0 left-0 w-full bg-base h-20 z-50">
        <ul class="flex text-text gap-x-4 items-center justify-center h-full">
          <li v-for="item in visibleNavItems" :key="item.name">
            <RouterLink :to="item.path" class="text-text px-4 py-2 font-semibold" activeClass="colored-text">
              {{ item.name }}
            </RouterLink>
          </li>
        </ul>
      </nav>
    </div>
    <header v-if="activeNavItem" class="bg-surface p-6">
      <div class="container mx-auto flex items-center">
        <component :is="activeNavItem.icon" class="size-12 bg-linear-to-br from-rose via-iris to-foam text-surface rounded-xl p-2 mr-4" />
        <div>
          <h1 class="text-2xl font-semibold text-text">{{ activeNavItem.title }}</h1>
          <p class="text-subtle italic font-serif">
            {{ activeNavItem.description }}
          </p>
        </div>
      </div>
    </header>
  </div>
</template>
