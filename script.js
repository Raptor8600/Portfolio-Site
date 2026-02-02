(() => {

    // Script.js

    document.addEventListener('DOMContentLoaded', () => {
        // Initialize Lucide Icons
        if (window.lucide) {
            lucide.createIcons();
        }


        // Trigger Hero Entrance on Load

        // Smooth Scrolling for Anchors
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return; // Allow default/other listeners for "#"

                e.preventDefault();
                try {
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                } catch (err) {
                    console.warn("Invalid scroll target:", href);
                }
            });
        });

        // Mobile Menu Toggle
        const mobileBtn = document.getElementById('mobile-menu');
        const navLinks = document.querySelector('.nav-links');

        if (mobileBtn) {
            mobileBtn.addEventListener('click', () => {
                const isVisible = navLinks.style.display === 'flex';
                if (window.innerWidth <= 768) {
                    if (isVisible) {
                        navLinks.style.display = 'none';
                    } else {
                        navLinks.style.display = 'flex';
                        navLinks.style.flexDirection = 'column';
                        navLinks.style.position = 'absolute';
                        navLinks.style.top = '100%';
                        navLinks.style.left = '0';
                        navLinks.style.width = '100%';
                        navLinks.style.backgroundColor = 'white';
                        navLinks.style.padding = '1rem';
                        navLinks.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                        navLinks.style.zIndex = '1001';
                    }
                }
            });
        }

        // Scroll Reveal Animation - Soft Apple Style
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Apply reveal to sections, headers, cards and tags
        document.querySelectorAll('section, .section-header, .experience-card, .tag').forEach((el, index) => {
            el.classList.add('reveal');
            // Add staggered delay for tags if they are clustered
            if (el.classList.contains('tag')) {
                el.style.transitionDelay = `${(index % 10) * 0.05}s`;
            }
            revealObserver.observe(el);
        });

        // --- PROJECT CAROUSEL DOTS ---
        const carousel = document.querySelector('.projects-carousel');
        const dotsContainer = document.getElementById('carousel-dots');
        const projectCards = carousel ? carousel.querySelectorAll('.experience-card') : [];

        if (carousel && dotsContainer && projectCards.length > 0) {
            // Clear existing dots
            dotsContainer.innerHTML = '';

            // Create dots
            projectCards.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    const cardWidth = projectCards[0].offsetWidth + parseInt(getComputedStyle(carousel).gap || '0');
                    carousel.scrollTo({
                        left: index * cardWidth,
                        behavior: 'smooth'
                    });
                });
                dotsContainer.appendChild(dot);
            });


            // Update active dot on scroll
            carousel.addEventListener('scroll', () => {
                const currentCards = carousel.querySelectorAll('.experience-card');
                if (currentCards.length === 0) return;

                const scrollLeft = carousel.scrollLeft;
                const cardWidth = currentCards[0].offsetWidth + parseInt(getComputedStyle(carousel).gap || '0');

                let activeIndex = Math.round(scrollLeft / cardWidth);

                if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 5) {
                    activeIndex = currentCards.length - 1;
                }

                dotsContainer.querySelectorAll('.dot').forEach((dot, index) => {
                    dot.classList.toggle('active', index === activeIndex);
                });
            });
        }

        // --- ADMIN / EDIT MODE LOGIC ---
        const adminTrigger = document.getElementById('admin-trigger');
        const adminBar = document.getElementById('admin-bar');
        const saveBtn = document.getElementById('save-btn');
        const cancelBtn = document.getElementById('cancel-btn');
        const addExpBtn = document.getElementById('add-exp-btn');
        const addProjBtn = document.getElementById('add-proj-btn');
        const addAwardBtn = document.getElementById('add-award-btn');
        const addVolunteerBtn = document.getElementById('add-volunteer-btn');
        const addArticleBtn = document.getElementById('add-article-btn');

        // Hidden File Inputs
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.accept = 'image/*';
        imageInput.style.display = 'none';
        document.body.appendChild(imageInput);

        const pdfInput = document.createElement('input');
        pdfInput.type = 'file';
        pdfInput.accept = 'application/pdf';
        pdfInput.style.position = 'fixed';
        pdfInput.style.top = '-100px';
        pdfInput.style.left = '-100px';
        pdfInput.style.visibility = 'hidden';
        document.body.appendChild(pdfInput);

        const mediaInput = document.createElement('input');
        mediaInput.type = 'file';
        mediaInput.accept = 'image/*,video/*';
        mediaInput.style.position = 'fixed';
        mediaInput.style.top = '-100px';
        mediaInput.style.left = '-100px';
        mediaInput.style.visibility = 'hidden';
        document.body.appendChild(mediaInput);

        let currentEditingImage = null;
        let currentEditingPdfLink = null;
        let currentMediaTarget = null;

        if (adminTrigger) {
            adminTrigger.addEventListener('click', async (e) => {
                e.preventDefault();
                const password = prompt("Enter Admin Password:");
                if (password === 'finance2026') {
                    enableEditMode();
                } else {
                    alert("Incorrect password.");
                }
            });
        }

        function enableEditMode() {
            document.body.classList.add('edit-mode');
            adminBar.classList.remove('hidden');

            addDeleteButtons();
            enableDragAndDrop();

            document.querySelectorAll('[data-editable="true"]').forEach(el => {
                el.setAttribute('contenteditable', 'true');
            });

            document.querySelectorAll('[data-editable-image="true"]').forEach(img => {
                img.style.cursor = 'pointer';
                img.style.outline = '4px solid var(--color-secondary)';
                img.title = "Click to upload new image";
                img.addEventListener('click', handleImageClick);
            });

            document.querySelectorAll('[data-editable-link="true"]').forEach(link => {
                link.style.cursor = 'pointer';
                link.style.outline = '2px dashed #00ff00';
                link.title = "Click to edit URL";
                link.addEventListener('click', handleLinkClick);
            });

            document.querySelectorAll('[data-editable-pdf="true"]').forEach(link => {
                link.style.cursor = 'pointer';
                link.style.outline = '2px dashed red';
                link.title = "Click to upload PDF resume";
                link.addEventListener('click', handlePdfClick);
            });

            // Add "Insert Media" buttons to cards that don't have media
            // And "Remove Media" buttons to those that do
            setupMediaControls();

            toggleFormattingToolbar(true);
            alert("Edit Mode Active.");
        }

        function handleImageClick(e) {
            if (!document.body.classList.contains('edit-mode')) return;
            currentEditingImage = e.target;
            imageInput.click();
        }

        function handleLinkClick(e) {
            if (!document.body.classList.contains('edit-mode')) return;
            e.preventDefault();
            const link = e.currentTarget;
            const currentHref = link.getAttribute('href');
            const newHref = prompt("Enter new URL:", currentHref);
            if (newHref !== null) {
                link.setAttribute('href', newHref);
            }
        }

        function handlePdfClick(e) {
            if (!document.body.classList.contains('edit-mode')) return;
            e.preventDefault();
            currentEditingPdfLink = e.currentTarget;
            pdfInput.click();
        }

        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && currentEditingImage) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    currentEditingImage.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        pdfInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && currentEditingPdfLink) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    currentEditingPdfLink.setAttribute('href', event.target.result);
                    currentEditingPdfLink.setAttribute('download', 'resume.pdf');
                };
                reader.readAsDataURL(file);
            }
        });

        mediaInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && currentMediaTarget) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    const result = event.target.result;
                    const isVideo = file.type.startsWith('video/');
                    let mediaEl;

                    if (isVideo) {
                        mediaEl = document.createElement('video');
                        mediaEl.setAttribute('autoplay', '');
                        mediaEl.setAttribute('muted', '');
                        mediaEl.setAttribute('loop', '');
                        mediaEl.setAttribute('playsinline', '');
                        mediaEl.setAttribute('data-editable-video', 'true');
                    } else {
                        mediaEl = document.createElement('img');
                        mediaEl.setAttribute('data-editable-image', 'true');
                    }

                    mediaEl.src = result;
                    mediaEl.className = 'project-preview-img';
                    mediaEl.style.width = '100%';
                    mediaEl.style.borderRadius = '8px';
                    mediaEl.style.marginBottom = '1.5rem';
                    mediaEl.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';

                    // Replace existing or prepend to card body
                    const existingImg = currentMediaTarget.querySelector('img, video');
                    if (existingImg) {
                        existingImg.replaceWith(mediaEl);
                    } else {
                        currentMediaTarget.prepend(mediaEl);
                    }

                    // Refresh controls
                    setupMediaControls();
                };
                reader.readAsDataURL(file);
            }
        });

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                saveChanges();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (confirm("Discard changes?")) {
                    location.reload();
                }
            });
        }

        function saveChanges() {
            disableEditModeUI();

            // Clear existing reveal animations before cloning
            // This prevents the page from being saved in the "visible" state
            document.querySelectorAll('.reveal').forEach(el => {
                el.classList.remove('active');
            });

            const clone = document.documentElement.cloneNode(true);
            const cloneBody = clone.querySelector('body');
            cloneBody.classList.remove('edit-mode');
            const cloneAdminBar = clone.querySelector('#admin-bar');
            if (cloneAdminBar) cloneAdminBar.classList.add('hidden');

            // Robustly remove any toolbars from the clone
            clone.querySelectorAll('.formatting-toolbar, #formatting-toolbar').forEach(tb => tb.remove());

            clone.querySelectorAll('.delete-card-btn, .media-control-btn').forEach(btn => btn.remove());
            clone.querySelectorAll('[draggable]').forEach(el => {
                el.removeAttribute('draggable');
                el.classList.remove('draggable');
            });
            // Remove file inputs from clone
            clone.querySelectorAll('input[type="file"]').forEach(input => input.remove());

            const htmlContent = "<!DOCTYPE html>\n" + clone.outerHTML;
            const blob = new Blob([htmlContent], { type: "text/html" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "index.html";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert("Changes saved! An updated 'index.html' has been downloaded.");
        }

        function disableEditModeUI() {
            document.body.classList.remove('edit-mode');
            adminBar.classList.add('hidden');
            toggleFormattingToolbar(false);
            document.querySelectorAll('.delete-card-btn, .media-control-btn').forEach(btn => btn.remove());
            disableDragAndDrop();
            document.querySelectorAll('[contenteditable]').forEach(el => {
                el.removeAttribute('contenteditable');
            });
            document.querySelectorAll('[data-editable-image="true"], [data-editable-video="true"]').forEach(img => {
                img.style.cursor = ''; img.style.outline = ''; img.title = "";
            });
            document.querySelectorAll('[data-editable-link="true"]').forEach(link => {
                link.style.cursor = ''; link.style.outline = ''; link.title = "";
            });
            document.querySelectorAll('[data-editable-pdf="true"]').forEach(link => {
                link.style.cursor = ''; link.style.outline = ''; link.title = "";
            });
        }

        function setupMediaControls() {
            if (!document.body.classList.contains('edit-mode')) return;

            // Remove existing management buttons first
            document.querySelectorAll('.media-control-btn').forEach(btn => btn.remove());

            document.querySelectorAll('.experience-card .exp-body').forEach(body => {
                const media = body.querySelector('img, video');

                if (media) {
                    // Add Remove button
                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'media-control-btn remove-media-btn';
                    removeBtn.innerHTML = '🗑️ Remove Media';
                    removeBtn.style.padding = '4px 8px';
                    removeBtn.style.margin = '10px 0';
                    removeBtn.style.fontSize = '0.7rem';
                    removeBtn.style.cursor = 'pointer';
                    removeBtn.addEventListener('click', () => {
                        media.remove();
                        setupMediaControls();
                    });
                    body.insertBefore(removeBtn, media.nextSibling);
                } else {
                    // Add Add Media button
                    const addMediaBtn = document.createElement('button');
                    addMediaBtn.className = 'media-control-btn add-media-btn';
                    addMediaBtn.innerHTML = '📷 Add Image/Video';
                    addMediaBtn.style.padding = '8px 12px';
                    addMediaBtn.style.margin = '10px 0';
                    addMediaBtn.style.fontSize = '0.8rem';
                    addMediaBtn.style.cursor = 'pointer';
                    addMediaBtn.style.display = 'block';
                    addMediaBtn.addEventListener('click', (ev) => {
                        ev.preventDefault();
                        currentMediaTarget = body;
                        // Some browsers require the input to be in the DOM and visible (even 0x0)
                        // Or they require the click to be very direct.
                        mediaInput.click();
                    });
                    body.prepend(addMediaBtn);
                }
            });
        }

        function addDeleteButtons() {
            document.querySelectorAll('.experience-card').forEach(card => {
                if (!card.querySelector('.delete-card-btn')) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-card-btn';
                    deleteBtn.innerHTML = '×';
                    deleteBtn.addEventListener('click', () => {
                        if (confirm('Delete this card?')) {
                            card.remove();
                        }
                    });
                    card.style.position = 'relative';
                    card.appendChild(deleteBtn);

                    if (document.body.classList.contains('edit-mode')) {
                        card.setAttribute('draggable', 'true');
                        card.classList.add('draggable');
                        card.addEventListener('dragstart', handleDragStart);
                        card.addEventListener('dragend', handleDragEnd);
                    }
                }
            });
        }

        if (addExpBtn) {
            addExpBtn.addEventListener('click', () => {
                const grid = document.querySelector('.experience-grid');
                const newCard = document.createElement('article');
                newCard.className = 'experience-card';
                newCard.innerHTML = `
                <div class="exp-header">
                    <div>
                        <h3 data-editable="true">[Job Title]</h3>
                        <h4 class="company" data-editable="true">[Company Name]</h4>
                    </div>
                    <div class="exp-meta" data-editable="true">[Date] <br> [Location]</div>
                </div>
                <div class="exp-body" data-editable="true"><ul><li>[Responsibility]</li></ul></div>
                <div class="tech-stack" data-editable="true"><span>Skill</span></div>
            `;
                grid.appendChild(newCard);
                newCard.querySelectorAll('[data-editable="true"]').forEach(el => el.setAttribute('contenteditable', 'true'));
                addDeleteButtons();
                newCard.scrollIntoView({ behavior: 'smooth' });
            });
        }

        if (addProjBtn) {
            addProjBtn.addEventListener('click', () => {
                const carousel = document.querySelector('.projects-carousel');
                const newCard = document.createElement('article');
                newCard.className = 'experience-card';
                newCard.innerHTML = `
                <div class="exp-header">
                    <div>
                        <h3 data-editable="true">[Project Title]</h3>
                        <h4 class="company" data-editable="true">[Subtitle]</h4>
                    </div>
                    <div class="exp-meta" data-editable="true">[Date] <br> <a href="#" class="social-link">Link</a></div>
                </div>
                <div class="exp-body" data-editable="true">
                    <img src="https://via.placeholder.com/400x200" alt="Preview" class="project-preview-img" data-editable-image="true">
                    <p>[Description]</p>
                </div>
                <div class="tech-stack" data-editable="true"><span>Tech</span></div>
            `;
                carousel.appendChild(newCard);
                newCard.querySelectorAll('[data-editable="true"]').forEach(el => el.setAttribute('contenteditable', 'true'));

                setupMediaControls();
                addDeleteButtons();
                newCard.scrollIntoView({ behavior: 'smooth' });
            });
        }

        if (addAwardBtn) {
            addAwardBtn.addEventListener('click', () => {
                const grid = document.querySelector('.awards-grid');
                const newCard = document.createElement('article');
                newCard.className = 'experience-card';
                newCard.innerHTML = `
                <div class="exp-header">
                    <div>
                        <h3 data-editable="true">[Award]</h3>
                        <h4 class="company" data-editable="true">[Org]</h4>
                    </div>
                    <div class="exp-meta" data-editable="true">[Date]</div>
                </div>
            `;
                grid.appendChild(newCard);
                newCard.querySelectorAll('[data-editable="true"]').forEach(el => el.setAttribute('contenteditable', 'true'));
                addDeleteButtons();
            });
        }

        if (addVolunteerBtn) {
            addVolunteerBtn.addEventListener('click', () => {
                const grid = document.querySelector('.volunteer-grid');
                const newCard = document.createElement('article');
                newCard.className = 'experience-card';
                newCard.innerHTML = `
                <div class="exp-header">
                    <div>
                        <h3 data-editable="true">[Role]</h3>
                        <h4 class="company" data-editable="true">[Org]</h4>
                    </div>
                    <div class="exp-meta" data-editable="true">[Date]</div>
                </div>
            `;
                grid.appendChild(newCard);
                newCard.querySelectorAll('[data-editable="true"]').forEach(el => el.setAttribute('contenteditable', 'true'));
                addDeleteButtons();
            });
        }

        if (addArticleBtn) {
            addArticleBtn.addEventListener('click', () => {
                const grid = document.querySelector('.articles-grid');
                const newCard = document.createElement('article');
                newCard.className = 'experience-card';
                newCard.innerHTML = `
                <div class="exp-header">
                    <div>
                        <h3 data-editable="true">[Article Title]</h3>
                        <h4 class="company" data-editable="true">[Publication Name]</h4>
                    </div>
                    <div class="exp-meta" data-editable="true">
                        [Date]<br>
                        <a href="#" class="social-link" style="color: var(--color-primary); font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                            🌐 [Read Full Article]
                        </a>
                    </div>
                </div>
                <div class="exp-body" data-editable="true">
                    <p>[Brief description of the article and its key takeaways.]</p>
                </div>
                <div class="tech-stack" data-editable="true">
                    <span>Tag1</span>
                    <span>Tag2</span>
                </div>
            `;
                grid.appendChild(newCard);
                newCard.querySelectorAll('[data-editable="true"]').forEach(el => el.setAttribute('contenteditable', 'true'));
                addDeleteButtons();
                newCard.scrollIntoView({ behavior: 'smooth' });
            });
        }

        function handleDragStart(e) { e.target.classList.add('dragging'); }
        function handleDragEnd(e) { e.target.classList.remove('dragging'); }
        function handleDragOver(e) {
            e.preventDefault();
            const container = e.currentTarget;
            const draggable = document.querySelector('.dragging');
            if (draggable) container.appendChild(draggable);
        }

        function enableDragAndDrop() {
            const containers = document.querySelectorAll('.projects-carousel, .awards-grid, .volunteer-grid, .experience-grid, .articles-grid');
            containers.forEach(container => {
                container.addEventListener('dragover', handleDragOver);
                container.querySelectorAll('.experience-card').forEach(card => {
                    card.setAttribute('draggable', 'true');
                    card.classList.add('draggable');
                    card.addEventListener('dragstart', handleDragStart);
                    card.addEventListener('dragend', handleDragEnd);
                });
            });
        }

        function disableDragAndDrop() {
            const containers = document.querySelectorAll('.projects-carousel, .awards-grid, .volunteer-grid, .experience-grid, .articles-grid');
            containers.forEach(container => {
                container.removeEventListener('dragover', handleDragOver);
            });
        }
    });


    // --- RICH TEXT EDITING TOOLBAR LOGIC ---
    const formattingToolbar = document.getElementById('formatting-toolbar');
    const toolbarButtons = document.querySelectorAll('.toolbar-btn[data-command]');
    const linkBtn = document.getElementById('link-btn');

    // Show/hide toolbar based on admin mode
    function toggleFormattingToolbar(show) {
        if (formattingToolbar) {
            formattingToolbar.style.display = show ? 'flex' : 'none';
        }
    }

    // Apply formatting command
    function applyFormat(command) {
        document.execCommand(command, false, null);
        updateToolbarState();
    }

    // Update toolbar button states based on current selection
    function updateToolbarState() {
        toolbarButtons.forEach(btn => {
            const command = btn.getAttribute('data-command');
            const isActive = document.queryCommandState(command);
            btn.classList.toggle('active', isActive);
        });
    }

    // Handle toolbar button clicks
    toolbarButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const command = btn.getAttribute('data-command');
            applyFormat(command);
        });
    });

    // Handle link insertion
    if (linkBtn) {
        linkBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const selection = window.getSelection();

            if (!selection || selection.toString().length === 0) {
                alert('Please select text to create a link.');
                return;
            }

            // Check if selection is within a contenteditable element
            let node = selection.anchorNode;
            while (node && node !== document.body) {
                if (node.nodeType === 1 && node.getAttribute('contenteditable') === 'true') {
                    break;
                }
                node = node.parentNode;
            }

            if (!node || node === document.body) {
                alert('Please select text within an editable field.');
                return;
            }

            const url = prompt('Enter URL:', 'https://');
            if (url && url.trim() !== '' && url !== 'https://') {
                // Focus the contenteditable element first
                if (node.focus) {
                    node.focus();
                }

                // Create the link
                document.execCommand('createLink', false, url);

                // Make sure the link opens in a new tab
                const links = node.querySelectorAll('a[href="' + url + '"]');
                links.forEach(link => {
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');
                });
            }
        });
    }

    // Update toolbar state on selection change
    document.addEventListener('selectionchange', () => {
        if (formattingToolbar && formattingToolbar.style.display === 'flex') {
            updateToolbarState();
        }
    });

    // Keyboard shortcuts for formatting
    document.addEventListener('keydown', (e) => {
        if (!formattingToolbar || formattingToolbar.style.display === 'none') return;

        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    applyFormat('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    applyFormat('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    applyFormat('underline');
                    break;
            }
        }

        // --- ARTICLES CAROUSEL DOTS ---
        function initArticlesCarousel() {
            const carousel = document.querySelector('.articles-carousel');
            const dotsContainer = document.getElementById('articles-dots');
            if (!carousel || !dotsContainer) return;

            const cards = carousel.querySelectorAll('.experience-card');
            if (cards.length === 0) return;

            dotsContainer.innerHTML = '';
            cards.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    const cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(carousel).gap || '0');
                    carousel.scrollTo({
                        left: index * cardWidth,
                        behavior: 'smooth'
                    });
                });
                dotsContainer.appendChild(dot);
            });

            carousel.addEventListener('scroll', () => {
                const scrollLeft = carousel.scrollLeft;
                const cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(carousel).gap || '0');
                let activeIndex = Math.round(scrollLeft / cardWidth);
                if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 5) {
                    activeIndex = cards.length - 1;
                }
                dotsContainer.querySelectorAll('.dot').forEach((dot, index) => {
                    dot.classList.toggle('active', index === activeIndex);
                });
            });
        }
        initArticlesCarousel();
    });

})();