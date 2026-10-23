"use client";

import {
  type ComponentPropsWithoutRef,
  useEffect,
  useRef,
} from "react";

type ResponsiveDetailsProps = ComponentPropsWithoutRef<"details"> & {
  desktopOpen?: boolean;
};

export function ResponsiveDetails({
  desktopOpen = false,
  onToggle,
  ...props
}: ResponsiveDetailsProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const mobileOpenRef = useRef(Boolean(props.open));
  const desktopOpenRef = useRef(desktopOpen || Boolean(props.open));

  useEffect(() => {
    if (!detailsRef.current) {
      return;
    }

    const details = detailsRef.current;
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const summary = details.querySelector<HTMLElement>(":scope > summary");
    const content = details.querySelector<HTMLElement>(
      ":scope > summary + *"
    );
    let detailsAnimation: Animation | null = null;
    let contentAnimation: Animation | null = null;
    let animationTargetOpen: boolean | null = null;

    const cancelAnimations = () => {
      detailsAnimation?.cancel();
      contentAnimation?.cancel();
      detailsAnimation = null;
      contentAnimation = null;
      animationTargetOpen = null;
    };

    const clearAnimationStyles = () => {
      details.style.height = "";
      details.style.overflow = "";
    };

    const syncOpenState = () => {
      cancelAnimations();
      clearAnimationStyles();
      details.open = desktopQuery.matches
        ? desktopOpenRef.current
        : mobileOpenRef.current;
    };

    const handleNativeToggle = () => {
      if (desktopQuery.matches) {
        desktopOpenRef.current = details.open;
      } else if (!desktopQuery.matches) {
        mobileOpenRef.current = details.open;
      }
    };

    const animateOpenState = (shouldOpen: boolean) => {
      if (!summary || !content) {
        details.open = shouldOpen;
        mobileOpenRef.current = shouldOpen;
        return;
      }

      const startHeight = details.getBoundingClientRect().height;
      detailsAnimation?.cancel();
      contentAnimation?.cancel();

      details.style.height = `${startHeight}px`;
      details.style.overflow = "hidden";
      details.open = true;

      const borderHeight = details.offsetHeight - details.clientHeight;
      const endHeight = shouldOpen
        ? summary.offsetHeight + content.offsetHeight + borderHeight
        : summary.offsetHeight + borderHeight;

      animationTargetOpen = shouldOpen;
      detailsAnimation = details.animate(
        {
          height: [`${startHeight}px`, `${endHeight}px`],
        },
        {
          duration: 180,
          easing: "cubic-bezier(0.2, 0, 0, 1)",
        }
      );
      contentAnimation = content.animate(
        shouldOpen
          ? [
              { opacity: 0, transform: "translateY(-4px)" },
              { opacity: 1, transform: "translateY(0)" },
            ]
          : [
              { opacity: 1, transform: "translateY(0)" },
              { opacity: 0, transform: "translateY(-4px)" },
            ],
        {
          duration: 140,
          delay: shouldOpen ? 20 : 0,
          easing: "ease-out",
          fill: "both",
        }
      );

      const activeAnimation = detailsAnimation;
      activeAnimation.onfinish = () => {
        if (detailsAnimation !== activeAnimation) {
          return;
        }

        details.open = shouldOpen;
        if (desktopQuery.matches) {
          desktopOpenRef.current = shouldOpen;
        } else {
          mobileOpenRef.current = shouldOpen;
        }
        cancelAnimations();
        clearAnimationStyles();
      };
    };

    const handleSummaryClick = (event: Event) => {
      if (reducedMotionQuery.matches) {
        return;
      }

      event.preventDefault();
      const shouldOpen =
        animationTargetOpen === null
          ? !details.open
          : !animationTargetOpen;
      animateOpenState(shouldOpen);
    };

    syncOpenState();
    desktopQuery.addEventListener("change", syncOpenState);
    details.addEventListener("toggle", handleNativeToggle);
    summary?.addEventListener("click", handleSummaryClick);

    return () => {
      cancelAnimations();
      clearAnimationStyles();
      desktopQuery.removeEventListener("change", syncOpenState);
      details.removeEventListener("toggle", handleNativeToggle);
      summary?.removeEventListener("click", handleSummaryClick);
    };
  }, [desktopOpen]);

  return <details ref={detailsRef} onToggle={onToggle} {...props} />;
}
