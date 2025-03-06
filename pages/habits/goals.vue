<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  CheckCircleIcon,
} from "@heroicons/vue/24/solid";
import autoAnimate from "@formkit/auto-animate";
import { useGoalsStore } from "@/stores/goals";

definePageMeta({
  title: "Goal Tracker",
  description:
    "Set and track your short and long-term goals for better habit building.",
});

const goalsStore = useGoalsStore();
const goalsList = ref<HTMLElement | null>(null);
const newGoalTitle = ref("");
const newGoalDescription = ref("");
const newGoalCategory = ref<"short" | "long" | "life">("short");
const newGoalDate = ref("");
const showAddGoalForm = ref(false);
const editingGoalId = ref<number | null>(null);

// Initialize goals store when component mounts
onMounted(async () => {
  await goalsStore.initialize();

  if (goalsList.value) {
    autoAnimate(goalsList.value);
  }
});

// Computed properties for filtered goals
const shortTermGoals = computed(() => goalsStore.shortTermGoals);
const longTermGoals = computed(() => goalsStore.longTermGoals);
const lifeGoals = computed(() => goalsStore.lifeGoals);

// Add a new goal
function addGoal() {
  if (!newGoalTitle.value.trim()) return;

  if (editingGoalId.value !== null) {
    // Editing existing goal
    goalsStore.updateGoal(editingGoalId.value, {
      title: newGoalTitle.value,
      description: newGoalDescription.value,
      category: newGoalCategory.value,
      targetDate: newGoalDate.value || undefined,
    });
    editingGoalId.value = null;
  } else {
    // Adding new goal
    goalsStore.addGoal(
      newGoalTitle.value,
      newGoalDescription.value,
      newGoalCategory.value,
      newGoalDate.value || undefined
    );
  }

  // Reset form
  newGoalTitle.value = "";
  newGoalDescription.value = "";
  newGoalCategory.value = "short";
  newGoalDate.value = "";
  showAddGoalForm.value = false;
}

// Edit a goal
function editGoal(goal: any) {
  editingGoalId.value = goal.id;
  newGoalTitle.value = goal.title;
  newGoalDescription.value = goal.description;
  newGoalCategory.value = goal.category;
  newGoalDate.value = goal.targetDate || "";
  showAddGoalForm.value = true;
}

// Delete a goal
function deleteGoal(id: number) {
  goalsStore.deleteGoal(id);
}

// Toggle goal completion
function toggleComplete(id: number) {
  goalsStore.toggleComplete(id);
}

// Format date for display
function formatDate(dateString?: string) {
  if (!dateString) return "No target date";
  const date = new Date(dateString);
  return date.toLocaleDateString();
}
</script>

