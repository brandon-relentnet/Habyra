<template>
  <CommonNavigationMenu />
  <div class="flex">
    <TasksSideNavigation />
    <main class="container mx-auto px-6 pt-20 text-text max-w-[1080px]">
      <slot />
    </main>
  </div>
</template>
