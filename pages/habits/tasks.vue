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
  CheckCircleIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/vue/24/solid";

definePageMeta({
  title: "Task Tracker",
  description:
    "Track and build positive habits with powerful habit-forming techniques.",
});

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
  e.dataTransfer.setData("text/plain", id.toString());

  // Get the specific list item being dragged
  const liElement = e.currentTarget as HTMLElement;
  if (liElement) {
    // Create a more precise drag image
    const rect = liElement.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    // Apply the dragging class only to this element
    liElement.classList.add("is-dragging");

    // Set the drag image to this specific element
    e.dataTransfer.setDragImage(liElement, offsetX, offsetY);
  }
}

function onDragEnd(e: DragEvent) {
  // Clear only the specific dragged element
  const liElement = e.currentTarget as HTMLElement;
  if (liElement) {
    liElement.classList.remove("is-dragging");
  }

  // Reset the dragged task ID
  draggedTaskId.value = null;

  // Remove drop-target class from all elements
  document.querySelectorAll(".drop-target").forEach((el) => {
    el.classList.remove("drop-target");
  });
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
  if (!e.dataTransfer) return;

  e.dataTransfer.dropEffect = "move";

  // Get the current target
  const liElement = e.currentTarget as HTMLElement;

  // Make sure we're not highlighting the element being dragged
  if (liElement && !liElement.classList.contains("is-dragging")) {
    // Remove highlight from all other elements first
    document.querySelectorAll(".drop-target").forEach((el) => {
      el.classList.remove("drop-target");
    });

    // Only add the drop-target class to the current element
    liElement.classList.add("drop-target");
  }
}

