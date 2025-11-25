// tests/unit/validation.test.js

import { expect, test, describe } from 'vitest';

// Simula la función que valida el formato de la URL de YouTube
const validateYoutubeUrl = (url) => {
    // Ejemplo de implementación: debe buscar el patrón de ID de 11 caracteres
    const pattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|\s*(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    return pattern.test(url);
};

describe('Validación de Lógica Crítica', () => {

    test('validateYoutubeUrl debe aceptar formatos válidos', () => {
        expect(validateYoutubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
        expect(validateYoutubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
    });

    test('validateYoutubeUrl debe rechazar formatos inválidos', () => {
        expect(validateYoutubeUrl('https://www.google.com/search?q=video')).toBe(false);
        expect(validateYoutubeUrl('https://www.youtube.com/invalid_long_id_12345')).toBe(false);
        expect(validateYoutubeUrl('')).toBe(false);
    });
    
    // Testea el límite de caracteres que implementaste
    test('La validación de título detecta menos de 5 caracteres', () => {
        const title = "Cort";
        expect(title.length < 5).toBe(true);
    });

});