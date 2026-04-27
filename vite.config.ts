import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.VITE_API_PROXY_TARGET?.trim();

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: apiProxyTarget
      ? {
          proxy: {
            '/api/prompt-expand': {
              target: apiProxyTarget,
              changeOrigin: true,
            },
          },
        }
      : undefined,
  };
});