function onDrop(e: DragEvent, targetId: number) {
  e.preventDefault();

  // Get the drop target element
  const liElement = e.currentTarget as HTMLElement;

  // Remove the drop-target class
  liElement.classList.remove("drop-target");

  // Clean up any other elements that might have the drop-target class
  document.querySelectorAll(".drop-target").forEach((el) => {
    el.classList.remove("drop-target");
  });

  // Get the dragged task ID and ensure it's different from the target
  const draggedId = draggedTaskId.value;
  if (draggedId === null || draggedId === targetId) return;

  // Find the indexes for reordering
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
  <div class="bg-base pb-16 min-h-screen text-text">
    <!-- Quick add section -->
    <div class="flex justify-between items-end mb-4">
      <div>
        <h1 class="mb-2 font-bold text-2xl">Task Tracker</h1>
        <div class="flex gap-2">
          <input
            v-model="newTask"
            @keyup.enter="addTask(newTask)"
            placeholder="Task title"
            class="bg-surface p-2 border-3 focus:border-foam/60 border-transparent rounded-xl outline-none ring ring-foam/10 w-full placeholder:italic transition duration-200 placeholder-subtle"
          />
          <button
            @click="addTask(newTask)"
            class="flex items-center gap-2 bg-surface hover:bg-overlay px-6 py-3 rounded-xl font-medium transition duration-200 cursor-pointer"
          >
            <PlusIcon class="size-5" />
          </button>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <!-- Sync status indicator (only shown when logged in) -->
        <div v-if="isLoggedIn" class="text-subtle text-sm italic">
          {{ syncStatus }}
        </div>
        <button
          @click="toggleHideCompleted"
          class="flex items-center space-x-2 hover:bg-surface px-4 py-2 rounded-xl font-semibold text-subtle hover:text-text whitespace-nowrap transition duration-200 cursor-pointer"
        >
          <div class="inline-block mr-2" v-auto-animate>
            <EyeIcon v-if="!hideCompleted" class="mt-0.5 size-6" />
            <EyeSlashIcon v-else class="mt-0.5 size-6" />
          </div>
          Completed
        </button>
        <!-- bottom right detailed add button -->
        <div>
          <button
            @click="showDetailedAdd = !showDetailedAdd"
            class="flex justify-center items-center bg-linear-to-br from-rose via-iris to-foam p-2 rounded-xl size-12 text-surface hover:scale-105 active:scale-90 transition duration-200 cursor-pointer"
          >
            <PlusIcon
              class="size-6 transition duration-500"
              :class="showDetailedAdd ? 'rotate-135' : 'rotate-0'"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Detailed add task modal -->
    <div v-auto-animate class="relative">
      <div v-if="showDetailedAdd" class="flex justify-center items-center">
        <div
          class="bg-linear-to-tl from-rose via-iris to-foam p-0.5 rounded-xl w-full"
        >
          <div class="bg-base p-6 rounded-xl w-full">
            <h2 class="mb-4 font-semibold text-xl">Add Detailed Task</h2>
            <input
              v-model="detailedTitle"
              type="text"
              placeholder="Task Title"
              class="bg-surface mb-3 p-2 border-3 focus:border-foam/60 border-transparent rounded-xl outline-none ring ring-foam/10 w-full placeholder:italic transition duration-200 placeholder-subtle"
            />
            <textarea
              v-model="detailedDescription"
              placeholder="Task Description"
              class="bg-surface mb-3 p-2 border-3 focus:border-foam/60 border-transparent rounded-xl outline-none ring ring-foam/10 w-full placeholder:italic transition duration-200 placeholder-subtle"
            ></textarea>

            <!-- Date field -->
            <div class="flex items-center gap-2 mb-3">
              <CalendarIcon class="size-5 text-subtle" />
              <input
                v-model="detailedDate"
                type="date"
                class="bg-surface p-2 border-3 focus:border-foam/60 border-transparent rounded-xl outline-none ring ring-foam/10 w-full transition duration-200"
              />
            </div>

            <!-- Time field -->
            <div class="flex items-center gap-2 mb-3">
              <ClockIcon class="size-5 text-subtle" />
              <input
                v-model="detailedTime"
                type="time"
                class="bg-surface p-2 border-3 focus:border-foam/60 border-transparent rounded-xl outline-none ring ring-foam/10 w-full transition duration-200"
              />
            </div>

            <div class="flex justify-end gap-2">
              <button
                @click="showDetailedAdd = false"
                class="bg-surface hover:bg-overlay px-4 py-2 rounded-xl text-text cursor-pointer"
              >
                Cancel
              </button>
              <button
                @click="addDetailedTask"
                class="bg-surface hover:bg-overlay px-4 py-2 rounded-xl text-text cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tasks list -->
    <h2 class="mt-2 mb-2 pb-2 border-surface border-b font-semibold text-xl">
      Current Tasks
    </h2>
    <ul ref="tasksList" class="mx-auto">
      <li
        v-for="task in filteredTasks"
        v-if="filteredTasks.length != 0"
        :key="task.id"
        class="group flex justify-between items-center mb-1 p-4 border-surface border-b rounded-xl transition duration-200 cursor-pointer"
        :class="{
          'is-dragging shadow-md': draggedTaskId === task.id,
          'border-l-4 border-l-rose': !task.synced && isLoggedIn,
          [task.completed ? 'bg-surface/60' : 'bg-surface']: true,
        }"
        @dragover="onDragOver($event)"
        @drop="onDrop($event, task.id)"
        draggable="true"
        @dragstart="onDragStart($event, task.id)"
        @dragend="onDragEnd($event)"
      >
        <div class="flex items-center gap-x-2 mr-2">
          <CheckCircleIcon
            @click="toggleComplete(task.id)"
            class="size-6 transition duration-200 cursor-pointer"
            :class="task.completed ? 'text-foam' : 'text-subtle'"
          />
          <div class="flex flex-col">
            <span
              :class="{ 'line-through': task.completed }"
              class="font-semibold text-text transition duration-200"
            >
              {{ task.title }}
            </span>
            <p
              :class="{ 'line-through': task.completed }"
              class="font-serif text-subtle break-all italic transition duration-200"
            >
              {{ task.description }}
            </p>
            <!-- Task date and time if present -->
            <div
              v-if="task.date || task.time"
              class="flex gap-2 mt-1 text-subtle text-xs"
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
        <div class="flex items-center gap-2">
          <!-- Drag handle -->
          <div
            class="p-1 rounded text-subtle hover:text-text active:text-foam transition duration-200 cursor-grab active:cursor-grabbing drag-handle"
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
            class="text-subtle hover:text-love transition duration-200 cursor-pointer"
          >
            <BackspaceIcon class="size-5" />
          </button>
        </div>
        <div
          class="absolute inset-0 bg-linear-to-r from-rose via-iris to-foam rounded-xl transition-opacity duration-300 pointer-events-none"
          :class="{
            'opacity-0 group-hover:opacity-10': draggedTaskId === null,
            'opacity-0': draggedTaskId !== null,
          }"
        ></div>
      </li>
      <li v-else class="mt-4 text-subtle text-center italic">
        No tasks found. Add a new task to get started!
      </li>
    </ul>
  </div>
</template>

<style scoped>
.drop-target {
  border-bottom: 3px solid var(--color-foam);
  background-color: var(--color-overlay);
}

.drag-handle {
  touch-action: none;
}

.is-dragging {
  opacity: 0.7;
  background-color: var(--color-overlay);
  z-index: 10;
  position: relative;
}

/* Make sure list items have position relative for proper drag handling */
li {
  position: relative;
}
</style>
