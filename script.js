(() => {

    // Script.js

    document.addEventListener('DOMContentLoaded', () => {
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

        if (mobileBtn && navLinks) {
            function toggleMenu(e) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                navLinks.classList.toggle('active');
                const isActive = navLinks.classList.contains('active');
                mobileBtn.setAttribute('aria-expanded', isActive);
                console.log('Menu toggle:', isActive);

                // Add/remove a class to body to prevent scrolling when menu is open
                document.body.style.overflow = isActive ? 'hidden' : '';
            }

            mobileBtn.addEventListener('click', toggleMenu);

            // Close Mobile Menu when a link is clicked
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    document.body.style.overflow = '';
                });
            });

            // Close menu if clicking outside - wrapped in a timeout to avoid race conditions
            document.addEventListener('click', (e) => {
                if (navLinks.classList.contains('active')) {
                    const isClickInsideMenu = navLinks.contains(e.target);
                    const isClickOnButton = mobileBtn.contains(e.target);

                    if (!isClickInsideMenu && !isClickOnButton) {
                        navLinks.classList.remove('active');
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

        // Apply reveal to headers, cards, and reveal elements
        document.querySelectorAll('.section-header, .experience-card, .reveal').forEach((el) => {
            el.classList.add('reveal');
            revealObserver.observe(el);
        });

        // Core Competency Tag Scroll Reveal Observer
        const skillsContainers = document.querySelectorAll('.skills-card, .side-section, .card');
        if (skillsContainers.length) {
            const tagObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.querySelectorAll('.tag').forEach(tag => {
                            tag.classList.add('active');
                        });
                        tagObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });
            skillsContainers.forEach(container => tagObserver.observe(container));
        }

        // Mobile / High-DPI Safety Fallback for Scroll Reveal (OnePlus 15 & Mobile fix)
        setTimeout(() => {
            document.querySelectorAll('section.reveal, .section-header.reveal, .experience-card.reveal').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    el.classList.add('active');
                }
            });
        }, 400);

        // Expandable Project Card Drawer Toggle
        document.querySelectorAll('.card-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = btn.closest('.experience-card');
                if (card) {
                    const isExpanded = card.classList.toggle('is-expanded');
                    btn.innerHTML = isExpanded 
                        ? '<span>Collapse Details</span> <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>'
                        : '<span>Expand Details & Preview</span> <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>';
                }
            });
        });

        // Interactive Project Filter Pills
        const filterBtns = document.querySelectorAll('.filter-btn');
        if (filterBtns.length > 0) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const category = btn.getAttribute('data-filter');
                    
                    document.querySelectorAll('#projects .experience-card').forEach(card => {
                        const cardCat = card.getAttribute('data-category') || 'all';
                        if (category === 'all' || cardCat.includes(category)) {
                            card.style.display = '';
                            card.classList.add('active');
                        } else {
                            card.style.display = 'none';
                        }
                    });
                });
            });
        }

        // Recruiter Perspective Switcher
        const perspectiveBtns = document.querySelectorAll('.perspective-btn');
        if (perspectiveBtns.length > 0) {
            perspectiveBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    perspectiveBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const mode = btn.getAttribute('data-perspective');
                    document.body.classList.remove('view-finance', 'view-engineering');
                    if (mode === 'finance') {
                        document.body.classList.add('view-finance');
                    } else if (mode === 'engineering') {
                        document.body.classList.add('view-engineering');
                    }
                });
            });
        }

        // --- PROJECT CAROUSEL DOTS ---
        const carousel = document.querySelector('.projects-carousel');
        const dotsContainer = document.getElementById('carousel-dots');
        const projectCards = carousel ? carousel.querySelectorAll('.experience-card') : [];

        if (carousel && dotsContainer && projectCards.length > 0) {
            // Clear existing dots
            dotsContainer.innerHTML = '';

            // Cache card width for performance
            let cardWidth = 0;
            const updateCardWidth = () => {
                if (projectCards[0]) {
                    cardWidth = projectCards[0].offsetWidth + parseInt(getComputedStyle(carousel).gap || '0');
                }
            };
            updateCardWidth();
            window.addEventListener('resize', updateCardWidth, { passive: true });

            // Create dots
            projectCards.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    carousel.scrollTo({
                        left: index * cardWidth,
                        behavior: 'smooth'
                    });
                });
                dotsContainer.appendChild(dot);
            });


            // Update active dot on scroll (Throttled)
            let isCarouselScrolling = false;
            carousel.addEventListener('scroll', () => {
                if (!isCarouselScrolling) {
                    window.requestAnimationFrame(() => {
                        const scrollLeft = carousel.scrollLeft;
                        let activeIndex = Math.round(scrollLeft / (cardWidth || 1));

                        if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 5) {
                            activeIndex = projectCards.length - 1;
                        }

                        dotsContainer.querySelectorAll('.dot').forEach((dot, index) => {
                            dot.classList.toggle('active', index === activeIndex);
                        });
                        isCarouselScrolling = false;
                    });
                    isCarouselScrolling = true;
                }
            }, { passive: true });
        }
    });

    // --- ARTICLES CAROUSEL DOTS ---
    function initArticlesCarousel() {
        const carousel = document.querySelector('.articles-carousel');
        const dotsContainer = document.getElementById('articles-dots');
        if (!carousel || !dotsContainer) return;

        const cards = carousel.querySelectorAll('.experience-card');
        if (cards.length === 0) return;

        // Cache card width
        let cardWidth = 0;
        const updateCardWidth = () => {
            if (cards[0]) {
                cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(carousel).gap || '0');
            }
        };
        updateCardWidth();
        window.addEventListener('resize', updateCardWidth, { passive: true });

        dotsContainer.innerHTML = '';
        cards.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                carousel.scrollTo({
                    left: index * cardWidth,
                    behavior: 'smooth'
                });
            });
            dotsContainer.appendChild(dot);
        });

        let isArticlesScrolling = false;
        carousel.addEventListener('scroll', () => {
            if (!isArticlesScrolling) {
                window.requestAnimationFrame(() => {
                    const scrollLeft = carousel.scrollLeft;
                    let activeIndex = Math.round(scrollLeft / (cardWidth || 1));
                    if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 5) {
                        activeIndex = cards.length - 1;
                    }
                    dotsContainer.querySelectorAll('.dot').forEach((dot, index) => {
                        dot.classList.toggle('active', index === activeIndex);
                    });
                    isArticlesScrolling = false;
                });
                isArticlesScrolling = true;
            }
        }, { passive: true });
    }
    initArticlesCarousel();

    // --- SCROLL HIGHLIGHTING (SCROLL-SPY) ---
    // Throttled Scroll Listener (Scroll Spy)
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                handleScrollSpy();
                isScrolling = false;
            });
            isScrolling = true;
        }
    }, { passive: true });

    function handleScrollSpy() {
        const sections = document.querySelectorAll('section[id], header.hero[id]');
        const navLinks = document.querySelectorAll('.nav-links a');
        let currentSection = "";
        const triggerPoint = window.innerHeight * 0.4;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= triggerPoint) {
                currentSection = section.getAttribute('id');
            }
        });

        const scrollBottom = window.innerHeight + window.pageYOffset;
        const pageHeight = document.documentElement.scrollHeight;

        if (scrollBottom >= pageHeight - 50) {
            for (let i = sections.length - 1; i >= 0; i--) {
                const id = sections[i].getAttribute('id');
                if (document.querySelector(`.nav-links a[href="#${id}"]`)) {
                    currentSection = id;
                    break;
                }
            }
        }

        if (currentSection) {
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    link.classList.toggle('active', href === `#${currentSection}`);
                }
            });
        }
    }

    // Collapsible Experience Toggle Listener
    const toggleExpBtn = document.getElementById('btn-toggle-exp');
    const moreExpContainer = document.getElementById('more-experience');
    const expToggleText = document.getElementById('exp-toggle-text');
    const expToggleIcon = document.getElementById('exp-toggle-icon');

    if (toggleExpBtn && moreExpContainer) {
        toggleExpBtn.addEventListener('click', () => {
            const isExpanded = moreExpContainer.classList.toggle('expanded');
            if (expToggleText && expToggleIcon) {
                expToggleText.textContent = isExpanded 
                    ? 'Hide Additional Roles' 
                    : 'View Additional Roles (Riveron, McDonnell Capital)';
                expToggleIcon.textContent = isExpanded ? '▴' : '▾';
            }
            if (isExpanded) {
                moreExpContainer.querySelectorAll('.reveal').forEach(el => {
                    el.classList.add('active');
                });
            }
        });
    }

})();


