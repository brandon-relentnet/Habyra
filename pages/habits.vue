<script setup lang="ts">
import { computed, ref, onMounted, watchEffect } from "vue";
import { useTasksStore } from "@/stores/tasks";
import autoAnimate from "@formkit/auto-animate";
import {
  ArrowsUpDownIcon,
  StarIcon,
  BackspaceIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/vue/24/solid";

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  favorited: boolean;
  date?: string;
  time?: string;
  synced?: boolean;
}

const tasksList = ref<HTMLElement | null>(null);
const newTask = ref<string>(""); // Quick add input
const showDetailedAdd = ref<boolean>(false);
const detailedTitle = ref<string>("");
const detailedDescription = ref<string>("");
const detailedDate = ref<string>("");
const detailedTime = ref<string>("");

const tasksStore = useTasksStore();
const { loggedIn } = useUserSession();
const draggedTaskId = ref<number | null>(null);

const tasks = computed<Task[]>(() => tasksStore.tasks);
const hideCompleted = computed(() => tasksStore.hideCompleted);
const isLoggedIn = computed(() => loggedIn.value);
const syncStatus = computed(() =>
  tasksStore.syncQueue.length === 0 ? "All changes saved" : "Syncing..."
);

function addTask(taskTitle: string, taskDescription: string = "") {
  if (taskTitle.trim()) {
    tasksStore.addTask(taskTitle, taskDescription);
    newTask.value = "";
  }
}

function addDetailedTask() {
  if (detailedTitle.value.trim()) {
    tasksStore.addTask(
      detailedTitle.value,
      detailedDescription.value,
      detailedDate.value,
      detailedTime.value
    );
    detailedTitle.value = "";
    detailedDescription.value = "";
    detailedDate.value = "";
    detailedTime.value = "";
    showDetailedAdd.value = false;
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

  // Initialize the tasks store and sync with server if user is logged in
  tasksStore.initialize();

  // Set up an interval to process the sync queue periodically
  const syncInterval = setInterval(() => {
    if (isLoggedIn.value) {
      tasksStore.processSyncQueue();
    }
  }, 10000); // Check every 10 seconds

  // Clean up the interval when component is unmounted
  onUnmounted(() => {
    clearInterval(syncInterval);
  });
});

// Set today's date as default for new tasks
const todayDate = new Date().toISOString().split("T")[0];
detailedDate.value = todayDate;

// Format task date for display
function formatDate(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString();
}
</script>

