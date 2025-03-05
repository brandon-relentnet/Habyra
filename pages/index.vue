<script>
export default {
  name: "HomePage",
  data() {
    return {
      appTitle: "Habyra",
      appSlogan: "One app, every habit",
      appSubtitle: "Your all-in-one tool for building habits, boosting productivity, and prioritizing wellness — effortlessly",
      introTitle: "Welcome to Your Health Journey",
      introDescription:
        "This application helps you build better health habits, stay productive, and track your progress all in one convenient dashboard.",
      featuresTitle: "App Features",
      features: [
        {
          title: "Productivity & Focus",
          colorClass: "text-love",
          items: [
            "Pomodoro Timer with customizable intervals",
            "Session tracking and statistics",
            "Focus mode with notification management",
          ],
        },
        {
          title: "Nutrition Management",
          colorClass: "text-gold",
          items: [
            "Recipe book with personal collection",
            "Weekly meal planning calendar",
            "Shopping list generator",
          ],
        },
        {
          title: "Fitness Tracking",
          colorClass: "text-rose",
          items: [
            "Workout planner with exercise library",
            "Progress tracking and visualization",
            "Custom workout routine builder",
          ],
        },
        {
          title: "Habit Building",
          colorClass: "text-pine",
          items: [
            "Routine tracker and todo list",
            "Streak tracking for consistency",
            "Recurring task automation",
          ],
        },
        {
          title: "Workplace Wellness",
          colorClass: "text-foam",
          items: [
            "Stretch and movement reminders",
            "Walk reminders with step counting",
            "Quick desk exercise suggestions",
          ],
        },
        {
          title: "Recovery & Wellness",
          colorClass: "text-iris",
          items: [
            "Sobriety tracker with milestones",
            "Stretching recommendations",
            "Sleep management and reminders",
          ],
        },
      ],
      roadmapTitle: "Development Roadmap",
      roadmap: [
        {
          title: "Phase 1: Core Infrastructure & Pomodoro Timer",
          progressClass: "bg-love",
          status: "Completed",
          tasks: [
            "Project setup with Nuxt and UI framework",
            "Core navigation and dashboard layout",
            "Pomodoro timer implementation",
            "Basic notification system",
            "Electron integration testing",
          ],
        },
        {
          title: "Phase 2: Daily Health Tracking",
          progressClass: "bg-gold",
          status: "Current Phase",
          tasks: [
            "Habit tracking system",
            "Desk health features",
            "Stretch reminders",
            "Walk reminders",
          ],
        },
        {
          title: "Phase 3: Nutrition & Fitness",
          progressClass: "bg-muted",
          status: "Upcoming",
          tasks: [
            "Recipe book & meal planning",
            "Workout planning & tracking",
            "Progress visualization",
          ],
        },
        {
          title: "Phase 4: Wellness & Recovery",
          progressClass: "bg-muted",
          status: "Future",
          tasks: [
            "Sleep management",
            "Sobriety tracking",
            "Mood tracking",
            "Journaling functionality",
          ],
        },
        {
          title: "Phase 5: Integration & Advanced Features",
          progressClass: "bg-muted",
          status: "Final Phase",
          tasks: [
            "Comprehensive dashboard",
            "Cross-feature data visualization",
            "Goal setting and achievement system",
            "Final optimization and polish",
          ],
        },
      ],
      gettingStartedTitle: "Getting Started",
      gettingStarted: [
        {
          title: "Pomodoro Timer",
          description:
            "The Pomodoro Timer is currently available. Start focusing on your tasks while taking regular breaks to maintain productivity without burnout.",
          button: "Launch Pomodoro Timer",
        },
      ],
    };
  },
};
</script>

<template>
  <div class="min-h-screen bg-base text-text">
    <main class="container mx-auto px-4 py-8">
      <!-- App Introduction -->
      <section class="mb-12 text-center">
        <h2 class="text-2xl font-semibold mb-4">{{ introTitle }}</h2>
        <p class="max-w-2xl mx-auto text-subtle italic font-serif">
          {{ introDescription }}
        </p>
      </section>

      <!-- Feature Categories -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-6 border-b border-b-subtle pb-2">
          {{ featuresTitle }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="feature in features"
            :key="feature.title"
            :class="[
              'bg-surface rounded-xl p-6 border-l-4',
              feature.colorClass,
            ]"
          >
            <h3 :class="['font-semibold text-xl mb-3', feature.colorClass]">
              {{ feature.title }}
            </h3>
            <ul class="space-y-2 font-serif text-text">
              <li
                v-for="item in feature.items"
                :key="item"
                class="flex items-start"
              >
                <span :class="[feature.colorClass, 'mr-2']">•</span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Development Roadmap -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-6 border-b border-b-subtle pb-2">
          {{ roadmapTitle }}
        </h2>

        <div class="space-y-6">
          <div
            v-for="phase in roadmap"
            :key="phase.title"
            class="bg-surface rounded-xl p-6"
          >
            <h3 class="font-semibold text-xl mb-2">{{ phase.title }}</h3>
            <div class="flex items-center mb-3">
              <div
                :class="[phase.progressClass, 'w-20 h-2 rounded mr-2']"
              ></div>
              <span class="text-sm text-subtle font-serif italic">{{
                phase.status
              }}</span>
            </div>
            <ul class="space-y-2 font-serif text-text">
              <li v-for="task in phase.tasks" :key="task">• {{ task }}</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Getting Started -->
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-4 border-b border-b-subtle pb-2">
          {{ gettingStartedTitle }}
        </h2>

        <div
          v-for="section in gettingStarted"
          :key="section.title"
          class="bg-surface rounded-lg shadow-md p-6"
        >
          <h3 class="text-xl font-semibold mb-2">{{ section.title }}</h3>
          <p class="mb-4 font-serif italic text-subtle">
            {{ section.description }}
          </p>
          <button
            class="bg-overlay hover:bg-muted text-text font-medium py-2 px-6 rounded-xl transition duration-200 cursor-pointer"
          >
            {{ section.button }}
          </button>
        </div>
      </section>
    </main>
  </div>
</template>
