// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {
    // Hide debug element
    const debugTest = document.getElementById('debug-test');
    if (debugTest) {
        debugTest.style.display = 'none';
    }

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

    // Check if device supports hover (desktop)
    const isDesktop = window.matchMedia('(hover: hover)').matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    // 15-second timer to disable button movement (desktop only)
    if (isDesktop) {
        setTimeout(() => {
            buttonMovementEnabled = false;
            fireButton.style.transition = 'all 0.3s ease';
            fireButton.style.position = 'static';
            fireButton.style.left = 'auto';
            fireButton.style.top = 'auto';
            fireButton.style.transform = 'scale(1.1)';
            fireButton.style.boxShadow = '0 0 30px rgba(255, 0, 0, 0.8)';

            // Add a subtle pulse effect to indicate it's now clickable
            setInterval(() => {
                if (!buttonMovementEnabled) {
                    fireButton.style.transform = fireButton.style.transform === 'scale(1.1)' ? 'scale(1.05)' : 'scale(1.1)';
                }
            }, 1000);
        }, 15000); // 15 seconds
    } else {
        // On mobile, button is immediately clickable (no timer needed)
        buttonMovementEnabled = false;
        fireButton.style.transform = 'scale(1.05)';
        fireButton.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.6)';
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

    // Function to move button to random position
    function moveButton(mouseX, mouseY) {
        if (isMoving) return;

        isMoving = true;
        const newPos = getRandomPosition(mouseX, mouseY);

        fireButton.style.transition = 'all 0.3s ease'; // Faster movement
        fireButton.style.position = 'fixed';
        fireButton.style.left = newPos.x + 'px';
        fireButton.style.top = newPos.y + 'px';

        setTimeout(() => {
            isMoving = false;
        }, 300); // Shorter cooldown
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

        // Additional difficulty: move button randomly even when mouse isn't close
        setInterval(() => {
            if (!buttonMovementEnabled) return; // Stop random movement after timer

            if (!isMoving && Math.random() < 0.1) { // 10% chance every interval
                const randomX = Math.random() * window.innerWidth;
                const randomY = Math.random() * window.innerHeight;
                moveButton(randomX, randomY);
            }
        }, 2000); // Check every 2 seconds
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

    // Button click handler
    fireButton.addEventListener('click', () => {
        modalOverlay.classList.add('show');
        modalOverlay.style.display = 'flex';
    });

    // Modal close handlers
    function closeModal() {
        modalOverlay.classList.remove('show');
        setTimeout(() => {
            modalOverlay.style.display = 'none';
        }, 300); // Match the CSS transition duration
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