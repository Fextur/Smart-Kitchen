import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        devOptions: {
          enabled: false,
        },
        includeAssets: ["logo.png", "logo-192.png", "logo-512.png"],
        manifest: {
          name: "מטבחכם - Smart Kitchen",
          short_name: "מטבחכם",
          description: "ניהול חכם למטבח שלך",
          theme_color: "#E49A61",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: "/",
          icons: [
            {
              src: "/logo-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/logo-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});
