<script>
    import { goto } from '$app/navigation';

    /** @type {import('./$types').PageData} */
   // Datos del servidor (PageData)
const { data } = $props();

    let form = $state({
     titulo: '',
     descripcion: '',
     categoria_id: '', 
     youtube_id: ''
});

// Estado para almacenar errores de forma instantánea
let errors = $state({
    titulo: null,
    youtube_id: null,
    descripcion: null,
    categoria_id: null
});

 let activeCategories = data.categories || [];

   let errorMessage = $state(null);
let successMessage = $state(null);
let isLoading = $state(false);

    // Variables de estado del formulario del video
    let videoData = $state({
        titulo: '',
        descripcion: '',
        categoria_id: '', 
        youtube_id: ''
    });;

// Estado de control para deshabilitar el botón de envío
const isFormValid = $derived(() => {
    // El formulario es válido si no hay errores y todos los campos requeridos están llenos.
    return (
        !errors.titulo && form.titulo &&
        !errors.youtube_id && form.youtube_id &&
        !errors.descripcion &&
        !errors.categoria_id
    );
});


function validateField(fieldName, value) {
    let error = null;
    const trimmedValue = value ? value.trim() : '';

    if (fieldName === 'titulo') {
        const MAX_LENGTH = 100;
        const MIN_LENGTH = 5;

        if (!trimmedValue) {
            error = "El título es obligatorio.";
        } else if (trimmedValue.length < MIN_LENGTH) {
            error = `El título debe tener al menos ${MIN_LENGTH} caracteres.`;
        } else if (trimmedValue.length > MAX_LENGTH) {
            // Este caso debería ser prevenido por el atributo maxlength en HTML,
            // pero es bueno tener una validación de fallback.
            error = `El título no puede exceder los ${MAX_LENGTH} caracteres.`;
        }

    } else if (fieldName === 'youtube_id') {
        const MAX_LENGTH = 255;
        
     if (trimmedValue.length > MAX_LENGTH) {
             error = `El ID de Youtube es demasiado largo (máx. ${MAX_LENGTH}).`;
        }

    } else if (fieldName === 'descripcion') {
        
        const MAX_LENGTH = 500;
        const MIN_LENGTH = 10;

        if (!trimmedValue) {
            error = "La descripción es obligatoria.";
        } else if (trimmedValue.length < MIN_LENGTH) {
            error = `La descripción debe tener al menos ${MIN_LENGTH} caracteres.`;
        } else if (trimmedValue.length > MAX_LENGTH) {
            error = `La descripción no puede exceder los ${MAX_LENGTH} caracteres. (Actual: ${trimmedValue.length}/${MAX_LENGTH})`;
        }

    } else if (fieldName === 'categoria_id') {
        
        // Asume que el valor de un select vacío es una cadena vacía o null
        if (!value) { 
            error = "Debes seleccionar una categoría para el video.";
        }
    }
    
    // ⚠️ Importante: Reasignar el objeto $state para que Svelte reaccione
    errors = { ...errors, [fieldName]: error };
}

   
    async function handleVideoSubmit() {
        event.preventDefault();
        isLoading = true;
        errorMessage = '';
        successMessage = '';

        // Validación simple
        if (!videoData.titulo || !videoData.descripcion || !videoData.categoria_id || !videoData.youtube_id) {
            errorMessage = 'El título, la descripcion, la categoría y el youtube_id son obligatorios.';
            isLoading = false;
            return;
        }

        try {
            // Llama al endpoint POST en /admin/videos/+server.js
            const response = await fetch('/admin/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(videoData)
            });
            const result = await response.json();

            if (result.success) {
                successMessage = '¡Video registrado con éxito!';
                // Limpiar el formulario 
                videoData = { titulo: '', descripcion: '', categoria_id: '', youtube_id: '' };
                
                // Redirigir después de 2 segundos para ver el mensaje
                setTimeout(() => {
                    goto('/admin/videos');
                }, 2000);

            } else {
                errorMessage = result.message || 'Fallo al registrar el video.';
            }

        } catch (error) {
            errorMessage = 'Fallo de conexión con el servidor.';
        } finally {
            isLoading = false;
        }
    }
