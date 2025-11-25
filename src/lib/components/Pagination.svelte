<script>
    // Usamos $props() para recibir las propiedades en modo Runes (Svelte 5)
    const { 
        currentPage, 
        totalPages, 
        onPageChange 
    } = $props();

    // Función que calcula las páginas a mostrar (por ejemplo, 5 botones)
    function getPagesToShow() {
        const delta = 2; // Mostrar 2 páginas antes y 2 después de la actual
        const start = Math.max(2, currentPage - delta);
        const end = Math.min(totalPages - 1, currentPage + delta);

        const pages = [];
        
        // Agregar la primera página (siempre)
        pages.push(1);

        // Si hay un salto grande desde la primera página
        if (start > 2) {
            pages.push('...');
        }

        // Agregar las páginas intermedias
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        // Si hay un salto grande antes de la última página
        if (end < totalPages - 1) {
            pages.push('...');
        }

        // Agregar la última página (si es diferente de la primera)
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        // Filtrar duplicados que pueden surgir si la paginación es pequeña
        return [...new Set(pages)];
    }

    // Usamos una función $derived para calcular las páginas a mostrar de forma reactiva
    const pagesToShow = $derived(getPagesToShow());

    // Manejador del clic que llama a la función onPageChange del componente padre
    function handleClick(pageNumber) {
        if (pageNumber !== currentPage) {
            // Llama a la prop que es una función para notificar al padre
            onPageChange(pageNumber); 
        }
    }
</script>

{#if totalPages > 1}
    <nav class="pagination-container">
        <button
            onclick={() => handleClick(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Página anterior"
        >
            &laquo; Anterior
        </button>

        {#each pagesToShow as pageNumber}
            {#if pageNumber === '...'}
                <span class="ellipsis">...</span>
            {:else}
                <button
                    onclick={() => handleClick(pageNumber)}
                    class:active={pageNumber === currentPage}
                    aria-current={pageNumber === currentPage ? 'page' : undefined}
                >
                    {pageNumber}
                </button>
            {/if}
        {/each}

        <button
            onclick={() => handleClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Página siguiente"
        >
            Siguiente &raquo;
        </button>
    </nav>
{/if}

<style>
    .pagination-container {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin: 3rem 0;
    }

    .pagination-container button {
        /* Usar estilos base para botones */
        padding: 0.5rem 1rem;
        border: 1px solid var(--pico-color-primary-500);
        background-color: transparent;
        color: var(--pico-color-primary-500);
        cursor: pointer;
        border-radius: var(--pico-border-radius);
    }

    .pagination-container button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .pagination-container button.active {
        background-color: var(--pico-color-primary-600);
        color: var(--pico-color-white);
        border-color: var(--pico-color-primary-600);
        font-weight: bold;
    }

    .ellipsis {
        padding: 0.5rem 0.5rem;
        color: var(--pico-color-gray-500);
        user-select: none;
    }
</style>