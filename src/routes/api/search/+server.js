// src/routes/api/search/+server.js

export async function GET({ url }) {
    // Obtener el término de búsqueda de la URL (?q=termino)
    const searchTerm = url.searchParams.get('q'); 

    if (!searchTerm || searchTerm.length < 3) {
        return json({ success: true, videos: [] }); // No buscar si el término es muy corto
    }

    // Consulta usando FULLTEXT MATCH AGAINST
    // La cláusula 'IN BOOLEAN MODE' permite manejar la búsqueda como una consulta web.
    const videos = await query(
        `SELECT id, titulo, descripcion, url_foto 
         FROM videos 
         WHERE MATCH (titulo, descripcion) AGAINST (? IN BOOLEAN MODE)
         LIMIT 50`,
        // El signo '+' asegura que la palabra debe estar presente
        [`+${searchTerm}`] 
    );

    return json({ success: true, videos });
}