// src/routes/api/settings/+server.js 

import { json } from '@sveltejs/kit';
import { query } from '$lib/server/db/mysql';

/**
 * GET: Obtener la configuración general (Público)
 * @type {import('./$types').RequestHandler}
 */
export async function GET() {
    try {
        // Obtenemos todas las configuraciones para el Front-end
        const settings = await query(
            'SELECT setting_key, setting_value FROM settings WHERE setting_key IN ("site_name", "videos_per_page")'
        );
        
        // Convertir la matriz a un objeto clave-valor para facilitar su uso
        const settingsObject = settings.reduce((acc, item) => {
            acc[item.setting_key] = item.setting_value;
            return acc;
        }, {});

        return json({ success: true, settings: settingsObject });

    } catch (error) {
        console.error('Error al obtener configuración pública:', error.message);
        return json({ success: false, message: 'Fallo al cargar la configuración pública.' }, { status: 500 });
    }
}