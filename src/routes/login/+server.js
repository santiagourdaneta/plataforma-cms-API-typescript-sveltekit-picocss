// src/routes/login/+server.js
import { json } from '@sveltejs/kit';
import { validarCredenciales } from '$lib/server/auth';
import { createSession } from '$lib/server/session';
import { redirect } from '@sveltejs/kit'; 

export async function POST({ request, cookies }) {
    try {
        const { username, password } = await request.json();

        // 1. Validar Credenciales
        const user = await validarCredenciales(username, password);

        if (!user) {
            // Código 401: No autorizado
            return json({ success: false, message: 'Usuario o contraseña inválidos.' }, { status: 401 });
        }

        // 2. Crear la sesión en la DB y obtener el token.
            const sessionToken = await createSession(user.id); 

        // 3. Establecer la cookie de sesión (usando el token generado y guardado en la DB)
        cookies.set('session_token', sessionToken, {
            path: '/',
            httpOnly: true, // NO accesible por JavaScript (protección XSS)
            sameSite: 'strict', // Protección CSRF
            maxAge: 60 * 60 * 24 // 1 día
        });
        throw redirect(303, '/admin/dashboard');
        //return json({ success: true, message: 'Inicio de sesión exitoso.', user: { id: user.id, rol: user.rol } });

    } catch (error) {
        console.error('Error en el login:', error.message);
        // Código 500: Error interno del servidor
        return json({ success: false, message: 'Error interno del servidor.' }, { status: 500 });
    }
}