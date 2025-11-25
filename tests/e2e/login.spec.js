// tests/e2e/login.spec.js 

import { test, expect } from '@playwright/test';

test.describe('Login Functionality', () => {

  // Cambia el nombre para reflejar que verifica el acceso, no el proceso POST
  test('should verify access to the admin dashboard after authentication', async ({ page }) => {
    
    // 1. Navegar directamente a la página protegida
    // Playwright usará la cookie guardada en el setup.
    await page.goto('/admin/dashboard');

    // 2. Verificar que la URL es la correcta y no fuimos redirigidos a / o /login
    await expect(page).toHaveURL(/admin\/dashboard/, { timeout: 10000 }); 

    // 3. Verificar un elemento de la página (opcional, pero buena práctica)
    // await expect(page.locator('h1')).toHaveText('Panel de Administración'); 
    
    console.log("Login E2E: ¡Verificación de acceso exitosa!");
  });
});

