"use client";

import React, { useState, useEffect } from "react";
import { Typography } from "@/components/atoms";
import { ProjectCard } from "@/components/molecules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Project } from "@/types";

interface FilmReelCarouselProps {
  projects: Project[];
  className?: string;
}

export const FilmReelCarousel: React.FC<FilmReelCarouselProps> = ({
  projects,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % projects.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, projects.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Film Reel Background Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="flex items-center justify-center h-full opacity-5">
          <div className="flex space-x-4">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-8 h-12 border-2 border-brand-primary rounded animate-pulse"
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Carousel Container */}
      <div className="relative">
        {/* Carousel Track */}
        <div 
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="w-full flex-shrink-0 px-4"
            >
              <div className="max-w-4xl mx-auto">
                <ProjectCard 
                  project={project}
                  className={`transform transition-all duration-700 ${
                    index === currentIndex 
                      ? 'scale-105 shadow-elevation-highest' 
                      : 'scale-95 opacity-80'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 
                     bg-black/70 hover:bg-black/90 p-3 rounded-full 
                     text-brand-primary hover:text-brand-primary-dark
                     transition-all duration-300 hover:scale-110
                     backdrop-blur-sm border border-brand-primary/30"
          aria-label="Previous project"
        >
          <FaChevronLeft size={20} />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 
                     bg-black/70 hover:bg-black/90 p-3 rounded-full 
                     text-brand-primary hover:text-brand-primary-dark
                     transition-all duration-300 hover:scale-110
                     backdrop-blur-sm border border-brand-primary/30"
          aria-label="Next project"
        >
          <FaChevronRight size={20} />
        </button>
      </div>

      {/* Film Strip Indicators */}
      <div className="flex justify-center mt-8 space-x-2">
        {projects.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-12 h-3 rounded-sm transition-all duration-300 border ${
              index === currentIndex
                ? 'bg-brand-primary border-brand-primary shadow-glow-primary'
                : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
            }`}
            aria-label={`Go to project ${index + 1}`}
          />
        ))}
      </div>

      {/* Film Perforations */}
      <div className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none">
        <div className="h-full flex flex-col justify-between py-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 bg-brand-primary/20 rounded-full border border-brand-primary/30"
            />
          ))}
        </div>
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none">
        <div className="h-full flex flex-col justify-between py-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 bg-brand-primary/20 rounded-full border border-brand-primary/30"
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      {isAutoPlaying && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary animate-pulse"
            style={{
              animation: `progressBar 5s linear infinite`,
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};