// stores/goals.ts
import { defineStore } from "pinia";

export interface Goal {
  id: number;
  title: string;
  description: string;
  category: "short" | "long" | "life";
  targetDate?: string;
  completed: boolean;
  createdAt: string;
  synced?: boolean; // Track if synced with server
  serverId?: number; // Server-side ID
}

export const useGoalsStore = defineStore("goals", {
  state: () => ({
    goals: [] as Goal[],
    nextId: 1,
    isInitialized: false,
    syncQueue: [] as number[], // IDs of goals to sync
  }),
  getters: {
    isLoggedIn() {
      try {
        const { loggedIn } = useUserSession();
        return loggedIn.value;
      } catch (error) {
        console.error("Error accessing user session:", error);
        return false;
      }
    },
    shortTermGoals(state) {
      return state.goals.filter((goal) => goal.category === "short");
    },
    longTermGoals(state) {
      return state.goals.filter((goal) => goal.category === "long");
    },
    lifeGoals(state) {
      return state.goals.filter((goal) => goal.category === "life");
    },
  },
  actions: {
    // Initialize store and load data
    async initialize() {
      if (this.isInitialized) return;

      // Try to load from localStorage first (for backward compatibility)
      const storedGoals = localStorage.getItem("goals");
      if (storedGoals) {
        try {
          const parsedGoals = JSON.parse(storedGoals) as Goal[];
          // Find the highest ID to set nextId correctly
          let highestId = -1;
          parsedGoals.forEach((goal) => {
            if (goal.id > highestId) {
              highestId = goal.id;
            }
            // Mark as not synced since it's from localStorage
            goal.synced = false;
          });
          this.nextId = highestId + 1;
          this.goals = parsedGoals;
        } catch (error) {
          console.error("Error parsing goals from localStorage:", error);
        }
      }

      // If logged in, sync with server
      if (this.isLoggedIn) {
        await this.fetchGoalsFromServer();
      }

      this.isInitialized = true;
    },

    // Fetch goals from server
    async fetchGoalsFromServer() {
      try {
        const response = await fetch("/api/goals");

        if (!response.ok) {
          throw new Error("Failed to fetch goals");
        }

        const data = await response.json();

        if (data.success && data.goals) {
          // Find the highest ID to set nextId correctly
          let highestId = -1;

          data.goals.forEach((goal: Goal) => {
            if (goal.id > highestId) {
              highestId = goal.id;
            }
          });

          this.nextId = highestId + 1;
          this.goals = data.goals;

          // Clean up localStorage once data is successfully fetched from server
          localStorage.removeItem("goals");
        }
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    },

    // Save goal to server
    async saveGoalToServer(goal: Goal) {
      try {
        const { loggedIn } = useUserSession();

        if (!loggedIn.value) return;

        const response = await fetch("/api/goals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(goal),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to save goal: ${errorText}`);
        }

        const data = await response.json();

        if (data.success) {
          // Update the goal with server ID and mark as synced
          const index = this.goals.findIndex((g) => g.id === goal.id);
          if (index !== -1) {
            this.goals[index].synced = true;
            this.goals[index].serverId = data.goalId;
          }
        }
      } catch (error) {
        console.error("Detailed error saving goal:", error);
        // Add to sync queue for retry
        if (!this.syncQueue.includes(goal.id)) {
          this.syncQueue.push(goal.id);
        }
      }
    },

    // Update goal on server
    async updateGoalOnServer(goal: Goal) {
      try {
        const { loggedIn } = useUserSession();
        if (!loggedIn.value) return;

        const response = await fetch(`/api/goals/${goal.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(goal),
        });

        if (!response.ok) {
          throw new Error("Failed to update goal");
        }

        // Mark goal as synced
        const index = this.goals.findIndex((g) => g.id === goal.id);
        if (index !== -1) {
          this.goals[index].synced = true;
        }
      } catch (error) {
        console.error("Error updating goal:", error);
        // Add to sync queue for retry
        if (!this.syncQueue.includes(goal.id)) {
          this.syncQueue.push(goal.id);
        }
      }
    },

    // Delete goal from server
    async deleteGoalFromServer(id: number) {
      try {
        const { loggedIn } = useUserSession();
        if (!loggedIn.value) return;

        const response = await fetch(`/api/goals/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete goal");
        }
      } catch (error) {
        console.error("Error deleting goal:", error);
      }
    },

    // Process sync queue
    async processSyncQueue() {
      try {
        const { loggedIn } = useUserSession();
        if (!loggedIn.value || this.syncQueue.length === 0) return;

        const queueCopy = [...this.syncQueue];
        this.syncQueue = [];

        for (const id of queueCopy) {
          const goal = this.goals.find((g) => g.id === id);
          if (goal) {
            if (goal.synced) {
              // Goal has been synced before, update it
              await this.updateGoalOnServer(goal);
            } else {
              // Goal has not been synced, save it
              await this.saveGoalToServer(goal);
            }
          }
        }
      } catch (error) {
        console.error("Error processing sync queue:", error);
      }
    },

    // Add a new goal
    async addGoal(
      title: string,
      description: string = "",
      category: "short" | "long" | "life" = "short",
      targetDate?: string
    ) {
      if (!title.trim()) return;

      const now = new Date().toISOString();

      const newGoal: Goal = {
        id: this.nextId++,
        title,
        description,
        category,
        targetDate,
        completed: false,
        createdAt: now,
        synced: false,
      };

      this.goals.push(newGoal);
      this.persistToLocalStorage();

      try {
        const { loggedIn } = useUserSession();
        if (loggedIn.value) {
          await this.saveGoalToServer(newGoal);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    },

    // Update an existing goal
    async updateGoal(id: number, updates: Partial<Goal>) {
      const index = this.goals.findIndex((goal) => goal.id === id);
      if (index !== -1) {
        this.goals[index] = { ...this.goals[index], ...updates };
        this.persistToLocalStorage();

        try {
          const { loggedIn } = useUserSession();
          if (loggedIn.value) {
            await this.updateGoalOnServer(this.goals[index]);
          }
        } catch (error) {
          console.error("Error checking login status:", error);
        }
      }
    },

    // Toggle goal completion
    async toggleComplete(id: number) {
      const index = this.goals.findIndex((goal) => goal.id === id);
      if (index !== -1) {
        this.goals[index].completed = !this.goals[index].completed;
        this.persistToLocalStorage();

        try {
          const { loggedIn } = useUserSession();
          if (loggedIn.value) {
            await this.updateGoalOnServer(this.goals[index]);
          }
        } catch (error) {
          console.error("Error checking login status:", error);
        }
      }
    },

    // Delete a goal
    async deleteGoal(id: number) {
      const goalToRemove = this.goals.find((goal) => goal.id === id);
      this.goals = this.goals.filter((goal) => goal.id !== id);
      this.persistToLocalStorage();

      try {
        const { loggedIn } = useUserSession();
        if (loggedIn.value && goalToRemove?.synced) {
          await this.deleteGoalFromServer(id);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    },

    // Persist data to localStorage (for offline use)
    persistToLocalStorage() {
      try {
        localStorage.setItem("goals", JSON.stringify(this.goals));
      } catch (error) {
        console.error("Error saving goals to localStorage:", error);
      }
    },
  },
  persist: true,
});
