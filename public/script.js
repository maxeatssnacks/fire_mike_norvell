// How many times the button dodges the mouse on desktop before it gives up
// and settles back in the center, clickable
const MAX_DODGES = 4;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {
    // Get DOM elements with error checking
    const fireButton = document.getElementById('fireButton');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalOk = document.getElementById('modalOk');
    const viewCount = document.getElementById('viewCount');

    // Check if all required elements exist
    if (!fireButton || !modalOverlay || !modalClose || !modalOk) {
        console.error('Required DOM elements not found');
        return;
    }

    // Redis-powered persistent view counter
    async function updateViewCount() {
        try {
            // Check if we're in a browser environment
            if (typeof window === 'undefined' || !window.fetch) {
                throw new Error('Browser environment not ready');
            }

            // Use Redis counter API
            const response = await fetch('/api/counter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (viewCount) {
                    viewCount.textContent = data.count;
                }
                console.log('Redis counter successful:', data.count);
            } else {
                throw new Error('Redis API response not ok');
            }
        } catch (error) {
            console.log('Redis failed, using localStorage fallback:', error.message);
            // Fallback to localStorage if Redis fails
            try {
                let currentViews = parseInt(localStorage.getItem('pageViews') || '0');
                currentViews++;
                localStorage.setItem('pageViews', currentViews.toString());
                if (viewCount) {
                    viewCount.textContent = currentViews;
                }
            } catch (localError) {
                console.error('localStorage also failed:', localError);
                if (viewCount) {
                    viewCount.textContent = '1';
                }
            }
        }
    }

    // Initialize view counter on page load
    updateViewCount();

    // Button movement variables
    let isMoving = false;
    let moveTimeout;
    let buttonMovementEnabled = true;
    let dodgesLeft = MAX_DODGES;

    // Check if device supports hover (desktop)
    const isDesktop = window.matchMedia('(hover: hover)').matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (!isDesktop) {
        // On mobile, button is immediately clickable
        buttonMovementEnabled = false;
        fireButton.style.transform = 'scale(1.05)';
        fireButton.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.6)';
    }

    // Once the dodge budget is spent: stop moving, return the button to the
    // normal document flow (its original centered spot) and cue that it's clickable
    function settleButton() {
        buttonMovementEnabled = false;
        clearTimeout(moveTimeout);
        fireButton.style.transition = 'all 0.3s ease';
        fireButton.style.position = 'static';
        fireButton.style.left = 'auto';
        fireButton.style.top = 'auto';
        fireButton.style.transform = 'scale(1.1)';
        fireButton.style.boxShadow = '0 0 30px rgba(255, 0, 0, 0.8)';

        // Add a subtle pulse effect to indicate it's now clickable
        setInterval(() => {
            fireButton.style.transform = fireButton.style.transform === 'scale(1.1)' ? 'scale(1.05)' : 'scale(1.1)';
        }, 1000);
    }

    // Function to get random position within viewport bounds
    function getRandomPosition(mouseX, mouseY) {
        const buttonRect = fireButton.getBoundingClientRect();
        const buttonWidth = buttonRect.width;
        const buttonHeight = buttonRect.height;

        const maxX = window.innerWidth - buttonWidth - 20;
        const maxY = window.innerHeight - buttonHeight - 20;

        const minX = 20;
        const minY = 20;

        let randomX, randomY;
        let attempts = 0;
        const maxAttempts = 10;

        // Try to find a position away from the mouse
        do {
            randomX = Math.random() * (maxX - minX) + minX;
            randomY = Math.random() * (maxY - minY) + minY;
            attempts++;

            // Calculate distance from mouse
            const distanceFromMouse = Math.sqrt(
                Math.pow(randomX - mouseX, 2) + Math.pow(randomY - mouseY, 2)
            );

            // If we're far enough from mouse or tried too many times, use this position
            if (distanceFromMouse > 200 || attempts >= maxAttempts) {
                break;
            }
        } while (attempts < maxAttempts);

        return { x: randomX, y: randomY };
    }

    // Function to move button to random position (one dodge from the budget)
    function moveButton(mouseX, mouseY) {
        if (isMoving || dodgesLeft <= 0) return;

        isMoving = true;
        dodgesLeft--;
        const newPos = getRandomPosition(mouseX, mouseY);

        fireButton.style.transition = 'all 0.3s ease'; // Faster movement
        fireButton.style.position = 'fixed';
        fireButton.style.left = newPos.x + 'px';
        fireButton.style.top = newPos.y + 'px';

        // Cooldown matches the transition, so one mouse pass counts as one dodge
        setTimeout(() => {
            isMoving = false;
            if (dodgesLeft === 0) {
                settleButton();
            }
        }, 300);
    }

    // Desktop behavior: Button runs away from mouse
    if (isDesktop) {
        document.addEventListener('mousemove', (e) => {
            // Only move button if movement is enabled
            if (!buttonMovementEnabled) return;

            const buttonRect = fireButton.getBoundingClientRect();
            const buttonCenterX = buttonRect.left + buttonRect.width / 2;
            const buttonCenterY = buttonRect.top + buttonRect.height / 2;

            const distance = Math.sqrt(
                Math.pow(e.clientX - buttonCenterX, 2) +
                Math.pow(e.clientY - buttonCenterY, 2)
            );

            // If mouse is within 300px of button center (much more sensitive)
            if (distance < 300 && !isMoving) {
                clearTimeout(moveTimeout);
                // Random delay between 0-50ms to make it more unpredictable
                const randomDelay = Math.random() * 50;
                moveTimeout = setTimeout(() => {
                    moveButton(e.clientX, e.clientY);
                }, randomDelay);
            }
        });
    }

    // Mobile behavior: Button stays stationary in center
    if (isMobile) {
        // Ensure button is centered and stationary on mobile
        fireButton.style.position = 'static';
        fireButton.style.left = 'auto';
        fireButton.style.top = 'auto';
        fireButton.style.transform = 'none';
        fireButton.style.transition = 'all 0.3s ease';

        // No movement behavior on mobile - button stays put
        console.log('Mobile detected: Button will remain stationary');
    }

    // Button click handler (show/hide is driven purely by the .show class;
    // the CSS handles the fade and visibility)
    fireButton.addEventListener('click', () => {
        modalOverlay.classList.add('show');
    });

    // Modal close handlers
    function closeModal() {
        modalOverlay.classList.remove('show');
    }

    modalClose.addEventListener('click', closeModal);
    modalOk.addEventListener('click', closeModal);

    // Close modal when clicking overlay
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('show')) {
            closeModal();
        }
    });

    // Reset button position on window resize
    window.addEventListener('resize', () => {
        fireButton.style.position = 'static';
        fireButton.style.left = 'auto';
        fireButton.style.top = 'auto';
        fireButton.style.transition = 'all 0.3s ease';
    });
}