<template>
  <div class="bg-base pb-16 min-h-screen text-text">
    <div v-auto-animate>
      <div class="flex justify-between items-center mb-6">
        <h1 class="font-bold text-2xl">Goal Tracker</h1>
        <button
          @click="showAddGoalForm = !showAddGoalForm"
          class="flex justify-center items-center bg-linear-to-br from-rose via-iris to-foam p-2 rounded-xl size-12 text-surface hover:scale-105 active:scale-90 transition duration-200 cursor-pointer"
        >
          <PlusIcon
            class="size-6 transition duration-500"
            :class="showAddGoalForm ? 'rotate-135' : 'rotate-0'"
          />
        </button>
      </div>

      <!-- Add/Edit Goal Form -->
      <div v-if="showAddGoalForm" class="bg-surface p-6 rounded-xl">
        <h2 class="mb-4 font-semibold text-xl">
          {{ editingGoalId !== null ? "Edit Goal" : "Add New Goal" }}
        </h2>
        <div class="space-y-4">
          <div>
            <label class="block mb-1 font-medium text-sm">Goal Title</label>
            <input
              v-model="newGoalTitle"
              type="text"
              placeholder="What do you want to achieve?"
              class="bg-overlay p-2 border-3 focus:border-foam/60 border-transparent rounded-xl outline-none ring ring-foam/10 w-full placeholder:italic transition duration-200 placeholder-subtle"
            />
          </div>

          <div>
            <label class="block mb-1 font-medium text-sm">Description</label>
            <textarea
              v-model="newGoalDescription"
              placeholder="Describe your goal in detail..."
              class="bg-overlay p-2 border-3 focus:border-foam/60 border-transparent rounded-xl outline-none ring ring-foam/10 w-full placeholder:italic transition duration-200 placeholder-subtle"
              rows="3"
            ></textarea>
          </div>

          <div class="flex gap-6">
            <div class="flex-1">
              <label class="block mb-1 font-medium text-sm"
                >Goal Category</label
              >
              <select
                v-model="newGoalCategory"
                class="bg-overlay p-2 border-3 focus:border-foam/60 border-transparent rounded-xl outline-none ring ring-foam/10 w-full transition duration-200"
              >
                <option value="short">Short-Term (1-30 days)</option>
                <option value="long">Long-Term (1-12 months)</option>
                <option value="life">Life Goal (1+ years)</option>
              </select>
            </div>

            <div class="flex-1">
              <label class="block mb-1 font-medium text-sm"
                >Target Date (Optional)</label
              >
              <input
                v-model="newGoalDate"
                type="date"
                class="bg-overlay p-2 border-3 focus:border-foam/60 border-transparent rounded-xl outline-none ring ring-foam/10 w-full transition duration-200"
              />
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-2">
            <button
              @click="
                showAddGoalForm = false;
                editingGoalId = null;
              "
              class="bg-overlay hover:bg-overlay/80 px-4 py-2 rounded-xl text-text cursor-pointer"
            >
              Cancel
            </button>
            <button
              @click="addGoal"
              class="bg-foam px-4 py-2 rounded-xl text-base cursor-pointer"
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
        <h2 class="mb-3 pb-2 border-surface border-b font-semibold text-xl">
          Short-Term Goals
        </h2>
        <p class="mb-4 text-subtle italic" v-if="shortTermGoals.length === 0">
          No short-term goals yet. Add one to get started!
        </p>

        <div class="space-y-2">
          <div
            v-for="goal in shortTermGoals"
            :key="goal.id"
            class="flex justify-between items-start bg-surface hover:bg-overlay p-4 border-surface border-b rounded-xl transition duration-200"
            :class="{ 'opacity-60': goal.completed }"
          >
            <div class="flex items-start gap-3">
              <button @click="toggleComplete(goal.id)" class="mt-1">
                <CheckCircleIcon
                  class="size-6 transition duration-200 cursor-pointer"
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
                  class="mt-1 text-subtle text-sm"
                  :class="{ 'line-through': goal.completed }"
                >
                  {{ goal.description }}
                </p>
                <div class="mt-2 text-subtle text-xs">
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
        <h2 class="mb-3 pb-2 border-surface border-b font-semibold text-xl">
          Long-Term Goals
        </h2>
        <p class="mb-4 text-subtle italic" v-if="longTermGoals.length === 0">
          No long-term goals yet. Think about what you want to achieve this
          year!
        </p>

        <div class="space-y-2">
          <div
            v-for="goal in longTermGoals"
            :key="goal.id"
            class="flex justify-between items-start bg-surface hover:bg-overlay p-4 border-surface border-b rounded-xl transition duration-200"
            :class="{ 'opacity-60': goal.completed }"
          >
            <div class="flex items-start gap-3">
              <button @click="toggleComplete(goal.id)" class="mt-1">
                <CheckCircleIcon
                  class="size-6 transition duration-200 cursor-pointer"
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
                  class="mt-1 text-subtle text-sm"
                  :class="{ 'line-through': goal.completed }"
                >
                  {{ goal.description }}
                </p>
                <div class="mt-2 text-subtle text-xs">
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
        <h2 class="mb-3 pb-2 border-surface border-b font-semibold text-xl">
          Life Goals
        </h2>
        <p class="mb-4 text-subtle italic" v-if="lifeGoals.length === 0">
          No life goals yet. What legacy do you want to build?
        </p>

        <div class="space-y-2">
          <div
            v-for="goal in lifeGoals"
            :key="goal.id"
            class="flex justify-between items-start bg-surface hover:bg-overlay p-4 border-surface border-b rounded-xl transition duration-200"
            :class="{ 'opacity-60': goal.completed }"
          >
            <div class="flex items-start gap-3">
              <button @click="toggleComplete(goal.id)" class="mt-1">
                <CheckCircleIcon
                  class="size-6 transition duration-200 cursor-pointer"
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
                  class="mt-1 text-subtle text-sm"
                  :class="{ 'line-through': goal.completed }"
                >
                  {{ goal.description }}
                </p>
                <div class="mt-2 text-subtle text-xs">
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
