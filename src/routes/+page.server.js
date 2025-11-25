// src/routes/+page.server.js

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch }) {
    // Llama a la API
    const videosResponse = await fetch(`/api/videos`); 
    const settingsResponse = await fetch('/api/settings');
    
    let videosData = await videosResponse.json();
    let settings = await settingsResponse.json();
    
    return {
        videosData: videosData,
        settings: settings
    };
}