// src/routes/admin/videos/register/+page.server.js

import { redirect } from '@sveltejs/kit';
import { query } from '$lib/server/db/mysql';

/**
 * Función de carga que se ejecuta en el servidor.
 * Su objetivo es obtener SOLO las categorías ACTIVAS para el desplegable del formulario.
 * @type {import('./$types').PageServerLoad}
 */
export async function load({ locals }) {
    
    // 1. (SEGURIDAD) Verificar si el usuario está logueado
    if (!locals.user) {
        // Redirigir si no hay usuario logueado.
        throw redirect(302, '/login'); 
    }

    try {
        // 2. Consulta de categorías: solo 'activo = 1' y ordenadas por nombre.
        // Solo necesitamos el ID (valor) y el nombre (texto a mostrar).
        const activeCategories = await query(
            'SELECT id, nombre FROM categorias WHERE activo = 1 ORDER BY nombre ASC'
        );

        // 3. Retorna los datos al Front-end. Estarán disponibles en 'data.categories'.
        return {
            categories: activeCategories
        };

    } catch (error) {
        console.error('Error [DB] al cargar categorías activas para registro:', error.message);
        
        // 4. Manejo de errores: Si la DB falla, devolvemos un arreglo vacío
        // y un mensaje de error para que la interfaz se lo muestre al usuario.
        return {
            categories: [],
            error: 'Fallo la conexión o la consulta a la base de datos. No se pudo cargar el listado de categorías.'
        };
    }
}