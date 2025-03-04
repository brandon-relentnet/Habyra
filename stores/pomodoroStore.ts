// stores/pomodoroStore.ts
import { defineStore } from "pinia";

export interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  notificationsEnabled: boolean;
  notificationSound: string;
  focusModeEnabled: boolean;
}

export interface SessionRecord {
  date: string;
  duration: number;
  type: "work" | "short_break" | "long_break";
  synced?: boolean;
}

export interface PomodoroStatistics {
  completedSessions: number;
  completedToday: number;
  completedThisWeek: number;
  totalFocusTime: number;
  sessionsHistory: SessionRecord[];
  lastSessionDate: string;
  lastWeekNumber: number;
}

export interface PomodoroState {
  // Timer state
  timerState: "idle" | "running" | "paused" | "break";
  previousState: "running" | "break" | null;
  timeRemaining: number;
  initialTime: number;
  breakTime: number;
  longBreakTime: number;
  timerInterval: number | null;

  // Settings
  settings: PomodoroSettings;

  // Statistics
  statistics: PomodoroStatistics;

  // Sync state
  isSyncing: boolean;
  isSyncedWithServer: boolean;
  lastSyncTime: string | null;
}

// Helper function to get current week number
const getWeekNumber = (d: Date): number => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

export const usePomodoroStore = defineStore("pomodoro", {
  state: (): PomodoroState => ({
    // Timer state
    timerState: "idle",
    previousState: null,
    timeRemaining: 25 * 60, // Default: 25 minutes in seconds
    initialTime: 25 * 60,
    breakTime: 5 * 60, // Default: 5 minutes in seconds
    longBreakTime: 15 * 60, // Default: 15 minutes
    timerInterval: null,

    // Settings
    settings: {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,
      notificationsEnabled: true,
      notificationSound: "bell",
      focusModeEnabled: false,
    },

    // Statistics
    statistics: {
      completedSessions: 0,
      completedToday: 0,
      completedThisWeek: 0,
      totalFocusTime: 0,
      sessionsHistory: [],
      lastSessionDate: new Date().toDateString(),
      lastWeekNumber: getWeekNumber(new Date()),
    },

    // Sync state
    isSyncing: false,
    isSyncedWithServer: false,
    lastSyncTime: null,
  }),

  getters: {
    formattedTime(): string {
      const minutes = Math.floor(this.timeRemaining / 60);
      const seconds = this.timeRemaining % 60;
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    },

    progress(): number {
      const max =
        this.timerState === "break"
          ? this.statistics.completedSessions %
              this.settings.sessionsBeforeLongBreak ===
            0
            ? this.longBreakTime
            : this.breakTime
          : this.initialTime;
      const current = this.timeRemaining;
      return 100 - (current / max) * 100;
    },
  },

  actions: {
    async initializeStore() {
      // Check for new day/week to reset counters
      const today = new Date().toDateString();
      const currentWeek = getWeekNumber(new Date());

      if (this.statistics.lastSessionDate !== today) {
        this.statistics.completedToday = 0;
        this.statistics.lastSessionDate = today;
      }

      if (this.statistics.lastWeekNumber !== currentWeek) {
        this.statistics.completedThisWeek = 0;
        this.statistics.lastWeekNumber = currentWeek;
      }

      // Update timer based on settings
      this.applySettings();
    },

    applySettings() {
      this.initialTime = this.settings.workDuration * 60;
      this.breakTime = this.settings.shortBreakDuration * 60;
      this.longBreakTime = this.settings.longBreakDuration * 60;

      // Reset timer if idle
      if (this.timerState === "idle") {
        this.timeRemaining = this.initialTime;
      }
    },

    startTimer() {
      if (this.timerState === "idle" || this.timerState === "paused") {
        // If we're resuming from a paused state, check if we were in a break
        if (this.timerState === "paused" && this.previousState) {
          this.timerState = this.previousState;
        } else {
          this.timerState = "running";
        }

        if (this.timerInterval) {
          clearInterval(this.timerInterval);
        }

        this.timerInterval = window.setInterval(() => {
          if (this.timeRemaining > 0) {
            this.timeRemaining--;
          } else {
            this.completeSession();
          }
        }, 1000);
      }
    },

    pauseTimer() {
      if (this.timerState === "running" || this.timerState === "break") {
        // Store the current state before pausing
        this.previousState = this.timerState;
        this.timerState = "paused";
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }
      }
    },

    resetTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      this.timerState = "idle";
      this.timeRemaining = this.initialTime;
    },

    skipToBreak() {
      this.completeSession();
    },

    skipBreak() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      this.timerState = "idle";
      this.timeRemaining = this.initialTime;
    },

    async completeSession() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      if (this.timerState === "running") {
        // Session completed - update statistics
        this.statistics.completedSessions++;
        this.statistics.completedToday++;
        this.statistics.completedThisWeek++;
        this.statistics.totalFocusTime += this.initialTime;

        // Record session in history
        const newSession = {
          date: new Date().toISOString(),
          duration: this.initialTime,
          type: "work" as const,
          synced: false,
        };

        this.statistics.sessionsHistory.unshift(newSession);

        // Limit history to last 100 sessions
        if (this.statistics.sessionsHistory.length > 100) {
          this.statistics.sessionsHistory =
            this.statistics.sessionsHistory.slice(-100);
        }

        // Play notification if enabled
        this.playNotificationSound();
        this.showNotification(
          "Session Complete",
          "Great job! Time for a break."
        );

        // Start break
        this.timerState = "break";

        // Determine break length
        if (
          this.statistics.completedSessions %
            this.settings.sessionsBeforeLongBreak ===
          0
        ) {
          this.timeRemaining = this.longBreakTime;
        } else {
          this.timeRemaining = this.breakTime;
        }

        // Auto-start break timer
        this.timerInterval = window.setInterval(() => {
          if (this.timeRemaining > 0) {
            this.timeRemaining--;
          } else {
            // Break completed
            if (this.timerInterval) {
              clearInterval(this.timerInterval);
              this.timerInterval = null;
            }
            this.timerState = "idle";
            this.timeRemaining = this.initialTime;

            // Play notification
            this.playNotificationSound();
            this.showNotification(
              "Break Complete",
              "Ready to start another session?"
            );
          }
        }, 1000);
      }
    },

    setNotificationSound(sound) {
      // Set the sound directly
      this.settings.notificationSound = sound;

      // Log for debugging
      console.log("Store: Setting notification sound to:", sound);

      // Force state update to ensure persistence triggers
      this.$state = {
        ...this.$state,
        settings: {
          ...this.settings,
        },
      };

      // Make sure changes are applied to the timer
      this.applySettings();
    },

    showNotification(title: string, body: string) {
      if (!this.settings.notificationsEnabled) return;

      if (Notification && Notification.permission === "granted") {
        new Notification(title, {
          body: body,
          icon: "/icon.png", // Add your icon path here
        });
      } else if (Notification && Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, {
              body: body,
              icon: "/icon.png",
            });
          }
        });
      }
    },

    playNotificationSound() {
      if (!this.settings.notificationsEnabled) return;

      try {
        const audio = new Audio(
          `/sounds/${this.settings.notificationSound}.wav`
        );
        audio.play();
      } catch (error) {
        console.error("Error playing notification sound:", error);
      }
    },

    // Sync with server
    async syncWithServer() {
      try {
        // Set syncing state to true
        this.isSyncing = true;

        // Get sessions that need to be synced (not yet marked as synced)
        const sessionsToSync = this.statistics.sessionsHistory.filter(
          (session) => !session.synced && session.type === "work"
        );

        console.log(`Syncing ${sessionsToSync.length} sessions with server`);

        if (sessionsToSync.length === 0) {
          // No sessions to sync, update sync time and return
          this.lastSyncTime = new Date().toISOString();
          this.isSyncedWithServer = true;
          return true;
        }

        // Sync each session one by one
        for (const session of sessionsToSync) {
          try {
            console.log(`Syncing session: ${session.date}`);

            const response = await fetch("/api/pomodoro/sessions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                date: session.date,
                duration: session.duration,
                type: session.type,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => null);
              console.error(
                "Server error details:",
                errorData || response.statusText
              );
              throw new Error(
                `Server responded with status: ${response.status}`
              );
            }

            // Mark session as synced
            session.synced = true;
          } catch (error) {
            console.error("Error syncing session:", error);
            // Continue with next session
          }
        }

        // After syncing, fetch fresh statistics
        await this.fetchFromServer();

        // Update sync state
        this.lastSyncTime = new Date().toISOString();
        this.isSyncedWithServer = true;

        return true;
      } catch (error) {
        console.error("Error in syncWithServer:", error);
        return false;
      } finally {
        this.isSyncing = false;
      }
    },

    // Fetch from server
    // Enhanced fetchFromServer method with detailed logging
    async fetchFromServer() {
      try {
        this.isSyncing = true;
        console.log("Starting fetchFromServer...");

        const response = await fetch("/api/pomodoro/statistics");
        console.log("API response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error(
            "Server error details:",
            errorData || response.statusText
          );
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API response data:", data);

        if (data.success && data.statistics) {
          const serverStats = data.statistics;
          console.log("Server statistics:", serverStats);

          // Update statistics with server values
          this.statistics.completedSessions =
            serverStats.completedSessions || 0;
          this.statistics.completedToday = serverStats.completedToday || 0;
          this.statistics.completedThisWeek =
            serverStats.completedThisWeek || 0;
          this.statistics.totalFocusTime = serverStats.totalFocusTime || 0;

          // Update session history
          if (
            serverStats.sessionsHistory &&
            Array.isArray(serverStats.sessionsHistory)
          ) {
            console.log(
              "Server returned",
              serverStats.sessionsHistory.length,
              "sessions"
            );

            // Merge with local sessions
            // First, create a map of existing sessions by date for quick lookup
            const existingSessions = new Map();
            this.statistics.sessionsHistory.forEach((session) => {
              if (!session.synced) {
                existingSessions.set(session.date, session);
              }
            });

            console.log("Local unsynced sessions:", existingSessions.size);

            // Now replace with server data but keep unsynced local sessions
            this.statistics.sessionsHistory = [
              ...serverStats.sessionsHistory,
              ...Array.from(existingSessions.values()),
            ];

            console.log(
              "Updated sessions history with",
              this.statistics.sessionsHistory.length,
              "total sessions"
            );
          } else {
            console.warn(
              "No sessions history returned from server or invalid format"
            );
          }

          // Update session tracking
          if (serverStats.lastSessionDate) {
            this.statistics.lastSessionDate = serverStats.lastSessionDate;
          }

          if (serverStats.lastWeekNumber) {
            this.statistics.lastWeekNumber = serverStats.lastWeekNumber;
          }

          this.isSyncedWithServer = true;
          this.lastSyncTime = new Date().toISOString();
          console.log("Statistics successfully fetched from server");
        } else {
          console.warn("API response missing success flag or statistics data");
        }

        return true;
      } catch (error) {
        console.error("Error in fetchFromServer:", error);
        return false;
      } finally {
        this.isSyncing = false;
      }
    },
  },

  // Using the built-in persistence
  persist: true,
});
