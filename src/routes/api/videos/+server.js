// src/routes/api/videos/+server.js

import { json } from '@sveltejs/kit';
import { query } from '$lib/server/db/mysql.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    try {
        // Consulta SQL para OBTENER TODOS LOS VIDEOS
        const videos = await query(
            `SELECT 
                v.id, v.titulo, v.descripcion, v.youtube_id, v.fecha_creacion,
                c.nombre AS categoria_nombre
            FROM videos v
            JOIN categorias c ON v.categoria_id = c.id
            ORDER BY v.fecha_creacion DESC`
        );

        // Construir la respuesta (solo datos de videos)
        return json({
            success: true,
            videos: videos,
        });
    } catch (error) {
        console.error("Error al obtener videos en la API:", error);
        return json({ 
            success: false, 
            message: 'Error interno del servidor al cargar los videos.',
            videos: []
        }, { status: 500 });
    }
}