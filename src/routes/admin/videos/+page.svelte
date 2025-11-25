<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    
    /** @type {import('./$types').PageData} */
    export let data; // Recibe { categories: [...] } desde +page.server.js

    // --- VARIABLES DE ESTADO ---
    let videos = [];
    let pagination = { page: 1, totalPages: 1, totalItems: 0 };
    let searchTerm = '';
    let categoryFilter = ''; // Filtro por ID de categoría
    let isLoading = true; // Controla la carga principal de la tabla
    let isSaving = false; // Controla el estado de guardado del modal y la activación/desactivación
    let errorMessage = '';
    let successMessage = '';
    
    // --- VARIABLES DEL MODAL ---
    let isModalOpen = false;
    let currentEditingVideo = { id: null, titulo: '', descripcion: '', categoria_id: '', url_video: '' };
    let newTitle = '';
    let newDescription = '';
    let newCategory = '';
    let newUrl = '';


    // ------------------- DATA LOADING Y FILTROS -------------------

    async function loadVideos(page = 1, queryTerm = searchTerm, catFilter = categoryFilter) {
        
        // Solo seteamos isLoading a true si NO estamos en un proceso de guardado (isSaving)
                if (!isSaving) {
                    isLoading = true;
                    // Limpiar mensajes si no estamos guardando/actualizando
                    errorMessage = ''; 
                    successMessage = ''; 
                }
        

        const params = new URLSearchParams();
        params.append('page', page);
        
        // Aplica filtro de búsqueda solo si es >= 3 caracteres
        if (queryTerm && queryTerm.trim().length >= 3) {
            params.append('q', queryTerm.trim());
        }
        // Aplica filtro de categoría
        if (catFilter) {
            params.append('cat', catFilter);
        }

        try {
            const response = await fetch(`/admin/videos?${params.toString()}`);
            const result = await response.json();

            if (result.success) {
                videos = result.videos;
                pagination = result.pagination;
                // Ajustar la URL del navegador para reflejar el estado actual 
                const currentPath = `${window.location.pathname}?${params.toString()}`;
                window.history.replaceState(null, '', currentPath);
            } else {
                errorMessage = result.message || 'Error al cargar los videos.';
            }
        } catch (error) {
            errorMessage = 'Fallo de conexión al servidor al cargar el listado.';
        } finally {
            isLoading = false;
            isSaving = false; // Asegurar que el estado de guardado se apague
        }
    }

    // Maneja la Paginación
    function changePage(page) {
        if (page >= 1 && page <= pagination.totalPages) {
            loadVideos(page);
        }
    }
    
    // Maneja la Búsqueda Instantánea (Debounce)
    let searchTimeout;
    const MIN_SEARCH_LENGTH = 3;
    function handleSearchInput() {
        clearTimeout(searchTimeout);
        const term = searchTerm.trim();
        
        if (term.length === 0) {
            loadVideos(1, '');
            return;
        }

        if (term.length < MIN_SEARCH_LENGTH) return; 

        searchTimeout = setTimeout(() => {
            loadVideos(1, term);
        }, 300); // 300ms de retraso
    }
    
    // Maneja el filtro de categoría
    function handleCategoryFilter() {
        loadVideos(1, searchTerm, categoryFilter);
    }

    // ------------------- MODAL Y ACCIONES CRUD -------------------

    function openEditModal(video) {
        currentEditingVideo = video;
        newTitle = video.titulo;
        newDescription = video.descripcion || ''; // Manejar nulos
        newCategory = video.categoria_id;
        newUrl = video.youtube_id;
        
        errorMessage = ''; // Limpiar errores del formulario
        isModalOpen = true;
    }

    function closeEditModal() {
        isModalOpen = false;
        // Reiniciar datos al cerrar
        currentEditingVideo = { id: null, titulo: '', descripcion: '', categoria_id: '', url_video: '' };
        // Dejar el mensaje de éxito para que el usuario lo vea
    }
    
    // Función central para actualizar un solo campo
    async function updateVideoField(field, value, videoId) {
        try {
            const response = await fetch('/admin/videos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: videoId, field, value })
            });
            const data = await response.json();

            if (!data.success) {
                // Si falla, lanza un error para que Promise.all falle
                throw new Error(data.message || `Error al actualizar el campo ${field}.`);
            }
            return data;
        } catch (error) {
            throw error; // Propagar el error
        }
    }


    async function saveEditedVideo() {
        isSaving = true; // Iniciar estado de guardado
        errorMessage = ''; // Limpiar errores
        successMessage = ''; // Limpiar éxito
        
        // Validación de campos obligatorios
        if (!newTitle || !newCategory || !newUrl) {
            errorMessage = 'El título, la categoría y la URL son obligatorios.';
            isSaving = false;
            return;
        }

        // Comprobación de que no sea una URL completa
        if (newUrl.includes('youtube.com') || newUrl.includes('youtu.be')) {
            errorMessage = 'Debe ingresar SÓLO el ID del video, no el enlace completo.';
            isLoading = false;
            return;
        }

        // Comprobación de que el ID tenga un formato razonable
        if (newUrl.length < 5 || newUrl.includes(' ')) {
            errorMessage = 'El ID de YouTube parece ser incorrecto.';
            isLoading = false;
            return;
        }

        const updatePromises = [];
        let changesDetected = false;

        // Detección de Cambios
        if (newTitle.trim() !== currentEditingVideo.titulo.trim()) {
            updatePromises.push(updateVideoField('titulo', newTitle.trim(), currentEditingVideo.id));
            changesDetected = true;
        }
        if (newDescription !== (currentEditingVideo.descripcion || '')) {
            updatePromises.push(updateVideoField('descripcion', newDescription, currentEditingVideo.id));
            changesDetected = true;
        }
        if (newCategory !== currentEditingVideo.categoria_id) {
            updatePromises.push(updateVideoField('categoria_id', newCategory, currentEditingVideo.id));
            changesDetected = true;
        }
        if (newUrl.trim() !== currentEditingVideo.url_video.trim()) {
             updatePromises.push(updateVideoField('url_video', newUrl.trim(), currentEditingVideo.id));
             changesDetected = true;
        }

        if (!changesDetected) {
            errorMessage = "No se detectaron cambios para guardar.";
            isSaving = false;
            return;
        }

        try {
            // Ejecutar todas las promesas de actualización en paralelo
            await Promise.all(updatePromises); 
            
            successMessage = "✅ Video actualizado y cambios guardados correctamente.";
            closeEditModal(); // Cerrar el modal
            
            // Recargar la tabla para mostrar los cambios
            await loadVideos(pagination.page); 
            
        } catch (error) {
            // Captura cualquier error lanzado por updateVideoField
            errorMessage = error.message || "Falló una o más operaciones de actualización en la base de datos.";
        } finally {
            isSaving = false; // Finalizar estado de guardado, independientemente del resultado
        }
    }
    
    // Toggle Activo (Soft Delete)
    async function toggleActive(videoId, currentState) {

            const newState = currentState ? 0 : 1;
            const actionVerb = newState === 1 ? 'Reactivar' : 'Desactivar';
            const actionText = newState === 1 ? 'Reactivado' : 'Desactivado'; // Para el mensaje de éxito

            if (confirm(`¿Está seguro de ${actionVerb} el video?`)) {
                        
                        errorMessage = ''; // Limpiar errores
                        successMessage = ''; // Limpiar éxito
                        isSaving = true; // Indicar que hay una operación en curso

                        try {
                            // 1. Esperar la actualización a la base de datos
                            await updateVideoField('activo', newState, videoId);
                            
                            // 2. Establecer el mensaje de éxito global
                            successMessage = `✅ Video ID ${videoId} ${actionText} con éxito.`;
                            
                            // 3. Recargar la lista para refrescar la tabla y el estado del botón
                            await loadVideos(pagination.page); 
                            
                        } catch (error) {
                            // 4. Capturar y mostrar el error
                            errorMessage = error.message;
                        } finally {
                            // 5. Finalizar la operación de guardado
                            isSaving = false;
                        }
                    }
                }
       
    

    onMount(() => {
        loadVideos();
    });
