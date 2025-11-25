// tests/e2e/auth.setup.js 
import { test as setup, expect } from '@playwright/test';
import * as path from 'path';

const authFile = path.join(process.cwd(), 'playwright/.auth/user.json');

setup('authenticate as admin and save state', async ({ page }) => {
    
    // 🛑 LEER EL TOKEN DE LA VARIABLE DE ENTORNO
        const VALID_ADMIN_TOKEN = process.env.TEST_ADMIN_SESSION_TOKEN; 

        if (!VALID_ADMIN_TOKEN) {
            // Lanza un error si la variable no está configurada, deteniendo la prueba de setup
            throw new Error("TEST_ADMIN_SESSION_TOKEN no está definido. Revisa tu archivo .env");
        }

        console.log("Iniciando setup de autenticación mediante inyección de cookie...");

    // 1. Inyectar la cookie de sesión directamente al contexto de Playwright
    await page.context().addCookies([{
        name: 'session_token',
        value: VALID_ADMIN_TOKEN,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
    }]);

    // 2. Navegar directamente a la página protegida (ya estamos "logueados")
    await page.goto('/admin/dashboard'); 

    // 3. Verificar que la navegación no fue redirigida a otra URL
    await expect(page).toHaveURL(/admin\/dashboard/, { timeout: 10000 });

    // 4. Guardar el estado de autenticación (cookies)
    await page.context().storageState({ path: authFile });
    
    console.log(`Estado de autenticación guardado en: ${authFile}`);
});