// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Agregar animación a las tarjetas
    const cards = document.querySelectorAll('.bg-white');
    cards.forEach(card => {
        card.classList.add('animate-fade-in', 'card');
    });

    // Variables globales
    let currentSection = null;
    const modal = document.getElementById('entry-modal');
    const entryForm = document.getElementById('entry-form');

    // Función para validar el formulario
    function validateForm(formData) {
        const errors = [];
        const title = formData.get('title')?.trim();
        const description = formData.get('description')?.trim();
        const url = formData.get('url')?.trim();
        const date = formData.get('date');

        // Validar título
        if (!title) {
            errors.push('El título es obligatorio');
        } else if (title.length < 3) {
            errors.push('El título debe tener al menos 3 caracteres');
        } else if (title.length > 100) {
            errors.push('El título no puede tener más de 100 caracteres');
        }

        // Validar descripción
        if (!description) {
            errors.push('La descripción es obligatoria');
        } else if (description.length < 10) {
            errors.push('La descripción debe tener al menos 10 caracteres');
        } else if (description.length > 500) {
            errors.push('La descripción no puede tener más de 500 caracteres');
        }

        // Validar URL si se proporciona
        if (url) {
            try {
                new URL(url);
            } catch (e) {
                errors.push('La URL proporcionada no es válida');
            }
        }

        // Validar fecha
        if (!date) {
            errors.push('La fecha es obligatoria');
        } else {
            const selectedDate = new Date(date);
            const today = new Date();
            if (selectedDate > today) {
                errors.push('La fecha no puede ser futura');
            }
        }

        return errors;
    }

    // Función para mostrar errores
    function showErrors(errors) {
        // Eliminar mensajes de error anteriores
        const existingErrors = document.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());

        // Crear y mostrar nuevos mensajes de error
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-container bg-red-50 border border-red-200 rounded-md p-4 mb-4';

        const errorList = document.createElement('ul');
        errorList.className = 'list-disc list-inside text-red-600';

        errors.forEach(error => {
            const li = document.createElement('li');
            li.textContent = error;
            errorList.appendChild(li);
        });

        errorContainer.appendChild(errorList);
        entryForm.insertBefore(errorContainer, entryForm.firstChild);
    }

    // Función para mostrar/ocultar secciones
    function toggleSection(sectionId) {
        const allSections = document.querySelectorAll('.section-content');
        allSections.forEach(section => {
            section.classList.add('hidden');
        });

        const selectedSection = document.getElementById(`${sectionId}-content`);
        if (selectedSection) {
            selectedSection.classList.remove('hidden');
            currentSection = sectionId;
        }
    }

    // Event listeners para las tarjetas principales
    document.querySelectorAll('[data-section]').forEach(card => {
        card.addEventListener('click', () => {
            const sectionId = card.getAttribute('data-section');
            toggleSection(sectionId);
        });
    });

    // Función para mostrar el modal
    function showModal() {
        modal.classList.remove('hidden');
        // Establecer la fecha actual por defecto
        const dateInput = entryForm.querySelector('input[name="date"]');
        dateInput.valueAsDate = new Date();
        // Limpiar errores anteriores
        const existingErrors = document.querySelectorAll('.error-message, .error-container');
        existingErrors.forEach(error => error.remove());
    }

    // Función para ocultar el modal
    function hideModal() {
        modal.classList.add('hidden');
        entryForm.reset();
        // Limpiar errores
        const existingErrors = document.querySelectorAll('.error-message, .error-container');
        existingErrors.forEach(error => error.remove());
    }

    // Event listeners para los botones de agregar entrada
    document.querySelectorAll('.add-entry-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            showModal();
        });
    });

    // Event listener para el botón de cancelar
    document.querySelector('.cancel-btn').addEventListener('click', hideModal);

    // Función para crear una nueva entrada
    function createEntry(data) {
        const entry = document.createElement('div');
        entry.className = 'bg-gray-50 p-4 rounded-lg entry';

        const date = new Date(data.date);
        const formattedDate = date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        entry.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-semibold text-lg">${data.title}</h4>
                    <p class="text-gray-600 text-sm">${formattedDate}</p>
                </div>
                ${data.url ? `<a href="${data.url}" target="_blank" class="text-blue-500 hover:text-blue-600">Ver más</a>` : ''}
            </div>
            <p class="mt-2 text-gray-700">${data.description}</p>
        `;

        return entry;
    }

    // Manejar el envío del formulario
    entryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(entryForm);
        const errors = validateForm(formData);

        if (errors.length > 0) {
            showErrors(errors);
            return;
        }

        const data = {
            title: formData.get('title').trim(),
            description: formData.get('description').trim(),
            url: formData.get('url')?.trim() || '',
            date: formData.get('date')
        };

        // Agregar la entrada a la sección correspondiente
        const container = document.querySelector(`#${currentSection}-content .entries-container`);
        const entry = createEntry(data);
        container.insertBefore(entry, container.firstChild);

        // Guardar en localStorage
        saveToLocalStorage(currentSection, data);

        hideModal();
    });

    // Función para guardar en localStorage
    function saveToLocalStorage(section, data) {
        const key = `fundacion-yate-${section}`;
        let entries = JSON.parse(localStorage.getItem(key) || '[]');
        entries.unshift(data);
        localStorage.setItem(key, JSON.stringify(entries));
    }

    // Función para cargar entradas desde localStorage
    function loadFromLocalStorage() {
        const sections = ['docs', 'proyectos', 'recursos', 'blog'];
        sections.forEach(section => {
            const key = `fundacion-yate-${section}`;
            const entries = JSON.parse(localStorage.getItem(key) || '[]');
            const container = document.querySelector(`#${section}-content .entries-container`);

            entries.forEach(data => {
                const entry = createEntry(data);
                container.appendChild(entry);
            });
        });
    }

    // Cargar entradas al iniciar
    loadFromLocalStorage();

    // Detectar el modo oscuro del sistema
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function handleDarkModeChange(e) {
        if (e.matches) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    // Escuchar cambios en el modo oscuro
    darkModeMediaQuery.addListener(handleDarkModeChange);
    handleDarkModeChange(darkModeMediaQuery);
});