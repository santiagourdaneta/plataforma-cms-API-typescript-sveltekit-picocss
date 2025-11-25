// vite.config.ts

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()], // 
    test: {
        exclude: ['node_modules', 'tests/e2e', 'src/**/__tests__/e2e/**'], 
    }
});