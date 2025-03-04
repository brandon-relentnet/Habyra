<!-- Template.vue -->
<script setup>
import { computed, ref, onMounted } from "vue";
import { useTasksStore } from "@/stores/tasks";
import autoAnimate from "@formkit/auto-animate";
import {
  ArrowsUpDownIcon,
  StarIcon,
  BackspaceIcon,
} from "@heroicons/vue/24/solid";

const tasksList = ref(null);
const newTask = ref("");
const tasksStore = useTasksStore();
const draggedTaskId = ref(null);

const tasks = computed(() => tasksStore.tasks);

function addTask(task) {
  if (task.trim()) {
    tasksStore.addTask(task);
    newTask.value = ""; // Clear input after adding
  }
}

function removeTask(id) {
  tasksStore.removeTask(id);
}

function toggleComplete(id) {
  tasksStore.toggleComplete(id);
}

function toggleFavorite(id) {
  tasksStore.toggleFavorite(id);
}

// Drag and drop functionality
function onDragStart(e, id) {
  draggedTaskId.value = id;
  e.dataTransfer.effectAllowed = "move";

  // Create a ghost image of the entire list item
  let element = e.target;
  while (element && element.tagName !== "LI") {
    element = element.parentElement;
  }

  if (element) {
    // Set the drag image to be the entire list item
    const rect = element.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    e.dataTransfer.setDragImage(element, offsetX, offsetY);
    element.classList.add("is-dragging");
  }

  // Store the ID in dataTransfer
  e.dataTransfer.setData("text/plain", id);
}

function onDragEnd(e) {
  // Find the parent li element and remove the dragging class
  let element = e.target;
  while (element && element.tagName !== "LI") {
    element = element.parentElement;
  }

  if (element) {
    element.classList.remove("is-dragging");
  }

  // Clear drag state
  draggedTaskId.value = null;

  // Remove drop-target class from all items
  document.querySelectorAll(".drop-target").forEach((el) => {
    el.classList.remove("drop-target");
  });
}

function onDragOver(e) {
  e.preventDefault(); // Necessary to allow dropping
  e.dataTransfer.dropEffect = "move";

  // Find the parent li element to indicate drop target
  let element = e.target;
  while (element && element.tagName !== "LI") {
    element = element.parentElement;
  }

  if (element && !element.classList.contains("is-dragging")) {
    // Remove drop-target class from all items first
    document.querySelectorAll(".drop-target").forEach((el) => {
      el.classList.remove("drop-target");
    });

    // Add drop-target class to the current element
    element.classList.add("drop-target");
  }
}

function onDrop(e, targetId) {
  e.preventDefault();

  // Remove drop-target class from all items
  document.querySelectorAll(".drop-target").forEach((el) => {
    el.classList.remove("drop-target");
  });

  // Get dragged ID
  const draggedId = draggedTaskId.value;

  // Don't do anything if dropping on the same item
  if (draggedId === targetId) return;

  // Get the indices of the dragged and target tasks
  const draggedTaskIndex = tasks.value.findIndex(
    (task) => task.id === draggedId
  );
  const targetTaskIndex = tasks.value.findIndex((task) => task.id === targetId);

  if (draggedTaskIndex !== -1 && targetTaskIndex !== -1) {
    tasksStore.reorderTask(draggedId, targetTaskIndex);
  }
}

onMounted(() => {
  if (tasksList.value) {
    autoAnimate(tasksList.value);
  }
});
</script>

<template>
  <div class="min-h-screen bg-base text-text pb-16">
    <header class="bg-surface p-6 mb-20">
      <div class="container mx-auto">
        <h1 class="text-2xl font-bold">Habits</h1>
        <p class="text-subtle italic font-serif">
          Track your daily habits and routines
        </p>
      </div>
    </header>

    <input
      v-model="newTask"
      @keyup.enter="addTask(newTask)"
      placeholder="Add a new habit"
      class="block w-full p-4 bg-surface border-b border-surface focus:outline-none focus:border-primary"
    />
    <button
      @click="addTask(newTask)"
      class="block w-full p-4 bg-primary text-white"
    >
      Add Habit
    </button>

    <ul ref="tasksList" class="mt-8 w-2/3 mx-auto">
      <li
        v-for="task in tasks"
        :key="task.id"
        class="flex items-center justify-between p-4 border-b border-surface bg-surface rounded-xl mb-1 transition duration-200"
        :class="{
          'is-dragging': draggedTaskId === task.id,
          'shadow-md': draggedTaskId === task.id,
        }"
        @dragover="onDragOver($event)"
        @drop="onDrop($event, task.id)"
      >
        <div class="flex items-center flex-1">
          <input
            type="checkbox"
            :checked="task.completed"
            @change="toggleComplete(task.id)"
            class="mr-4"
          />
          <span :class="{ 'line-through': task.completed }">
            {{ task.title }}
          </span>
        </div>
        <div class="flex gap-2 items-center">
          <!-- Drag handle -->
          <div
            class="drag-handle p-1 rounded text-subtle hover:text-text active:text-foam cursor-grab active:cursor-grabbing transition duration-200"
            draggable="true"
            data-id="taskItem"
            @dragstart="onDragStart($event, task.id)"
            @dragend="onDragEnd($event)"
          >
            <ArrowsUpDownIcon class="size-5" />
          </div>
          <button
            @click="toggleFavorite(task.id)"
            class="transition duration-200 cursor-pointer"
            :class="
              task.favorited ? 'text-gold' : 'text-subtle hover:text-text'
            "
          >
            <StarIcon class="size-5" />
          </button>
          <button
            @click="removeTask(task.id)"
            class="transition duration-200 cursor-pointer text-subtle hover:text-love"
          >
            <BackspaceIcon class="size-5" />
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.is-dragging {
  opacity: 0.7;
  background-color: var(--color-overlay);
}

.drop-target {
  border-bottom: 2px solid var(--color-foam);
  background-color: var(--color-overlay);
}

.drag-handle {
  touch-action: none; /* Prevents scrolling on mobile when dragging */
}
</style>
