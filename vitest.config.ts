import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    include: ['src/**/*.{test,spec}.{js,ts}'],
    env: {
      DB_HOST_PARAM: '/test/prefix/param',
      DB_NAME_PARAM: '/test/prefix/param',
      DB_PASS_PARAM: '/test/prefix/param',
      DB_PORT_PARAM: '/test/prefix/param',
      DB_URI_PARAM: '/test/prefix/param',
      DB_USER_PARAM: '/test/prefix/param',
    },
  },
  resolve: {
    alias: {
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@controllers': fileURLToPath(
        new URL('./src/controllers', import.meta.url),
      ),
      '@service': fileURLToPath(new URL('./src/service', import.meta.url)),
      '@data': fileURLToPath(new URL('./src/data', import.meta.url)),
      '@routes': fileURLToPath(new URL('./src/routes', import.meta.url)),
      '@middlewares': fileURLToPath(
        new URL('./src/middlewares', import.meta.url),
      ),
    },
  },
});
