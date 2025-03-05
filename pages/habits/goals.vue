<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  CheckCircleIcon,
} from "@heroicons/vue/24/solid";
import autoAnimate from "@formkit/auto-animate";

definePageMeta({
  title: "Goal Tracker",
  description:
    "Set and track your short and long-term goals for better habit building.",
  layout: "habits",
});

interface Goal {
  id: number;
  title: string;
  description: string;
  category: "short" | "long" | "life";
  targetDate?: string;
  completed: boolean;
  createdAt: string;
}

const goalsList = ref<HTMLElement | null>(null);
const newGoalTitle = ref("");
const newGoalDescription = ref("");
const newGoalCategory = ref<"short" | "long" | "life">("short");
const newGoalDate = ref("");
const showAddGoalForm = ref(false);
const editingGoalId = ref<number | null>(null);

// Goals data with local storage persistence
const goalsData = ref<Goal[]>(
  localStorage.getItem("goals")
    ? JSON.parse(localStorage.getItem("goals") || "[]")
    : []
);

// Computed properties for filtered goals
const shortTermGoals = computed(() =>
  goalsData.value.filter((goal) => goal.category === "short")
);

const longTermGoals = computed(() =>
  goalsData.value.filter((goal) => goal.category === "long")
);

const lifeGoals = computed(() =>
  goalsData.value.filter((goal) => goal.category === "life")
);

// Next ID for new goals
const nextId = computed(() => {
  const ids = goalsData.value.map((goal) => goal.id);
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
});

// Add a new goal
function addGoal() {
  if (!newGoalTitle.value.trim()) return;

  const now = new Date().toISOString();

  if (editingGoalId.value !== null) {
    // Editing existing goal
    const index = goalsData.value.findIndex(
      (g) => g.id === editingGoalId.value
    );
    if (index !== -1) {
      goalsData.value[index] = {
        ...goalsData.value[index],
        title: newGoalTitle.value,
        description: newGoalDescription.value,
        category: newGoalCategory.value,
        targetDate: newGoalDate.value || undefined,
      };
    }
    editingGoalId.value = null;
  } else {
    // Adding new goal
    goalsData.value.push({
      id: nextId.value,
      title: newGoalTitle.value,
      description: newGoalDescription.value,
      category: newGoalCategory.value,
      targetDate: newGoalDate.value || undefined,
      completed: false,
      createdAt: now,
    });
  }

  // Save to localStorage
  localStorage.setItem("goals", JSON.stringify(goalsData.value));

  // Reset form
  newGoalTitle.value = "";
  newGoalDescription.value = "";
  newGoalCategory.value = "short";
  newGoalDate.value = "";
  showAddGoalForm.value = false;
}

// Edit a goal
function editGoal(goal: Goal) {
  editingGoalId.value = goal.id;
  newGoalTitle.value = goal.title;
  newGoalDescription.value = goal.description;
  newGoalCategory.value = goal.category;
  newGoalDate.value = goal.targetDate || "";
  showAddGoalForm.value = true;
}

// Delete a goal
function deleteGoal(id: number) {
  goalsData.value = goalsData.value.filter((goal) => goal.id !== id);
  localStorage.setItem("goals", JSON.stringify(goalsData.value));
}

// Toggle goal completion
function toggleComplete(id: number) {
  const index = goalsData.value.findIndex((goal) => goal.id === id);
  if (index !== -1) {
    goalsData.value[index].completed = !goalsData.value[index].completed;
    localStorage.setItem("goals", JSON.stringify(goalsData.value));
  }
}

