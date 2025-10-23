const slides = document.querySelectorAll('.slide');
const taglineText = document.getElementById('tagline-text');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('mobileMenu');
const menuBackdrop = document.getElementById('menuBackdrop');
const closeButton = document.getElementById('closeButton');
const benefitCards = document.querySelectorAll('#benefits-grid .benefit-card');
const loadMoreButton = document.getElementById('load-more-benefits');
const processSteps = document.querySelectorAll('.process-step'); 
const servicesCarousel = document.getElementById('services-carousel');
const prevServiceBtn = document.getElementById('prev-service-btn');
const nextServiceBtn = document.getElementById('next-service-btn');
const accordionHeaders = document.querySelectorAll('.accordion-header'); 

// --- Configuration ---
const SERVICE_SLIDE_DURATION = 3500; // 3.5 seconds
const SERVICE_TRANSITION_SPEED = 500; // 0.5 seconds (must match CSS)

let currentSlideIndex = 0;
const intervalTime = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--interval-time'));
let slideInterval;
let initialCardsToShow = 3; 
let visibleCardsCount = initialCardsToShow; 
let currentCarouselIndex = 0;
let cardWidth = 330; // Initial Approximation: 300px min-width + 30px gap
let autoSlideInterval;

// Array of image URLs for Hero Slideshow
const imageUrls = [
    "https://t4.ftcdn.net/jpg/17/30/00/65/240_F_1730006534_YHfTVRDP5szQiw7MwLSuPJDKOrQp50JD.jpg", 
    "https://t3.ftcdn.net/jpg/06/84/07/52/240_F_684075293_eOEjUopR5k97tYYm2CeMG1C5seJF2net.jpg",
    "https://t3.ftcdn.net/jpg/08/13/06/46/240_F_813064677_7s38QLcamF8C0xnXFVU72RFoppPGfJiw.jpg"
];


// ======================================================
// 1. Initialization Functions
// ======================================================

function initializeHeroSlides() {
    // Set initial background images
    slides.forEach((slide, index) => {
        slide.style.backgroundImage = `url('${imageUrls[index]}')`;
    });
    
    // Set initial tagline text and start slideshow
    taglineText.textContent = slides[0].getAttribute('data-tagline');
    slides[0].classList.add('active'); 
    slideInterval = setInterval(nextSlide, intervalTime);
}

// ======================================================
// 2. Hero Slideshow Logic
// ======================================================

function nextSlide() {
    const currentSlide = slides[currentSlideIndex];

    currentSlide.classList.remove('active');
    taglineText.classList.remove('show');
    
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    const nextSlide = slides[currentSlideIndex];
    
    // Delay tagline change for smoother transition
    setTimeout(() => {
        taglineText.textContent = nextSlide.getAttribute('data-tagline');
        taglineText.classList.add('show');
    }, 500);

    nextSlide.classList.add('active');
}

// ======================================================
// 3. Mobile Menu Toggle Logic
// ======================================================

function toggleMobileMenu() {
    if (window.innerWidth <= 768) {
        const isActive = navLinks.classList.toggle('active');
        menuBackdrop.classList.toggle('active', isActive);
        // Disable scrolling when menu is active
        document.body.style.overflow = isActive ? 'hidden' : 'auto';
    }
}

// Event listeners for the menu
menuToggle.addEventListener('click', toggleMobileMenu); 
closeButton.addEventListener('click', toggleMobileMenu);
menuBackdrop.addEventListener('click', toggleMobileMenu);

document.querySelectorAll('#mobileMenu .mobile-links-wrapper a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) {
            // Close menu slightly after link click to register it
            setTimeout(toggleMobileMenu, 200); 
        }
    });
});

// ======================================================
// 4. Scroll Reveal Animation Logic
// ======================================================

function setupScrollObservers() {
    // About Section Animation
    const aboutContainer = document.querySelector('.about-container.scroll-reveal');
    if (aboutContainer) {
        const observerOptions = { root: null, rootMargin: '0px', threshold: 0.2 };
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        observer.observe(aboutContainer);
    }

    // Project Workflow Animation
    const processStepsContainer = document.querySelector('.scroll-reveal-workflow');
    if (processStepsContainer) {
        const processObserverOptions = { root: null, rootMargin: '0px', threshold: 0.2 };
        const processObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    processSteps.forEach(step => {
                        const delay = parseInt(step.getAttribute('data-delay'));
                        setTimeout(() => {
                            step.classList.add('visible');
                        }, delay);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, processObserverOptions);
        processObserver.observe(processStepsContainer);
    }
    
    // Benefits Card Fade-in Trigger (Show initial cards)
    const benefitsSection = document.querySelector('.benefits-section');
    if (benefitsSection) {
        const benefitsObserverOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
        const benefitsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    showBenefits();
                    observer.unobserve(entry.target);
                }
            });
        }, benefitsObserverOptions);
        benefitsObserver.observe(benefitsSection);
    }
}


// ======================================================
// 5. Load More Benefits Logic with Animation 
// ======================================================

