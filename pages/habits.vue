<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useTasksStore } from "@/stores/tasks";
import autoAnimate from "@formkit/auto-animate";
import {
  ArrowsUpDownIcon,
  StarIcon,
  BackspaceIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/vue/24/solid";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  favorited: boolean;
}

const tasksList = ref<HTMLElement | null>(null);
const newTask = ref<string>("");
const tasksStore = useTasksStore();
const draggedTaskId = ref<number | null>(null);

const tasks = computed<Task[]>(() => tasksStore.tasks);

const hideCompleted = computed(() => tasksStore.hideCompleted);

function addTask(taskTitle: string) {
  if (taskTitle.trim()) {
    tasksStore.addTask(taskTitle);
    newTask.value = ""; // Clear input after adding
  }
}

const filteredTasks = computed(() =>
  hideCompleted.value
    ? tasks.value.filter((task) => !task.completed)
    : tasks.value
);

const toggleHideCompleted = () => {
  tasksStore.toggleHideCompleted();
};

function removeTask(id: number) {
  tasksStore.removeTask(id);
}

function toggleComplete(id: number) {
  tasksStore.toggleComplete(id);
}

function toggleFavorite(id: number) {
  tasksStore.toggleFavorite(id);
}

// Drag and drop functionality remains unchanged
function onDragStart(e: DragEvent, id: number) {
  draggedTaskId.value = id;
  if (!e.dataTransfer) return;

  e.dataTransfer.effectAllowed = "move";

  const liElement = (e.currentTarget as HTMLElement).closest("li");
  if (liElement) {
    const rect = liElement.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setDragImage(liElement, offsetX, offsetY);
    liElement.classList.add("is-dragging");
  }

  // Store the ID as string in dataTransfer
  e.dataTransfer.setData("text/plain", id.toString());
}

function onDragEnd(e: DragEvent) {
  const liElement = (e.currentTarget as HTMLElement).closest("li");
  if (liElement) {
    liElement.classList.remove("is-dragging");
  }
  draggedTaskId.value = null;
  document.querySelectorAll(".drop-target").forEach((el) => {
    el.classList.remove("drop-target");
  });
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
  if (!e.dataTransfer) return;

  e.dataTransfer.dropEffect = "move";

  const liElement = e.currentTarget as HTMLElement;
  if (liElement && !liElement.classList.contains("is-dragging")) {
    document.querySelectorAll(".drop-target").forEach((el) => {
      el.classList.remove("drop-target");
    });
    liElement.classList.add("drop-target");
  }
}

function onDrop(e: DragEvent, targetId: number) {
  e.preventDefault();
  const liElement = e.currentTarget as HTMLElement;
  liElement.classList.remove("drop-target");
  document.querySelectorAll(".drop-target").forEach((el) => {
    el.classList.remove("drop-target");
  });

  const draggedId = draggedTaskId.value;
  if (draggedId === targetId) return;

  const draggedTaskIndex = tasks.value.findIndex(
    (task) => task.id === draggedId
  );
  const targetTaskIndex = tasks.value.findIndex((task) => task.id === targetId);

  if (draggedTaskIndex !== -1 && targetTaskIndex !== -1) {
    tasksStore.reorderTask(draggedId!, targetTaskIndex);
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
    <div class="flex justify-between items-center mb-6">
      <button
        @click="toggleHideCompleted"
        class="hover:bg-surface rounded-xl px-4 py-2 cursor-pointer transition duration-200 flex items-center space-x-2 text-subtle hover:text-text font-semibold whitespace-nowrap"
      >
        <div class="inline-block mr-2" v-auto-animate>
          <EyeIcon v-if="!hideCompleted" class="size-6 mt-0.5" />
          <EyeSlashIcon v-else class="size-6 mt-0.5" />
        </div>
        {{ hideCompleted ? "Show" : "Hide" }} Completed
      </button>
    </div>

    <ul ref="tasksList" class="mt-8 w-2/3 mx-auto">
      <li
        v-for="task in filteredTasks"
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
    <div class="fixed bottom-4 right-4 flex items-center gap-2 w-100">
      <input
        v-model="newTask"
        @keyup.enter="addTask(newTask)"
        placeholder="Quick add a new task"
        class="bg-surface ring p-2 ring-foam/10 border-3 border-transparent focus:border-foam/60 transition duration-200 outline-none rounded-xl placeholder-subtle placeholder:italic w-full"
      />
      <button
        @click="addTask(newTask)"
        class="px-6 py-3 bg-surface hover:bg-overlay rounded-xl font-medium flex items-center gap-2 cursor-pointer transition duration-200"
      >
        <PlusIcon class="size-5" />
      </button>
    </div>
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
