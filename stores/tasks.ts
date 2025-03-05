// store/tasks.ts
import { defineStore } from "pinia";

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  favorited: boolean;
}

export const useTasksStore = defineStore("tasks", {
  state: () => ({
    tasks: [] as Task[],
    nextId: 0,
    hideCompleted: false,
  }),
  actions: {
    addTask(taskTitle: string) {
      this.tasks.push({
        id: this.nextId++,
        title: taskTitle,
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
      this.nextId = 0;
    },
    reorderTask(draggedId: number, targetIndex: number) {
      const draggedIndex = this.tasks.findIndex(
        (task) => task.id === draggedId
      );
      if (draggedIndex === -1) return;
      const [draggedTask] = this.tasks.splice(draggedIndex, 1);
      this.tasks.splice(targetIndex, 0, draggedTask);
    },
    toggleHideCompleted() {
      this.hideCompleted = !this.hideCompleted;
    },
  },
  persist: true,
});
