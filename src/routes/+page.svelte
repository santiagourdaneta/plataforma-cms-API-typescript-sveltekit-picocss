<script>
    import { format } from 'date-fns';
    import { es } from 'date-fns/locale'; 
    import VideoCard from '$lib/components/VideoCard.svelte';
    // 🚫 Se eliminan: $app/stores, $app/navigation, onMount, $state, $effect, Pagination
    
    const { data } = $props(); // Recibir datos del servidor

    // Inicializar videos directamente de la data (sin reactividad)
    const initialVideos = data.videosData.videos || [];
    
    // Filtrar videos nulos o inválidos (práctica de seguridad)
    const videos = initialVideos.filter(v => v && v.youtube_id && v.youtube_id.length === 11);
    
    const error = data.videosData.message || null;

    // 🚫 Se eliminan: loadVideos, handlePageChange, handleSearchInput, isFirstEffectRun, etc.
</script>

<svelte:head>
    <title>{data.settings.site_name || 'Plataforma de Video Web'}</title> 
    <meta name="description" content="Plataforma de videos públicos." />
</svelte:head>

<main class="container">
    <header class="page-header">
        <h1>{data.settings.site_name || 'Catálogo de Videos'}</h1>
        </header>

    {#if error}
        <div class="error-message">
            <article class="error-box">
                <h2>❌ Error de Carga</h2>
                <p>{error}</p>
            </article>
        </div>
    {:else if videos.length === 0}
        <div class="no-results-message">
            <p>No hay videos disponibles en este momento.</p>
        </div>
    {:else}
        <section class="video-grid">
            {#each videos as video (video.id)}
                <VideoCard 
                    title={video.titulo}
                    description={video.descripcion}
                    youtubeId={video.youtube_id}
                    category={video.categoria_nombre}
                    date={format(new Date(video.fecha_creacion), 'd LLL yyyy', { locale: es })}
                />
            {/each}
        </section>

        {/if}
</main>

<style>
    /* Mantén tus estilos personalizados aquí */
    .page-header {
        padding-top: 3rem;
        padding-bottom: 2rem;
        text-align: center;
    }

    .video-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
        padding-bottom: 3rem;
    }
</style>