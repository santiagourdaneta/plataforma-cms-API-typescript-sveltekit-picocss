// src/routes/admin/categorias/+server.js

import { json } from '@sveltejs/kit';
import { query } from '$lib/server/db/mysql';
import slugify from 'slugify';

const ITEMS_PER_PAGE = 20; // Límite para la paginación

// ----------------------------------------------------
// GET: Listar, Paginación y Búsqueda (Read/Referir)
// ----------------------------------------------------
export async function GET({ url, locals }) {
    // 1. (SEGURIDAD) Verificar Sesión (Solo logueados pueden acceder)
    if (!locals.user) {
        return json({ success: false, message: 'Acceso no autorizado.' }, { status: 401 });
    }

    try {
        const page = parseInt(url.searchParams.get('page')) || 1;
        const searchTerm = url.searchParams.get('q') || '';
        const offset = (page - 1) * ITEMS_PER_PAGE;
        
        let sqlWhere = '';
        let sqlParams = [];

        // Lógica de Búsqueda Instantánea (FULLTEXT)
                if (searchTerm && searchTerm.length >= 3) { // <-- Se mantiene el filtro de 3 caracteres en el server como doble chequeo
                    // El operador '*' al final busca cualquier palabra que COMIENCE con el término.
                    sqlWhere = ' WHERE MATCH (nombre) AGAINST (? IN BOOLEAN MODE)';
                    sqlParams.push(`+${searchTerm}*`); 
                }
                
        // Si no hay búsqueda o es muy corta, listamos todas las categorías activas (o el comportamiento por defecto)

        // 2. Consulta de Datos (Paginada y Filtrada)
        const categorias = await query(
            `SELECT id, nombre, activo, fecha_creacion, fecha_actualizacion
             FROM categorias
             ${sqlWhere}
             ORDER BY nombre ASC
             LIMIT ? OFFSET ?`,
            [...sqlParams, ITEMS_PER_PAGE, offset]
        );
        
        // 3. Consulta de Total de Elementos (para la paginación)
        const [totalResult] = await query(
            `SELECT COUNT(id) AS total FROM categorias ${sqlWhere}`,
            sqlParams
        );
        const totalCategories = totalResult.total;
        const totalPages = Math.ceil(totalCategories / ITEMS_PER_PAGE);

        return json({ 
            success: true, 
            categorias,
            pagination: {
                page,
                totalPages,
                totalItems: totalCategories
            }
        });
    } catch (error) {
        console.error('Error al obtener categorías:', error.message);
        return json({ success: false, message: 'Fallo al listar categorías.' }, { status: 500 });
    }
}


// ----------------------------------------------------
// POST: Crear Nueva Categoría
// ----------------------------------------------------
export async function POST({ request, locals }) {
    // 1. (SEGURIDAD) Solo Superadmins pueden crear contenido
    if (!locals.user || locals.user.rol !== 'superadmin') {
        return json({ success: false, message: 'Acceso denegado. Solo Superadmins.' }, { status: 403 });
    }
    
    try {
        const { nombre } = await request.json();

        // 2. VALIDACIÓN (Básica)
        if (!nombre || nombre.length < 3 || nombre.length > 100) {
            return json({ success: false, message: 'El nombre debe tener entre 3 y 100 caracteres.' }, { status: 400 });
        }

        const generatedSlug = slugify(nombre, {
            lower: true,           // Convertir a minúsculas
            strict: true,          // Eliminar caracteres no válidos ($, *, etc.)
            locale: 'es'           // Mejor manejo de caracteres en español (ñ, acentos)
        });

        
        // 3. Inserción Segura. Por defecto, 'activo' es 1.
       const result = await query(
                   'INSERT INTO categorias (nombre, slug) VALUES (?, ?)',
                   [nombre.trim(), generatedSlug]
               );

        return json({ success: true, message: 'Categoría creada.', id: result.insertId }, { status: 201 });

    } catch (error) {
        // Maneja error de duplicado (MySQL code 1062 para UNIQUE)
        if (error.code === 'ER_DUP_ENTRY') {
            return json({ success: false, message: 'El nombre de la categoría ya existe.' }, { status: 409 });
        }
        console.error('Error al crear categoría:', error.message);
        return json({ success: false, message: 'Error interno: No se pudo crear la categoría.' }, { status: 500 });
    }
}


// ----------------------------------------------------
// PUT: Actualizar Nombre o Desactivar Categoría
// ----------------------------------------------------
export async function PUT({ request, locals }) {
    // 1. (SEGURIDAD) Solo Superadmins pueden actualizar contenido
    if (!locals.user || locals.user.rol !== 'superadmin') {
        return json({ success: false, message: 'Acceso denegado. Solo Superadmins.' }, { status: 403 });
    }
    
    try {
        const { id, nombre, activo } = await request.json();

        if (!id) {
            return json({ success: false, message: 'ID faltante para actualizar.' }, { status: 400 });
        }
        
        if (nombre) {

            if (nombre.length < 3 || nombre.length > 100) {
                return json({ success: false, message: 'El nombre debe tener entre 3 y 100 caracteres.' }, { status: 400 });
            }
            const result = await query('UPDATE categorias SET nombre = ? WHERE id = ?', [nombre.trim(), id]);
            
            if (result.affectedRows === 0) {
                return json({ success: false, message: 'Categoría no encontrada.' }, { status: 404 });
            }
            return json({ success: true, message: `Categoría ${id} actualizada.` });

        } else if (activo !== undefined) {
            // Desactivar o Reactivar (Soft Delete)
            const newActivoState = activo ? 1 : 0;
            const fechaDesactivacion = (newActivoState === 0) ? 'NOW()' : 'NULL';

            const result = await query(
                `UPDATE categorias SET activo = ?, fecha_desactivacion = ${fechaDesactivacion} WHERE id = ?`,
                [newActivoState, id]
            );

            if (result.affectedRows === 0) {
                return json({ success: false, message: 'Categoría no encontrada.' }, { status: 404 });
            }
            const action = newActivoState === 0 ? 'Desactivada' : 'Reactivada';
            return json({ success: true, message: `Categoría ${id} ${action} con éxito.` });

        } else {
             return json({ success: false, message: 'Datos de actualización inválidos.' }, { status: 400 });
        }

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return json({ success: false, message: 'El nombre de la categoría ya existe.' }, { status: 409 });
        }
        console.error('Error al actualizar categoría:', error.message);
        return json({ success: false, message: 'No se pudo actualizar la categoría.' }, { status: 500 });
    }
}

