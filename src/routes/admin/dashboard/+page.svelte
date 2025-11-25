<script>
    import { page } from '$app/stores';
    
    // El objeto $page.data contiene el usuario autenticado
    // si usaras un layout principal para el área admin.
    
    // Por ahora, solo confirmamos la carga exitosa
</script>

<div class="dashboard-container">
    <h2>👋 Bienvenido al Panel de Administración</h2>
    
    <div class="actions">
        <a href="/admin/videos" role="button">
            Gestionar Catálogo de Videos
        </a>
        <a href="/admin/settings" role="button" class="secondary">
            Configuración del Sistema
        </a>
    </div>
</div>

<style>
    .dashboard-container {
        max-width: 800px;
        margin: 50px auto;
        padding: 30px;
        background-color: var(--pico-background-color);
        border: 1px solid var(--pico-border-color);
        border-radius: var(--pico-border-radius);
    }
    h2 {
        color: var(--pico-h1-color);
        margin-bottom: 20px;
    }
    .actions {
        margin-top: 30px;
        display: flex;
        gap: 15px;
    }
</style>