<template>
  <div class="min-h-screen bg-base text-text pb-16">
    <!-- Quick add section -->
    <div class="flex justify-between items-end mb-4">
      <div class="flex gap-2">
        <input
          v-model="newTask"
          @keyup.enter="addTask(newTask)"
          placeholder="Task title"
          class="bg-surface ring p-2 ring-foam/10 border-3 border-transparent focus:border-foam/60 transition duration-200 outline-none rounded-xl placeholder-subtle placeholder:italic w-full"
        />
        <button
          @click="addTask(newTask)"
          class="px-6 py-3 bg-surface hover:bg-overlay rounded-xl font-medium flex items-center gap-2 cursor-pointer transition duration-200"
        >
          <PlusIcon class="size-5" />
        </button>
      </div>
      <div class="flex items-center gap-4">
        <!-- Sync status indicator (only shown when logged in) -->
        <div v-if="isLoggedIn" class="text-sm text-subtle italic">
          {{ syncStatus }}
        </div>
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
    </div>

    <!-- Tasks list -->
    <ul ref="tasksList" class="mx-auto">
      <li
        v-for="task in filteredTasks"
        :key="task.id"
        class="flex items-center justify-between p-4 border-b border-surface bg-surface rounded-xl mb-1 transition duration-200 cursor-pointer hover:bg-overlay"
        :class="{
          'is-dragging': draggedTaskId === task.id,
          'shadow-md': draggedTaskId === task.id,
          'border-l-4 border-l-rose': !task.synced && isLoggedIn,
        }"
        @dragover="onDragOver($event)"
        @drop="onDrop($event, task.id)"
        @click="toggleComplete(task.id)"
      >
        <div class="flex items-center gap-x-2 mr-2">
          <CheckCircleIcon
            @click="toggleComplete(task.id)"
            class="size-6 cursor-pointer transition duration-200"
            :class="task.completed ? 'text-foam' : 'text-subtle'"
          />
          <div class="flex flex-col">
            <span
              :class="{ 'line-through': task.completed }"
              class="text-text transition duration-200 font-semibold"
            >
              {{ task.title }}
            </span>
            <p
              :class="{ 'line-through': task.completed }"
              class="transition duration-200 italic font-serif text-subtle break-all"
            >
              {{ task.description }}
            </p>
            <!-- Task date and time if present -->
            <div
              v-if="task.date || task.time"
              class="flex gap-2 mt-1 text-xs text-subtle"
            >
              <div v-if="task.date" class="flex items-center gap-1">
                <CalendarIcon class="size-3" />
                <span>{{ formatDate(task.date) }}</span>
              </div>
              <div v-if="task.time" class="flex items-center gap-1">
                <ClockIcon class="size-3" />
                <span>{{ task.time }}</span>
              </div>
            </div>
          </div>
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

    <!-- Detailed add task modal -->
    <div v-auto-animate="{ origin: 'top' }" class="fixed bottom-4 right-4">
      <div
        v-if="showDetailedAdd"
        class="absolute bottom-18 right-4 flex items-center justify-center"
      >
        <div
          class="bg-linear-to-tl from-rose via-iris to-foam rounded-xl w-80 p-0.5"
        >
          <div class="bg-surface p-6 rounded-xl w-full">
            <h2 class="text-xl font-semibold mb-4">Add Detailed Task</h2>
            <input
              v-model="detailedTitle"
              type="text"
              placeholder="Task Title"
              class="mb-3 bg-overlay ring p-2 ring-foam/10 border-3 border-transparent focus:border-foam/60 transition duration-200 outline-none rounded-xl placeholder-subtle placeholder:italic w-full"
            />
            <textarea
              v-model="detailedDescription"
              placeholder="Task Description"
              class="mb-3 bg-overlay ring p-2 ring-foam/10 border-3 border-transparent focus:border-foam/60 transition duration-200 outline-none rounded-xl placeholder-subtle placeholder:italic w-full"
            ></textarea>

            <!-- Date field -->
            <div class="flex items-center gap-2 mb-3">
              <CalendarIcon class="size-5 text-subtle" />
              <input
                v-model="detailedDate"
                type="date"
                class="bg-overlay ring p-2 ring-foam/10 border-3 border-transparent focus:border-foam/60 transition duration-200 outline-none rounded-xl w-full"
              />
            </div>

            <!-- Time field -->
            <div class="flex items-center gap-2 mb-3">
              <ClockIcon class="size-5 text-subtle" />
              <input
                v-model="detailedTime"
                type="time"
                class="bg-overlay ring p-2 ring-foam/10 border-3 border-transparent focus:border-foam/60 transition duration-200 outline-none rounded-xl w-full"
              />
            </div>

            <div class="flex justify-end gap-2">
              <button
                @click="showDetailedAdd = false"
                class="px-4 py-2 rounded-xl bg-overlay hover:bg-overlay/80 text-text cursor-pointer"
              >
                Cancel
              </button>
              <button
                @click="addDetailedTask"
                class="px-4 py-2 rounded-xl bg-overlay hover:bg-overlay/80 text-text cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- bottom right detailed add button -->
      <div class="absolute bottom-4 right-4">
        <button
          @click="showDetailedAdd = !showDetailedAdd"
          class="size-12 bg-linear-to-br from-rose via-iris to-foam text-surface rounded-xl p-2 flex items-center justify-center cursor-pointer transition duration-200 active:scale-90 hover:scale-105"
        >
          <PlusIcon
            class="size-6 transition duration-500"
            :class="showDetailedAdd ? 'rotate-135' : 'rotate-0'"
          />
        </button>
      </div>
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
  touch-action: none;
}
</style>