function showBenefits() {
    // Hide all first to ensure re-run works (for initial load logic)
    benefitCards.forEach(card => {
        card.classList.remove('visible');
        card.classList.add('hidden'); 
    });

    // Show initial batch with staggered fade-in
    for (let i = 0; i < initialCardsToShow && i < benefitCards.length; i++) {
        benefitCards[i].classList.remove('hidden'); 
        setTimeout(() => {
            benefitCards[i].classList.add('visible');
        }, 100 * i);
    }
    
    visibleCardsCount = initialCardsToShow;

    // Toggle button visibility
    if (visibleCardsCount >= benefitCards.length) {
        loadMoreButton.style.display = 'none';
    } else {
        loadMoreButton.style.display = 'inline-block';
    }
}

function loadMoreBenefits() {
    const nextBatchSize = 3;
    const remainingCards = benefitCards.length - visibleCardsCount;
    const cardsToDisplay = Math.min(nextBatchSize, remainingCards);

    // Show the next batch with staggered fade-in
    for (let i = visibleCardsCount; i < visibleCardsCount + cardsToDisplay; i++) {
        benefitCards[i].classList.remove('hidden'); 
        setTimeout(() => {
            benefitCards[i].classList.add('visible');
        }, 100 * (i - visibleCardsCount)); 
    }

    visibleCardsCount += cardsToDisplay;
    
    // Hide button if all cards are visible
    if (visibleCardsCount >= benefitCards.length) {
        setTimeout(() => {
            loadMoreButton.style.display = 'none';
        }, 600); // Wait for the last card to finish its animation
    }
}

loadMoreButton.addEventListener('click', loadMoreBenefits);


// ======================================================
// 6. Services Carousel Logic
// ======================================================

function updateCarouselWidth() {
    const cardElement = servicesCarousel.querySelector('.service-card');
    if (cardElement) {
        const style = window.getComputedStyle(cardElement);
        // Get the computed min-width and gap (which is easier if it's set in px)
        const minWidth = parseFloat(style.minWidth);
        const gapStyle = window.getComputedStyle(servicesCarousel).gap;
        const gap = parseFloat(gapStyle) || 30; // Default to 30px if calculation fails
        
        // Card width is the min-width plus the space to the next card (the gap)
        cardWidth = minWidth + gap; 
    }
}

function moveCarousel(direction) {
    updateCarouselWidth(); 

    const nonDuplicateCards = 4; // Total non-duplicate cards: Hydropower, Fossil, Solar, Turbines

    // Stop auto-slide momentarily on manual interaction
    clearInterval(autoSlideInterval);
    
    // Update the index
    currentCarouselIndex += direction;
    
    servicesCarousel.style.transition = `transform ${SERVICE_TRANSITION_SPEED}ms ease-in-out`;
    
    // Handle infinite loop logic (forwards)
    if (currentCarouselIndex >= nonDuplicateCards) {
        // 1. Visually move to the duplicate card
        servicesCarousel.style.transform = `translateX(-${currentCarouselIndex * cardWidth}px)`;
        
        // 2. Immediately jump back to the first real card (index 0) without transition
        setTimeout(() => {
            servicesCarousel.style.transition = 'none';
            currentCarouselIndex = 0;
            servicesCarousel.style.transform = `translateX(0px)`;
        }, SERVICE_TRANSITION_SPEED);
        
        // 3. Re-enable transition after the jump
        setTimeout(() => {
             servicesCarousel.style.transition = `transform ${SERVICE_TRANSITION_SPEED}ms ease-in-out`;
        }, SERVICE_TRANSITION_SPEED + 50);

    } 
    // Handle loop limit (backwards: stick to the first card)
    else if (currentCarouselIndex < 0) {
        currentCarouselIndex = 0; // Stick to the first card
    } 
    // Apply normal translation
    else {
        servicesCarousel.style.transform = `translateX(-${currentCarouselIndex * cardWidth}px)`;
    }
    
    // Restart auto-slide after a delay (to respect manual interaction)
    autoSlideInterval = setTimeout(() => {
        startAutoSlide();
    }, SERVICE_SLIDE_DURATION + SERVICE_TRANSITION_SPEED);

}

function startAutoSlide() {
    autoSlideInterval = setInterval(() => moveCarousel(1), SERVICE_SLIDE_DURATION);
}

// Event listeners for carousel buttons
nextServiceBtn.addEventListener('click', () => moveCarousel(1));
prevServiceBtn.addEventListener('click', () => moveCarousel(-1));


// ======================================================
// 7. NEW: FAQ Accordion Logic
// ======================================================

function setupAccordion() {
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            
            // Check if this item is already active
            const isActive = item.classList.contains('active');
            
            // Close all other open accordion items
            document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                if (activeItem !== item) {
                    activeItem.classList.remove('active');
                    activeItem.querySelector('.accordion-content').style.maxHeight = 0;
                }
            });

            // Toggle the clicked item
            if (!isActive) {
                item.classList.add('active');
                // Set max-height to its scrollHeight for smooth transition
                content.style.maxHeight = content.scrollHeight + "px"; 
            } else {
                item.classList.remove('active');
                content.style.maxHeight = 0;
            }
        });
    });
}


// ======================================================
// 8. Initial Page Load (Updated to include Accordion)
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
    initializeHeroSlides();
    setupScrollObservers();
    setupAccordion(); // Initialize accordion functionality
    
    // Services Carousel setup
    updateCarouselWidth();
    startAutoSlide();
    window.addEventListener('resize', updateCarouselWidth);
});