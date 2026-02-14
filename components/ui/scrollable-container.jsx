"use client";

import { useEffect, useRef } from "react";

// Custom scrollable container that works with touch, mouse wheel, arrow keys, and scrollbar
export function ScrollableContainer({ children, className = "", maxHeight = "100%" }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        // Handle wheel events to prevent parent scroll when scrolling inside
        const handleWheel = (e) => {
            const { scrollTop, scrollHeight, clientHeight } = el;
            const maxScroll = scrollHeight - clientHeight;

            if (maxScroll <= 0) return; // nothing to scroll

            // If we're at the top and scrolling up, or at the bottom and scrolling down, let parent handle it
            if (scrollTop <= 0 && e.deltaY < 0) return;
            if (scrollTop >= maxScroll && e.deltaY > 0) return;

            // Otherwise prevent parent from scrolling
            e.stopPropagation();
        };

        // Handle touch events for mobile scroll
        let touchStartY = 0;
        const handleTouchStart = (e) => {
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchMove = (e) => {
            const { scrollTop, scrollHeight, clientHeight } = el;
            const maxScroll = scrollHeight - clientHeight;
            if (maxScroll <= 0) return;

            const touchY = e.touches[0].clientY;
            const deltaY = touchStartY - touchY;

            // Prevent parent scroll when we still have room to scroll
            if ((deltaY > 0 && scrollTop < maxScroll) || (deltaY < 0 && scrollTop > 0)) {
                e.stopPropagation();
            }
        };

        el.addEventListener("wheel", handleWheel, { passive: false });
        el.addEventListener("touchstart", handleTouchStart, { passive: true });
        el.addEventListener("touchmove", handleTouchMove, { passive: false });

        return () => {
            el.removeEventListener("wheel", handleWheel);
            el.removeEventListener("touchstart", handleTouchStart);
            el.removeEventListener("touchmove", handleTouchMove);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={className}
            tabIndex={0}
            role="list"
            style={{
                maxHeight: maxHeight,
                overflowY: "auto",
                overscrollBehavior: "contain",
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-y",
                scrollbarWidth: "thin",
                scrollbarColor: "var(--scroll-thumb, #888) transparent",
            }}
        >
            {children}
        </div>
    );
}
