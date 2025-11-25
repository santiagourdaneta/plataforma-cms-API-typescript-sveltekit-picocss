<script>
    import '../app.css'; // Importación de los estilos globales (Pico.css)
</script>

<svelte:head>
    <title>Plataforma de Video Web | Gestión CMS</title>
</svelte:head>

<div class="global-layout">
    <slot />
</div>

<style>
    /* Estilos muy básicos para asegurar que el layout ocupe todo */
    .global-layout {
        min-height: 100vh;
        padding: 0;
        margin: 0;
    }
</style>