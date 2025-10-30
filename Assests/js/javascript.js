// --- Throttle Utility Function (For scroll performance) ---
function throttle(fn, wait) {
    let lastTime = 0;
    return function(...args) {
        const now = new Date().getTime();
        if (now - lastTime < wait) {
            return;
        }
        lastTime = now;
        fn.apply(this, args);
    };
}

// --- Global Element Selectors ---
const header = document.querySelector('.top-nav'); 
const slides = document.querySelectorAll('.slide');
const taglineText = document.getElementById('tagline-text');
const menuToggle = document.getElementById('menuToggle'); 
const navLinks = document.querySelector('.nav-links'); 
const closeMenu = document.getElementById('closeMenu'); 
const viewServicesBtn = document.getElementById('viewServicesBtn');
const hiddenCardsContainer = document.querySelector('.hidden-cards');
const hiddenCards = hiddenCardsContainer ? hiddenCardsContainer.querySelectorAll('.service-card') : []; 
const initialCardsContainer = document.querySelector('.initial-cards');
const initialCards = initialCardsContainer ? initialCardsContainer.querySelectorAll('.service-card') : []; 
const animatedElements = document.querySelectorAll('.animate-on-scroll'); 

// Project Slider Elements
const projectsGrid = document.getElementById('projectsGrid');
const prevProjectBtn = document.getElementById('prevProject');
const nextProjectBtn = document.getElementById('nextProject');

// Solar Calculator Elements
const monthlyBillInput = document.getElementById('monthlyBill');
const systemSizeManualInput = document.getElementById('systemSizeManual');
const calculateBtn = document.getElementById('calculateBtn');
const billDisplay = document.getElementById('billDisplay');
const sizeDisplay = document.getElementById('sizeDisplay');

const systemSizeOutput = document.getElementById('systemSizeOutput');
const annualSavingsOutput = document.getElementById('annualSavingsOutput');
const annualGenerationOutput = document.getElementById('annualGenerationOutput');
const spaceRequiredOutput = document.getElementById('spaceRequiredOutput');
const netCostOutput = document.getElementById('netCost');


// --- Hero Slideshow Variables ---
const intervalTime = 3500; 
let currentSlideIndex = 0;
let slideInterval;

// RELIABLE Image URLs for hero section
const imageUrls = [
    "https://i.pinimg.com/736x/c4/89/9f/c4899f90db74be7c323b0066a43fb2e3.jpg",
    "https://i.pinimg.com/736x/c7/41/86/c74186df6d43d924300dd6e6f21996f4.jpg",
    "https://i.pinimg.com/736x/66/8e/7a/668e7a52803f582fd9c3c1ee9459d273.jpg",
];

// --- Utility for Preloading Images ---
const preloadImage = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = (e) => {
            console.error("Image failed to load:", url, e);
            reject(e); 
        };
        img.src = url;
    });
};


// ======================================================
// Hero Slideshow Logic
// ======================================================

function nextSlide() {
    const currentSlide = slides[currentSlideIndex];

    currentSlide.classList.remove('active');
    taglineText.classList.remove('show');
    
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    const nextSlide = slides[currentSlideIndex];
    
    setTimeout(() => {
        taglineText.textContent = nextSlide.getAttribute('data-tagline');
        taglineText.classList.add('show');
    }, 500); 

    nextSlide.classList.add('active');
}

async function initializeHeroSlides() {
    const promises = [];
    
    slides.forEach((slide, index) => {
        if (imageUrls[index]) {
            slide.style.backgroundImage = `url('${imageUrls[index]}')`;
            promises.push(preloadImage(imageUrls[index]));
        }
    });

    await Promise.all(promises).catch(error => { 
        console.error("One or more background images failed to load, proceeding anyway:", error);
    });
    
    if (slides.length > 0 && taglineText) {
        taglineText.textContent = slides[0].getAttribute('data-tagline');
        slides[0].classList.add('active'); 
        taglineText.classList.add('show');
        slideInterval = setInterval(nextSlide, intervalTime);
    }
}


// ======================================================
// Mobile Menu Toggle Logic (FIXED)
// ======================================================

function openSidebar() {
    if (navLinks) navLinks.classList.add('active');
    // Hide the toggle button when menu is open
    if (menuToggle) menuToggle.style.display = 'none'; 
    document.body.style.overflow = 'hidden'; 
}

function closeSidebar() {
    if (navLinks) navLinks.classList.remove('active');
    // Show the toggle button when menu is closed
    // Use setTimeout to ensure the transition completes before showing the button
    setTimeout(() => {
        if (menuToggle) menuToggle.style.display = 'block'; 
    }, 300); // Matches CSS transition speed
    document.body.style.overflow = '';
}

// ======================================================
// Scroll Animation Logic 
// ======================================================

const generalScrollCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;

            if (target.classList.contains('service-card') && target.closest('.initial-cards')) {
                const card = target; 
                const index = Array.from(initialCards).indexOf(card);
                
                if (!card.classList.contains('show-animate')) {
                    setTimeout(() => {
                        card.classList.add('show-animate');
                        card.classList.add('visible'); 
                    }, index * 150);
                }
            } else {
                target.classList.add('visible');
            }
            
            observer.unobserve(target);
        }
    });
};

function setupScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
        animatedElements.forEach(el => el.classList.add('visible'));
        initialCards.forEach(card => card.classList.add('show-animate'));
        return;
    }

    const observerOptions = {
        root: null, 
        rootMargin: '0px 0px -50px 0px', 
        threshold: 0.1 
    };

    const generalObserver = new IntersectionObserver(generalScrollCallback, observerOptions);
    
    animatedElements.forEach(element => {
        generalObserver.observe(element);
    });
}

// ======================================================
// Load More Services Logic 
// ======================================================

function showMoreServices(event) {
    event.preventDefault();

    if (!hiddenCardsContainer || hiddenCards.length === 0) return;

    hiddenCards.forEach((card, index) => {
        card.classList.remove('hidden');

        setTimeout(() => {
            card.classList.add('show-animate'); 
        }, index * 150); 
    });

    viewServicesBtn.style.display = 'none';

    if (hiddenCards[0]) {
        const newCardsPosition = hiddenCards[0].getBoundingClientRect().top + window.scrollY - 100; 
        window.scrollTo({
            top: newCardsPosition,
            behavior: 'smooth'
        });
    }
}

// ======================================================
// Project Slider Logic 
// ======================================================
function setupProjectSlider() {
    if (!projectsGrid || !prevProjectBtn || !nextProjectBtn || projectsGrid.children.length === 0) return;

    const scrollCard = projectsGrid.querySelector('.project-card');
    if (!scrollCard) return;
    
    const gap = 30;

    const calculateScrollAmount = () => {
        const cardWidth = scrollCard.offsetWidth;
        return cardWidth + gap;
    }

    const handleScroll = (direction) => {
        const amount = calculateScrollAmount();
        const scrollDirection = direction === 'next' ? amount : -amount;
        
        projectsGrid.scrollBy({ left: scrollDirection, behavior: 'smooth' });
    };

    prevProjectBtn.addEventListener('click', () => handleScroll('prev'));
    nextProjectBtn.addEventListener('click', () => handleScroll('next'));
    
    const updateArrowVisibility = () => {
        const scrollTolerance = 5; 
        const isAtStart = projectsGrid.scrollLeft < scrollTolerance; 
        const isAtEnd = projectsGrid.scrollWidth - (projectsGrid.scrollLeft + projectsGrid.clientWidth) < scrollTolerance;

        prevProjectBtn.style.opacity = isAtStart ? 0.5 : 1;
        nextProjectBtn.style.opacity = isAtEnd ? 0.5 : 1;
        
        prevProjectBtn.style.pointerEvents = isAtStart ? 'none' : 'auto';
        nextProjectBtn.style.pointerEvents = isAtEnd ? 'none' : 'auto';
    };
    
    projectsGrid.addEventListener('scroll', updateArrowVisibility);
    
    setTimeout(updateArrowVisibility, 250); 
    window.addEventListener('resize', throttle(() => {
        setTimeout(updateArrowVisibility, 250); 
    }, 100));
}

// ======================================================
// Scroll-based Header Styling (Shrink/Shadow)
// ======================================================
function handleHeaderScroll() {
    const scrollPosition = window.scrollY;
    if (scrollPosition > 100) { 
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// ======================================================
// FAQ Accordion Logic 
// ======================================================
function setupFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            item.classList.toggle('active', !isActive);
            
            if (!isActive) {
                setTimeout(() => {
                    const itemTop = item.getBoundingClientRect().top + window.scrollY;
                    window.scrollTo({
                        top: itemTop - 100,
                        behavior: 'smooth'
                    });
                }, 50); 
            }
        });
    });
}

// ======================================================
// Solar Calculator Logic 
// ======================================================

const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;
const formatUnits = (units) => `${units.toLocaleString('en-IN')}`;
const formatSpace = (sqft) => `${sqft.toLocaleString('en-IN')}`;

// Core calculation logic
function calculateSolar(finalKW) {
    // Fixed constants
    const avgTariff = 8.5; 
    const grossCostPerKW = 68000;
    const companyDiscount = 5000; 

    // Calculations based on the determined finalKW
    const annualUnits = finalKW * 1500;
    const grossCost = finalKW * grossCostPerKW;
    const estimatedAnnualSavings = annualUnits * avgTariff;
    const spaceRequired = finalKW * 80;

    // Estimate Subsidies/Deductions
    let subsidy = 0;
    // Central scheme estimate: Up to 3kW: ₹18,000/kW | Above 3kW: ₹9,000/kW
    if (finalKW <= 3) {
        subsidy = finalKW * 18000;
    } else {
        subsidy = (3 * 18000) + ((finalKW - 3) * 9000);
    }
    
    const totalDeductions = subsidy + companyDiscount;
    const netCost = grossCost - totalDeductions;

    return {
        systemSize: finalKW,
        annualSavings: estimatedAnnualSavings,
        annualGeneration: annualUnits,
        spaceRequired: spaceRequired,
        grossPrice: grossCost,
        deductions: totalDeductions,
        netCost: netCost < 0 ? 0 : netCost 
    };
}

