// src/lib/server/session.js

import { query } from '$lib/server/db/mysql.js';
import { generateSessionToken } from '$lib/server/auth.js';

// Duración de la sesión: 1 día (en segundos)
const SESSION_DURATION_SECONDS = 60 * 60 * 24; 

/**
 * Crea una nueva sesión en la base de datos y devuelve el token.
 */
export async function createSession(userId) {
    const sessionToken = generateSessionToken();
    
    // Calcula el tiempo de expiración
    const expira_en = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' '); // Formato TIMESTAMP de MySQL 'YYYY-MM-DD HH:MM:SS'
try {
    // Inserta la sesión en la tabla
    await query(
        'INSERT INTO sesiones (token, id_usuario_admin, expira_en) VALUES (?, ?, ?)',
        [sessionToken, userId, expira_en]
    );

    console.log(`SESSION OK: Token creado para UserID: ${userId}`); 
    return sessionToken;

    } catch (error) {
        
        console.error("🔴 ERROR DE INSERCIÓN DE SESIÓN:", error);
        throw error; // Relanza el error para que el catch de +page.server.js lo capture.
    }
}

/**
 * Busca una sesión por token y verifica si no ha expirado.
 */
export async function getSessionUser(sessionToken) {
    const [session] = await query(
        `SELECT u.id, u.rol
         FROM sesiones s
         JOIN usuarios_admin u ON s.id_usuario_admin = u.id
         WHERE s.token = ? AND s.expira_en > NOW()`, 
        [sessionToken]
    );

    if (session) {
        return { id: session.id, rol: session.rol };
    }
    return null;
}