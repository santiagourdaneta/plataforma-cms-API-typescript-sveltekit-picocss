// sistema/src/routes/api/logout/+server.js

import { json } from '@sveltejs/kit';
import { query } from '$lib/server/db/mysql'; 

/**
 * Endpoint de API para manejar el cierre de sesión (Logout).
 * Borra el token de la cookie y lo elimina de la tabla de sesiones de la DB.
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ cookies }) {
    // 1. Obtener el token de la cookie antes de borrarla
    const sessionToken = cookies.get('session_token');

    // 2. Eliminar el token de la base de datos (¡CRUCIAL para la seguridad!)
    if (sessionToken) {
        try {
            await query(
                'DELETE FROM sesiones WHERE token = ?',
                [sessionToken]
            );
            // Si hay un error de DB (ej: desconexión), la sesión no se borra, 
            // pero el usuario no lo notará gracias al paso 3.
        } catch (error) {
            console.error('Error al eliminar la sesión de la DB:', error);
            // Continuamos aunque falle la DB para asegurar que la cookie se borre.
        }
    }

    // 3. Eliminar la cookie de sesión del navegador
    // Esto es lo que efectivamente cierra la sesión para el usuario.
    cookies.set('session_token', '', {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        expires: new Date(0) // Establece la expiración en el pasado para que se borre inmediatamente
    });

    return json({ success: true, message: 'Sesión cerrada con éxito.' });
}