# 🤝 Guía para Contribuir

¡Gracias por tu interés en contribuir a `modern-sveltekit-cms-platform`! Este proyecto se beneficia enormemente de la comunidad y tus contribuciones son bienvenidas.

Para asegurar un proceso fluido y productivo, por favor, sigue estas directrices.

## 🐛 Reporte de Errores (Bugs)

Si encuentras un error (bug), sigue estos pasos:

1.  **Revisa los Issues:** Antes de reportar, verifica si ya existe un *issue* abierto que describa el mismo problema.
2.  **Abre un Nuevo Issue:** Si el error es nuevo, crea un nuevo *issue* utilizando la plantilla "Bug Report".
3.  **Proporciona Información Detallada:** Incluye la siguiente información:
    * Una descripción clara y concisa del error.
    * Pasos exactos para reproducir el comportamiento.
    * El comportamiento que **esperabas** ver.
    * El comportamiento que **realmente** sucedió.
    * Tu entorno (Sistema Operativo, Navegador, versión de Node/npm).

## ✨ Sugerencias de Funcionalidades (Feature Requests)

Si tienes una idea para una nueva funcionalidad o mejora:

1.  **Revisa los Issues y Discussions:** Asegúrate de que la funcionalidad no esté ya planeada o discutida.
2.  **Abre un Nuevo Issue:** Utiliza la plantilla "Feature Request".
3.  **Describe la Propuesta:** Explica el *por qué* de la funcionalidad (el problema que resuelve) y el *cómo* (una posible solución o impacto).

## 💻 Desarrollo y Envío de Código (Pull Requests)

Para enviar tus cambios al proyecto:

1.  **Haz un Fork:** Haz un *fork* del repositorio a tu cuenta de GitHub.
2.  **Crea una Rama:** Crea una nueva rama para tu trabajo. Utiliza nombres descriptivos (ej: `feature/agregar-modo-oscuro` o `fix/corregir-error-login`).
    ```bash
    git checkout -b tu-nueva-rama
    ```
3.  **Realiza tus Cambios:** Implementa tus cambios en tu rama. Asegúrate de que el código sigue las convenciones de estilo existentes.
4.  **Pruebas:** Si aplica, incluye pruebas (tests) que cubran tu nuevo código o el código que modificaste.
5.  **Commit:** Haz un *commit* con un mensaje claro y descriptivo.
    ```bash
    git commit -m "feat: Se agregó la funcionalidad X, solucionando el issue #YYY"
    # o
    git commit -m "fix: Se corrigió un error en el módulo de autenticación"
    ```
6.  **Sube los Cambios:** Sube tu rama a tu *fork*.
    ```bash
    git push origin tu-nueva-rama
    ```
7.  **Abre un Pull Request (PR):**
    * Abre un PR desde tu rama hacia la rama `main` del repositorio original.
    * Asegúrate de enlazar el PR al *issue* que está resolviendo (ej: `Closes #123`).
    * Completa la plantilla del PR con todos los detalles relevantes sobre tus cambios.

### **Convenciones de Código**

* **TypeScript:** El código debe estar fuertemente tipado.
* **Estilo:** Utiliza las herramientas de formato (Prettier/ESLint) configuradas en el proyecto. Ejecuta `npm run format` antes de enviar.

## 🌟 Reconocimiento

Todos los colaboradores serán reconocidos en el archivo `AUTHORS.md` o en la sección de "Contribuciones" del `README.md`.