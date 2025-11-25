<script>
    import { format } from 'date-fns';
    import { es } from 'date-fns/locale'; // Para el formato en español

    // 1. Usar $props() para recibir las propiedades individuales
    const { 
        title,           // <-- Viene de {video.titulo} en el padre
        description,     // <-- Viene de {video.descripcion} en el padre
        youtubeId,       // <-- Viene de {video.youtube_id}
        date,            // <-- Ya viene formateada del padre
        category         // <-- Viene de {video.categoria_nombre}
    } = $props();
 
    // 2. Crear el enlace al video
    const videoLink = `/video/${youtubeId}`; 

</script>

<article class="video-card">
    <a href={videoLink} aria-label={`Ver video: ${title}`} class="thumbnail-link">
        {#if category}
            <span class="category-badge">{category}</span>
        {/if}
    </a>

    <div class="card-content">
        <h4>{title}</h4> 
        
        <p class="description">
            {description.substring(0, 100)}{description.length > 100 ? '...' : ''}
        </p>
        <footer>
            <small>Cargado el: {date}</small>
        </footer>
    </div>
</article>

<style>
    /* ... (Los estilos permanecen igual, pero asegúrate de que exista .thumbnail-link) ... */
    .thumbnail-link {
        text-decoration: none; /* Quitar subrayado del enlace */
        color: inherit;
        display: block;
    }
</style>