<script setup>
const navLinks = [
    {
        name: "Home",
        link: "/habits",
    },
    {
        name: "Tasks",
        link: "/habits/tasks",
    },
    {
        name: "Goals",
        link: "/habits/goals",
    },
    {
        name: "Statistics",
        link: "/habits/statistics",
    },
    {
        name: "About",
        link: "/habits/about",
    },
]
</script>

<template>
  <div class="relative min-h-screen w-40">
    <div class="fixed left-0 bottom-0 h-full pt-50 w-40 bg-surface">
      <ul class="flex flex-col size-full p-8 items-start justify-center gap-y-4">
        <li v-for="link in navLinks" :key="link.name">
          <RouterLink :to="link.link" class="text-text font-semibold p-4" activeClass="colored-text">
            {{ link.name }}
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>
