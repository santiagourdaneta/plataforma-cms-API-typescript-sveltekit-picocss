// tests/e2e/video-lifecycle.spec.js

import { test, expect } from '@playwright/test';

const newVideoTitle = `Test Video ${Date.now()}`;
const newYoutubeUrl = 'https://www.youtube.com/watch?v=TESTID12345'; 

test('El ciclo de vida del video (Admin a Público) funciona correctamente', async ({ page }) => {

    //Navegar directamente al dashboard (ya logueado por el setup)
    await page.goto('/admin/dashboard');

    // Navegar al modulo de videos
    await page.click('text=Gestionar Catálogo de Videos');
    await page.waitForURL('/admin/videos');

    // 1. Navegar al formulario de registro
    await page.click('text=Registrar Video');
    await page.waitForURL('/admin/videos/register');
    
    // 2. Llenar el formulario (Verificar validaciones al llenar)
    await page.fill('#titulo', newVideoTitle);
    await page.fill('#youtube_id', newYoutubeUrl);
    await page.selectOption('#categoria_id', { index: 1 }); // Selecciona la primera categoría
    await page.fill('textarea[name="descripcion"]', 'Esta es la descripción del video de prueba E2E.');
    
    // 3. Enviar el formulario y esperar éxito
    await page.click('button[type="submit"]');
    await expect(page.locator('.success-message')).toBeVisible(); 
    
    // --- Parte 2: Verificar la Visualización Pública ---
    
    // 4. Navegar a la página pública
    await page.goto('/');

    // 5. Verificar que el nuevo video aparezca en la lista
    const videoCard = page.locator(`.video-card:has-text("${newVideoTitle}")`);
    await expect(videoCard).toBeVisible();
    
});