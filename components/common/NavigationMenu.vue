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
    title: "Habits",
    description:
      "Track and build positive habits with powerful habit-forming techniques.",
    icon: CheckCircleIcon,
    children: [
      {
        name: "About",
        path: "/habits/about",
        title: "Habits // About",
        description: "Learn the science behind building lasting habits.",
      },
      {
        name: "Goals",
        path: "/habits/goals",
        title: "Habits // Goals",
        description: "Set and track habit-related goals effectively.",
      },
      {
        name: "Statistics",
        path: "/habits/statistics",
        title: "Habits // Statistics",
        description: "Analyze your habit-building progress over time.",
      },
      {
        name: "Tasks",
        path: "/habits/tasks",
        title: "Habits // Tasks",
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
  if (item.children && route.path.startsWith(item.path + "/")) return true;

  return false;
};

const habitsPaths = [
  { name: "Home", path: "/habits" },
  ...navItems
    .find(item => item.name === "Habits")
    ?.children.map(child => ({ 
      name: child.name, 
      path: child.path 
    })) || []
];

console.log(habitsPaths);
</script>

<template>
  <div>
    <div class="relative bg-surface w-full h-20">
      <nav class="top-0 left-0 z-50 fixed bg-base w-full h-20">
        <ul class="flex justify-center items-center gap-x-4 h-full text-text">
          <li v-for="item in visibleNavItems" :key="item.name">
            <RouterLink
              :to="item.path"
              class="px-4 py-2 font-semibold text-text"
              :class="{ 'colored-text': isActive(item) }"
            >
              {{ item.name }}
            </RouterLink>
          </li>
        </ul>
      </nav>
    </div>

    <header class="z-25 relative flex justify-between bg-surface p-6 px-8">
      <div class="flex items-center h-full">
        <component
          :is="activeNavItem.icon"
          class="flex-shrink-0 bg-linear-to-br from-rose via-iris to-foam mr-4 p-2 rounded-xl size-12 text-surface"
        />
        <div>
          <h1 class="font-semibold text-text text-2xl">
            {{ activeNavItem.title }}
          </h1>
          <p class="font-serif text-subtle italic">
            {{ activeNavItem.description }}
          </p>
        </div>
      </div>
      <ul v-if="activeNavItem.path === '/habits'" class="flex justify-start items-center gap-y-4">
        <li v-for="link in habitsPaths" :key="link.name">
          <RouterLink
            :to="link.path"
            class="p-4 font-semibold text-text"
            activeClass="colored-text"
          >
            {{ link.name }}
          </RouterLink>
        </li>
      </ul>
    </header>
  </div>
</template>
