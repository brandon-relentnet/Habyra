<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
    <header class="bg-green-600 text-white shadow-md">
      <div class="container mx-auto py-6 px-4">
        <h1 class="text-3xl font-bold">Brandon's Healthy Choices</h1>
        <p class="mt-2 text-green-100">
          Your personal health and productivity dashboard
        </p>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <!-- App Introduction -->
      <section class="mb-12 text-center">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">
          Welcome to Your Health Journey
        </h2>
        <p class="max-w-2xl mx-auto text-gray-600">
          This application helps you build better health habits, stay
          productive, and track your progress all in one convenient dashboard.
        </p>
      </section>

      <!-- Feature Categories -->
      <section class="mb-12">
        <h2 class="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
          App Features
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Productivity & Focus -->
          <div
            class="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500"
          >
            <h3 class="font-bold text-lg text-indigo-700 mb-3">
              Productivity & Focus
            </h3>
            <ul class="space-y-2 text-gray-700">
              <li class="flex items-start">
                <span class="text-indigo-500 mr-2">•</span>
                <span>Pomodoro Timer with customizable intervals</span>
              </li>
              <li class="flex items-start">
                <span class="text-indigo-500 mr-2">•</span>
                <span>Session tracking and statistics</span>
              </li>
              <li class="flex items-start">
                <span class="text-indigo-500 mr-2">•</span>
                <span>Focus mode with notification management</span>
              </li>
            </ul>
          </div>

          <!-- Nutrition Management -->
          <div
            class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500"
          >
            <h3 class="font-bold text-lg text-green-700 mb-3">
              Nutrition Management
            </h3>
            <ul class="space-y-2 text-gray-700">
              <li class="flex items-start">
                <span class="text-green-500 mr-2">•</span>
                <span>Recipe book with personal collection</span>
              </li>
              <li class="flex items-start">
                <span class="text-green-500 mr-2">•</span>
                <span>Weekly meal planning calendar</span>
              </li>
              <li class="flex items-start">
                <span class="text-green-500 mr-2">•</span>
                <span>Shopping list generator</span>
              </li>
            </ul>
          </div>

          <!-- Fitness Tracking -->
          <div
            class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500"
          >
            <h3 class="font-bold text-lg text-red-700 mb-3">
              Fitness Tracking
            </h3>
            <ul class="space-y-2 text-gray-700">
              <li class="flex items-start">
                <span class="text-red-500 mr-2">•</span>
                <span>Workout planner with exercise library</span>
              </li>
              <li class="flex items-start">
                <span class="text-red-500 mr-2">•</span>
                <span>Progress tracking and visualization</span>
              </li>
              <li class="flex items-start">
                <span class="text-red-500 mr-2">•</span>
                <span>Custom workout routine builder</span>
              </li>
            </ul>
          </div>

          <!-- Habit Building -->
          <div
            class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500"
          >
            <h3 class="font-bold text-lg text-purple-700 mb-3">
              Habit Building
            </h3>
            <ul class="space-y-2 text-gray-700">
              <li class="flex items-start">
                <span class="text-purple-500 mr-2">•</span>
                <span>Routine tracker and todo list</span>
              </li>
              <li class="flex items-start">
                <span class="text-purple-500 mr-2">•</span>
                <span>Streak tracking for consistency</span>
              </li>
              <li class="flex items-start">
                <span class="text-purple-500 mr-2">•</span>
                <span>Recurring task automation</span>
              </li>
            </ul>
          </div>

          <!-- Workplace Wellness -->
          <div
            class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
          >
            <h3 class="font-bold text-lg text-blue-700 mb-3">
              Workplace Wellness
            </h3>
            <ul class="space-y-2 text-gray-700">
              <li class="flex items-start">
                <span class="text-blue-500 mr-2">•</span>
                <span>Stretch and movement reminders</span>
              </li>
              <li class="flex items-start">
                <span class="text-blue-500 mr-2">•</span>
                <span>Walk reminders with step counting</span>
              </li>
              <li class="flex items-start">
                <span class="text-blue-500 mr-2">•</span>
                <span>Quick desk exercise suggestions</span>
              </li>
            </ul>
          </div>

          <!-- Recovery & Wellness -->
          <div
            class="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500"
          >
            <h3 class="font-bold text-lg text-yellow-700 mb-3">
              Recovery & Wellness
            </h3>
            <ul class="space-y-2 text-gray-700">
              <li class="flex items-start">
                <span class="text-yellow-500 mr-2">•</span>
                <span>Sobriety tracker with milestones</span>
              </li>
              <li class="flex items-start">
                <span class="text-yellow-500 mr-2">•</span>
                <span>Stretching recommendations</span>
              </li>
              <li class="flex items-start">
                <span class="text-yellow-500 mr-2">•</span>
                <span>Sleep management and reminders</span>
              </li>
            </ul>
          </div>

          <!-- Additional Features -->
          <div
            class="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-500 md:col-span-2 lg:col-span-3"
          >
            <h3 class="font-bold text-lg text-gray-700 mb-3">
              Additional Features
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="text-gray-700">
                <p class="font-medium">Water Intake</p>
                <p class="text-sm">Track daily hydration goals</p>
              </div>
              <div class="text-gray-700">
                <p class="font-medium">Mood Tracking</p>
                <p class="text-sm">Daily check-ins and patterns</p>
              </div>
              <div class="text-gray-700">
                <p class="font-medium">Meditation Timer</p>
                <p class="text-sm">Guided and unguided sessions</p>
              </div>
              <div class="text-gray-700">
                <p class="font-medium">Health Metrics</p>
                <p class="text-sm">Weight and measurements tracking</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Development Roadmap -->
      <section class="mb-12">
        <h2 class="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
          Development Roadmap
        </h2>

        <div class="space-y-6">
          <!-- Phase 1 -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="font-bold text-lg text-gray-800 mb-2">
              Phase 1: Core Infrastructure & Pomodoro Timer
            </h3>
            <div class="flex items-center mb-3">
              <div class="w-20 h-2 bg-green-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">Current Phase</span>
            </div>
            <ul class="space-y-2 text-gray-700">
              <li>• Project setup with Nuxt and UI framework</li>
              <li>• Core navigation and dashboard layout</li>
              <li>• Pomodoro timer implementation</li>
              <li>• Basic notification system</li>
              <li>• Electron integration testing</li>
            </ul>
          </div>

          <!-- Phase 2 -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="font-bold text-lg text-gray-800 mb-2">
              Phase 2: Daily Health Tracking
            </h3>
            <div class="flex items-center mb-3">
              <div class="w-20 h-2 bg-gray-200 rounded mr-2"></div>
              <span class="text-sm text-gray-600">Upcoming</span>
            </div>
            <ul class="space-y-2 text-gray-700">
              <li>• Habit tracking system</li>
              <li>• Desk health features</li>
              <li>• Stretch reminders</li>
              <li>• Walk reminders</li>
            </ul>
          </div>

          <!-- Phase 3 -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="font-bold text-lg text-gray-800 mb-2">
              Phase 3: Nutrition & Fitness
            </h3>
            <div class="flex items-center mb-3">
              <div class="w-20 h-2 bg-gray-200 rounded mr-2"></div>
              <span class="text-sm text-gray-600">Upcoming</span>
            </div>
            <ul class="space-y-2 text-gray-700">
              <li>• Recipe book & meal planning</li>
              <li>• Workout planning & tracking</li>
              <li>• Progress visualization</li>
            </ul>
          </div>

          <!-- Phase 4 -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="font-bold text-lg text-gray-800 mb-2">
              Phase 4: Wellness & Recovery
            </h3>
            <div class="flex items-center mb-3">
              <div class="w-20 h-2 bg-gray-200 rounded mr-2"></div>
              <span class="text-sm text-gray-600">Future</span>
            </div>
            <ul class="space-y-2 text-gray-700">
              <li>• Sleep management</li>
              <li>• Sobriety tracking</li>
              <li>• Mood tracking</li>
              <li>• Journaling functionality</li>
            </ul>
          </div>

          <!-- Phase 5 -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="font-bold text-lg text-gray-800 mb-2">
              Phase 5: Integration & Advanced Features
            </h3>
            <div class="flex items-center mb-3">
              <div class="w-20 h-2 bg-gray-200 rounded mr-2"></div>
              <span class="text-sm text-gray-600">Final Phase</span>
            </div>
            <ul class="space-y-2 text-gray-700">
              <li>• Comprehensive dashboard</li>
              <li>• Cross-feature data visualization</li>
              <li>• Goal setting and achievement system</li>
              <li>• Final optimization and polish</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Getting Started -->
      <section class="mb-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          Getting Started
        </h2>
        <div class="bg-white rounded-lg shadow-md p-6">
          <p class="text-gray-700 mb-4">
            The Pomodoro Timer is currently available. Start focusing on your
            tasks while taking regular breaks to maintain productivity without
            burnout.
          </p>
          <button
            class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
          >
            Launch Pomodoro Timer
          </button>
        </div>
      </section>
    </main>

    <footer class="bg-gray-100 border-t border-gray-200">
      <div class="container mx-auto px-4 py-6">
        <p class="text-center text-gray-600">
          Brandon's Healthy Choices - Personal Health & Productivity App
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: "HomePage",
  // We'll add more functionality as we develop the actual features
};
</script>
