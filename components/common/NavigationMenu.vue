<script setup>
import { ref } from "vue";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Pomodoro", path: "/pomodoro" },
  { name: "Recipes", path: "/recipes" },
  { name: "Habits", path: "/habits" },
  { name: "Fitness", path: "/fitness" },
  { name: "Wellness", path: "/wellness" },
];
</script>

<template>
  <div class="relative h-20 w-full">
    <nav class="fixed top-0 left-0 w-full bg-base h-20">
      <ul class="flex text-text gap-x-4 items-center justify-center h-full">
        <li v-for="item in navItems" :key="item.name">
          <NuxtLink :to="item.path" class="text-text px-4 py-2">
            {{ item.name }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
</template>
