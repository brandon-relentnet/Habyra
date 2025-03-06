<script setup>
import {
  ClockIcon,
  HomeIcon,
  BookOpenIcon,
  CheckCircleIcon,
  HeartIcon,
  FireIcon,
  ArrowRightEndOnRectangleIcon,
  UserIcon,
  ClipboardDocumentCheckIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/vue/24/solid";
import { useRoute } from "vue-router";
import { computed, ref } from "vue";

const { loggedIn } = useUserSession();
const route = useRoute();
const mobileMenuOpen = ref(false);
// Universal state for tracking open dropdowns keyed by nav item name
const openDropdowns = ref({});

const navItems = [
  {
    name: "Home",
    path: "/",
    icon: HomeIcon,
    title: "Habyra",
    description:
      "Your all-in-one tool for building habits, boosting productivity, and prioritizing wellness — effortlessly.",
  },
  {
    name: "Pomodoro",
    path: "/pomodoro",
    icon: ClockIcon,
    title: "Pomodoro Timer",
    description:
      "Boost productivity with focused work sessions and regular breaks.",
  },
  {
    name: "Recipes",
    path: "/recipes",
    icon: BookOpenIcon,
    title: "Recipe Book",
    description:
      "Discover, save, and organize your favorite recipes for a healthier lifestyle.",
  },
  {
    name: "Habits",
    path: "/habits",
    icon: CheckCircleIcon,
    title: "Habits // Dashboard",
    description:
      "Track and build positive habits with powerful habit-forming techniques.",
    hasChildren: true,
    children: [
      {
        name: "Dashboard",
        path: "/habits",
        title: "Habits // Dashboard",
        description:
          "Track and build positive habits with powerful habit-forming techniques.",
      },
      {
        name: "Tasks",
        path: "/habits/tasks",
        title: "Habits // Tasks",
        description: "Manage daily tasks related to your habits.",
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
        name: "About",
        path: "/habits/about",
        title: "Habits // About",
        description: "Learn the science behind building lasting habits.",
      },
    ],
  },
  {
    name: "Fitness",
    path: "/fitness",
    icon: FireIcon,
    title: "Fitness Tracker",
    description:
      "Monitor your workouts, set fitness goals, and stay on top of your progress.",
  },
  {
    name: "Wellness",
    path: "/wellness",
    icon: HeartIcon,
    title: "Wellness Hub",
    description:
      "Stay mindful of your mental health, meditation, and overall well-being.",
  },
];

const authItemsData = [
  {
    name: "Login",
    path: "/login",
    icon: ArrowRightEndOnRectangleIcon,
    title: "Log in to Habyra",
    description: "Access your account and continue where you left off.",
    showWhen: () => !loggedIn.value,
  },
  {
    name: "Register",
    path: "/registration",
    icon: ClipboardDocumentCheckIcon,
    title: "Create an Account",
    description:
      "Sign up for Habyra and start your journey towards better habits and productivity.",
    showWhen: () => !loggedIn.value,
  },
  {
    name: "Account",
    path: "/account",
    icon: UserIcon,
    title: "Your Account",
    description: "Manage your account settings, preferences, and security.",
    showWhen: () => loggedIn.value,
  },
];

const authItems = computed(() =>
  authItemsData.filter((item) => item.showWhen())
);
const allItems = computed(() => [
  ...navItems,
  ...authItemsData.filter((item) => item.showWhen()),
]);

// Checks if a given path (or its children) is active
const isActive = (path, exact = false) => {
  if (exact) return route.path === path;
  if (route.path === path) return true;
  if (path !== "/" && route.path.startsWith(path + "/")) return true;
  return false;
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

// Generic dropdown toggler for any nav item
const toggleDropdown = (name) => {
  openDropdowns.value[name] = !openDropdowns.value[name];
};
const closeDropdown = (name) => {
  openDropdowns.value[name] = false;
};

// Compute which dropdown (if any) is active for header sub-navigation
const activeDropdown = computed(() => {
  return navItems.find(
    (item) =>
      item.hasChildren &&
      item.children.some((child) => isActive(child.path, true))
  );
});

// Determine page info based on current route
const pageInfo = computed(() => {
  for (const item of allItems.value) {
    if (item.path === route.path) {
      return {
        title: item.title || item.name,
        description: item.description || "",
        icon: item.icon,
      };
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.path === route.path) {
          return {
            title: child.title || `${item.name} / ${child.name}`,
            description: child.description || "",
            icon: item.icon,
          };
        }
      }
    }
  }
  return {
    title: "Habyra",
    description:
      "Your all-in-one tool for building habits, boosting productivity, and prioritizing wellness.",
    icon: HomeIcon,
  };
});
</script>

