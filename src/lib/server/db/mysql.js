// src/lib/server/db/mysql.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
// Importamos fail de SvelteKit para manejar errores en la acción del servidor
import { fail } from '@sveltejs/kit'; 

// Carga las variables del archivo .env
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * Función genérica y segura para ejecutar consultas SQL.
 */
export async function query(sql, params) {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute(sql, params);
        return rows;
    } catch (error) {
        // Registra el error REAL de MySQL
        console.error("⛔ Error de DB (Fallo la Conexión o Consulta):", error);
        
        // Relanza el error original para que la función que llama
        // (el archivo de login) pueda manejarlo.
        throw error; 
        
    } finally {
        if (connection) connection.release();
    }
}