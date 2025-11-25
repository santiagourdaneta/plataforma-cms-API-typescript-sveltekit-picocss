import { test, expect } from '@playwright/test';

test.describe('Video Soft Delete/Toggle Active Functionality', () => {

    test('should allow an admin to deactivate a video and verify status change', async ({ page }) => {
        
        await page.goto('/admin/videos'); // Navegar a la página de listado

        // Esperar a que la tabla se llene con datos (al menos un video)
        // Buscamos la fila del primer video y esperamos que contenga el botón 'Editar',
        // lo que prueba que el fetch asíncrono terminó.
        const targetRow = page.locator('table tbody tr:first-child');
        await expect(targetRow.locator('button', { hasText: 'Editar' })).toBeVisible({ timeout: 10000 });
        
        const initialStatusTag = targetRow.locator('.tag');
        
        // 1. Crear Localizadores para ambos estados del botón
        const deactivateButton = targetRow.locator('button', { hasText: 'Desactivar' });
        const reactivateButton = targetRow.locator('button', { hasText: 'Reactivar' });

        // Determinar qué botón está visible y hacer clic en ese
        let toggleButton;
        if (await deactivateButton.isVisible()) {
            toggleButton = deactivateButton;
        } else if (await reactivateButton.isVisible()) {
            toggleButton = reactivateButton;
        } else {
            // Este error solo debería lanzarse si la fila existe pero no tiene ninguno de los dos botones
            throw new Error("No se encontró el botón Desactivar ni Reactivar en la primera fila. La fila existe pero los botones no están.");
        }
        
        const initialActionText = await toggleButton.textContent(); 
        
        // 2. Manejar el diálogo de confirmación
        page.once('dialog', async dialog => {
            await dialog.accept(); 
        });
        
        // 3. Hacer clic en el botón de toggle 
        await toggleButton.click();
        
        // 4. Esperar el mensaje de éxito (esto valida el fin del proceso asíncrono loadVideos())
        await expect(page.locator('.success-message')).toBeVisible({ timeout: 10000 });
        
        // 5. Verificación final: El botón debe haber cambiado de texto
        const expectedNewActionText = initialActionText.includes('Desactivar') ? 'Reactivar' : 'Desactivar';
        await expect(targetRow.locator('button', { hasText: expectedNewActionText })).toBeVisible();
        
        console.log(`Video cambiado de estado exitosamente a: ${expectedNewActionText}`);
    });
});