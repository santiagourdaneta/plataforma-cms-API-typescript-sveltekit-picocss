# 🚀 Plataforma Moderna de Contenido Centrada en el Usuario

!

## 💡 Descripción General

Esta plataforma representa una arquitectura moderna y **orientada a servicios (SOA)**, diseñada desde cero con una fuerte **prioridad en la experiencia del usuario (UX)** y la **gestión eficiente de contenido**.

Actúa como el *front-end* desacoplado de una arquitectura de microservicios, consumiendo datos a través de APIs y ofreciendo una interfaz rápida y altamente reactiva.

## ✨ Características Principales

* **Arquitectura Orientada a Servicios (SOA):** Separación clara entre la presentación (este *front-end*) y los servicios de *back-end* (APIs de datos, autenticación, etc.).
* **Experiencia de Usuario (UX) Superior:** Diseño limpio y accesible, optimizado para la velocidad y la interacción intuitiva.
* **Desarrollo Moderno:** Construido con **TypeScript** para un desarrollo más robusto y escalable.
* **Rendimiento Extremo:** Utiliza **SvelteKit**, aprovechando su compilador para generar paquetes de JavaScript muy pequeños y eficientes.
* **Estilo Minimalista y Accesible:** Implementa **PicoCSS** como *framework* CSS minimalista, garantizando una estética moderna y una base sólida de accesibilidad (*dark mode* incluido).

## 🛠️ Tecnologías Utilizadas

| Categoría | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework** | **SvelteKit** | El *framework* web que impulsa la aplicación. |
| **Lenguaje** | **TypeScript** | Para tipado estático y mejor mantenibilidad del código. |
| **Estilos** | **PicoCSS** | Un CSS *framework* minimalista para estilos limpios y accesibles. |
| **Gestión** | **Vite** | Para el *bundling* rápido y el entorno de desarrollo. |

## ⚙️ Instalación y Ejecución Local

Para poner en marcha el proyecto en tu máquina local, sigue estos pasos:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/santiagourdaneta/plataforma-cms-API-typescript-sveltekit-picocss
    cd plataforma-cms-API-typescript-sveltekit-picocss
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    # o
    pnpm install
    # o
    yarn install
    ```

3.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

    La aplicación estará disponible en `http://localhost:5173`.

4.  **Construir para producción:**
    ```bash
    npm run build
    npm run preview
    ```

    Esto generará la versión optimizada de la aplicación.

## 🤝 Contribución

¡Las contribuciones son bienvenidas! 

## 📄 Licencia

Este proyecto está bajo la Licencia **[MIT]**.