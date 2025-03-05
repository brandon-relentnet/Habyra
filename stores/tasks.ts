// store/tasks.ts
import { defineStore } from "pinia";

export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  favorited: boolean;
  date?: string; // YYYY-MM-DD format
  time?: string; // HH:MM format
  synced?: boolean; // Track if synced with server
  serverId?: number; // Server-side ID
}

export const useTasksStore = defineStore("tasks", {
  state: () => ({
    tasks: [] as Task[],
    nextId: 0,
    hideCompleted: false,
    isInitialized: false,
    syncQueue: [] as number[], // IDs of tasks to sync
  }),
  getters: {
    isLoggedIn() {
      // Move useUserSession inside the getter function
      try {
        const { loggedIn } = useUserSession();
        return loggedIn.value;
      } catch (error) {
        console.error("Error accessing user session:", error);
        return false;
      }
    },
  },
  actions: {
    // Initialize store and sync with server if user is logged in
    async initialize() {
      if (this.isInitialized) return;

      this.isInitialized = true;

      if (this.isLoggedIn) {
        await this.fetchTasksFromServer();
      }
    },

    // Fetch tasks from server
    async fetchTasksFromServer() {
      try {
        const response = await fetch("/api/tasks");

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await response.json();

        if (data.success && data.tasks) {
          // Find the highest ID to set nextId correctly
          let highestId = -1;

          data.tasks.forEach((task: Task) => {
            if (task.id > highestId) {
              highestId = task.id;
            }
          });

          this.nextId = highestId + 1;
          this.tasks = data.tasks;
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    },

    // Save task to server
    async saveTaskToServer(task: Task) {
      // Check login status inside the function, not at the top level
      try {
        const { loggedIn } = useUserSession();
        if (!loggedIn.value) return;

        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(task),
        });

        if (!response.ok) {
          throw new Error("Failed to save task");
        }

        const data = await response.json();

        if (data.success) {
          // Update the task with server ID and mark as synced
          const index = this.tasks.findIndex((t) => t.id === task.id);
          if (index !== -1) {
            this.tasks[index].synced = true;
            this.tasks[index].serverId = data.taskId;
          }
        }
      } catch (error) {
        console.error("Error saving task:", error);
        // Add to sync queue for retry
        if (!this.syncQueue.includes(task.id)) {
          this.syncQueue.push(task.id);
        }
      }
    },

    // Update task on server
    async updateTaskOnServer(task: Task) {
      try {
        const { loggedIn } = useUserSession();
        if (!loggedIn.value) return;

        const response = await fetch(`/api/tasks/${task.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(task),
        });

        if (!response.ok) {
          throw new Error("Failed to update task");
        }

        // Mark task as synced
        const index = this.tasks.findIndex((t) => t.id === task.id);
        if (index !== -1) {
          this.tasks[index].synced = true;
        }
      } catch (error) {
        console.error("Error updating task:", error);
        // Add to sync queue for retry
        if (!this.syncQueue.includes(task.id)) {
          this.syncQueue.push(task.id);
        }
      }
    },

    // Delete task from server
    async deleteTaskFromServer(id: number) {
      try {
        const { loggedIn } = useUserSession();
        if (!loggedIn.value) return;

        const response = await fetch(`/api/tasks/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete task");
        }
      } catch (error) {
        console.error("Error deleting task:", error);
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
          const task = this.tasks.find((t) => t.id === id);
          if (task) {
            if (task.synced) {
              // Task has been synced before, update it
              await this.updateTaskOnServer(task);
            } else {
              // Task has not been synced, save it
              await this.saveTaskToServer(task);
            }
          }
        }
      } catch (error) {
        console.error("Error processing sync queue:", error);
      }
    },

    // Add task
    async addTask(
      taskTitle: string,
      taskDescription: string = "",
      taskDate?: string,
      taskTime?: string
    ) {
      if (!taskTitle.trim()) return;

      const newTask: Task = {
        id: this.nextId++,
        title: taskTitle,
        description: taskDescription,
        completed: false,
        favorited: false,
        date: taskDate,
        time: taskTime,
        synced: false,
      };

      this.tasks.push(newTask);

      try {
        const { loggedIn } = useUserSession();
        if (loggedIn.value) {
          await this.saveTaskToServer(newTask);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    },

    // Toggle completion status
    async toggleComplete(id: number) {
      const index = this.tasks.findIndex((task) => task.id === id);
      if (index !== -1) {
        this.tasks[index].completed = !this.tasks[index].completed;

        try {
          const { loggedIn } = useUserSession();
          if (loggedIn.value) {
            await this.updateTaskOnServer(this.tasks[index]);
          }
        } catch (error) {
          console.error("Error checking login status:", error);
        }
      }
    },

    // Toggle favorite status
    async toggleFavorite(id: number) {
      const index = this.tasks.findIndex((task) => task.id === id);
      if (index !== -1) {
        this.tasks[index].favorited = !this.tasks[index].favorited;

        try {
          const { loggedIn } = useUserSession();
          if (loggedIn.value) {
            await this.updateTaskOnServer(this.tasks[index]);
          }
        } catch (error) {
          console.error("Error checking login status:", error);
        }
      }
    },

    // Remove task
    async removeTask(id: number) {
      const taskToRemove = this.tasks.find((task) => task.id === id);
      this.tasks = this.tasks.filter((task) => task.id !== id);

      try {
        const { loggedIn } = useUserSession();
        if (loggedIn.value && taskToRemove?.synced) {
          await this.deleteTaskFromServer(id);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    },

    // Clear completed tasks
    async clearCompleted() {
      const completedTasks = this.tasks.filter((task) => task.completed);
      this.tasks = this.tasks.filter((task) => !task.completed);

      try {
        const { loggedIn } = useUserSession();
        if (loggedIn.value) {
          for (const task of completedTasks) {
            if (task.synced) {
              await this.deleteTaskFromServer(task.id);
            }
          }
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    },

    // Clear all tasks
    async clearAll() {
      const allTasks = [...this.tasks];
      this.tasks = [];
      this.nextId = 0;

      try {
        const { loggedIn } = useUserSession();
        if (loggedIn.value) {
          for (const task of allTasks) {
            if (task.synced) {
              await this.deleteTaskFromServer(task.id);
            }
          }
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    },

    // Reorder tasks
    async reorderTask(draggedId: number, targetIndex: number) {
      const draggedIndex = this.tasks.findIndex(
        (task) => task.id === draggedId
      );
      if (draggedIndex === -1) return;

      const [draggedTask] = this.tasks.splice(draggedIndex, 1);
      this.tasks.splice(targetIndex, 0, draggedTask);

      // For now, we don't sync task order to the server
      // This would require additional API endpoints and database changes
    },

    // Toggle hide completed tasks
    toggleHideCompleted() {
      this.hideCompleted = !this.hideCompleted;
    },

    // Update task
    async updateTask(id: number, updates: Partial<Task>) {
      const index = this.tasks.findIndex((task) => task.id === id);
      if (index !== -1) {
        this.tasks[index] = { ...this.tasks[index], ...updates };

        try {
          const { loggedIn } = useUserSession();
          if (loggedIn.value) {
            await this.updateTaskOnServer(this.tasks[index]);
          }
        } catch (error) {
          console.error("Error checking login status:", error);
        }
      }
    },
  },
  persist: true,
});
