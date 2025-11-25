// src/lib/server/auth.js
import { query } from '$lib/server/db/mysql.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * Busca un usuario por nombre y compara la contraseña (hash)
 * @returns {object | null} Retorna datos del usuario si las credenciales son válidas.
 */
export async function validarCredenciales(nombre_usuario, password) {

    let match = false; 
    let user = null; 

    console.log("Iniciando validación para:", nombre_usuario);
    
    try {
    
    const users = await query(
        'SELECT id, password_hash, rol FROM usuarios_admin WHERE nombre_usuario = ?',
        [nombre_usuario]
    );

    console.log("Consulta de usuario terminada.");

    // Usuario no encontrado
    if (users.length === 0) {
                console.log("Usuario no encontrado.");
                return null;
    }

    user = users[0];

    console.log("Hash de DB:", user.password_hash ? 'Presente' : '¡FALTA!');

    match = await bcrypt.compare(password, user.password_hash); 

    console.log("Comparación de BCrypt terminada. Match:", match);

    } catch (error) {
        // Capturamos el error de la DB y lo volvemos a mostrar en la terminal
        console.error("⛔ FATAL ERROR en validarCredenciales:", error); 
        throw error; // Relanzamos el error para que SvelteKit lo maneje como 500
    }

    if (match) {
        return { 
            id: user.id, 
            nombre: nombre_usuario, 
            rol: user.rol 
        };
    } else {
        return null;
    }
}

/**
 * Genera un token de sesión seguro usando crypto.
 */
export function generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}