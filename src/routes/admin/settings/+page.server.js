// src/routes/admin/settings/+page.server.js

import { redirect, error } from '@sveltejs/kit';

/**
 * Carga la configuración inicial del sistema.
 * @type {import('./$types').PageServerLoad}
 */
export async function load({ fetch, locals }) {
    // 1. (SEGURIDAD) Solo Superadmins pueden ver esta página
    if (!locals.user || locals.user.rol !== 'superadmin') {
        // En lugar de 404, redirigimos o damos error 403
        throw error(403, 'Acceso denegado. Solo Superadmins.');
    }

    try {
        // Llamar a la API interna GET /admin/settings
        const response = await fetch('/admin/settings');
        const result = await response.json();

        if (result.success) {
            // Convertir la matriz de objetos a un objeto clave-valor para facilitar su uso en Svelte
            const settingsObject = result.settings.reduce((acc, item) => {
                acc[item.setting_key] = item.setting_value;
                return acc;
            }, {});
            
            return {
                settings: settingsObject,
                rawSettings: result.settings // Para mostrar la descripción
            };
        } else {
            return {
                settings: {},
                error: result.message || 'Fallo al cargar la configuración desde la API.'
            };
        }
    } catch (e) {
        console.error('Error en load settings:', e.message);
        return { settings: {}, error: 'Error de conexión con la API interna.' };
    }
}