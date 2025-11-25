// src/routes/admin/videos/+server.js

import { json } from '@sveltejs/kit';
import { query } from '$lib/server/db/mysql';
import slugify from 'slugify'; 

const ITEMS_PER_PAGE = 20;

// Función para extraer el ID de YouTube de cualquier entrada
function sanitizeYoutubeId(input) {
    if (!input) return null;
    
    const text = input.trim();

    // Patrón 1: ID puro (ej: nLKA39w9g9w)
    // Patrón 2: URL corta (ej: youtu.be/nLKA39w9g9w)
    // Patrón 3: URL larga (ej: youtube.com/watch?v=nLKA39w9g9w)
    // Patrón 4: Embedded (ej: youtube.com/embed/nLKA39w9g9w)
    
    // Expresión regular que captura el ID de 11 caracteres en cualquiera de los formatos de YT
    const match = text.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/)|)([a-zA-Z0-9_-]{11})/
    );

    if (match && match[1]) {
        return match[1];
    }
    
    // Si no coincide con ninguno, pero tiene 11 caracteres, lo tratamos como ID puro (falla el regex)
    if (text.length === 11 && !text.includes(' ')) {
        return text;
    }

    return null; // Si no se encuentra un ID válido o si es una URL mal formada
}
   

// ----------------------------------------------------
// GET: Listar, Paginación, Búsqueda (Read/Referir)
// ----------------------------------------------------
export async function GET({ url, locals }) {
    if (!locals.user) {
        return json({ success: false, message: 'Acceso no autorizado.' }, { status: 401 });
    }

    try {
        const page = parseInt(url.searchParams.get('page')) || 1;
        const searchTerm = url.searchParams.get('q') || '';
        const categoryFilter = url.searchParams.get('cat') || '';
        const offset = (page - 1) * ITEMS_PER_PAGE;
        
        let sqlWhere = '';
        let sqlParams = [];

        // 1. Lógica de Búsqueda Instantánea (FULLTEXT)
        if (searchTerm && searchTerm.length >= 3) {
            sqlWhere = ' WHERE MATCH (v.titulo, v.descripcion) AGAINST (? IN BOOLEAN MODE)';
            sqlParams.push(`+${searchTerm}*`); // Buscar prefijos
        }
        
        // 2. Filtro por Categoría
        if (categoryFilter) {
            const filterClause = ` v.categoria_id = ?`;
            
            if (sqlWhere) {
                sqlWhere += ` AND ${filterClause}`;
            } else {
                sqlWhere += ` WHERE ${filterClause}`;
            }
            sqlParams.push(categoryFilter);
        }

        // 3. Consulta de Datos (Join con Categorías para el nombre)
        const videos = await query(
            `SELECT v.id, v.titulo, v.descripcion, v.activo, v.youtube_id, v.categoria_id, c.nombre AS categoria_nombre
             FROM videos v
             JOIN categorias c ON v.categoria_id = c.id
             ${sqlWhere}
             ORDER BY v.fecha_creacion DESC
             LIMIT ? OFFSET ?`,
            [...sqlParams, ITEMS_PER_PAGE, offset]
        );
        
        // 4. Consulta de Total de Elementos (para la paginación)
        const [totalResult] = await query(
            `SELECT COUNT(v.id) AS total FROM videos v ${sqlWhere}`,
            sqlParams
        );
        const totalVideos = totalResult.total;
        const totalPages = Math.ceil(totalVideos / ITEMS_PER_PAGE);

        return json({ 
            success: true, 
            videos,
            pagination: { page, totalPages, totalItems: totalVideos }
        });
    } catch (error) {
        console.error('Error al obtener videos:', error.message);
        return json({ success: false, message: 'Fallo al listar videos.' }, { status: 500 });
    }
}


// ----------------------------------------------------
// POST: Crear Nuevo Video
// ----------------------------------------------------
export async function POST({ request, locals }) {
    if (!locals.user || locals.user.rol === 'editor') { // Permitir a Superadmins y Editores
        return json({ success: false, message: 'Acceso denegado.' }, { status: 403 });
    }
    
    try {

        const body = await request.json();

        // Verificar que el cuerpo contenga datos (opcional pero recomendado)
    if (!body || Object.keys(body).length === 0) {
        return json({ success: false, message: 'Falta el cuerpo de la petición (JSON vacío).' }, { status: 400 });
    }
    

        // Obtener y sanitizar el ID del video
        const rawVideoId = body.youtube_id; 
        const youtube_id = sanitizeYoutubeId(rawVideoId);


    const { titulo, descripcion, categoria_id} = body; 


    // --- Comprobaciones de validación ---

     if (!titulo || !descripcion || !categoria_id || !youtube_id) {
            return json({ success: false, message: 'Faltan campos obligatorios.' }, { status: 400 });
        }


        // 1. Generar Slug
        const video_slug = slugify(titulo, { lower: true, strict: true, locale: 'es' });

       

        // 2. Inserción Segura
        const result = await query(
            `INSERT INTO videos (titulo, descripcion, youtube_id, categoria_id, slug) 
             VALUES (?, ?, ?, ?, ?)`,
            [titulo.trim(), descripcion.trim(), youtube_id.trim(), categoria_id, video_slug]
        );

        return json({ success: true, message: 'Video registrado.', id: result.insertId }, { status: 201 });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return json({ success: false, message: 'El título o slug ya existe.' }, { status: 409 });
        }
        console.error('Error al registrar video:', error.message);
        return json({ success: false, message: 'Error interno: No se pudo registrar el video.' }, { status: 500 });
    }
}


// ----------------------------------------------------
// PUT: Actualizar Video (Incluye Soft Deletion)
// ----------------------------------------------------
export async function PUT({ request, locals }) {
    if (!locals.user || locals.user.rol === 'editor') { 
        return json({ success: false, message: 'Acceso denegado.' }, { status: 403 });
    }
    
    try {
        const { id, field, value } = await request.json();

        if (!id || !field || value === undefined) {
            return json({ success: false, message: 'Datos de actualización incompletos.' }, { status: 400 });
        }
        
        let sql = '';
        let params = [value, id];

        switch (field) {
            case 'activo':
                // Desactivar o Reactivar (Soft Deletion)
                const fechaDesactivacion = (value === 0) ? 'NOW()' : 'NULL';
                sql = `UPDATE videos SET activo = ?, fecha_desactivacion = ${fechaDesactivacion} WHERE id = ?`;
                break;
            case 'titulo':
                // Actualizar Título y Slug
                const video_slug = slugify(value, { lower: true, strict: true, locale: 'es' });
                sql = `UPDATE videos SET titulo = ?, slug = ?, fecha_actualizacion = NOW() WHERE id = ?`;
                params = [value, video_slug, id];
                break;
            case 'categoria_id':
            case 'descripcion':
            case ' youtube_id':
                sql = `UPDATE videos SET ${field} = ?, fecha_actualizacion = NOW() WHERE id = ?`;
                break;
            default:
                return json({ success: false, message: 'Campo de actualización no permitido.' }, { status: 400 });
        }

        const result = await query(sql, params);
        
        if (result.affectedRows === 0) {
            return json({ success: false, message: 'Video no encontrado.' }, { status: 404 });
        }
        return json({ success: true, message: `Video ${id} actualizado con éxito.` });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return json({ success: false, message: 'El título ya existe.' }, { status: 409 });
        }
        console.error('Error al actualizar video:', error.message);
        return json({ success: false, message: 'No se pudo actualizar el video.' }, { status: 500 });
    }
}