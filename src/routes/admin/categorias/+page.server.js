// src/routes/admin/categorias/+page.server.js

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, url }) {
    // 1. Obtener parámetros de búsqueda y paginación de la URL
    const currentPage = url.searchParams.get('page') || '1';
    const searchTerm = url.searchParams.get('search') || '';
    
    // Configura un límite por página si es necesario (ej. 10)
    const limit = 10; 

    let categoriesData = {};

    try {
        // 2. Construir la URL completa para el fetch a la API
        const apiURL = `/api/categorias?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`;
        
        console.log(`[CATEGORIES LOAD] Fetching: ${apiURL}`);

        const response = await fetch(apiURL); 

        if (response.ok) {
            // 3. Desestructurar la respuesta del JSON
            categoriesData = await response.json();
        } else {
            console.error(`[CATEGORIES LOAD] API responded with status ${response.status}`);
            // Si la API falla, inicializa con un mensaje de error
            categoriesData = {
                success: false,
                message: `Error al cargar categorías: ${response.statusText}`,
                categories: [],
                pagination: { totalPages: 1, page: 1, totalItems: 0 }
            };
        }

    } catch (error) {
        console.error("[CATEGORIES LOAD] Error during fetch:", error);
        // Manejar errores de red o parsing
        categoriesData = {
            success: false,
            message: "Error de conexión o configuración al cargar categorías.",
            categories: [],
            pagination: { totalPages: 1, page: 1, totalItems: 0 }
        };
    }

    // 4. Devolver la estructura de datos al componente +page.svelte
    // El componente Svelte lo recibirá como const { data } = $props(); y accederá a data.categoriesData
    return {
        categoriesData: categoriesData
    };
}