<template>
  <div>
    <!-- Mobile menu button -->
    <div class="lg:hidden flex justify-between items-center bg-base p-4">
      <div class="flex items-center">
        <component :is="pageInfo.icon" class="mr-2 w-6 h-6 text-primary" />
        <span class="font-semibold text-text">{{ pageInfo.title }}</span>
      </div>
      <button @click="toggleMobileMenu" class="focus:outline-none text-text">
        <Bars3Icon v-if="!mobileMenuOpen" class="w-6 h-6" />
        <XMarkIcon v-else class="w-6 h-6" />
      </button>
    </div>

    <!-- Mobile Navigation -->
    <div
      v-if="mobileMenuOpen"
      class="lg:hidden bg-surface border-muted border-b"
    >
      <div class="space-y-1 px-2 pt-2 pb-3">
        <template v-for="item in navItems" :key="item.name">
          <div>
            <!-- If the nav item has children, render a dropdown -->
            <div v-if="item.hasChildren" class="relative">
              <button
                @click="toggleDropdown(item.name)"
                class="flex justify-between items-center hover:bg-muted px-3 py-2 rounded-md w-full text-text"
                :class="{ 'bg-primary text-white': isActive(item.path) }"
              >
                <div class="flex items-center">
                  <component :is="item.icon" class="mr-2 w-5 h-5" />
                  <span>{{ item.name }}</span>
                </div>
                <ChevronDownIcon
                  class="w-4 h-4"
                  :class="{ 'transform rotate-180': openDropdowns[item.name] }"
                />
              </button>
              <div
                v-if="openDropdowns[item.name]"
                class="space-y-1 mt-1 py-1 pl-8"
              >
                <RouterLink
                  v-for="child in item.children"
                  :key="child.name"
                  :to="child.path"
                  class="block hover:bg-muted px-3 py-2 rounded-md text-text"
                  :class="{ 'bg-primary text-white': isActive(child.path) }"
                >
                  {{ child.name }}
                </RouterLink>
              </div>
            </div>
            <!-- Otherwise render a normal link -->
            <RouterLink
              v-else
              :to="item.path"
              class="flex items-center hover:bg-muted px-3 py-2 rounded-md text-text"
              :class="{ 'bg-primary text-white': isActive(item.path) }"
            >
              <component :is="item.icon" class="mr-2 w-5 h-5" />
              <span>{{ item.name }}</span>
            </RouterLink>
          </div>
        </template>

        <!-- Auth items -->
        <div class="mt-2 pt-2 border-muted border-t">
          <RouterLink
            v-for="item in authItems"
            :key="item.name"
            :to="item.path"
            class="flex items-center hover:bg-muted px-3 py-2 rounded-md text-text"
            :class="{ 'bg-primary text-white': isActive(item.path) }"
          >
            <component :is="item.icon" class="mr-2 w-5 h-5" />
            <span>{{ item.name }}</span>
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Desktop Navigation -->
    <nav class="hidden lg:block bg-base">
      <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div class="flex justify-between items-center h-16">
          <!-- Main navigation -->
          <div class="flex items-center">
            <div class="flex flex-shrink-0 items-center">
              <span class="ml-2 font-bold text-lg colored-text">Habyra</span>
            </div>
            <div class="flex items-center space-x-4 ml-10">
              <template v-for="item in navItems" :key="item.name">
                <div
                  v-if="item.hasChildren"
                  v-on-click-outside.bubble="() => closeDropdown(item.name)"
                  class="relative"
                >
                  <button
                    @click="toggleDropdown(item.name)"
                    :class="[
                      'flex items-center space-x-1 px-3 py-2 rounded-xl font-medium text-sm transition duration-200 cursor-pointer',
                      openDropdowns[item.name]
                        ? isActive(item.path)
                          ? 'colored-bg text-base'
                          : 'bg-linear-to-br from-rose/20 via-iris/20 to-foam/20 text-text'
                        : isActive(item.path)
                        ? 'colored-bg text-base'
                        : 'text-subtle hover:text-text colored-bg-hover',
                    ]"
                  >
                    <component :is="item.icon" class="mr-1 size-4" />
                    <span>{{ item.name }}</span>
                    <ChevronDownIcon
                      class="size-4 transition-transform duration-250"
                      :class="{
                        'transform rotate-180': openDropdowns[item.name],
                      }"
                    />
                  </button>
                  <div
                    class="left-0 z-10 absolute bg-linear-to-tl from-rose via-iris to-foam shadow-lg mt-2 p-0.5 rounded-xl w-48 overflow-hidden"
                    :class="[
                      'dropdown',
                      openDropdowns[item.name] ? 'active' : '',
                    ]"
                  >
                    <div class="bg-surface rounded-xl size-full">
                      <div
                        class="divide-y divide-overlay"
                        role="menu"
                        aria-orientation="vertical"
                      >
                        <RouterLink
                          v-for="child in item.children"
                          :key="child.name"
                          :to="child.path"
                          class="block px-4 py-2 font-semibold text-subtle hover:text-text text-sm"
                          role="menuitem"
                        >
                          <span
                            :class="
                              isActive(child.path, true) ? 'colored-text' : ''
                            "
                          >
                            {{ child.name }}
                          </span>
                        </RouterLink>
                      </div>
                    </div>
                  </div>
                </div>
                <RouterLink
                  v-else
                  :to="item.path"
                  class="px-3 py-2 rounded-xl font-semibold text-sm transition duration-200"
                  :class="
                    isActive(item.path)
                      ? 'colored-bg text-base'
                      : 'text-subtle hover:text-text colored-bg-hover'
                  "
                >
                  <div class="flex items-center">
                    <component :is="item.icon" class="mr-1 size-4" />
                    {{ item.name }}
                  </div>
                </RouterLink>
              </template>
            </div>
          </div>

          <!-- Auth items -->
          <div class="flex items-center">
            <RouterLink
              v-for="item in authItems"
              :key="item.name"
              :to="item.path"
              class="ml-4 px-3 py-2 rounded-xl font-semibold text-sm transition duration-200"
              :class="
                isActive(item.path)
                  ? 'colored-bg text-base'
                  : 'text-subtle hover:text-text colored-bg-hover'
              "
            >
              <div class="flex items-center">
                <component :is="item.icon" class="mr-1 w-4 h-4" />
                {{ item.name }}
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Page Header with full title and description -->
    <header class="bg-surface p-6 px-8 w-screen">
      <div class="mx-auto max-w-7xl">
        <div class="flex justify-between">
          <div class="flex items-center">
            <component
              :is="pageInfo.icon"
              class="flex-shrink-0 p-2 rounded-xl size-12 text-surface colored-bg"
            />
            <div class="ml-4">
              <h1 class="font-semibold text-text text-2xl">
                {{ pageInfo.title }}
              </h1>
              <p class="font-serif text-subtle italic">
                {{ pageInfo.description }}
              </p>
            </div>
          </div>

          <!-- Universal sub-navigation for dropdown items -->
          <ul
            v-if="activeDropdown"
            class="flex justify-start items-center gap-y-4"
          >
            <li v-for="child in activeDropdown.children" :key="child.name">
              <RouterLink
                :to="child.path"
                class="p-4 font-semibold text-subtle hover:text-text"
                :class="{ 'colored-text': isActive(child.path, true) }"
              >
                {{ child.name }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </header>
  </div>
</template>

<style scoped>
.dropdown {
  opacity: 0.0001;
  transform: scale(0.6) translateY(-20%);
  transition: 0.3s cubic-bezier(0.2, 0, 0, 1.6);
  display: inline-block;
  pointer-events: none;
}

.dropdown.active {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}
</style>
