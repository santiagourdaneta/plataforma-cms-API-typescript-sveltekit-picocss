<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    
    // Accedemos a los datos del usuario pasados desde layout.server.js
    // $page.data.user contiene { id: ..., rol: ... }
    $: user = $page.data.user;

    // Función para cerrar sesión
    async function logout() {
        // Llama a un endpoint de API para borrar la cookie y la sesión en la DB
        await fetch('/api/logout', { method: 'POST' });
        
        // Redirige al login
        goto('/login');
    }
</script>

<header>
    <nav class="container">
        <ul>
            <li>
                <a href="/admin/dashboard" class="contrast">
                    <strong>🎬 Admin Panel</strong>
                </a>
            </li>
        </ul>

        <ul>
            <li>
                <a href="/admin/videos">Videos</a>
            </li>
            <li>
                <a href="/admin/categorias">Categorías</a>
            </li>
            <li>
                {#if user}
                    <span class="user-info">Hola, {user.rol}</span>
                {/if}
            </li>
            <li>
                <button on:click={logout} class="secondary">
                    Cerrar Sesión
                </button>
            </li>
        </ul>
    </nav>
</header>

<main class="container">
    <slot />
</main>

<footer>
    <div class="container">
        <small>Plataforma Video Web &copy; {new Date().getFullYear()} </small>
    </div>
</footer>

<style>
    /* Estilos específicos del Header y Footer Admin */
    header {
        background-color: var(--pico-background-color);
        padding: 0;
        margin-bottom: 20px; /* Separación del contenido principal */
    }
    nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 10px;
        padding-bottom: 10px;
    }
    nav ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 15px;
    }
    .user-info {
        color: var(--pico-color-gray-400);
        font-size: 0.9em;
    }
    footer {
        margin-top: 50px;
        padding: 20px 0;
        background-color: var(--pico-background-color-secondary);
        border-top: 1px solid var(--pico-border-color);
        text-align: center;
    }
</style>