</script>

<svelte:head>
    <title>Gestión de Catálogo de Videos | Plataforma CMS</title>
    <meta name="description" content="Panel de administración para listar, buscar y editar videos." />
</svelte:head>

<div class="video-module">
    <h2>Gestión de Catálogo de Videos</h2>
    
    
    {#if successMessage}
        <article class="success-message"> {successMessage} </article>
    {/if}
    {#if errorMessage}
        <article class="error-message"> {errorMessage} </article>
    {/if}

    <div class="actions-bar grid">
        <input 
            type="search" 
            placeholder="Buscar título/descripción (mín. 3 letras)..." 
            bind:value={searchTerm}
            on:input={handleSearchInput}
            class:loading={isLoading && searchTerm.length >= MIN_SEARCH_LENGTH}
        />

        <select bind:value={categoryFilter} on:change={handleCategoryFilter}>
            <option value="">-- Filtrar por Categoría --</option>
            {#each data.categories as category}
                <option value={category.id}>{category.nombre}</option>
            {/each}
        </select>
        
        <a href="/admin/videos/register" role="button" class="contrast">
            Registrar Video
        </a>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {#each videos as video (video.id)}
                <tr>
                    <td>{video.id}</td>
                    <td title={video.descripcion}>
                        <a href={video.youtube_id} target="_blank">{video.titulo}</a>
                    </td>
                    <td>{video.categoria_nombre}</td>
                    <td>
                        <span class="tag" class:tag-success={video.activo} class:tag-error={!video.activo}>
                            {video.activo ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td>
                        <button 
                            on:click={() => openEditModal(video)} 
                            class="secondary btn-small"
                            disabled={!video.activo}  >
                            Editar
                        </button>

                        <button 
                            on:click={() => toggleActive(video.id, video.activo)} 
                            class="secondary btn-small"
                            class:contrast={!video.activo}
                        >
                            {video.activo ? 'Desactivar' : 'Reactivar'}
                        </button>
                    </td>
                </tr>
            {:else}
                <tr>
                    <td colspan="5">{isLoading ? 'Cargando...' : 'No se encontraron videos.'}</td>
                </tr>
            {/each}
        </tbody>
    </table>

    <nav class="pagination-nav">
        <ul class="pagination">
            <li><button on:click={() => changePage(pagination.page - 1)} disabled={pagination.page <= 1 || isLoading} class="secondary">Anterior</button></li>
            <li class="current-page">Página {pagination.page} de {pagination.totalPages}</li>
            <li><button on:click={() => changePage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages || isLoading} class="secondary">Siguiente</button></li>
        </ul>
    </nav>
</div>


{#if isModalOpen}
    <dialog open>
        <article>
            <header>
                <a href="#close" aria-label="Cerrar" class="close" on:click|preventDefault={closeEditModal}></a>
                <h3>Editar Video ID: {currentEditingVideo.id}</h3>
            </header>

            <form on:submit|preventDefault={saveEditedVideo}>
                <label for="edit_title">Título</label>
                <input type="text" id="edit_title" bind:value={newTitle} required />
                
                <label for="edit_description">Descripción</label>
                <textarea id="edit_description" bind:value={newDescription} rows="3"></textarea>

                <label for="edit_category">Categoría</label>
                <select id="edit_category" bind:value={newCategory} required>
                    <option value="" disabled>--- Seleccionar Categoría ---</option>
                    {#each data.categories as category}
                        <option value={category.id}>{category.nombre}</option>
                    {/each}
                </select>

              
                <label for="edit_url">ID de Video de YouTube</label>
<input 
    type="text" 
    id="edit_url" 
    bind:value={newUrl}
    required 
/>

                
                <footer class="modal-footer">
                    <button type="button" class="secondary" on:click={closeEditModal} disabled={isSaving}>Cancelar</button>
                    <button type="submit" aria-busy={isSaving}>
                        {#if isSaving}
                            Guardando...
                        {:else}
                            Guardar Cambios
                        {/if}
                    </button>
                </footer>
            </form>
            
            {#if errorMessage}
                <article class="error-message">{errorMessage}</article>
            {/if}
        </article>
    </dialog>
{/if}

<style>
    /* ... (Estilos CSS existentes) ... */
    .video-module { max-width: 1200px; margin: 0 auto; }
    .actions-bar { 
        display: grid; 
        grid-template-columns: 2fr 1fr 1fr; 
        gap: 20px; 
        margin-bottom: 20px;
    }
    .success-message { background-color: var(--pico-ins-color); color: var(--pico-inverse-color); padding: 15px; margin-bottom: 20px; border-radius: var(--pico-border-radius); }
    .error-message { background-color: var(--pico-del-color); color: var(--pico-inverse-color); padding: 15px; margin-bottom: 20px; border-radius: var(--pico-border-radius); }
    .tag { padding: 3px 8px; border-radius: var(--pico-border-radius); font-size: 0.8em; font-weight: bold; }
    .tag-success { background-color: var(--pico-ins-color); color: var(--pico-inverse-color); }
    .tag-error { background-color: var(--pico-del-color); color: var(--pico-inverse-color); }
    .btn-small { padding: 5px 10px; font-size: 0.8em; line-height: 1; margin-left: 5px; }

    /* Paginación */
    .pagination-nav { margin-top: 20px; display: flex; justify-content: center; }
    .pagination { display: flex; list-style: none; padding: 0; margin: 0; gap: 10px; align-items: center; }
    .current-page { font-weight: bold; color: var(--pico-color-gray-400); }

    /* Modal */
    dialog[open] { display: flex; align-items: center; justify-content: center; position: fixed; z-index: 1000; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); }
    dialog article { max-width: 600px; width: 90%; margin: auto; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
    
    /* Indicador de carga visual para la búsqueda */
    input.loading {
        background-image: var(--pico-loading-icon); /* Usa un indicador visual si tu framework lo tiene */
        background-repeat: no-repeat;
        background-position: right 10px center;
        background-size: 20px;
    }
</style>