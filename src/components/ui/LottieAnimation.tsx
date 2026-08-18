import lottie from 'lottie-web/build/player/lottie_light';
import { useEffect, useRef } from 'react';

interface LottieAnimationProps {
  animationData: object;
  autoplay?: boolean;
  className?: string;
  loop?: boolean;
}

export const LottieAnimation = ({
  animationData,
  autoplay = true,
  className = '',
  loop = true,
}: LottieAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animation = lottie.loadAnimation({
      animationData,
      autoplay: reduceMotion ? false : autoplay,
      container: containerRef.current,
      loop: reduceMotion ? false : loop,
      renderer: 'svg',
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
    });

    if (reduceMotion) animation.goToAndStop(0, true);
    return () => animation.destroy();
  }, [animationData, autoplay, loop]);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
};
