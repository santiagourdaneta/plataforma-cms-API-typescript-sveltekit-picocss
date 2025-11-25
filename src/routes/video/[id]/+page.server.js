// src/routes/video/[id]/+page.server.js

import { error } from '@sveltejs/kit';
import { query } from '$lib/server/db/mysql';

/**
 * Carga la información de un solo video por su ID.
 * @type {import('./$types').PageServerLoad}
 */
export async function load({ params }) {
    const videoId = params.id;

    if (!videoId) {
        throw error(404, 'ID de video no proporcionado.');
    }

    try {
        const sql = `
            SELECT 
                v.id, v.titulo, v.descripcion, v.youtube_id, v.fecha_creacion,
                c.nombre as nombre_categoria
            FROM videos v
            JOIN categorias c ON v.categoria_id = c.id
            WHERE v.id = ?
        `;
        const [video] = await query(sql, [videoId]);

        if (video) {
            return {
                video
            };
        } else {
            throw error(404, 'Video no encontrado.');
        }

    } catch (e) {
        console.error('Error al cargar video:', e.message);
        throw error(500, 'Fallo interno al cargar el video.');
    }
}