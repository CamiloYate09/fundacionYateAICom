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
        if (!entryForm) return;
        // Eliminar mensajes de error anteriores
        const existingErrors = entryForm.querySelectorAll('.error-message, .error-container');
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
        if (!modal || !entryForm) return;
        modal.classList.remove('hidden');
        // Establecer la fecha actual por defecto
        const dateInput = entryForm.querySelector('input[name="date"]');
        if (dateInput) dateInput.valueAsDate = new Date();
        // Limpiar errores anteriores
        const existingErrors = entryForm.querySelectorAll('.error-message, .error-container');
        existingErrors.forEach(error => error.remove());
    }

    // Función para ocultar el modal
    function hideModal() {
        if (modal) modal.classList.add('hidden');
        if (entryForm) {
            entryForm.reset();
            // Limpiar errores
            const existingErrors = entryForm.querySelectorAll('.error-message, .error-container');
            existingErrors.forEach(error => error.remove());
        }
    }

    // Event listeners para los botones de agregar entrada
    document.querySelectorAll('.add-entry-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            showModal();
        });
    });

    // Event listener para el botón de cancelar
    const cancelBtn = document.querySelector('.cancel-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', hideModal);

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
    if (entryForm) {
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
            if (container) {
                const entry = createEntry(data);
                container.insertBefore(entry, container.firstChild);
            }

            // Guardar en localStorage
            saveToLocalStorage(currentSection, data);

            hideModal();
        });
    }

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
            if (!container) return;
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

    // =====================
    // Soporte de idiomas ES/EN
    // =====================
    (function setupI18n() {
        const i18nEls = Array.from(document.querySelectorAll('[data-i18n]'));
        if (i18nEls.length === 0) return; // no translatable elements present

        // Guardar HTML original (ES) por clave
        const originalsES = {};
        i18nEls.forEach(el => { originalsES[el.dataset.i18n] = el.innerHTML; });

        // Diccionario EN (usar HTML cuando sea necesario para conservar el span YateAI)
        const EN = {
            hero_subtitle: 'Colombian Innovation in AI',
            hero_p1: 'At <span class="ai-intel-border inline-block rounded-full px-2 py-0.5">YateAI</span>, we believe Artificial Intelligence is the key to unlocking a future of greater efficiency and well-being. From the heart of Colombia, we are building a bridge between AI knowledge and the urgent needs of security, health, and mobility.',
            hero_p2: 'Our foundation not only teaches; it inspires and equips entrepreneurs to create startups that not only grow but also transform lives. We are ready to show the world the power of Colombian innovation. Your support allows us to take these solutions to the next level.',
            cta_join: 'Join Us',
            vision_title: 'Our Vision 2034',
            vision_subtitle: 'Challenges 2025 - 2026',
            card1_title: 'Research',
            card1_text: 'Regulation with the Government of Colombia: laws, standards, and public policies on AI',
            card2_title: 'Platform',
            card2_text: 'Platform for the entire AI ecosystem in Colombia with <span class="ai-intel-border inline-block rounded-full px-2 py-0.5">Yate AI</span>, 2nd semester 2025',
            card3_title: 'CityStream Platform',
            card3_text: 'Platform 1st semester 2026, iOS and Android production',
            videos_title: 'Recommended Videos',
            video_caption: 'Talk about AI and the future of Colombia',
            video_link: 'Watch on YouTube',
            video_note: 'If the player doesn\u2019t load, click the link to watch it directly on YouTube.',
            footer_foundation_heading: '<span class="ai-intel-border inline-block rounded-full px-2 py-0.5">YateAI</span> Foundation',
            footer_about: 'Colombian innovation in Artificial Intelligence for a more efficient future and greater well-being.',
            links_heading: 'Links',
            link_home: 'Home',
            link_about: 'About Us',
            link_projects: 'Projects',
            link_research: 'Research',
            link_blog: 'Blog',
            contact_heading: 'Contact',
            project_heading: 'Flagship Project',
            project_desc: 'Transforming cities with artificial intelligence and real-time data analytics.',
            visit_btn: 'Visit',
            policy: 'Privacy Policy',
            terms: 'Terms of Service',
            sitemap: 'Sitemap',
            copyright: '\u00A9 2025 <span class="ai-intel-border inline-block rounded-full px-2 py-0.5">YateAI</span> Foundation. All rights reserved.'
        };

        function applyLanguage(lang) {
            const isEN = lang === 'en';
            document.documentElement.setAttribute('lang', isEN ? 'en' : 'es');

            // Actualizar textos
            i18nEls.forEach(el => {
                const key = el.dataset.i18n;
                if (isEN) {
                    if (EN[key] !== undefined) el.innerHTML = EN[key];
                } else {
                    if (originalsES[key] !== undefined) el.innerHTML = originalsES[key];
                }
            });

            // Actualizar título del iframe del video principal si existe
            const video = document.getElementById('main-video');
            if (video) {
                video.setAttribute('title', isEN ? EN.video_caption : 'Charla sobre IA y futuro de Colombia');
            }

            // Estado visual de los botones
            const buttons = document.querySelectorAll('#lang-switch .lang-btn');
            buttons.forEach(btn => {
                const active = btn.dataset.lang === (isEN ? 'en' : 'es');
                btn.classList.toggle('bg-indigo-600', active);
                btn.classList.toggle('text-white', active);
                btn.classList.toggle('text-gray-800', !active);
            });

            try { localStorage.setItem('lang', isEN ? 'en' : 'es'); } catch (_) {}
        }

        // Eventos
        document.querySelectorAll('#lang-switch .lang-btn')
            .forEach(btn => btn.addEventListener('click', () => applyLanguage(btn.dataset.lang)));

        // Inicializar
        let initial = 'es';
        try {
            initial = localStorage.getItem('lang') || initial;
        } catch (_) {}
        applyLanguage(initial);
    })();
});
