import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(() => {

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: { enabled: true },
        manifest: {
          name: 'Smart Kitchen',
          start_url: '/',
          theme_color: '#ffffff',
        },
      }),
    ],
  };
});
