import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/** Long fallback so we only advance when TTS actually finishes; avoids page turning before audio plays. */
const READ_ALOUD_FALLBACK_MS = 15000;
const COVER_AUTO_FLIP_MS = 2500;

interface BookPage {
    title?: string;
    content: React.ReactNode;
    image?: string;
    layout?: 'default' | 'editorial' | 'cover';
    subtitle?: string;
}

interface DigitalBookProps {
    pages: BookPage[];
    pageTexts?: string[];
    sendMessage?: (msg: object) => void;
    payload?: { audioBase64?: string } | null;
    /** Called when last content page TTS finishes; close book and return to chat. */
    onComplete?: () => void;
    /** When true, skip playing the first incoming audio (overview reply TTS). */
    skipFirstAudio?: boolean;
}

export default function DigitalBook({ pages, pageTexts, sendMessage, payload, onComplete, skipFirstAudio = false }: DigitalBookProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [direction, setDirection] = useState(0); // 1 for next, -1 for prev
    const [isAnimating, setIsAnimating] = useState(false);
    const [isHoveringRight, setIsHoveringRight] = useState(false);
    const [isHoveringLeft, setIsHoveringLeft] = useState(false);
    const isReadAloud = Boolean(pageTexts?.length && sendMessage);
    const lastPlayedRef = useRef<string | null>(null);
    const isPlayingRef = useRef(false);
    const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasAdvancedSinceSendRef = useRef(false);
    const hasSkippedFirstRef = useRef(false);

    const clearFallback = () => {
        if (fallbackTimerRef.current) {
            clearTimeout(fallbackTimerRef.current);
            fallbackTimerRef.current = null;
        }
    };

    const advanceOrComplete = () => {
        if (currentPage >= pages.length - 1) {
            onComplete?.();
            return;
        }
        clearFallback();
        setDirection(1);
        setCurrentPage((prev) => prev + 1);
    };

    const goToNextPage = () => {
        setCurrentPage((prev) => {
            if (prev >= pages.length - 1) return prev;
            clearFallback();
            setDirection(1);
            return prev + 1;
        });
    };

    // Cover (page 0): no TTS, auto-flip after delay. Content pages: send diary_tts, then advance on audio end or fallback.
    useEffect(() => {
        if (!isReadAloud || !pageTexts || !sendMessage) return;
        if (currentPage === 0) {
            const t = setTimeout(goToNextPage, COVER_AUTO_FLIP_MS);
            return () => clearTimeout(t);
        }
        const text = pageTexts[currentPage];
        if (text == null || text === '') {
            advanceOrComplete();
            return;
        }
        hasAdvancedSinceSendRef.current = false;
        sendMessage({ action: 'diary_tts', text });
        clearFallback();
        fallbackTimerRef.current = setTimeout(advanceOrComplete, READ_ALOUD_FALLBACK_MS);
        return clearFallback;
    }, [currentPage, isReadAloud, pageTexts?.length]);

    useEffect(() => {
        if (!isReadAloud || !payload?.audioBase64) return;
        const audioBase64 = payload.audioBase64;
        if (audioBase64 === lastPlayedRef.current || isPlayingRef.current || hasAdvancedSinceSendRef.current) return;
        if (skipFirstAudio && !hasSkippedFirstRef.current) {
            hasSkippedFirstRef.current = true;
            lastPlayedRef.current = audioBase64;
            return;
        }
        lastPlayedRef.current = audioBase64;
        isPlayingRef.current = true;
        clearFallback();
        try {
            const binary = atob(audioBase64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            const blob = new Blob([bytes], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            const onEnd = () => {
                URL.revokeObjectURL(url);
                isPlayingRef.current = false;
                hasAdvancedSinceSendRef.current = true;
                advanceOrComplete();
            };
            audio.addEventListener('ended', onEnd);
            audio.addEventListener('error', onEnd);
            audio.play().catch(() => onEnd());
        } catch {
            isPlayingRef.current = false;
            advanceOrComplete();
        }
    }, [payload?.audioBase64, currentPage, isReadAloud, pages.length]);

    useEffect(() => {
        return () => clearFallback();
    }, []);

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isAnimating || currentPage >= pages.length - 1) return;
        setDirection(1);
        setCurrentPage((prev) => prev + 1);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isAnimating || currentPage <= 0) return;
        setDirection(-1);
        setCurrentPage((prev) => prev - 1);
    };

    // Calculate the "next" page to show underneath
    const nextPageIdx = direction > 0
        ? Math.min(currentPage, pages.length - 1)
        : Math.max(currentPage, 0);

    const prevPageIdx = direction > 0
        ? Math.max(currentPage - 1, 0)
        : Math.min(currentPage + 1, pages.length - 1);

    return (
        <div className="premium-book-viewport">
            <div className="premium-book-container">
                <div className="premium-book-ambient-shadow" />

                <div className="premium-book-wrapper">
                    {/* Fixed Spiral Spine - Always visible on the left side */}
                    <div className="book-spiral-spine">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <div key={i} className="spiral-loop" />
                        ))}
                    </div>

                    {/* Content Anchor for the pages */}
                    <div className="book-content-anchor">
                        {/* Under Layer (The page being revealed) */}
                        <div className="page-layer under">
                            <PageContent page={pages[currentPage]} pageNumber={currentPage + 1} />
                        </div>

                        {/* Turning Layer (Animated) */}
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={prevPageIdx}
                                custom={direction}
                                className="page-layer active"
                                initial={{ rotateY: 0, x: 0, opacity: 1 }}
                                animate={{
                                    rotateY: direction > 0 ? -110 : 110,
                                    x: direction > 0 ? -20 : 20,
                                    opacity: 0,
                                    skewY: direction > 0 ? -5 : 5,
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 0.9,
                                    ease: [0.645, 0.045, 0.355, 1.0],
                                }}
                                onAnimationStart={() => setIsAnimating(true)}
                                onAnimationComplete={() => setIsAnimating(false)}
                                style={{ transformOrigin: 'left center' }}
                            >
                                <PageContent page={pages[prevPageIdx]} pageNumber={prevPageIdx + 1} isTurning />
                            </motion.div>
                        </AnimatePresence>

                        {/* Hover Preview Effects */}
                        {!isAnimating && (
                            <div className="page-layer active" style={{ pointerEvents: 'none' }}>
                                <motion.div
                                    animate={{
                                        rotateY: isHoveringRight ? -5 : (isHoveringLeft ? 5 : 0),
                                        x: isHoveringRight ? -2 : (isHoveringLeft ? 2 : 0)
                                    }}
                                    className="w-full h-full"
                                    style={{ transformOrigin: 'left center' }}
                                >
                                    <div className="premium-page-paper" style={{ boxShadow: 'none', background: 'transparent', border: 'none' }}>
                                        {/* This is just a visual shell for the hover lift */}
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Overlays */}
                <div className="premium-nav-overlay">
                    <div
                        className={`nav-zone left-zone ${currentPage === 0 ? 'disabled' : ''}`}
                        onClick={handlePrev}
                        onMouseEnter={() => setIsHoveringLeft(true)}
                        onMouseLeave={() => setIsHoveringLeft(false)}
                    />
                    <div
                        className={`nav-zone right-zone ${currentPage === pages.length - 1 ? 'disabled' : ''}`}
                        onClick={handleNext}
                        onMouseEnter={() => setIsHoveringRight(true)}
                        onMouseLeave={() => setIsHoveringRight(false)}
                    />
                </div>
            </div>
        </div>
    );
}

