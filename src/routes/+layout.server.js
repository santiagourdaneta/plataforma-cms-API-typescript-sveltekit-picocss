// src/routes/+layout.server.js (ARCHIVO TEMPORAL DE DIAGNÓSTICO)

import { error } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, url }) {
    // Si esta función se ejecuta sin lanzar una redirección, 
    // significa que la redirección NO viene de aquí.

    // Comprueba si hay un error en la consola del servidor.
    console.log(`[LAYOUT SERVER LOAD] Carga OK en ruta: ${url.pathname}`); 
    
    // Retorna un objeto simple.
    return {
        isLoggedIn: !!locals.user // En tu caso, siempre será false por la prueba
    };
}