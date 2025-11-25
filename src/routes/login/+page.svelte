<script>
    import { goto } from '$app/navigation';

    let username = '';
    let password = '';
    let isLoading = false;
    let message = '';
    let isError = false;

</script>

<div class="container-login">
    <hgroup>
        <h2>Admin - Acceso</h2>
        <p>Catálogo de Videos</p>
    </hgroup>
    
    <form method="POST" action="?/login">
        <label for="username">Usuario</label>
        <input 
            type="text" 
            id="username"
            name="username" 
            bind:value={username} 
            required 
            autocomplete="username"
        />

        <label for="password">Contraseña</label>
        <input 
            type="password" 
            id="password"
            name="password" 
            bind:value={password} 
            required
            autocomplete="current-password"
        />

        <button type="submit" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? 'Accediendo...' : 'Acceder'}
        </button>
    </form>

    {#if message}
        <article class={isError ? 'error-message' : 'info-message'}>
            {message}
        </article>
    {/if}
</div>

<style>
    /* Estilos ligeros para centrar el formulario */
    .container-login {
        max-width: 400px;
        margin: 50px auto;
        padding: 2rem;
        border: 1px solid var(--pico-border-color);
        border-radius: var(--pico-border-radius);
    }
    
    /* Estilos de retroalimentación usando colores del Dark Mode */
    .error-message {
        background-color: var(--pico-form-element-background-color);
        border-left: 5px solid var(--pico-del-color); /* Rojo */
        padding: 10px;
        margin-top: 15px;
    }
    .info-message {
        background-color: var(--pico-form-element-background-color);
        border-left: 5px solid var(--pico-ins-color); /* Verde */
        padding: 10px;
        margin-top: 15px;
    }
</style>