</script>

<svelte:head>
    <title>Registrar Nuevo Video | Plataforma CMS</title>
    <meta name="description" content="Formulario para registrar un nuevo video en el catálogo." />
</svelte:head>

<div class="register-module">
    <h2>➕ Registrar Nuevo Video</h2>
    <p>Completa el formulario para añadir un nuevo elemento al catálogo de videos.</p>

    {#if successMessage}
        <article class="success-message">{successMessage}</article>
    {/if}
    {#if errorMessage}
        <article class="error-message">{errorMessage}</article>
    {/if}

   <form onsubmit={handleVideoSubmit}>
        <div class="grid">

            <label for="titulo">Título del Video *</label>
            <input type="text" id="titulo" bind:value={videoData.titulo} maxlength="100" required onblur={() => validateField('title', form.titulo)}
        aria-invalid={errors.titulo ? 'true' : 'false'}/>
        {#if errors.titulo}
        <small class="error-message">❌ {errors.titulo}</small>
    {/if}
            <label for="categoria_id">Categoría del Video *</label>
            <select id="categoria_id" bind:value={videoData.categoria_id} required onblur={() => validateField('categoryId', form.categoria_id)}
    aria-invalid={errors.categoria_id ? 'true' : 'false'}>

                <option value="" disabled selected>--- Seleccionar Categoría ---</option>
                
                {#each activeCategories as category}
                    <option value={category.id}>
                        {category.nombre}
                    </option>
                {:else}
                    <option value="" disabled>No hay categorías activas disponibles</option>
                {/each}
            </select>
            {#if errors.categoria_id}
    <small class="error-message">❌ {errors.categoria_id}</small>
{/if}
        </div>

        <label for="youtube_id">ID de Video de YouTube *</label>
        <input 
            type="text" 
            id="youtube_id" 
            maxlength="255"
            bind:value={videoData.youtube_id} 
            required onblur={() => validateField('youtube_id', form.youtube_id)}
        aria-invalid={errors.youtube_id ? 'true' : 'false'}  
        />
       {#if errors.youtube_id}
        <small class="error-message">❌ {errors.youtube_id}</small>
    {/if}

        <label for="descripcion">Descripción *</label>
        <textarea id="descripcion" name="descripcion" bind:value={videoData.descripcion} rows="3" maxlength="500"></textarea>
        
        <button type="submit" aria-busy={isLoading} disabled={!isFormValid}>
            {isLoading ? 'Registrando...' : 'Registrar Video'}
        </button>
        <a href="/admin/videos" role="button" class="secondary">Cancelar</a>
    </form>
</div>

<style>
    /* Estilo para los mensajes de error */
.error-message, .success-message {
    color: var(--pico-color-red-600); /* Rojo fuerte */
    font-size: 0.9rem;
    display: block;
    margin-top: -0.5rem; /* Ajuste para pegarlo al campo */
    margin-bottom: 1rem;
    font-weight: 500;
}

/* Estilo para los inputs inválidos (usando el selector de Pico.css) */
[aria-invalid="true"] {
    border-color: var(--pico-color-red-500) !important;
    box-shadow: 0 0 0 1px var(--pico-color-red-500);
}

/* Estilo para deshabilitar el botón */
button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
    .register-module {
        max-width: 600px;
        margin: 50px auto;
        padding: 20px;
    }
    .success-message { background-color: var(--pico-ins-color); color: var(--pico-inverse-color); padding: 15px; margin-bottom: 20px; border-radius: var(--pico-border-radius); }
    .error-message { background-color: var(--pico-del-color); color: white; padding: 15px; margin-bottom: 20px; border-radius: var(--pico-border-radius); }
    
    /* Pequeño ajuste para el grid */
    .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }
    .grid > label, .grid > input, .grid > select {
        grid-column: span 1;
    }
    @media (max-width: 768px) {
        .grid {
            grid-template-columns: 1fr;
        }
    }
</style>