// store/tasks.ts
import { defineStore } from "pinia";

let nextId = 0;

export const useTasksStore = defineStore("tasks", {
  state: () => ({
    tasks: [] as {
      id: number;
      title: string;
      completed: boolean;
      favorited: boolean;
    }[],
  }),
  actions: {
    addTask(task: string) {
      this.tasks.push({
        id: nextId++,
        title: task,
        completed: false,
        favorited: false,
      });
    },
    toggleComplete(id: number) {
      const index = this.tasks.findIndex((task) => task.id === id);
      if (index !== -1) {
        this.tasks[index].completed = !this.tasks[index].completed;
      }
    },
    toggleFavorite(id: number) {
      const index = this.tasks.findIndex((task) => task.id === id);
      if (index !== -1) {
        this.tasks[index].favorited = !this.tasks[index].favorited;
      }
    },
    removeTask(id: number) {
      this.tasks = this.tasks.filter((task) => task.id !== id);
    },
    clearCompleted() {
      this.tasks = this.tasks.filter((task) => !task.completed);
    },
    clearAll() {
      this.tasks = [];
      nextId = 0;
    },
    reorderTask(draggedId: number, targetIndex: number) {
      const draggedIndex = this.tasks.findIndex(
        (task) => task.id === draggedId
      );
      if (draggedIndex === -1) return;

      const [draggedTask] = this.tasks.splice(draggedIndex, 1);

      this.tasks.splice(targetIndex, 0, draggedTask);
    },
  },
  persist: true,
});
