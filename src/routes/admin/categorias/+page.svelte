<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import slugify from 'slugify';
    // Recibir el objeto 'data' del Page Load
const { data } = $props();

   // 1. Declaraciones de Estado Reactivo
let categorias = $state(data.categoriesData.categories || []); // Inicializar desde SSR data
let pagination = $state(data.categoriesData.pagination || {}); // Inicializar desde SSR data
let newCategoryName = $state(''); // Para el input de nueva categoría
let searchTerm = $state(''); // Para el input de búsqueda
let isLoading = $state(false); // Para mostrar el loader
let errorMessage = $state(null); // Para mostrar errores
let successMessage = $state(null); // Para mostrar éxito

// 2. Declaraciones para el Modal de Edición
let isModalOpen = $state(false);
let currentEditingCategory = $state(null);
let newCategoryNameInput = $state('');

     let errors = $state({
    newCategoryName: null // Inicializa los campos que tienes en el formulario
    // Puedes añadir otros campos si el formulario es más complejo
});
     let form = $state({
   newCategoryName: '', // Campo para el nombre de la categoría
    // Añade aquí cualquier otro campo que tu formulario de categorías use (ej. slug, description)
});

    function validateField(fieldName, value) {

    const trimmedValue = value ? value.trim() : '';

    if (fieldName === 'newCategoryName') {  
        const MAX_LENGTH = 100;
        const MIN_LENGTH = 3;

        if (!trimmedValue) {
            error = "El nombre de la categoría es obligatorio. No puede estar vacío.";
        } else if (trimmedValue.length < MIN_LENGTH) {
            error = `El nombre debe tener al menos ${MIN_LENGTH} caracteres.`;
        } else if (trimmedValue.length > MAX_LENGTH) {
            error = `El nombre no puede exceder los ${MAX_LENGTH} caracteres. (Actual: ${trimmedValue.length})`;
        }
    }
    
    //  Importante: Reasignar el objeto $state para que Svelte reaccione
    errors = { ...errors, [fieldName]: error };
}

        // Función que se llama al hacer clic en 'Editar' en la tabla
        function openEditModal(categoria) {
            console.log("Abriendo modal para:", categoria.nombre);
            currentEditingCategory = categoria;
            newCategoryNameInput = categoria.nombre; // Carga el nombre actual en el input
            isModalOpen = true;
        }

        // Función para cerrar el modal
        function closeEditModal() {
            isModalOpen = false;
            currentEditingCategory = { id: null, nombre: '' };
        }


        // 3. Función para Guardar la Edición
        async function saveEditedName() {
            if (newCategoryNameInput.trim() === currentEditingCategory.nombre.trim()) {
                errorMessage = 'No hay cambios en el nombre.';
                return;
            }

            if (newCategoryNameInput.length < 3 || newCategoryNameInput.length > 100) {
                errorMessage = 'El nuevo nombre debe tener entre 3 y 100 caracteres.';
                return;
            }
            
            try {
                const response = await fetch('/admin/categorias', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        id: currentEditingCategory.id, 
                        nombre: newCategoryNameInput.trim() 
                    })
                });
                const data = await response.json();

                if (data.success) {
                    successMessage = data.message;
                    closeEditModal();
                    loadCategories(pagination.page); // Recarga la página actual
                } else {
                    errorMessage = data.message;
                }
            } catch (error) {
                errorMessage = 'Fallo al conectar para actualizar la categoría.';
            }
        }
    
    // Función central para cargar la lista de categorías
    async function loadCategories(page = 1, queryTerm = searchTerm) {
        isLoading = true;
        errorMessage = '';
        
        // Construye los parámetros de la URL para paginación y búsqueda
        const params = new URLSearchParams();
        params.append('page', page);
        if (queryTerm) {
            params.append('q', queryTerm);
        }

        try {
            const response = await fetch(`/admin/categorias?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                categorias = data.categorias;
                pagination = data.pagination;
            } else {
                errorMessage = data.message || 'Error al cargar las categorías.';
            }
        } catch (error) {
            errorMessage = 'Fallo de conexión al servidor.';
        } finally {
            isLoading = false;
        }
    }

    // Maneja la paginación
    function changePage(page) {
        if (page >= 1 && page <= pagination.totalPages) {
            goto(`?page=${page}&q=${searchTerm}`, { replaceState: true }); // Actualiza la URL
            loadCategories(page);
        }
    }
    
    // Maneja la búsqueda
   let searchTimeout;
   const MIN_SEARCH_LENGTH = 3;

    function handleSearchInput() {

        // 1. Limpia el temporizador anterior
                clearTimeout(searchTimeout);

                // 2. Si el término de búsqueda está vacío, o es menor al mínimo, recarga la página 1 sin filtro.
                if (searchTerm.length === 0) {
                    loadCategories(1, '');
                    return;
                }

                // 3. Verifica el umbral de caracteres
                if (searchTerm.length < MIN_SEARCH_LENGTH) {
                    // No hacemos nada si no se cumplen los 3 caracteres, esperando la siguiente pulsación.
                    return;
                }

                // 4. Establece un nuevo temporizador (DEBOUNCE)
                searchTimeout = setTimeout(() => {
                    loadCategories(1, searchTerm); // Recarga la primera página con el término
                }, 300); // 300ms de retraso para evitar llamadas excesivas
            }


    // ------------------- CRUD ACTIONS -------------------

    // 1. Crear Categoría
    async function createCategory() {
        if (!newCategoryName) return;

        try {
            const response = await fetch('/admin/categorias', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: newCategoryName })
            });
            const data = await response.json();

            if (data.success) {
                successMessage = data.message;
                newCategoryName = '';
                loadCategories(1); // Recarga la primera página
            } else {
                errorMessage = data.message;
            }
        } catch (error) {
            errorMessage = 'Fallo al conectar para crear la categoría.';
        }
    }
    
    // 2. Desactivar/Reactivar Categoría (Soft Delete)
    async function toggleActive(categoriaId, currentState) {
        const newState = !currentState;
        const action = newState ? 'Reactivar' : 'Desactivar';
        if (!confirm(`¿Está seguro de ${action} la categoría ID ${categoriaId}?`)) {
            return;
        }

        try {
            const response = await fetch('/admin/categorias', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: categoriaId, activo: newState })
            });
            const data = await response.json();

            if (data.success) {
                successMessage = data.message;
                loadCategories(pagination.page); // Recarga la página actual
            } else {
                errorMessage = data.message;
            }
        } catch (error) {
            errorMessage = 'Fallo al actualizar el estado de la categoría.';
        }
    }

    // Carga inicial al montar el componente
    onMount(() => {
        loadCategories(pagination.page);
    });
</script>

<svelte:head>
    <title>Gestión de Categorías | Plataforma CMS</title>
    <meta name="description" content="Panel de administración para gestión de categorías de video." />
</svelte:head>

<div class="category-module">
    <h2>Gestión de Categorías</h2>
    <p>Total de categorías: {pagination.totalItems}</p>

    {#if successMessage}
        <article class="success-message">
            {successMessage}
            <button onclick={() => successMessage = ''} class="close-btn" aria-label="Cerrar notificación">×</button>
        </article>
    {/if}
    {#if errorMessage}
        <article class="error-message">
            {errorMessage}
            <button onclick={() => errorMessage = ''} class="close-btn" aria-label="Cerrar error">×</button>
        </article>
    {/if}

    <article class="creation-form">
        <hgroup>
            <h3>Crear Nueva Categoría</h3>
        </hgroup>
        <form onsubmit={createCategory}>
            <div class="grid">
                <label for="categoryName">Nombre de la Categoría *</label>
                <input 
                    type="text"
                    id="newCategoryName" 
                    placeholder="Nombre de la nueva categoría (ej: Acción, Ciencia Ficción)"
                    bind:value={newCategoryName}
                    onblur={() => validateField('categoryName', form.newCategoryName)} aria-invalid={errors.newCategoryName ? 'true' : 'false'}
                    maxlength="100"
                    required
                />
                {#if errors.categoryName}
    <small class="error-message">❌ {errors.categoryName}</small> {/if}

<small class="help-text">
    Máximo 100 caracteres. ({form.NewCategoryName?.length || 0}/100) 
</small>
                <button type="submit" aria-busy={isLoading}>
                    Crear
                </button>
            </div>
        </form>
    </article>

    <article class="search-section">
        <input 
            type="search" 
            placeholder="Buscar categoría (mínimo 3 letras)..." 
            bind:value={searchTerm}
            oninput={handleSearchInput}
        />
        {#if isLoading}
            <p aria-busy="true">Cargando...</p>
        {/if}
    </article>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {#each categorias as categoria (categoria.id)}
                <tr>
                    <td>{categoria.id}</td>
                    <td>
                        {categoria.nombre}
                        {#if !categoria.activo}
                            <small class="tag-inactivo"> (INACTIVA)</small>
                        {/if}
                    </td>
                    <td>
                        <span class="tag" class:tag-success={categoria.activo} class:tag-error={!categoria.activo}>
                            {categoria.activo ? 'Activa' : 'Desactivada'}
                        </span>
                    </td>
                    <td>{new Date(categoria.fecha_creacion).toLocaleDateString()}</td>
                   

                        <td>
                                                <button onclick={() => openEditModal(categoria)} class="secondary btn-small"
        aria-label="Editar Categoría"
    >
        Editar
    </button>
                                                <button onclick={() => toggleActive(categoria.id, categoria.activo)} class="secondary btn-small"
                                                    class:contrast={!categoria.activo}
                                                    aria-label={categoria.activo ? 'Desactivar' : 'Reactivar'}
                                                >
                                                    {categoria.activo ? 'Desactivar' : 'Reactivar'}
                                                </button>
                                            </td>
                </tr>
            {:else}
                <tr>
                    <td colspan="5">No se encontraron categorías.</td>
                </tr>
            {/each}
        </tbody>
    </table>

    <nav class="pagination-nav">
        <ul class="pagination">
            <li>
                <button onclick={() => changePage(pagination.page - 1)} disabled={pagination.page <= 1} class="secondary">
                    Anterior
                </button>
            </li>
            <li class="current-page">Página {pagination.page} de {pagination.totalPages}</li>
            <li>
                <button onclick={() => changePage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} class="secondary">
                    Siguiente
                </button>
            </li>
        </ul>
    </nav>
</div>
{#if isModalOpen}
    <dialog open>
        <article>
            <header>
                <a href="#close" 
                   aria-label="Cerrar" 
                   class="close" 
                   onclick={closeEditModal}
                ></a>
                <h3>Editar Categoría ID: {currentEditingCategory.id}</h3>
            </header>

            <form onsubmit={saveEditedName}>
                <label for="new_category_name">Nuevo Nombre</label>
                <input 
                    type="text" 
                    id="new_category_name" 
                    placeholder="Escriba el nuevo nombre de la categoría"
                    bind:value={newCategoryNameInput}
                    maxlength="100"
                    required
                />
                
                <footer class="modal-footer">
                    <button type="button" class="secondary" onclick={closeEditModal}>
                        Cancelar
                    </button>
                    <button type="submit" aria-busy={isLoading}>
                        Guardar Cambios
                    </button>
                </footer>
            </form>

        </article>
    </dialog>
{/if}
<style>
    /* Estilos del módulo */
    .category-module {
        max-width: 900px;
        margin: 0 auto;
    }
    
    /* Paginación */
    .pagination-nav {
        margin-top: 20px;
        display: flex;
        justify-content: center;
    }
    .pagination {
        display: flex;
        list-style: none;
        padding: 0;
        margin: 0;
        gap: 10px;
        align-items: center;
    }
    .current-page {
        font-weight: bold;
        color: var(--pico-color-gray-400);
    }

    /* Tags de Estado */
    .tag {
        padding: 3px 8px;
        border-radius: var(--pico-border-radius);
        font-size: 0.8em;
        font-weight: bold;
    }
    .tag-success {
        background-color: var(--pico-ins-color); /* Verde */
        color: var(--pico-inverse-color);
    }
    .tag-error {
        background-color: var(--pico-del-color); /* Rojo */
        color: var(--pico-inverse-color);
    }
    .tag-inactivo {
        color: var(--pico-del-color);
        font-weight: normal;
        margin-left: 5px;
    }
    .btn-small {
        padding: 5px 10px;
        font-size: 0.8em;
        line-height: 1;
    }

    /* Mensajes de Notificación */
    .success-message, .error-message {
        position: relative;
        padding: 15px;
        margin-bottom: 20px;
        border-radius: var(--pico-border-radius);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
    }
    .success-message {
        background-color: var(--pico-ins-color); /* Verde */
        color: var(--pico-inverse-color);
    }
    .error-message {
        background-color: var(--pico-del-color); /* Rojo */
        color: var(--pico-inverse-color);
    }
    .close-btn {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        font-size: 1.5em;
        line-height: 1;
        margin-left: 10px;
        padding: 0;
        opacity: 0.7;
    }
    .close-btn:hover {
        opacity: 1;
    }
</style>