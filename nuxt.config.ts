import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  modules: [
    "nuxt-auth-utils",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@formkit/auto-animate/nuxt",
    "@vueuse/nuxt",
  ],
});