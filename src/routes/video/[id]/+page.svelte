<script>
    /** @type {import('./$types').PageData} */
    export let data;
    
    // El video se carga desde el PageServerLoad
    const video = data.video;

    // Crea la URL de incrustación (embed) de YouTube
    $: embedUrl = `https://www.youtube.com/embed/${video.youtube_id}?autoplay=1`;
</script>

<svelte:head>
    <title>{video.title} | Plataforma de Video</title>
    <meta name="description" content={video.description.substring(0, 160)} />
</svelte:head>

<main class="container">
    <div class="video-container-page">
        <h1>{video.title}</h1>

        <div class="video-player">
            <iframe 
                width="100%" 
                height="100%" 
                {src} 
                title={video.title} 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerpolicy="strict-origin-when-cross-origin" 
                allowfullscreen>
            </iframe>
        </div>

        <article class="video-details">
            <h2>Detalles</h2>
            <p><strong>Categoría:</strong> <span class="badge">{video.category_name}</span></p>
            <p><strong>Publicado:</strong> {new Date(video.created_at).toLocaleDateString()}</p>
            
            <p class="description-text">{video.description}</p>
        </article>
    </div>
</main>

<style>
    .video-container-page {
        max-width: 900px;
        margin: 50px auto;
    }
    .video-player {
        /* Contenedor responsivo 16:9 */
        position: relative;
        width: 100%;
        padding-bottom: 56.25%; /* 16/9 = 1.777... | 1/1.777... = 0.5625 | 56.25% */
        height: 0;
        margin-bottom: 30px;
        overflow: hidden;
        border-radius: var(--pico-border-radius);
    }
    .video-player iframe {
        position: absolute;
        top: 0;
        left: 0;
    }
    .badge {
        background-color: var(--pico-primary-background);
        color: var(--pico-inverse-color);
        padding: 5px 10px;
        border-radius: var(--pico-border-radius);
        font-size: 0.8rem;
        font-weight: bold;
    }
    .description-text {
        white-space: pre-wrap; /* Mantiene saltos de línea y espacios en la descripción */
    }
</style>