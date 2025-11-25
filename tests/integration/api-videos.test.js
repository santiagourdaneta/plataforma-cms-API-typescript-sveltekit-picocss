// tests/integration/api-videos.test.js

import { test, expect, beforeAll, afterAll } from 'vitest';
import { GET } from '../../src/routes/api/videos/+server.js';
import { dbConnect, dbClose, setupTestData } from '../db-helpers'; // Helpers simulados

beforeAll(async () => {
    // 1. Conectar a una DB de prueba (o simular la conexión)
    await dbConnect('test_db');
    // 2. Insertar registros de prueba (1 video y 1 categoría)
    await setupTestData(); 
});

test('GET /api/videos devuelve el formato correcto y la lista de videos', async () => {
    // Simular el contexto necesario para la función GET del SvelteKit endpoint
    const mockContext = { 
        url: new URL('http://localhost/api/videos'),
        // ... otros parámetros como request, params, etc.
    }; 
    
    const response = await GET(mockContext);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.videos).toBeInstanceOf(Array);
    expect(body.videos.length).toBeGreaterThan(0);
    
    // Verificar que la estructura de un video sea correcta
    const video = body.videos[0];
    expect(video).toHaveProperty('titulo');
    expect(video).toHaveProperty('youtube_id');
    expect(video).toHaveProperty('categoria_nombre');
});

afterAll(async () => {
    // Limpiar y cerrar la conexión de prueba
    await dbClose();
});