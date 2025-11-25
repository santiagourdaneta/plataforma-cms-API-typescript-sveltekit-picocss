// src/routes/admin/settings/+server.js

import { json } from '@sveltejs/kit';
import { query } from '$lib/server/db/mysql';

// ----------------------------------------------------
// GET: Obtener toda la configuración
// ----------------------------------------------------
export async function GET({ locals }) {
    if (!locals.user || locals.user.rol !== 'superadmin') {
        return json({ success: false, message: 'Acceso denegado.' }, { status: 403 });
    }

    try {
        // Obtenemos todas las configuraciones para el Front-end
        const settings = await query(
            'SELECT setting_key, setting_value, description FROM settings ORDER BY setting_key'
        );

        return json({ success: true, settings });

    } catch (error) {
        console.error('Error al obtener configuración:', error.message);
        return json({ success: false, message: 'Fallo al cargar la configuración.' }, { status: 500 });
    }
}


// ----------------------------------------------------
// PUT: Actualizar la configuración (Bulk Update)
// ----------------------------------------------------
export async function PUT({ request, locals }) {
    if (!locals.user || locals.user.rol !== 'superadmin') {
        return json({ success: false, message: 'Acceso denegado.' }, { status: 403 });
    }

    try {
        // Esperamos un objeto JSON de tipo { key1: value1, key2: value2, ... }
        const settingsData = await request.json();

        if (!settingsData || typeof settingsData !== 'object' || Object.keys(settingsData).length === 0) {
            return json({ success: false, message: 'Datos de configuración inválidos.' }, { status: 400 });
        }

        let successCount = 0;
        let errorMessages = [];

        // Preparamos múltiples promesas de actualización (una por cada key-value)
        const updatePromises = Object.entries(settingsData).map(([key, value]) => {

            return query(
                `UPDATE settings SET setting_value = ? WHERE setting_key = ?`,
                [value, key]
            ).then(result => {
                if (result.affectedRows > 0) {
                    successCount++;
                }
            }).catch(e => {
                errorMessages.push(`Fallo al actualizar '${key}': ${e.message}`);
            });
        });

        // Esperar a que todas las actualizaciones terminen
        await Promise.all(updatePromises);
        
        if (errorMessages.length > 0) {
            return json({ success: false, message: 'Algunas configuraciones fallaron al actualizar.', details: errorMessages }, { status: 500 });
        }

        return json({ success: true, message: `Configuración actualizada (${successCount} campos).` });

    } catch (error) {
        console.error('Error al actualizar configuración:', error.message);
        return json({ success: false, message: 'Error interno al procesar la actualización.' }, { status: 500 });
    }
}