// Format date for display
function formatDate(dateString?: string) {
  if (!dateString) return "No target date";
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

onMounted(() => {
  if (goalsList.value) {
    autoAnimate(goalsList.value);
  }
});
</script>

<template>
  <div class="min-h-screen bg-base text-text pb-16">
    <div v-auto-animate>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Goal Tracker</h1>
        <button
          @click="showAddGoalForm = !showAddGoalForm"
          class="size-12 bg-linear-to-br from-rose via-iris to-foam text-surface rounded-xl p-2 flex items-center justify-center cursor-pointer transition duration-200 active:scale-90 hover:scale-105"
        >
          <PlusIcon
            class="size-6 transition duration-500"
            :class="showAddGoalForm ? 'rotate-135' : 'rotate-0'"
          />
        </button>
      </div>

      <!-- Add/Edit Goal Form -->
      <div v-if="showAddGoalForm" class="bg-surface p-6 rounded-xl">
        <h2 class="text-xl font-semibold mb-4">
          {{ editingGoalId !== null ? "Edit Goal" : "Add New Goal" }}
        </h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Goal Title</label>
            <input
              v-model="newGoalTitle"
              type="text"
              placeholder="What do you want to achieve?"
              class="bg-overlay ring p-2 ring-foam/10 border-3 border-transparent focus:border-foam/60 transition duration-200 outline-none rounded-xl placeholder-subtle placeholder:italic w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea
              v-model="newGoalDescription"
              placeholder="Describe your goal in detail..."
              class="bg-overlay ring p-2 ring-foam/10 border-3 border-transparent focus:border-foam/60 transition duration-200 outline-none rounded-xl placeholder-subtle placeholder:italic w-full"
              rows="3"
            ></textarea>
          </div>

          <div class="flex gap-6">
            <div class="flex-1">
              <label class="block text-sm font-medium mb-1"
                >Goal Category</label
              >
              <select
                v-model="newGoalCategory"
                class="bg-overlay ring p-2 ring-foam/10 border-3 border-transparent focus:border-foam/60 transition duration-200 outline-none rounded-xl w-full"
              >
                <option value="short">Short-Term (1-30 days)</option>
                <option value="long">Long-Term (1-12 months)</option>
                <option value="life">Life Goal (1+ years)</option>
              </select>
            </div>

            <div class="flex-1">
              <label class="block text-sm font-medium mb-1"
                >Target Date (Optional)</label
              >
              <input
                v-model="newGoalDate"
                type="date"
                class="bg-overlay ring p-2 ring-foam/10 border-3 border-transparent focus:border-foam/60 transition duration-200 outline-none rounded-xl w-full"
              />
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-2">
            <button
              @click="
                showAddGoalForm = false;
                editingGoalId = null;
              "
              class="px-4 py-2 rounded-xl bg-overlay hover:bg-overlay/80 text-text cursor-pointer"
            >
              Cancel
            </button>
            <button
              @click="addGoal"
              class="px-4 py-2 rounded-xl bg-foam text-base cursor-pointer"
            >
              {{ editingGoalId !== null ? "Update Goal" : "Add Goal" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Goals Lists -->
    <div ref="goalsList" class="space-y-10 mt-8">
      <!-- Short-Term Goals -->
      <div>
        <h2 class="text-xl font-semibold mb-3 border-b border-surface pb-2">
          Short-Term Goals
        </h2>
        <p class="text-subtle italic mb-4" v-if="shortTermGoals.length === 0">
          No short-term goals yet. Add one to get started!
        </p>

        <div class="space-y-2">
          <div
            v-for="goal in shortTermGoals"
            :key="goal.id"
            class="flex items-start justify-between p-4 border-b border-surface bg-surface rounded-xl transition duration-200 hover:bg-overlay"
            :class="{ 'opacity-60': goal.completed }"
          >
            <div class="flex items-start gap-3">
              <button @click="toggleComplete(goal.id)" class="mt-1">
                <CheckCircleIcon
                  class="size-6 cursor-pointer transition duration-200"
                  :class="goal.completed ? 'text-foam' : 'text-subtle'"
                />
              </button>
              <div>
                <h3
                  class="font-semibold transition duration-200"
                  :class="{ 'line-through': goal.completed }"
                >
                  {{ goal.title }}
                </h3>
                <p
                  class="text-subtle text-sm mt-1"
                  :class="{ 'line-through': goal.completed }"
                >
                  {{ goal.description }}
                </p>
                <div class="text-xs text-subtle mt-2">
                  Target: {{ formatDate(goal.targetDate) }}
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="editGoal(goal)"
                class="text-subtle hover:text-text transition duration-200"
              >
                <PencilSquareIcon class="size-5" />
              </button>
              <button
                @click="deleteGoal(goal.id)"
                class="text-subtle hover:text-love transition duration-200"
              >
                <TrashIcon class="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Long-Term Goals -->
      <div>
        <h2 class="text-xl font-semibold mb-3 border-b border-surface pb-2">
          Long-Term Goals
        </h2>
        <p class="text-subtle italic mb-4" v-if="longTermGoals.length === 0">
          No long-term goals yet. Think about what you want to achieve this
          year!
        </p>

        <div class="space-y-2">
          <div
            v-for="goal in longTermGoals"
            :key="goal.id"
            class="flex items-start justify-between p-4 border-b border-surface bg-surface rounded-xl transition duration-200 hover:bg-overlay"
            :class="{ 'opacity-60': goal.completed }"
          >
            <div class="flex items-start gap-3">
              <button @click="toggleComplete(goal.id)" class="mt-1">
                <CheckCircleIcon
                  class="size-6 cursor-pointer transition duration-200"
                  :class="goal.completed ? 'text-foam' : 'text-subtle'"
                />
              </button>
              <div>
                <h3
                  class="font-semibold transition duration-200"
                  :class="{ 'line-through': goal.completed }"
                >
                  {{ goal.title }}
                </h3>
                <p
                  class="text-subtle text-sm mt-1"
                  :class="{ 'line-through': goal.completed }"
                >
                  {{ goal.description }}
                </p>
                <div class="text-xs text-subtle mt-2">
                  Target: {{ formatDate(goal.targetDate) }}
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="editGoal(goal)"
                class="text-subtle hover:text-text transition duration-200"
              >
                <PencilSquareIcon class="size-5" />
              </button>
              <button
                @click="deleteGoal(goal.id)"
                class="text-subtle hover:text-love transition duration-200"
              >
                <TrashIcon class="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Life Goals -->
      <div>
        <h2 class="text-xl font-semibold mb-3 border-b border-surface pb-2">
          Life Goals
        </h2>
        <p class="text-subtle italic mb-4" v-if="lifeGoals.length === 0">
          No life goals yet. What legacy do you want to build?
        </p>

        <div class="space-y-2">
          <div
            v-for="goal in lifeGoals"
            :key="goal.id"
            class="flex items-start justify-between p-4 border-b border-surface bg-surface rounded-xl transition duration-200 hover:bg-overlay"
            :class="{ 'opacity-60': goal.completed }"
          >
            <div class="flex items-start gap-3">
              <button @click="toggleComplete(goal.id)" class="mt-1">
                <CheckCircleIcon
                  class="size-6 cursor-pointer transition duration-200"
                  :class="goal.completed ? 'text-foam' : 'text-subtle'"
                />
              </button>
              <div>
                <h3
                  class="font-semibold transition duration-200"
                  :class="{ 'line-through': goal.completed }"
                >
                  {{ goal.title }}
                </h3>
                <p
                  class="text-subtle text-sm mt-1"
                  :class="{ 'line-through': goal.completed }"
                >
                  {{ goal.description }}
                </p>
                <div class="text-xs text-subtle mt-2">
                  Target: {{ formatDate(goal.targetDate) }}
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="editGoal(goal)"
                class="text-subtle hover:text-text transition duration-200"
              >
                <PencilSquareIcon class="size-5" />
              </button>
              <button
                @click="deleteGoal(goal.id)"
                class="text-subtle hover:text-love transition duration-200"
              >
                <TrashIcon class="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
