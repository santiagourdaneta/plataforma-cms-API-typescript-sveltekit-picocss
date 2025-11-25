// src/routes/login/+page.server.js 

import { fail, redirect } from '@sveltejs/kit';
import { validarCredenciales } from '$lib/server/auth.js'; 
import { createSession } from '$lib/server/session.js';

export const actions = {

    login: async ({ request, cookies }) => {

        console.log("Servidor: Solicitud POST recibida en /login");

        // LEER DATOS PRIMERO
        const data = await request.formData();
        const username = data.get('username');
        const password = data.get('password');

        // VALIDAR CAMPOS DESPUÉS DE LEERLOS

        if (!username || !password) {
            return fail(400, { success: false, error: 'Faltan campos.' });
        }

        // CONTINUAR CON LA LÓGICA DE NEGOCIO (Autenticación/Sesión)

        // Llama a la lógica de autenticación que retorna {id, nombre, rol} o null
        const user = await validarCredenciales(username, password); 


        if (!user) {
            // Falla por credenciales incorrectas
            return fail(401, { success: false, error: 'Usuario o contraseña incorrectos.' });
        }

        // --- Lógica de Sesión (ÉXITO) ---

            // Autenticación Exitosa: Crear el token de sesión
            const sessionToken = await createSession(user.id); // Crear el token usando el ID

            // Autenticación Exitosa: Establece cookie y redirige
            cookies.set('session_token', sessionToken, { 
                                    path: '/', 
                                    httpOnly: true, 
                                    secure: process.env.NODE_ENV === 'production',
                                    maxAge: 60 * 60 * 24 // 1 día
                });
                
        // Una vez que hemos establecido la cookie,la redirección se ejecuta.
        return redirect(303, '/admin/dashboard');
    }
};