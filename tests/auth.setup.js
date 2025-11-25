// tests/auth.setup.js
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json'; // Ruta donde se guardará el estado de la sesión

setup('authenticate as admin', async ({ page }) => {
  // 1. Navegar a la página de login
  await page.goto('/login');

  // 2. Llenar el formulario
  await page.fill('input[name="username"]', 'superadmin'); // Tu usuario de prueba
  await page.fill('input[name="password"]', 'tu_password_segura'); // Tu contraseña

  // 3. Hacer clic y esperar la redirección exitosa
  await page.click('button[type="submit"]');

  // Esperar la URL final para confirmar que la sesión se estableció correctamente
  await page.waitForURL('/admin/dashboard', { timeout: 10000 }); 
  
  // 4. Guardar el estado de autenticación (cookies, localStorage, etc.)
  await page.context().storageState({ path: authFile });
});