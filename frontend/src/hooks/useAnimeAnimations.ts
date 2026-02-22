import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

export function useMessageAnimation(role: 'user' | 'clara') {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        // Reset initial state for animation
        elementRef.current.style.opacity = '0';
        elementRef.current.style.transform = `translateX(${role === 'user' ? '20px' : '-20px'}) scale(0.98)`;

        animate(elementRef.current, {
            translateX: 0,
            opacity: 1,
            scale: 1,
            duration: 300,
            ease: 'outExpo', // Clean and premium as requested
        });
    }, [role]);

    return elementRef;
}

export function useListeningStateAnimation(isActive: boolean) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        if (isActive) {
            animate(containerRef.current, {
                scale: 1.005,
                duration: 400,
                ease: 'outExpo',
            });
        } else {
            animate(containerRef.current, {
                scale: 1,
                duration: 400,
                ease: 'outExpo',
            });
        }
    }, [isActive]);

    return containerRef;
}
