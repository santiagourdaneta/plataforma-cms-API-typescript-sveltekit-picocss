// src/hooks.server.js

import { redirect } from '@sveltejs/kit';
import { getSessionUser } from '$lib/server/session'; 

// Usamos JSDoc para tipar la función 'handle', evitando errores de sintaxis en JS.
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const sessionToken = event.cookies.get('session_token');
    
    // --- 1. Lógica de Carga de Sesión (Lectura de la cookie) ---
    if (sessionToken) {
    
        const user = await getSessionUser(sessionToken);
        event.locals.user = user;
    } else {
        event.locals.user = null;
    }

    const user = event.locals.user;
    const path = event.url.pathname;
    
    // --- 2. Lógica de Autorización y Redirección (SÓLO para /admin) ---
    
    // El área pública es la raíz (/) y las rutas /api, /login, /video.
    // Solo necesitamos proteger explícitamente el área de administración.
    
    if (path.startsWith('/admin')) {
        
        // A. Redirección si NO hay usuario
        if (!user) {
            // SÓLO redirige si intentamos acceder a /admin y no estamos logueados
            throw redirect(302, '/login'); 
        }
        
        // B. Verificación de Rol (Si el usuario existe, pero el rol no es admin/superadmin)
        if (user.rol !== 'admin' && user.rol !== 'superadmin') {
            // Si el usuario está logueado pero no es administrador, lo enviamos a la raíz pública
            throw redirect(302, '/');
        }
    }
    
    // --- 3. Resolución de la Solicitud ---
    // Si la ruta NO es /admin (es decir, es /, /login, /api, o /video), 
    // la solicitud es resuelta por SvelteKit y el contenido público se muestra.
    const response = await resolve(event);
    return response;
}