function getCalculatedKW(monthlyBill) {
    const avgTariff = 8.5; 
    const monthlyUnits = Math.round(monthlyBill / avgTariff);
    // Convert monthly units to required kW (assuming 1500 units/kW/year)
    const requiredKW = Math.ceil(monthlyUnits / 1500 * 12); 
    // Minimum system size is 1kW
    return requiredKW < 1 ? 1 : requiredKW;
}

function updateCalculatorUI(results) {
    // Update display outputs
    if (netCostOutput) netCostOutput.textContent = formatCurrency(Math.round(results.netCost));
    if (systemSizeOutput) systemSizeOutput.textContent = results.systemSize.toFixed(1);
    if (annualSavingsOutput) annualSavingsOutput.textContent = Math.round(results.annualSavings).toLocaleString('en-IN');
    if (annualGenerationOutput) annualGenerationOutput.textContent = formatUnits(results.annualGeneration);
    if (spaceRequiredOutput) spaceRequiredOutput.textContent = formatSpace(results.spaceRequired);

    // Re-trigger result animation
    document.querySelectorAll('.animate-result-load').forEach(el => {
        el.classList.remove('animate-result-load');
        void el.offsetWidth; // Force reflow
        el.classList.add('animate-result-load');
    });
}

function handleBillSliderChange() {
    const bill = parseFloat(monthlyBillInput.value);
    
    // 1. Update bill display
    if (billDisplay) billDisplay.textContent = formatCurrency(bill);
    
    // 2. Determine the kW required based on the bill
    const calculatedKW = getCalculatedKW(bill);
    
    // 3. Update the System Size Override slider to reflect the calculated KW
    if (systemSizeManualInput) {
        // Ensure the value stays within the slider's range (1 to 10)
        const newSliderValue = Math.min(10, Math.max(1, calculatedKW));
        systemSizeManualInput.value = newSliderValue;
        if (sizeDisplay) sizeDisplay.textContent = `${newSliderValue.toFixed(1)} kW`;
    }

    // 4. Calculate and update UI based on the calculated KW
    const results = calculateSolar(calculatedKW);
    updateCalculatorUI(results);
}

function handleSizeSliderChange() {
    const sizeOverride = parseFloat(systemSizeManualInput.value);

    // 1. Update display value
    if (sizeDisplay) sizeDisplay.textContent = `${sizeOverride.toFixed(1)} kW`;
    
    // 2. Perform calculation based ONLY on the override size
    const results = calculateSolar(sizeOverride);
    updateCalculatorUI(results);
}


// ======================================================
// Initial Page Load & Event Listeners
// ======================================================

document.addEventListener('DOMContentLoaded', () => {
    // Core Initializations
    initializeHeroSlides();
    setupScrollAnimations(); 
    setupProjectSlider(); 
    setupFaqAccordion(); 
    
    // Initial calculator display: must calculate based on the default bill value
    handleBillSliderChange(); 
    
    // Header Scroll Listener
    const throttledHandleHeaderScroll = throttle(handleHeaderScroll, 100); 
    window.addEventListener('scroll', throttledHandleHeaderScroll);
    handleHeaderScroll(); 

    // Event listeners for the sidebar
    if (menuToggle && navLinks) {
        // Corrected Menu Toggle Logic
        menuToggle.addEventListener('click', openSidebar);
        
        if (closeMenu) {
             closeMenu.addEventListener('click', closeSidebar); 
        }

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                // Short delay to allow smooth anchor scrolling first
                setTimeout(closeSidebar, 350); 
            });
        });
    }

    // Event Listener for "Load More" button
    if (viewServicesBtn) {
        viewServicesBtn.addEventListener('click', showMoreServices);
    }

    // Event Listeners for Solar Calculator Sliders
    if (monthlyBillInput) {
        // Bill slider drives calculation and adjusts the size slider (real-time)
        monthlyBillInput.addEventListener('input', handleBillSliderChange);
    }
    
    if (systemSizeManualInput) {
        // Size slider immediately overrides the result output (real-time)
        systemSizeManualInput.addEventListener('input', handleSizeSliderChange);
    }

    // The calculate button triggers the same manual size update
    if (calculateBtn) {
        calculateBtn.addEventListener('click', handleSizeSliderChange);
    }
});