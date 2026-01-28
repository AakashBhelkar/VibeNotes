import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@mui/material';

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number | string;
    height?: number | string;
    placeholder?: React.ReactNode;
    onLoad?: () => void;
    onError?: () => void;
}

/**
 * Lazy loading image component using Intersection Observer
 * Only loads image when it enters the viewport
 */
export function LazyImage({
    src,
    alt,
    className,
    width,
    height,
    placeholder,
    onLoad,
    onError,
}: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '100px', // Start loading 100px before entering viewport
                threshold: 0,
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setHasError(true);
        onError?.();
    };

    const defaultPlaceholder = (
        <Skeleton
            variant="rectangular"
            width={width || '100%'}
            height={height || 200}
            animation="wave"
            sx={{ borderRadius: 1 }}
        />
    );

    return (
        <div
            ref={imgRef}
            className={className}
            style={{
                width: width || '100%',
                height: isLoaded ? 'auto' : height || 200,
                position: 'relative',
            }}
        >
            {!isLoaded && !hasError && (placeholder || defaultPlaceholder)}

            {hasError ? (
                <div
                    style={{
                        width: width || '100%',
                        height: height || 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        borderRadius: 4,
                        color: '#999',
                        fontSize: 14,
                    }}
                >
                    Failed to load image
                </div>
            ) : isInView ? (
                <img
                    src={src}
                    alt={alt}
                    onLoad={handleLoad}
                    onError={handleError}
                    style={{
                        width: '100%',
                        height: 'auto',
                        display: isLoaded ? 'block' : 'none',
                        borderRadius: 4,
                    }}
                />
            ) : null}
        </div>
    );
}

/**
 * Lazy loading background image component
 */
export function LazyBackgroundImage({
    src,
    className,
    children,
}: {
    src: string;
    className?: string;
    children?: React.ReactNode;
}) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '100px', threshold: 0 }
        );

        if (divRef.current) {
            observer.observe(divRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (isInView && src) {
            const img = new Image();
            img.onload = () => setIsLoaded(true);
            img.src = src;
        }
    }, [isInView, src]);

    return (
        <div
            ref={divRef}
            className={className}
            style={{
                backgroundImage: isLoaded ? `url(${src})` : undefined,
                backgroundColor: isLoaded ? undefined : '#f5f5f5',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'background-image 0.3s ease-in-out',
            }}
        >
            {children}
        </div>
    );
}
