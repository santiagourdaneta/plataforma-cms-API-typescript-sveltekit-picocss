<script>
    /** @type {import('./$types').PageData} */
    export let data;

    // Variables de estado
    let settings = data.settings || {}; // Objeto clave-valor de settings
    let rawSettings = data.rawSettings || []; // Lista completa con descripciones
    let initialError = data.error || null;
    
    let successMessage = '';
    let errorMessage = '';
    let isSaving = false;

    // Función para manejar el envío
    async function handleSettingsSubmit() {
        isSaving = true;
        errorMessage = '';
        successMessage = '';

        try {
            // Llamar al endpoint PUT /admin/settings
            const response = await fetch('/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings) // Enviamos todo el objeto de ajustes
            });
            
            const result = await response.json();

            if (result.success) {
                successMessage = result.message || 'Configuración guardada con éxito.';
            } else {
                errorMessage = result.message || 'Fallo al guardar la configuración.';
            }
        } catch (error) {
            errorMessage = 'Fallo de conexión con el servidor.';
        } finally {
            isSaving = false;
        }
    }
</script>

<svelte:head>
    <title>Configuración del Sistema | Plataforma CMS</title>
    <meta name="description" content="Ajustes y variables globales de la plataforma." />
</svelte:head>

<div class="settings-module">
    <h2>⚙️ Configuración del Sistema</h2>

    {#if initialError}
        <article class="error-message">
            <h3>Error de Carga Inicial</h3>
            <p>{initialError}</p>
        </article>
    {/if}

    {#if successMessage}
        <article class="success-message">{successMessage}</article>
    {/if}
    {#if errorMessage}
        <article class="error-message">{errorMessage}</article>
    {/if}

    <form on:submit|preventDefault={handleSettingsSubmit} class="settings-form">
        {#each rawSettings as setting (setting.setting_key)}
            <div class="setting-item">
                <label for={setting.setting_key}>
                    **{setting.setting_key.replace(/_/g, ' ').toUpperCase()}**
                </label>
                <input 
                    type="text" 
                    id={setting.setting_key} 
                    bind:value={settings[setting.setting_key]}
                />
                <small>{setting.description}</small>
            </div>
        {/each}

        <button type="submit" aria-busy={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
    </form>
</div>

<style>
    .settings-module { max-width: 800px; margin: 50px auto; }
    .settings-form { margin-top: 30px; }
    .setting-item { margin-bottom: 20px; border-bottom: 1px dashed var(--pico-color-gray-300); padding-bottom: 15px; }
    .setting-item label { font-weight: bold; margin-bottom: 5px; display: block; }
    .setting-item small { display: block; color: var(--pico-color-gray-500); margin-top: 5px; }

    /* Mensajes */
    .success-message { background-color: var(--pico-ins-color); color: var(--pico-inverse-color); padding: 15px; margin-bottom: 20px; border-radius: var(--pico-border-radius); }
    .error-message { background-color: var(--pico-del-color); color: var(--pico-inverse-color); padding: 15px; margin-bottom: 20px; border-radius: var(--pico-border-radius); }
</style>