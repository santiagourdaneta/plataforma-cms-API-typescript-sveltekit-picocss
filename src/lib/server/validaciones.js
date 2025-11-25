// src/lib/server/validaciones.js
import { query } from '$lib/server/db/mysql.js';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

// Inicializa DOMPurify para el entorno del servidor
const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * Función que limpia el HTML de scripts y atributos peligrosos (XSS).
 * Se permite texto normal, pero se elimina cualquier código malicioso.
 */
function sanitizeHtml(htmlString) {
    // Usamos .sanitize() para limpiar la cadena antes de guardarla.
    // Esto previene XSS al eliminar tags como <script>, onerror, etc.
    return purify.sanitize(htmlString, {
        // Opciones adicionales para un entorno seguro
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'], // Solo permite tags básicos
        ALLOWED_ATTR: [] // No permite atributos (como style, onclick)
    });
}

/**
 * Reglas de validación para una nueva entrada de video.
 * @param {object} data - Los datos del formulario recibidos.
 */
export async function validateVideoData(data) {

    let { titulo, descripcion, precio, id_categoria, url_foto } = data;
    const errors = {};

    // Sanitizar la Descripción antes de la validación final
    data.descripcion = sanitizeHtml(descripcion); 

    // 1. Título
    if (!titulo || titulo.length < 5 || titulo.length > 100) {
        errors.titulo = 'El título debe tener entre 5 y 100 caracteres.';
    }

    // 2. Descripción (Usamos el valor ya sanitizado)
    if (!data.descripcion || data.descripcion.length < 10) {
        errors.descripcion = 'La descripción es muy corta o ha sido sanitizada por seguridad.';
    }

    // 3. Precio
    const precioNumerico = parseFloat(precio);
    if (isNaN(precioNumerico) || precioNumerico < 0) {
        errors.precio = 'El precio debe ser un número positivo.';
    }

    // 4. Categoría (Verificación de existencia en la DB)
    if (!id_categoria || isNaN(parseInt(id_categoria))) {
        errors.id_categoria = 'Categoría inválida.';
    } else {
        const categoriaExists = await query('SELECT id FROM categorias WHERE id = ?', [id_categoria]);
        if (categoriaExists.length === 0) {
            errors.id_categoria = 'La categoría seleccionada no existe.';
        }
    }
    
    // 5. URL/Foto (Asumiendo que se recibe la URL final)
    if (!data.url_foto || !data.url_foto.startsWith('http')) {
        errors.url_foto = 'URL de la foto inválida o faltante.';
    }

    // Si hay errores, lanzamos una excepción
    if (Object.keys(errors).length > 0) {
        const errorMessage = Object.values(errors).join(' | ');
        throw new Error(`Validación fallida: ${errorMessage}`);
    }

    // Retorna los datos limpios y validados
    return data;
}