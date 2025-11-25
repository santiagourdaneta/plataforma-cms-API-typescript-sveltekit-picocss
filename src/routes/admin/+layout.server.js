// src/routes/admin/+layout.server.js

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals }) {
    // 1. Obtiene el objeto 'user' que fue establecido en hooks.server.js
    const user = locals.user;

    // 2. Si el usuario existe, se retorna para que esté disponible en $page.data
    // Si no existe, hooks.server.js ya habrá redirigido a /login.
    return {
        user: user
    };
}