'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ProductCarouselProps {
  items: any[];
  renderItem: (item: any) => React.ReactNode;
  autoPlayInterval?: number;
}

export default function ProductCarousel({ items, renderItem, autoPlayInterval = 0 }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(3);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Update visible items based on screen size
  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth < 640) setVisibleItems(1);
      else if (window.innerWidth < 1024) setVisibleItems(2);
      else setVisibleItems(3);
    };
    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, []);

  const totalPages = Math.ceil(items.length / visibleItems);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Auto-play logic
  useEffect(() => {
    if (autoPlayInterval > 0 && totalPages > 1) {
      timerRef.current = setInterval(nextSlide, autoPlayInterval);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, autoPlayInterval, totalPages]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoPlayInterval > 0 && totalPages > 1) {
      timerRef.current = setInterval(nextSlide, autoPlayInterval);
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
      resetTimer();
    }
    touchStartX.current = null;
  };

  if (items.length === 0) return null;

  return (
    <div className="relative group overflow-hidden">
      {/* Navigation Arrows */}
      {totalPages > 1 && (
        <>
          <button
            onClick={() => { prevSlide(); resetTimer(); }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 backdrop-blur-sm p-3 rounded-r-2xl shadow-xl text-slate-400 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100 hidden md:block"
          >
            ❮
          </button>
          <button
            onClick={() => { nextSlide(); resetTimer(); }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 backdrop-blur-sm p-3 rounded-l-2xl shadow-xl text-slate-400 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100 hidden md:block"
          >
            ❯
          </button>
        </>
      )}

      {/* Carousel Track */}
      <div
        className="flex transition-transform duration-700 ease-out py-6"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {Array.from({ length: totalPages }).map((_, pageIndex) => (
          <div key={pageIndex} className="flex min-w-full gap-10 px-2 justify-center">
            {items.slice(pageIndex * visibleItems, (pageIndex + 1) * visibleItems).map((item, idx) => (
              <div
                key={idx}
                className="w-full"
                style={{ maxWidth: visibleItems === 1 ? '100%' : visibleItems === 2 ? 'calc(50% - 20px)' : 'calc(33.333% - 26px)' }}
              >
                {renderItem(item)}
              </div>
            ))}
            {/* Fillers for alignment if items count is not multiple of visibleItems */}
            {items.slice(pageIndex * visibleItems, (pageIndex + 1) * visibleItems).length < visibleItems &&
              Array.from({ length: visibleItems - items.slice(pageIndex * visibleItems, (pageIndex + 1) * visibleItems).length }).map((_, i) => (
                <div key={`filler-${i}`} className="w-full invisible" style={{ maxWidth: visibleItems === 1 ? '100%' : visibleItems === 2 ? 'calc(50% - 20px)' : 'calc(33.333% - 26px)' }} />
              ))
            }
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentIndex(idx); resetTimer(); }}
              className={`w-2 h-2 rounded-full transition-all ${currentIndex === idx ? 'bg-blue-600 w-6' : 'bg-slate-200'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
