/**
 * Scroll-Linked Marquee Animation
 * Adds inertia effect based on HORIZONTAL scroll velocity (deltaX).
 */

document.addEventListener('DOMContentLoaded', () => {
    const marqueeContents = document.querySelectorAll('.marquee-content');
    if (!marqueeContents.length) return;

    // Configuration
    let baseSpeed = 1.0; // Pixels per frame
    let scrollSensitivity = 0.5; // How much scroll affects speed
    let friction = 0.95; // How quickly it slows down (0.0 - 1.0)

    // State
    let currentPos = 0;
    let scrollVelocity = 0;
    let isPaused = false;

    // Hover Handling
    const container = document.querySelector('.marquee-container');
    if (container) {
        container.addEventListener('mouseenter', () => isPaused = true);
        container.addEventListener('mouseleave', () => isPaused = false);
    }

    // Measure width for looping
    let contentWidth = marqueeContents[0].offsetWidth + 20; // +gap

    // Update width on resize
    window.addEventListener('resize', () => {
        if (marqueeContents[0]) {
            contentWidth = marqueeContents[0].offsetWidth + 20;
        }
    });

    // Track Horizontal Scroll (Wheel/Touchpad)
    window.addEventListener('wheel', (e) => {
        // We only care about horizontal scroll (deltaX)
        if (Math.abs(e.deltaX) > 0) {
            // Invert deltaX because usually swiping left moves content right? 
            // Or simply add it. Let's try adding.
            // If we scroll Right (positive deltaX), we want it to move faster to Left (negative transform)?
            // Default motion is Leftwards (Pos goes negative).
            // So positive deltaX (scrolling right) should probably subtract from Pos (make it more negative / faster).

            scrollVelocity += e.deltaX * scrollSensitivity;
        }
    });

    // Animation Loop
    function animate() {
        if (!isPaused) {
            // Calculate current speed
            let currentSpeed = baseSpeed + scrollVelocity;

            // Move leftwards (negative subtraction moves it left)
            currentPos -= currentSpeed;
        } else {
            // Paused
        }

        // Apply friction to velocity
        scrollVelocity *= friction;

        // If velocity is very small, snap to 0
        if (Math.abs(scrollVelocity) < 0.01) scrollVelocity = 0;

        // Loop Logic
        if (currentPos <= -contentWidth) {
            currentPos += contentWidth;
        }
        if (currentPos > 0) {
            currentPos -= contentWidth;
        }

        // Apply Transform
        marqueeContents.forEach(content => {
            content.style.transform = `translateX(${currentPos}px)`;
        });

        requestAnimationFrame(animate);
    }

    animate();
});
