// playwright.config.js

import { defineConfig } from '@playwright/test';
import 'dotenv/config';

const authFile = 'playwright/.auth/user.json';

export default defineConfig({

  // Directorio donde Playwright debe buscar las pruebas
  testDir: './tests/e2e', 
  
  // URL base para todas las pruebas (simplifica page.goto('/login'))
  use: {
    // Asegúrate de que este puerto coincida con 'npm run preview'
    baseURL: 'http://localhost:5173/', 
    // Usar trazas para depuración en caso de fallo
    trace: 'on-first-retry', 
  },

  projects: [
        {
            name: 'setup',
            testMatch: /auth\.setup\.js/, // Asegura que solo el archivo setup se ejecute primero
        },
        {
            name: 'logged-in-user',
            testDir: './tests/e2e', 
            dependencies: ['setup'],
            use: {
                storageState: authFile, // ✅ Carga el estado guardado
            },
            testMatch: /login\.spec\.js|video-lifecycle\.spec\.js|edit-video\.spec\.js|soft-delete\.spec\.js/, 
            testIgnore: /.*\.setup\.js|standard-user\.spec\.js/,
        },
    ],
  
  // Configuración del servidor de desarrollo (para ejecutar Playwright)
  webServer: {
    // Inicia el servidor de producción antes de ejecutar las pruebas
    command: 'npm run dev',
    url: 'http://localhost:5173/',
    // Espera a que la URL esté lista antes de ejecutar los tests
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});