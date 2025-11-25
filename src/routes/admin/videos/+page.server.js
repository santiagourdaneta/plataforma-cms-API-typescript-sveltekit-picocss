// src/routes/admin/videos/+page.server.js

import { query } from '$lib/server/db/mysql';

/**
 * Carga la lista de categorías activas para usar como filtro.
 * @type {import('./$types').PageServerLoad}
 */
export async function load({ locals }) {
    if (!locals.user) {
        // La seguridad ya está en hooks, pero es una buena práctica.
        return { categories: [] };
    }

    try {
        // Obtener solo ID y Nombre de categorías activas
        const categories = await query(
            'SELECT id, nombre FROM categorias WHERE activo = 1 ORDER BY nombre ASC'
        );

        return {
            categories: categories
        };
    } catch (error) {
        console.error('Error al cargar categorías para filtro:', error.message);
        return { categories: [], error: 'Fallo al cargar filtros.' };
    }
}