function PageContent({ page, pageNumber, isTurning = false }: { page: BookPage; pageNumber: number; isTurning?: boolean }) {
    if (!page) return null;

    const renderLayout = () => {
        if (page.layout === 'cover') {
            return (
                <div className="page-cover">
                    <h1 className="cover-title">{page.title}</h1>
                    <div className="cover-divider" />
                    {page.subtitle && <p className="cover-subtitle">{page.subtitle}</p>}
                </div>
            );
        }

        if (page.layout === 'editorial') {
            return (
                <div className="overview-editorial-grid">
                    <div className="editorial-text-side">
                        {page.title && <h2 className="premium-page-title">{page.title}</h2>}
                        <div className="premium-page-body">
                            {page.content}
                        </div>
                    </div>
                    <div className="editorial-image-side">
                        {page.image && <img src={page.image} alt="SVIT Overview" />}
                    </div>
                </div>
            );
        }

        return (
            <div className="premium-page-inner">
                {page.title && <h2 className="premium-page-title">{page.title}</h2>}
                <div className="premium-page-body">
                    {page.content}
                </div>
                {page.image && (
                    <div className="premium-image-wrapper">
                        <img src={page.image} alt="Visual" className="premium-page-image" />
                    </div>
                )}
                <div className="premium-page-footer">
                    <span className="premium-page-number">
                        {String(pageNumber).padStart(2, '0')}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="premium-page-paper">
            <div className="paper-texture" />
            {isTurning && <div className="page-curl-overlay" style={{ opacity: 1 }} />}
            {renderLayout()}
        </div>
    );
}
