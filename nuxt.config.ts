// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,

  typescript: {
    shim: false,
    strict: true
  },

  build: {
    transpile: ["vuetify"],
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
    define: {
      "process.env.DEBUG": false,
      'import.meta.env.API_BASE_URL': JSON.stringify(process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'),
    },
  },

  modules: [
    '@pinia/nuxt',
  ],

  nitro: {
    serveStatic: true,
  },

  devServerHandlers: [],

  // Runtime config for environment variables
  runtimeConfig: {
    // Public config exposed to the client
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
    },
    // Specify the package manager
    packageManager: 'yarn',
  },

  // App config
  app: {
    head: {
      title: 'FSES - First Stage Evaluation System',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'UTM FSES' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    },
  },

  vuetify: {
    moduleOptions: {
      /* module specific options */
    },
    vuetifyOptions: {
      /* vuetify options */
    }
  },

  // Development server options
  devServer: {
    port: 8001,
    host: '0.0.0.0'
  },
  compatibilityDate: "2025-04-15",
})